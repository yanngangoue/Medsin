import { chromium } from 'playwright';
import https from 'https';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://medsim-roan.vercel.app';
const EMAIL = 'sophie.eligible@medsim.ca';
const PASSWORD = 'Patient2026!';
const SCREENSHOT_DIR = 'C:\\Users\\Utilisateur\\Desktop\\Medsim\\test-screenshots\\stripe-payment';

async function fetchRaw(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };
    const req = https.request(reqOptions, (res) => {
      let data = '';
      const cookies = res.headers['set-cookie'] || [];
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, cookies, body: data, location: res.headers['location'] }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function screenshot(page, name) {
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`  📸 ${filePath}`);
  return filePath;
}

async function run() {
  // Step 1: Auth
  console.log('=== Auth ===');
  const csrfRes = await fetchRaw(`${BASE_URL}/api/auth/csrf`);
  const csrfData = JSON.parse(csrfRes.body);
  const csrfToken = csrfData.csrfToken;
  console.log('CSRF token:', csrfToken);

  const csrfCookies = csrfRes.cookies.map(c => c.split(';')[0]).join('; ');

  const body = new URLSearchParams({
    email: EMAIL,
    password: PASSWORD,
    csrfToken,
    redirect: 'false',
    json: 'true',
    callbackUrl: `${BASE_URL}/paiement`,
  }).toString();

  const authRes = await fetchRaw(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': csrfCookies,
      'Content-Length': Buffer.byteLength(body),
    },
    body,
  });

  console.log('Auth status:', authRes.status);
  console.log('Auth location:', authRes.location);
  const allCookies = [...csrfRes.cookies, ...authRes.cookies];
  console.log('All cookies:', allCookies.map(c => c.split(';')[0]));

  const sessionCookieStr = allCookies.map(c => c.split(';')[0]).join('; ');

  // Step 2: Browser test with detailed network monitoring
  console.log('\n=== Browser Test ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });

  // Inject all cookies
  for (const rawCookie of allCookies) {
    const parts = rawCookie.split(';').map(p => p.trim());
    const [nameVal] = parts;
    const eqIdx = nameVal.indexOf('=');
    if (eqIdx === -1) continue;
    const name = nameVal.substring(0, eqIdx);
    const value = nameVal.substring(eqIdx + 1);
    if (!name || !value) continue;
    const attrMap = {};
    for (const attr of parts.slice(1)) {
      const [k, v] = attr.split('=');
      attrMap[k.toLowerCase().trim()] = v ? v.trim() : true;
    }
    try {
      await context.addCookies([{
        name, value,
        domain: 'medsim-roan.vercel.app',
        path: attrMap['path'] || '/',
        httpOnly: 'httponly' in attrMap,
        secure: 'secure' in attrMap,
        sameSite: attrMap['samesite'] === 'Lax' ? 'Lax' : 'None',
      }]);
    } catch (e) { /* skip */ }
  }

  const page = await context.newPage();

  // Capture all network requests/responses for /api/checkout or /api/payment calls
  const apiResponses = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/') || url.includes('stripe')) {
      let body = '';
      try { body = await response.text(); } catch {}
      apiResponses.push({ url, status: response.status(), body: body.substring(0, 1000) });
      if (response.status() >= 400 || url.includes('stripe') || url.includes('checkout') || url.includes('payment')) {
        console.log(`  API: [${response.status()}] ${url}`);
        if (body) console.log(`    Body: ${body.substring(0, 500)}`);
      }
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('  CONSOLE ERROR:', msg.text());
    if (msg.type() === 'warn') console.log('  CONSOLE WARN:', msg.text());
  });

  // Navigate to payment page
  await page.goto(`${BASE_URL}/paiement`, { waitUntil: 'networkidle', timeout: 45000 });
  console.log('URL:', page.url());
  await screenshot(page, '01-paiement-loaded');

  // Get full page text
  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('\n--- Payment Page Text ---');
  console.log(pageText.substring(0, 2000));

  // Find the pay button
  const payBtns = await page.locator('button, a[href]').all();
  console.log('\n--- All interactive elements ---');
  for (const btn of payBtns) {
    const text = await btn.textContent().catch(() => '');
    if (text.trim()) console.log(`  [${await btn.evaluate(el => el.tagName)}] "${text.trim()}"`);
  }

  // Click the pay button
  const payButton = page.locator('button:has-text("Payer"), a:has-text("Payer")').first();
  const payButtonCount = await payButton.count();
  console.log('\n--- Clicking Pay Button ---');
  console.log('Pay button found:', payButtonCount > 0);

  if (payButtonCount > 0) {
    const btnText = await payButton.textContent();
    console.log('Button text:', btnText.trim());

    // Check if button is disabled
    const isDisabled = await payButton.isDisabled();
    console.log('Button disabled:', isDisabled);

    // Try to capture the network request on click
    const responsePromise = page.waitForResponse(
      resp => resp.url().includes('/api/') && resp.url().includes('payment') ||
              resp.url().includes('/api/') && resp.url().includes('checkout') ||
              resp.url().includes('/api/') && resp.url().includes('stripe') ||
              resp.url().includes('checkout.stripe.com'),
      { timeout: 30000 }
    ).catch(() => null);

    await payButton.click();
    console.log('Clicked!');

    // Wait for response
    const resp = await responsePromise;
    if (resp) {
      const respBody = await resp.text().catch(() => '');
      console.log(`\nCaptured response: [${resp.status()}] ${resp.url()}`);
      console.log('Response body:', respBody.substring(0, 1000));
    }

    // Wait and check
    await page.waitForTimeout(5000);
    const urlAfter = page.url();
    console.log('URL after click:', urlAfter);
    await screenshot(page, '02-after-click');

    // Get page text after click
    const textAfter = await page.evaluate(() => document.body.innerText);
    console.log('\n--- Page text after click ---');
    console.log(textAfter.substring(0, 2000));

    // Check all API calls captured
    console.log('\n--- All API calls captured ---');
    for (const r of apiResponses) {
      console.log(`  [${r.status}] ${r.url}`);
      if (r.status >= 400) console.log(`    Error body: ${r.body}`);
    }

    // If still on paiement, check for error UI
    if (urlAfter.includes('/paiement')) {
      // Try to find error message in the DOM
      const errorElements = await page.locator('[class*="error"], [class*="Error"], [role="alert"], [class*="toast"]').all();
      console.log('\n--- Error elements ---');
      for (const el of errorElements) {
        const text = await el.textContent().catch(() => '');
        const className = await el.getAttribute('class').catch(() => '');
        if (text.trim()) console.log(`  [${className}]: "${text.trim()}"`);
      }
    }
  }

  await browser.close();
  console.log('\nDone.');
}

run().catch(console.error);

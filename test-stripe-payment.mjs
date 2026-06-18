import { chromium } from 'playwright';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://medsim-roan.vercel.app';
const EMAIL = 'sophie.eligible@medsim.ca';
const PASSWORD = 'Patient2026!';
const SCREENSHOT_DIR = 'C:\\Users\\Utilisateur\\Desktop\\Medsim\\test-screenshots\\stripe-payment';

const results = [];

function log(step, status, detail, url) {
  const entry = { step, status, detail, url };
  results.push(entry);
  const icon = status === 'OK' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️';
  console.log(`${icon} [${step}] ${detail}${url ? ' | URL: ' + url : ''}`);
}

async function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const reqOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };
    const req = lib.request(reqOptions, (res) => {
      let data = '';
      const cookies = res.headers['set-cookie'] || [];
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          cookies,
          body: data,
          json: () => {
            try { return JSON.parse(data); } catch { return null; }
          }
        });
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function screenshot(page, name) {
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`  📸 Screenshot saved: ${filePath}`);
  return filePath;
}

async function run() {
  // ── STEP 1: Get CSRF token ──────────────────────────────────────────────
  console.log('\n=== STEP 1: Authentication via API ===');
  let csrfToken, sessionCookies;

  try {
    const csrfRes = await fetchJson(`${BASE_URL}/api/auth/csrf`);
    const csrfData = csrfRes.json();
    csrfToken = csrfData?.csrfToken;
    const rawCookies = csrfRes.cookies;
    log('CSRF', csrfToken ? 'OK' : 'FAIL', `csrfToken: ${csrfToken}`, `${BASE_URL}/api/auth/csrf`);

    // Collect Set-Cookie for subsequent requests
    const cookieHeader = rawCookies.map(c => c.split(';')[0]).join('; ');

    // ── POST credentials ──────────────────────────────────────────────────
    const body = new URLSearchParams({
      email: EMAIL,
      password: PASSWORD,
      csrfToken,
      redirect: 'false',
      json: 'true',
      callbackUrl: `${BASE_URL}/paiement`,
    }).toString();

    const authRes = await fetchJson(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieHeader,
        'Content-Length': Buffer.byteLength(body),
      },
      body,
    });

    sessionCookies = [...rawCookies, ...authRes.cookies];
    const authData = authRes.json();
    console.log('  Auth response status:', authRes.status);
    console.log('  Auth response body:', authRes.body.substring(0, 500));

    const hasSession = sessionCookies.some(c => c.includes('next-auth.session-token') || c.includes('__Secure-next-auth.session-token'));
    log('Auth', hasSession ? 'OK' : 'FAIL', `Session cookie found: ${hasSession}`, `${BASE_URL}/api/auth/callback/credentials`);

    if (!hasSession) {
      console.log('  All cookies:', sessionCookies.map(c => c.split(';')[0]));
    }
  } catch (err) {
    log('Auth', 'FAIL', `Error: ${err.message}`);
    console.error(err);
    printReport();
    return;
  }

  // ── STEP 2-6: Playwright browser ─────────────────────────────────────────
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  // Inject session cookies
  for (const rawCookie of sessionCookies) {
    const parts = rawCookie.split(';').map(p => p.trim());
    const [nameVal, ...attrs] = parts;
    const eqIdx = nameVal.indexOf('=');
    if (eqIdx === -1) continue;
    const name = nameVal.substring(0, eqIdx);
    const value = nameVal.substring(eqIdx + 1);
    const attrMap = {};
    for (const attr of attrs) {
      const [k, v] = attr.split('=');
      attrMap[k.toLowerCase().trim()] = v ? v.trim() : true;
    }
    const cookieObj = {
      name,
      value,
      domain: 'medsim-roan.vercel.app',
      path: attrMap['path'] || '/',
      httpOnly: 'httponly' in attrMap,
      secure: 'secure' in attrMap,
      sameSite: attrMap['samesite'] === 'Lax' ? 'Lax' : attrMap['samesite'] === 'Strict' ? 'Strict' : 'None',
    };
    if (attrMap['expires']) {
      cookieObj.expires = new Date(attrMap['expires']).getTime() / 1000;
    }
    if (name && value) {
      try {
        await context.addCookies([cookieObj]);
      } catch (e) {
        console.log(`  Skipped cookie ${name}: ${e.message}`);
      }
    }
  }
  log('Cookie injection', 'OK', `Injected ${sessionCookies.length} cookies`);

  const page = await context.newPage();

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('  BROWSER ERROR:', msg.text());
  });

  try {
    // ── STEP 2: Navigate to /paiement ────────────────────────────────────
    console.log('\n=== STEP 2: Navigate to /paiement ===');
    await page.goto(`${BASE_URL}/paiement`, { waitUntil: 'networkidle', timeout: 45000 });
    const currentUrl = page.url();
    console.log('  Current URL after navigation:', currentUrl);

    await screenshot(page, '01-paiement-page');

    const redirectedOk = currentUrl.includes('/paiement');
    const redirectedElsewhere = !redirectedOk;
    log('Navigate /paiement', redirectedOk ? 'OK' : 'FAIL',
      `URL: ${currentUrl}`,
      currentUrl);

    if (redirectedElsewhere) {
      console.log('  ⚠️  Redirected away from /paiement — likely not authenticated. Checking page content...');
      const pageText = await page.textContent('body').catch(() => '');
      console.log('  Page text (first 500):', pageText.substring(0, 500));
    }

    // ── STEP 3: Verify payment page content ──────────────────────────────
    console.log('\n=== STEP 3: Verify payment page content ===');
    const pageText = await page.textContent('body');

    // Check for medication/prescription info
    const hasMedication = /ozempic|wegovy|saxenda|mounjaro|trulicity|victoza|rybelsus|glp|semaglutide|liraglutide|dulaglutide|tirzepatide/i.test(pageText);
    const hasAmount = /\d+[\s,.]?\d*\s*\$|€|\$\s*\d+|\d+\s*CAD/i.test(pageText);
    const hasPayButton = await page.locator('button:has-text("Payer maintenant"), button:has-text("Payer"), a:has-text("Payer maintenant")').count() > 0;
    const hasIPS = /IPS|infirmière praticienne|prescripteur/i.test(pageText);

    console.log('  Has medication info:', hasMedication);
    console.log('  Has amount:', hasAmount);
    console.log('  Has "Payer maintenant" button:', hasPayButton);
    console.log('  Has IPS mention:', hasIPS);

    // Extract visible amount
    const amountMatch = pageText.match(/(\d[\d\s,]*(?:\.\d{2})?\s*(?:\$|CAD|€)|\$\s*\d[\d,]*(?:\.\d{2})?)/);
    if (amountMatch) console.log('  Amount found:', amountMatch[0].trim());

    log('Page content - Medication', hasMedication ? 'OK' : 'FAIL', hasMedication ? 'Medication info visible' : 'No medication info found');
    log('Page content - Amount', hasAmount ? 'OK' : 'FAIL', hasAmount ? `Amount: ${amountMatch ? amountMatch[0].trim() : 'yes'}` : 'No amount found');
    log('Page content - Pay button', hasPayButton ? 'OK' : 'FAIL', hasPayButton ? '"Payer maintenant" button visible' : 'Pay button not found');

    if (!hasPayButton) {
      // Try to find any button
      const buttons = await page.locator('button').allTextContents();
      console.log('  All buttons found:', buttons);
    }

    // ── STEP 4: Click "Payer maintenant" ─────────────────────────────────
    console.log('\n=== STEP 4: Click "Payer maintenant" ===');
    if (!hasPayButton) {
      log('Click Pay', 'FAIL', 'Button not found, cannot click');
    } else {
      const payButton = page.locator('button:has-text("Payer maintenant"), button:has-text("Payer"), a:has-text("Payer maintenant")').first();

      // Listen for navigation
      let stripeUrl = null;
      let errorText = null;

      // Set up navigation promise before clicking
      const navigationPromise = page.waitForURL('**/checkout.stripe.com/**', { timeout: 45000 }).catch(() => null);

      await payButton.click();
      console.log('  Clicked pay button');

      // Wait a moment for response
      await page.waitForTimeout(3000);

      const urlAfterClick = page.url();
      console.log('  URL after click:', urlAfterClick);

      await screenshot(page, '02-after-pay-click');

      // Check for errors on page
      const pageTextAfterClick = await page.textContent('body');
      const hasError = /erreur|error|invalide|invalid|503|500|failed|échec/i.test(pageTextAfterClick);
      if (hasError) {
        const errorMatch = pageTextAfterClick.match(/(?:erreur|error|invalide|invalid|503|500|failed|échec)[^\n.]{0,100}/i);
        errorText = errorMatch ? errorMatch[0].trim() : 'Error detected';
        log('After click - Error', 'FAIL', `Error found: ${errorText}`);
      }

      // Check if we navigated to Stripe
      if (urlAfterClick.includes('checkout.stripe.com')) {
        stripeUrl = urlAfterClick;
        log('Redirect to Stripe', 'OK', 'Redirected to Stripe checkout', stripeUrl);

        // ── STEP 5: Stripe checkout ───────────────────────────────────────
        console.log('\n=== STEP 5: Stripe Checkout ===');
        console.log('  Stripe URL:', stripeUrl);

        await page.waitForLoadState('networkidle', { timeout: 45000 });
        await screenshot(page, '03-stripe-checkout');

        const stripeText = await page.textContent('body');

        // Extract amount from Stripe page
        const stripeAmount = stripeText.match(/(\$[\d,]+(?:\.\d{2})?|[\d,]+(?:\.\d{2})?\s*(?:CAD|USD|EUR|\$))/);
        if (stripeAmount) {
          log('Stripe - Amount', 'OK', `Amount on Stripe: ${stripeAmount[0].trim()}`);
        } else {
          log('Stripe - Amount', 'FAIL', 'Could not find amount on Stripe page');
        }

        // Fill payment form
        console.log('  Filling Stripe payment form...');

        // Email field
        const emailField = page.locator('input[name="email"], input[type="email"], input[placeholder*="email" i], input[id*="email" i]').first();
        const emailExists = await emailField.count() > 0;
        if (emailExists) {
          await emailField.fill(EMAIL);
          log('Stripe - Email', 'OK', `Filled email: ${EMAIL}`);
        } else {
          log('Stripe - Email', 'FAIL', 'Email field not found');
        }

        // Card number - Stripe uses iframes
        // Try direct input first, then iframe
        try {
          // Wait for card frame
          await page.waitForSelector('iframe[name*="card"], iframe[title*="card" i], input[name*="cardnumber" i], input[placeholder*="card" i]', { timeout: 15000 });

          // Try Stripe's card element via iframe
          const cardFrames = page.frameLocator('iframe[name*="__privateStripeFrame"], iframe[title*="card number" i], iframe[name*="card"]');

          const cardInput = cardFrames.locator('input[name="cardnumber"], input[placeholder*="card" i]');
          if (await cardInput.count() > 0) {
            await cardInput.fill('4242424242424242');
            await page.keyboard.press('Tab');
            await page.waitForTimeout(500);

            const expiryInput = cardFrames.locator('input[name="exp-date"], input[placeholder*="MM" i]');
            if (await expiryInput.count() > 0) {
              await expiryInput.fill('12/26');
              await page.keyboard.press('Tab');
            }

            const cvcInput = cardFrames.locator('input[name="cvc"], input[placeholder*="CVC" i]');
            if (await cvcInput.count() > 0) {
              await cvcInput.fill('123');
              await page.keyboard.press('Tab');
            }

            log('Stripe - Card', 'OK', 'Card details filled via iframe');
          } else {
            // Try payment element approach
            const paymentElement = page.locator('[data-testid="card-input-number"], input[autocomplete="cc-number"]').first();
            if (await paymentElement.count() > 0) {
              await paymentElement.fill('4242424242424242');
              log('Stripe - Card', 'OK', 'Card number filled directly');
            } else {
              log('Stripe - Card', 'FAIL', 'Card input not found');
            }
          }
        } catch (e) {
          log('Stripe - Card', 'FAIL', `Error filling card: ${e.message}`);
        }

        // ZIP
        const zipInput = page.locator('input[name="postalCode"], input[placeholder*="ZIP" i], input[placeholder*="postal" i], input[autocomplete="postal-code"]').first();
        if (await zipInput.count() > 0) {
          await zipInput.fill('12345');
          log('Stripe - ZIP', 'OK', 'ZIP filled');
        } else {
          log('Stripe - ZIP', 'INFO', 'ZIP field not found (may not be required)');
        }

        await screenshot(page, '04-stripe-filled');

        // Submit
        const submitButton = page.locator('button[type="submit"]:has-text("Pay"), button:has-text("Pay now"), button:has-text("Payer"), button[data-testid="submit"]').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          log('Stripe - Submit', 'OK', 'Clicked submit button');
          console.log('  Waiting for redirect back to medsim...');

          try {
            await page.waitForURL('**/medsim-roan.vercel.app/paiement**', { timeout: 45000 });
            const successUrl = page.url();
            log('Stripe - Redirect', 'OK', `Redirected back: ${successUrl}`, successUrl);
            await screenshot(page, '05-post-stripe-redirect');

            // ── STEP 6: Confirmation page ─────────────────────────────────
            console.log('\n=== STEP 6: Verify confirmation page ===');
            const confirmText = await page.textContent('body');

            const hasPaiementConfirme = /paiement confirm[eé]/i.test(confirmText);
            const hasNextSteps = /étape|step|prochaine/i.test(confirmText);
            const hasPatientButton = await page.locator('a:has-text("espace patient"), button:has-text("espace patient"), a:has-text("Accéder"), button:has-text("Accéder")').count() > 0;

            log('Confirmation - "Paiement confirmé !"', hasPaiementConfirme ? 'OK' : 'FAIL',
              hasPaiementConfirme ? 'Text visible' : 'Text not found');
            log('Confirmation - Next steps', hasNextSteps ? 'OK' : 'FAIL',
              hasNextSteps ? 'Next steps visible' : 'Next steps not found');
            log('Confirmation - Patient button', hasPatientButton ? 'OK' : 'FAIL',
              hasPatientButton ? '"Accéder à mon espace patient" visible' : 'Button not found');

            await screenshot(page, '06-confirmation');
          } catch (e) {
            log('Stripe - Redirect', 'FAIL', `Timeout waiting for redirect: ${e.message}`);
            await screenshot(page, '05-stripe-timeout');
          }
        } else {
          log('Stripe - Submit', 'FAIL', 'Submit button not found');
          const allButtons = await page.locator('button').allTextContents();
          console.log('  Buttons available:', allButtons);
          await screenshot(page, '04-stripe-no-submit');
        }
      } else {
        // Not redirected to Stripe - check what happened
        log('Redirect to Stripe', 'FAIL', `Not redirected to Stripe. Current URL: ${urlAfterClick}`, urlAfterClick);

        // Try waiting longer in case of slow redirect
        try {
          await page.waitForURL('**/checkout.stripe.com/**', { timeout: 15000 });
          stripeUrl = page.url();
          log('Redirect to Stripe (delayed)', 'OK', `Delayed redirect to Stripe: ${stripeUrl}`, stripeUrl);
        } catch {
          const finalUrl = page.url();
          const finalText = await page.textContent('body');
          console.log('  Final URL:', finalUrl);
          console.log('  Page text sample:', finalText.substring(0, 800));
        }
      }
    }
  } catch (err) {
    log('Browser test', 'FAIL', `Unexpected error: ${err.message}`);
    console.error(err);
    try { await screenshot(page, 'error-state'); } catch {}
  } finally {
    await browser.close();
  }

  printReport();
}

function printReport() {
  console.log('\n\n══════════════════════════════════════════');
  console.log('          STRIPE PAYMENT FLOW REPORT');
  console.log('══════════════════════════════════════════');
  for (const r of results) {
    const icon = r.status === 'OK' ? '✅' : r.status === 'FAIL' ? '❌' : 'ℹ️';
    console.log(`${icon}  ${r.step}: ${r.detail}`);
    if (r.url) console.log(`     URL: ${r.url}`);
  }
  console.log('══════════════════════════════════════════\n');
}

run().catch(console.error);

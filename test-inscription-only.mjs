import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = 'C:\\Users\\Utilisateur\\Desktop\\Medsim\\test-screenshots';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('Navigating to inscription page...');
  await page.goto('https://medsim-roan.vercel.app/auth/inscription?service=gestion-poids&callbackUrl=%2Fquestionnaire', {
    waitUntil: 'networkidle', timeout: 30000
  });

  await page.waitForTimeout(1500);
  console.log('URL:', page.url());

  // Inspect all inputs
  const inputs = await page.$$eval('input', (els) => els.map(el => ({
    id: el.id,
    type: el.type,
    name: el.name,
    placeholder: el.placeholder,
    autocomplete: el.autocomplete,
    tagName: el.tagName
  })));
  console.log('All inputs:', JSON.stringify(inputs, null, 2));

  // Fill by id
  const prenomInput = await page.$('#prenom');
  if (prenomInput) {
    await prenomInput.click();
    await prenomInput.fill('TestFlow');
    console.log('Filled #prenom with TestFlow');
  } else {
    console.log('ERROR: #prenom not found');
  }

  const nomInput = await page.$('#nom');
  if (nomInput) {
    await nomInput.click();
    await nomInput.fill('Eligibilite');
    console.log('Filled #nom with Eligibilite');
  } else {
    console.log('ERROR: #nom not found');
  }

  const emailInput = await page.$('#email');
  if (emailInput) {
    await emailInput.click();
    await emailInput.fill('test.flow.eligibilite.2026@gmail.com');
    console.log('Filled #email');
  }

  const passwordInput = await page.$('#password');
  if (passwordInput) {
    await passwordInput.click();
    await passwordInput.fill('TestFlow2026!');
    console.log('Filled #password');
  }

  const confirmInput = await page.$('#confirmPassword');
  if (confirmInput) {
    await confirmInput.click();
    await confirmInput.fill('TestFlow2026!');
    console.log('Filled #confirmPassword');
  }

  await page.waitForTimeout(1000);

  // Screenshot before submit
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'inscription-filled-correctly.png'), fullPage: true });
  console.log('Screenshot: inscription-filled-correctly.png');

  // Check button state
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    const isDisabled = await submitBtn.evaluate(el => el.disabled);
    const btnText = await submitBtn.textContent();
    console.log(`Submit button: "${btnText?.trim()}", disabled: ${isDisabled}`);

    if (!isDisabled) {
      console.log('Button is ENABLED - submitting...');
      await submitBtn.click();
      await page.waitForTimeout(8000); // wait for API + redirect
      const newUrl = page.url();
      console.log('URL after submit:', newUrl);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'inscription-after-submit.png'), fullPage: true });
      console.log('Screenshot: inscription-after-submit.png');

      if (newUrl.includes('questionnaire') || newUrl.includes('onboarding')) {
        console.log('[PASS] Redirected to questionnaire:', newUrl);
      } else if (newUrl.includes('inscription')) {
        const pageText = await page.textContent('body');
        const hasError = pageText.toLowerCase().includes('erreur') || pageText.toLowerCase().includes('error') || pageText.toLowerCase().includes('déjà');
        console.log(`[INFO] Still on inscription. Error found: ${hasError}`);
        console.log('Page snippet:', pageText.substring(0, 500));
      } else {
        console.log('[INFO] Redirected to:', newUrl);
      }
    } else {
      // Find what's invalid
      console.log('Button is DISABLED - checking form validity...');
      const formState = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        return Array.from(inputs).map(el => ({
          id: el.id,
          value: el.value,
          validity: el.validity?.valid,
          validationMessage: el.validationMessage
        }));
      });
      console.log('Form state:', JSON.stringify(formState, null, 2));
    }
  } else {
    console.log('No submit button found');
  }

  await browser.close();
})();

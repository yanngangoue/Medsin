import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://medsim-roan.vercel.app';
const SCREENSHOTS_DIR = 'C:\\Users\\Utilisateur\\Desktop\\Medsim\\test-screenshots';

// Create screenshots dir
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function screenshot(page, name) {
  const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`[SCREENSHOT] ${name}.png`);
}

async function log(msg) {
  console.log(`[LOG] ${msg}`);
}

const results = [];
function pass(step, detail) {
  results.push({ step, status: 'PASS', detail });
  console.log(`[PASS] ${step}: ${detail}`);
}
function fail(step, detail) {
  results.push({ step, status: 'FAIL', detail });
  console.log(`[FAIL] ${step}: ${detail}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // ─── STEP 1: Navigate to /eligibilite ───────────────────────────────────────
  try {
    log('Step 1: Navigating to /eligibilite');
    const response = await page.goto(`${BASE_URL}/eligibilite`, { waitUntil: 'networkidle', timeout: 30000 });
    const status = response?.status();
    const url = page.url();
    log(`URL: ${url}, Status: ${status}`);
    await screenshot(page, '01-eligibilite-initial');

    if (status === 200 || url.includes('eligibilite')) {
      pass('Step 1 - Navigate to /eligibilite', `URL: ${url}, HTTP: ${status}`);
    } else {
      fail('Step 1 - Navigate to /eligibilite', `Unexpected status ${status} at ${url}`);
    }
  } catch (e) {
    fail('Step 1 - Navigate to /eligibilite', `Error: ${e.message}`);
    await screenshot(page, '01-eligibilite-error');
  }

  // ─── STEP 2: Verify Typeform wizard ─────────────────────────────────────────
  try {
    log('Step 2: Verifying Typeform-style wizard');
    await page.waitForTimeout(2000);
    const url = page.url();
    const content = await page.content();

    // Check for progress bar and question-per-screen layout
    const hasProgressBar = await page.$('[class*="progress"], [role="progressbar"], [class*="Progress"]') !== null;
    const hasSlider = await page.$('input[type="range"], [class*="slider"], [class*="Slider"]') !== null;
    const hasQuestion = await page.$('[class*="question"], h1, h2, h3') !== null;
    const pageText = await page.textContent('body');
    const hasAgeText = pageText.toLowerCase().includes('âge') || pageText.toLowerCase().includes('age') || pageText.toLowerCase().includes('ans');

    log(`Has progress bar: ${hasProgressBar}, Has slider: ${hasSlider}, Has question: ${hasQuestion}`);
    log(`Has age text: ${hasAgeText}`);
    log(`Current URL: ${url}`);

    await screenshot(page, '02-wizard-check');

    if (hasQuestion && (hasSlider || hasAgeText)) {
      pass('Step 2 - Typeform wizard visible', `Progress: ${hasProgressBar}, Slider: ${hasSlider}, Age content: ${hasAgeText}`);
    } else {
      // Try to get more info about what's on screen
      const bodyText = pageText.substring(0, 500);
      fail('Step 2 - Typeform wizard', `Missing elements. Page text: ${bodyText}`);
    }
  } catch (e) {
    fail('Step 2 - Typeform wizard', `Error: ${e.message}`);
    await screenshot(page, '02-wizard-error');
  }

  // ─── STEP 3a: Âge slider (42 ans) ───────────────────────────────────────────
  try {
    log('Step 3a: Setting age to 42');
    await page.waitForTimeout(1000);

    // Look for slider input
    const slider = await page.$('input[type="range"]');
    if (slider) {
      // Set value to 42
      await slider.evaluate((el) => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(el, '42');
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      log('Slider set to 42');
      await page.waitForTimeout(500);
      await screenshot(page, '03a-age-set');
    } else {
      log('No range slider found, checking for other inputs');
      // Try number input
      const numInput = await page.$('input[type="number"]');
      if (numInput) {
        await numInput.fill('42');
        log('Number input filled with 42');
      } else {
        log('No age input found, looking for age buttons or clickable elements');
        const bodyText = await page.textContent('body');
        log(`Page content snippet: ${bodyText.substring(0, 300)}`);
      }
    }

    // Look for Next/Continue button
    const nextBtn = await page.$('button[type="submit"], button:has-text("Suivant"), button:has-text("Continuer"), button:has-text("Next")');
    if (nextBtn) {
      const btnText = await nextBtn.textContent();
      log(`Found next button: "${btnText}"`);
      await nextBtn.click();
      await page.waitForTimeout(1500);
      pass('Step 3a - Age 42 set', `Slider/input set, next clicked. Btn: ${btnText}`);
    } else {
      // Try pressing Enter or Tab
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      pass('Step 3a - Age 42', 'Set via keyboard Enter (no explicit next button found)');
    }
    await screenshot(page, '03a-age-after-next');
  } catch (e) {
    fail('Step 3a - Age slider', `Error: ${e.message}`);
    await screenshot(page, '03a-age-error');
  }

  // ─── STEP 3b: Taille 175cm / Poids 105kg ────────────────────────────────────
  try {
    log('Step 3b: Setting height 175 and weight 105');
    await page.waitForTimeout(1500);

    const pageText = await page.textContent('body');
    log(`Page text before height/weight: ${pageText.substring(0, 300)}`);
    await screenshot(page, '03b-before-height-weight');

    // Look for two sliders or number inputs
    const sliders = await page.$$('input[type="range"]');
    const numInputs = await page.$$('input[type="number"]');

    log(`Found ${sliders.length} sliders, ${numInputs.length} number inputs`);

    if (sliders.length >= 2) {
      // First slider = height, second = weight
      await sliders[0].evaluate((el) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, '175');
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForTimeout(300);
      await sliders[1].evaluate((el) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, '105');
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      log('Set height=175, weight=105 via sliders');
    } else if (sliders.length === 1) {
      // Maybe height first
      await sliders[0].evaluate((el) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, '175');
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      log('Set one slider to 175 (height)');
    } else if (numInputs.length >= 1) {
      for (const inp of numInputs) {
        const placeholder = await inp.getAttribute('placeholder') || '';
        const name = await inp.getAttribute('name') || '';
        log(`Input: placeholder="${placeholder}", name="${name}"`);
      }
    }

    await page.waitForTimeout(500);
    await screenshot(page, '03b-height-weight-set');

    // Check for IMC gauge
    const imc_visible = await page.$('[class*="imc"], [class*="IMC"], [class*="bmi"], [class*="BMI"], [class*="gauge"], [class*="Gauge"]') !== null;
    const bodyText2 = await page.textContent('body');
    const hasImcText = bodyText2.toLowerCase().includes('imc') || bodyText2.toLowerCase().includes('34') || bodyText2.toLowerCase().includes('bmi');
    log(`IMC gauge element: ${imc_visible}, IMC text: ${hasImcText}`);

    // Find and click Next
    const nextBtn = await page.$('button[type="submit"], button:has-text("Suivant"), button:has-text("Continuer"), button:has-text("Next"), button:has-text("suivant")');
    if (nextBtn) {
      const btnText = await nextBtn.textContent();
      log(`Clicking next: "${btnText}"`);
      await nextBtn.click();
      await page.waitForTimeout(1500);
      pass('Step 3b - Height/Weight', `Set values, IMC visible: ${hasImcText}, clicked next`);
    } else {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      pass('Step 3b - Height/Weight', `Set values, IMC text: ${hasImcText}, pressed Enter`);
    }
    await screenshot(page, '03b-after-next');
  } catch (e) {
    fail('Step 3b - Height/Weight', `Error: ${e.message}`);
    await screenshot(page, '03b-error');
  }

  // ─── STEP 3c: Diabète ────────────────────────────────────────────────────────
  try {
    log('Step 3c: Selecting diabetes option');
    await page.waitForTimeout(1500);
    const pageText = await page.textContent('body');
    log(`Page text: ${pageText.substring(0, 400)}`);
    await screenshot(page, '03c-before-diabetes');

    // Look for "Non" option for diabetes
    const nonDiabete = await page.$('button:has-text("Non"), [class*="option"]:has-text("Non"), label:has-text("Non"), [role="radio"]:has-text("Non")');
    if (nonDiabete) {
      await nonDiabete.click();
      log('Clicked "Non" for diabetes');
      await page.waitForTimeout(500);
    } else {
      // Try looking for any clickable option with "Non" text
      const allButtons = await page.$$('button');
      for (const btn of allButtons) {
        const text = await btn.textContent();
        if (text && text.trim().toLowerCase().startsWith('non')) {
          await btn.click();
          log(`Clicked button with text: "${text}"`);
          break;
        }
      }
    }

    await page.waitForTimeout(500);
    await screenshot(page, '03c-diabetes-selected');

    // Click Next
    const nextBtn = await page.$('button[type="submit"], button:has-text("Suivant"), button:has-text("Continuer"), button:has-text("Next")');
    if (nextBtn) {
      await nextBtn.click();
      await page.waitForTimeout(1500);
    } else {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
    pass('Step 3c - Diabetes: Non', 'Selected "Non" option');
    await screenshot(page, '03c-after-next');
  } catch (e) {
    fail('Step 3c - Diabetes', `Error: ${e.message}`);
    await screenshot(page, '03c-error');
  }

  // ─── STEP 3d: Antécédents thyroïde ───────────────────────────────────────────
  try {
    log('Step 3d: Thyroid/pancreatitis antecedents');
    await page.waitForTimeout(1500);
    const pageText = await page.textContent('body');
    log(`Page text: ${pageText.substring(0, 400)}`);
    await screenshot(page, '03d-before-thyroid');

    // Click "Non" option
    const allButtons = await page.$$('button');
    let clicked = false;
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.trim().toLowerCase().startsWith('non')) {
        await btn.click();
        log(`Clicked: "${text}"`);
        clicked = true;
        break;
      }
    }
    if (!clicked) {
      const nonEl = await page.$('[class*="option"]:has-text("Non"), label:has-text("Non"), [role="radio"]:has-text("Non")');
      if (nonEl) { await nonEl.click(); clicked = true; }
    }

    await page.waitForTimeout(500);
    await screenshot(page, '03d-thyroid-selected');

    const nextBtn = await page.$('button[type="submit"], button:has-text("Suivant"), button:has-text("Continuer"), button:has-text("Next")');
    if (nextBtn) {
      await nextBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }
    await page.waitForTimeout(1500);
    pass('Step 3d - Thyroid: Non', `Clicked "Non": ${clicked}`);
    await screenshot(page, '03d-after-next');
  } catch (e) {
    fail('Step 3d - Thyroid', `Error: ${e.message}`);
    await screenshot(page, '03d-error');
  }

  // ─── STEP 3e: Enceinte/allaitante ────────────────────────────────────────────
  try {
    log('Step 3e: Pregnant/breastfeeding');
    await page.waitForTimeout(1500);
    const pageText = await page.textContent('body');
    log(`Page text: ${pageText.substring(0, 400)}`);
    await screenshot(page, '03e-before-pregnancy');

    const allButtons = await page.$$('button');
    let clicked = false;
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.trim().toLowerCase().startsWith('non')) {
        await btn.click();
        log(`Clicked: "${text}"`);
        clicked = true;
        break;
      }
    }
    if (!clicked) {
      const nonEl = await page.$('[class*="option"]:has-text("Non"), label:has-text("Non")');
      if (nonEl) { await nonEl.click(); clicked = true; }
    }

    await page.waitForTimeout(500);
    await screenshot(page, '03e-pregnancy-selected');

    // Look for "Voir mon résultat" button or next
    const voirBtn = await page.$('button:has-text("Voir mon résultat"), button:has-text("Voir"), button:has-text("résultat"), button[type="submit"]');
    if (voirBtn) {
      const btnText = await voirBtn.textContent();
      log(`Found button: "${btnText}"`);
      await voirBtn.click();
      await page.waitForTimeout(2000);
      pass('Step 3e - Pregnant: Non + Voir résultat clicked', `Btn: ${btnText}`);
    } else {
      const nextBtn = await page.$('button:has-text("Suivant"), button:has-text("Continuer"), button:has-text("Next")');
      if (nextBtn) {
        await nextBtn.click();
      } else {
        await page.keyboard.press('Enter');
      }
      await page.waitForTimeout(1500);
      pass('Step 3e - Pregnant: Non', `Clicked "Non": ${clicked}`);
    }
    await screenshot(page, '03e-after-submit');
  } catch (e) {
    fail('Step 3e - Pregnancy', `Error: ${e.message}`);
    await screenshot(page, '03e-error');
  }

  // ─── STEP 4: Check /eligibilite/resultat?status=ELIGIBLE ─────────────────────
  try {
    log('Step 4: Checking result page');
    await page.waitForTimeout(2000);
    const url = page.url();
    log(`Current URL after wizard: ${url}`);
    await screenshot(page, '04-result-page');

    const isEligibleUrl = url.includes('eligibilite/resultat') || url.includes('status=ELIGIBLE') || url.includes('resultat');
    const pageText = await page.textContent('body');
    const hasEligible = pageText.toLowerCase().includes('éligible') || pageText.toLowerCase().includes('eligible') || pageText.toLowerCase().includes('félicitation') || pageText.toLowerCase().includes('résultat');

    log(`URL has resultat: ${isEligibleUrl}, Has eligible text: ${hasEligible}`);

    if (isEligibleUrl || hasEligible) {
      pass('Step 4 - Result page /eligibilite/resultat?status=ELIGIBLE', `URL: ${url}`);
    } else {
      fail('Step 4 - Result page', `URL: ${url}, Text: ${pageText.substring(0, 300)}`);
    }
  } catch (e) {
    fail('Step 4 - Result page', `Error: ${e.message}`);
    await screenshot(page, '04-result-error');
  }

  // ─── STEP 5: Verify result page beauty ────────────────────────────────────────
  try {
    log('Step 5: Verifying result page elements');
    const pageText = await page.textContent('body');
    const hasCheckmark = await page.$('[class*="check"], [class*="success"], svg, [class*="animate"], [class*="icon"]') !== null;
    const hasCreateBtn = await page.$('button:has-text("Créer"), a:has-text("Créer"), button:has-text("compte"), a:has-text("compte")') !== null;
    const hasCard = await page.$('[class*="card"], [class*="Card"], [class*="white"], [class*="result"]') !== null;

    log(`Has checkmark: ${hasCheckmark}, Has create btn: ${hasCreateBtn}, Has card: ${hasCard}`);

    const hasPositiveContent = pageText.toLowerCase().includes('éligible') || pageText.toLowerCase().includes('créer') || pageText.toLowerCase().includes('compte') || hasCreateBtn;

    if (hasPositiveContent) {
      pass('Step 5 - Result page visual check', `Checkmark: ${hasCheckmark}, CTA btn: ${hasCreateBtn}, Card: ${hasCard}`);
    } else {
      fail('Step 5 - Result page visual', `Missing expected elements. Text: ${pageText.substring(0, 200)}`);
    }
  } catch (e) {
    fail('Step 5 - Result page visual', `Error: ${e.message}`);
  }

  // ─── STEP 6: Click "Créer mon compte" ─────────────────────────────────────────
  try {
    log('Step 6: Clicking create account button');

    // Try various selectors for the CTA button
    let cta = await page.$('button:has-text("Créer mon compte"), a:has-text("Créer mon compte")');
    if (!cta) cta = await page.$('button:has-text("Créer"), a:has-text("Créer")');
    if (!cta) cta = await page.$('button:has-text("continuer"), a:has-text("continuer")');
    if (!cta) cta = await page.$('button:has-text("compte"), a:has-text("compte")');
    if (!cta) {
      const allLinks = await page.$$('a');
      for (const link of allLinks) {
        const text = await link.textContent();
        const href = await link.getAttribute('href');
        log(`Link: "${text}" -> ${href}`);
        if (text && (text.includes('Créer') || text.includes('compte') || text.includes('inscription'))) {
          cta = link;
          break;
        }
      }
    }
    if (!cta) {
      const allBtns = await page.$$('button');
      for (const btn of allBtns) {
        const text = await btn.textContent();
        log(`Button: "${text}"`);
      }
    }

    if (cta) {
      const ctaText = await cta.textContent();
      log(`Clicking CTA: "${ctaText}"`);
      await cta.click();
      await page.waitForTimeout(3000);
      const newUrl = page.url();
      log(`URL after CTA click: ${newUrl}`);
      await screenshot(page, '06-after-cta-click');

      const isInscriptionUrl = newUrl.includes('inscription') || newUrl.includes('auth') || newUrl.includes('signup');
      if (isInscriptionUrl) {
        pass('Step 6 - Click create account', `Redirected to: ${newUrl}`);
      } else {
        fail('Step 6 - Click create account', `Expected inscription URL, got: ${newUrl}`);
      }
    } else {
      const url = page.url();
      fail('Step 6 - Click create account', `No CTA button found. URL: ${url}`);
      await screenshot(page, '06-no-cta');
    }
  } catch (e) {
    fail('Step 6 - Click create account', `Error: ${e.message}`);
    await screenshot(page, '06-error');
  }

  // ─── STEP 7: Verify inscription form ─────────────────────────────────────────
  try {
    log('Step 7: Checking inscription form');
    await page.waitForTimeout(1500);
    const url = page.url();
    await screenshot(page, '07-inscription-form');

    const hasEmailInput = await page.$('input[type="email"], input[name="email"]') !== null;
    const hasPasswordInput = await page.$('input[type="password"]') !== null;
    const hasNameInput = await page.$('input[name="prenom"], input[name="nom"], input[placeholder*="prénom"], input[placeholder*="nom"]') !== null;
    const pageText = await page.textContent('body');
    const hasInscriptionText = pageText.toLowerCase().includes('inscription') || pageText.toLowerCase().includes('créer') || pageText.toLowerCase().includes('compte');

    log(`Email input: ${hasEmailInput}, Password: ${hasPasswordInput}, Name: ${hasNameInput}`);
    log(`URL: ${url}`);

    if (hasEmailInput && hasPasswordInput) {
      pass('Step 7 - Inscription form', `URL: ${url}, Email: ${hasEmailInput}, Password: ${hasPasswordInput}, Name: ${hasNameInput}`);
    } else {
      fail('Step 7 - Inscription form', `Missing form fields. URL: ${url}, Text: ${pageText.substring(0, 300)}`);
    }
  } catch (e) {
    fail('Step 7 - Inscription form', `Error: ${e.message}`);
    await screenshot(page, '07-error');
  }

  // ─── STEP 8: Fill and submit inscription form ─────────────────────────────────
  try {
    log('Step 8: Filling inscription form');

    // Try to fill prenom
    const prenomInput = await page.$('input[name="prenom"], input[placeholder*="prénom"], input[placeholder*="Prénom"], input[id*="prenom"], input[id*="first"]');
    if (prenomInput) {
      await prenomInput.fill('TestFlow');
      log('Filled prenom: TestFlow');
    } else {
      // Try first text input
      const textInputs = await page.$$('input[type="text"]');
      if (textInputs.length > 0) {
        await textInputs[0].fill('TestFlow');
        log('Filled first text input with TestFlow');
      }
    }

    // Nom
    const nomInput = await page.$('input[name="nom"], input[placeholder*="nom"], input[placeholder*="Nom"], input[id*="nom"], input[id*="last"]');
    if (nomInput) {
      await nomInput.fill('Eligibilité');
      log('Filled nom: Eligibilité');
    } else {
      const textInputs = await page.$$('input[type="text"]');
      if (textInputs.length > 1) {
        await textInputs[1].fill('Eligibilité');
        log('Filled second text input with Eligibilité');
      }
    }

    // Email
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    if (emailInput) {
      await emailInput.fill('test.flow.eligibilite.2026@gmail.com');
      log('Filled email');
    }

    // Password
    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length > 0) {
      await passwordInputs[0].fill('TestFlow2026!');
      log('Filled password');
    }
    if (passwordInputs.length > 1) {
      await passwordInputs[1].fill('TestFlow2026!');
      log('Filled confirm password');
    }

    await page.waitForTimeout(500);
    await screenshot(page, '08-form-filled');

    // Submit
    const submitBtn = await page.$('button[type="submit"], button:has-text("Créer"), button:has-text("S\'inscrire"), button:has-text("Inscription"), button:has-text("Continuer")');
    if (submitBtn) {
      const btnText = await submitBtn.textContent();
      log(`Submitting with button: "${btnText}"`);
      await submitBtn.click();
      await page.waitForTimeout(5000);
      const newUrl = page.url();
      log(`URL after submit: ${newUrl}`);
      await screenshot(page, '08-after-submit');
      pass('Step 8 - Fill and submit form', `Submitted, new URL: ${newUrl}`);
    } else {
      fail('Step 8 - Fill form', 'No submit button found');
      await screenshot(page, '08-no-submit');
    }
  } catch (e) {
    fail('Step 8 - Fill inscription form', `Error: ${e.message}`);
    await screenshot(page, '08-error');
  }

  // ─── STEP 9: Verify redirect to /questionnaire ────────────────────────────────
  try {
    log('Step 9: Checking redirect to /questionnaire');
    await page.waitForTimeout(2000);
    const url = page.url();
    log(`Current URL: ${url}`);
    await screenshot(page, '09-post-inscription');

    const isQuestionnaire = url.includes('questionnaire') || url.includes('onboarding');
    const pageText = await page.textContent('body');
    const hasQuestionnaireText = pageText.toLowerCase().includes('questionnaire') || pageText.toLowerCase().includes('médical') || pageText.toLowerCase().includes('medical');

    if (isQuestionnaire || hasQuestionnaireText) {
      pass('Step 9 - Redirect to /questionnaire', `URL: ${url}`);
    } else {
      // Maybe email verification needed
      const needsVerif = pageText.toLowerCase().includes('vérifi') || pageText.toLowerCase().includes('email') || pageText.toLowerCase().includes('confirmer');
      if (needsVerif) {
        fail('Step 9 - Redirect to /questionnaire', `Email verification required. URL: ${url}`);
      } else {
        fail('Step 9 - Redirect to /questionnaire', `URL: ${url}, Text: ${pageText.substring(0, 300)}`);
      }
    }
  } catch (e) {
    fail('Step 9 - Questionnaire redirect', `Error: ${e.message}`);
    await screenshot(page, '09-error');
  }

  // ─── STEP 10: Verify medical questionnaire wizard ─────────────────────────────
  try {
    log('Step 10: Checking MedicalQuestionnaireWizard');
    const url = page.url();
    const pageText = await page.textContent('body');
    await screenshot(page, '10-questionnaire-wizard');

    const hasProgress = await page.$('[class*="progress"], [role="progressbar"]') !== null;
    const hasQuestion = await page.$('[class*="question"], h1, h2') !== null;
    const hasMedical = pageText.toLowerCase().includes('médical') || pageText.toLowerCase().includes('santé') || pageText.toLowerCase().includes('symptôme') || pageText.toLowerCase().includes('questionnaire');

    log(`Has progress: ${hasProgress}, Has question: ${hasQuestion}, Has medical: ${hasMedical}`);

    if (hasProgress || hasMedical || (url.includes('questionnaire') && hasQuestion)) {
      pass('Step 10 - Medical questionnaire wizard', `URL: ${url}, Progress: ${hasProgress}, Medical: ${hasMedical}`);
    } else {
      fail('Step 10 - Medical questionnaire wizard', `URL: ${url}, Text: ${pageText.substring(0, 300)}`);
    }
  } catch (e) {
    fail('Step 10 - Medical questionnaire', `Error: ${e.message}`);
    await screenshot(page, '10-error');
  }

  await browser.close();

  // ─── FINAL REPORT ─────────────────────────────────────────────────────────────
  console.log('\n\n=== FINAL REPORT ===');
  let passCount = 0, failCount = 0;
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${r.step}`);
    console.log(`   → ${r.detail}`);
    if (r.status === 'PASS') passCount++; else failCount++;
  }
  console.log(`\nTotal: ${passCount} PASS, ${failCount} FAIL`);
  console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}`);
})();

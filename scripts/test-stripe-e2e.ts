/**
 * Test E2E paiement Stripe (carte 4242…) + webhook /api/webhooks/stripe + vérif DB.
 *
 * Prérequis : serveur local sur :3001 avec STRIPE_IPE_WEBHOOK_SECRET identique à E2E_WEBHOOK_SECRET.
 * Usage : npx tsx scripts/test-stripe-e2e.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const BASE_URL = process.env.MEDSIM_E2E_BASE ?? "http://localhost:3001";
const EMAIL = "sophie.eligible@medsim.ca";
const PASSWORD = "Patient2026!";
/** Doit correspondre à STRIPE_IPE_WEBHOOK_SECRET du serveur Next.js */
const E2E_WEBHOOK_SECRET =
  process.env.STRIPE_IPE_WEBHOOK_SECRET ?? "whsec_e2e_local_test_key";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  try {
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    console.warn("⚠️  .env introuvable — variables système uniquement");
  }
}

function mapStripeIpeEnv() {
  if (!process.env.STRIPE_IPE_PRICE_ID && process.env.STRIPE_PRICE_ID) {
    process.env.STRIPE_IPE_PRICE_ID = process.env.STRIPE_PRICE_ID;
  }
  if (
    !process.env.NEXT_PUBLIC_STRIPE_IPE_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ) {
    process.env.NEXT_PUBLIC_STRIPE_IPE_PUBLISHABLE_KEY =
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  }
  if (!process.env.STRIPE_IPE_WEBHOOK_SECRET) {
    process.env.STRIPE_IPE_WEBHOOK_SECRET = E2E_WEBHOOK_SECRET;
  }
}

function log(step: string, ok: boolean, detail: string) {
  console.log(`${ok ? "✅" : "❌"} [${step}] ${detail}`);
}

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { res, text, json };
}

async function loginSessionCookie(): Promise<string> {
  const csrf = await fetchJson(`${BASE_URL}/api/auth/csrf`);
  const csrfToken = (csrf.json as { csrfToken?: string })?.csrfToken;
  if (!csrfToken) throw new Error("CSRF token introuvable");

  const csrfCookies = csrf.res.headers.getSetCookie?.() ?? [];
  const cookieHeader = csrfCookies.map((c) => c.split(";")[0]).join("; ");

  const body = new URLSearchParams({
    email: EMAIL,
    password: PASSWORD,
    csrfToken,
    redirect: "false",
    json: "true",
    callbackUrl: `${BASE_URL}/paiement`,
  });

  const auth = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader,
    },
    body,
    redirect: "manual",
  });

  const authCookies = auth.headers.getSetCookie?.() ?? [];
  const all = [...csrfCookies, ...authCookies]
    .map((c) => c.split(";")[0])
    .filter(Boolean)
    .join("; ");

  if (!all.includes("session-token") && !all.includes("authjs")) {
    throw new Error(`Connexion échouée — cookies session absents (HTTP ${auth.status})`);
  }
  return all;
}

async function fillStripeCheckout(page: import("playwright").Page) {
  await page.waitForLoadState("networkidle", { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const emailField = page.locator('input[name="email"], input[type="email"]').first();
  if (await emailField.count()) {
    await emailField.fill(EMAIL);
  }

  const payWithCard = page.getByRole("button", { name: /carte|card/i });
  if (await payWithCard.count()) {
    await payWithCard.first().click({ timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1500);
  }

  async function fillInAnyFrame(selectors: string[], value: string): Promise<boolean> {
    for (const frame of page.frames()) {
      for (const sel of selectors) {
        const loc = frame.locator(sel).first();
        if (await loc.count()) {
          await loc.click({ timeout: 5000 }).catch(() => {});
          await loc.fill(value, { timeout: 10000 });
          return true;
        }
      }
    }
    return false;
  }

  const cardOk = await fillInAnyFrame(
    [
      'input[name="cardnumber"]',
      'input[name="cardNumber"]',
      'input[autocomplete="cc-number"]',
      'input[placeholder*="1234" i]',
      'input[aria-label*="card" i]',
      'input[aria-label*="carte" i]',
    ],
    "4242424242424242",
  );

  if (!cardOk) {
    await page.getByLabel(/numéro de carte|card number/i).fill("4242424242424242", { timeout: 15000 });
  }

  if (
    !(await fillInAnyFrame(
      [
        'input[name="exp-date"]',
        'input[name="cardExpiry"]',
        'input[autocomplete="cc-exp"]',
        'input[placeholder*="MM" i]',
      ],
      "1234",
    ))
  ) {
    await page.getByLabel(/expiration|expiry|mm/i).fill("1234", { timeout: 8000 }).catch(() => {});
  }

  if (
    !(await fillInAnyFrame(
      [
        'input[name="cvc"]',
        'input[name="cardCvc"]',
        'input[autocomplete="cc-csc"]',
        'input[placeholder*="CVC" i]',
      ],
      "123",
    ))
  ) {
    await page.getByLabel(/cvc|cvv|sécurité|security/i).fill("123", { timeout: 8000 }).catch(() => {});
  }

  const nameField = page.locator('input[name="billingName"], input[autocomplete="name"]').first();
  if (await nameField.count()) {
    await nameField.fill("Sophie Test");
  }

  const submit = page.locator(
    'button[type="submit"], button:has-text("Pay"), button:has-text("Payer"), button:has-text("Subscribe"), [data-testid="hosted-payment-submit-button"]',
  ).first();
  await submit.click({ timeout: 20000 });
}

async function fireWebhook(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<Response> {
  const event: Stripe.Event = {
    id: `evt_e2e_${Date.now()}`,
    object: "event",
    api_version: "2024-11-20.acacia",
    created: Math.floor(Date.now() / 1000),
    type: "checkout.session.completed",
    livemode: false,
    pending_webhooks: 0,
    request: null,
    data: { object: session },
  } as Stripe.Event;

  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: E2E_WEBHOOK_SECRET,
  });

  return fetch(`${BASE_URL}/api/webhooks/stripe`, {
    method: "POST",
    headers: {
      "stripe-signature": signature,
      "content-type": "application/json",
    },
    body: payload,
  });
}

async function main() {
  loadEnvFile();
  mapStripeIpeEnv();

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey) {
    console.error("❌ STRIPE_SECRET_KEY manquant dans .env");
    process.exit(1);
  }

  if (process.env.MEDSIM_DEMO_MODE === "true") {
    console.error("❌ MEDSIM_DEMO_MODE=true — désactivez-le pour tester Stripe");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const stripe = new Stripe(stripeKey);

  try {
    // ── Santé serveur ──
    const health = await fetch(BASE_URL).catch(() => null);
    if (!health?.ok) {
      console.error(`❌ Serveur inaccessible sur ${BASE_URL} — lancez npm run dev`);
      process.exit(1);
    }
    log("Serveur", true, BASE_URL);

    // ── Patient + fulfillment PENDING ──
    const user = await prisma.user.findUnique({ where: { email: EMAIL } });
    if (!user) {
      log("Patient seed", false, `${EMAIL} introuvable — exécutez npx tsx prisma/seed.ts`);
      process.exit(1);
    }

    let fulfillment = await prisma.medicationFulfillment.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!fulfillment) {
      log("Fulfillment", false, "Aucune ordonnance pour Sophie");
      process.exit(1);
    }

    if (fulfillment.paymentStatus === "PAID") {
      await prisma.medicationFulfillment.update({
        where: { id: fulfillment.id },
        data: {
          paymentStatus: "PENDING",
          status: "ISSUED",
          paidAt: null,
          stripeSessionId: null,
          stripePaymentIntentId: null,
        },
      });
      log("Reset fulfillment", true, `Réinitialisé ${fulfillment.id} → PENDING`);
    } else {
      log("Fulfillment", true, `${fulfillment.id} déjà PENDING`);
    }

    const fulfillmentId = fulfillment.id;

    // ── Playwright : connexion + checkout Stripe ──
    const cookieHeader = await loginSessionCookie();
    log("Auth API", true, EMAIL);

    const browser = await chromium.launch({
      headless: true,
      channel: process.env.PLAYWRIGHT_CHROME_CHANNEL ?? "chrome",
    });
    const context = await browser.newContext();
    const cookies = cookieHeader.split("; ").map((pair) => {
      const i = pair.indexOf("=");
      return {
        name: pair.slice(0, i),
        value: pair.slice(i + 1),
        domain: "localhost",
        path: "/",
      };
    });
    await context.addCookies(cookies);

    const page = await context.newPage();
    await page.goto(`${BASE_URL}/paiement`, { waitUntil: "networkidle", timeout: 60000 });

    const payBtn = page.locator('button:has-text("Payer")').first();
    if (!(await payBtn.count())) {
      log("Page paiement", false, "Bouton Payer introuvable");
      process.exit(1);
    }

    await payBtn.click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60000 });
    log("Redirect Stripe", true, page.url());

    await fillStripeCheckout(page);

    await page.waitForURL(/\/paiement\?.*paid=1/, { timeout: 120000 });
    log("Checkout Stripe", true, `Retour : ${page.url()}`);
    await browser.close();

    // ── Session Stripe depuis DB ──
    const afterCheckout = await prisma.medicationFulfillment.findUnique({
      where: { id: fulfillmentId },
    });
    const sessionId = afterCheckout?.stripeSessionId;
    if (!sessionId) {
      log("Session Stripe", false, "stripeSessionId absent en base après checkout");
      process.exit(1);
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      log(
        "Paiement Stripe",
        false,
        `payment_status=${session.payment_status} (attendu: paid)`,
      );
      process.exit(1);
    }
    log("Paiement Stripe", true, `Session ${sessionId} — paid`);

    // ── Webhook (simulation locale — Stripe CLI absent) ──
    const beforeWebhook = await prisma.medicationFulfillment.findUnique({
      where: { id: fulfillmentId },
    });
    if (beforeWebhook?.paymentStatus === "PAID") {
      log("Webhook", true, "Déjà PAID (webhook Stripe distant reçu ?)");
    } else {
      const whRes = await fireWebhook(stripe, session);
      const whBody = await whRes.text();
      if (!whRes.ok) {
        log("Webhook POST", false, `HTTP ${whRes.status} — ${whBody}`);
        console.error(
          "   → Vérifiez que le serveur tourne avec STRIPE_IPE_WEBHOOK_SECRET=",
          E2E_WEBHOOK_SECRET,
        );
        process.exit(1);
      }
      log("Webhook POST", true, `/api/webhooks/stripe → ${whBody}`);
    }

    // ── Vérification DB ──
    const final = await prisma.medicationFulfillment.findUnique({
      where: { id: fulfillmentId },
      include: { user: { select: { email: true, prenom: true } } },
    });

    const program = await prisma.weightProgram.findUnique({
      where: { userId: user.id },
    });

    const notif = await prisma.appNotification.findFirst({
      where: { userId: user.id, type: "PAYMENT_CONFIRMED" },
      orderBy: { createdAt: "desc" },
    });

    const fulfillmentOk =
      final?.paymentStatus === "PAID" && final.status === "IN_PREPARATION";
    log(
      "DB fulfillment",
      fulfillmentOk,
      `paymentStatus=${final?.paymentStatus}, status=${final?.status}, paidAt=${final?.paidAt?.toISOString() ?? "null"}`,
    );

    log(
      "DB weightProgram",
      program?.isActive === true && program?.status === "ACTIVE",
      `isActive=${program?.isActive}, status=${program?.status}`,
    );

    log(
      "DB notification",
      Boolean(notif),
      notif ? notif.title : "PAYMENT_CONFIRMED absent",
    );

    if (!fulfillmentOk) process.exit(1);

    console.log("\n🎉 Test paiement complet réussi — webhook + base de données OK\n");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("❌ Erreur fatale:", err);
  process.exit(1);
});

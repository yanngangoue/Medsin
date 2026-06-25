/**
 * Test E2E paiement prod — carte 4242, webhook Stripe, Glp1Membership PAID.
 * Usage: node scripts/test-prod-payment-e2e.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const PROD = "https://anne-sante.vercel.app";
const GLP1_MONTHLY_PRICE_CENTS = 14999;

function loadEnv() {
  for (const line of readFileSync(resolve(process.cwd(), ".env"), "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

const email = `prod.pay.${Date.now()}@medsim.test`;
const password = "ProdPay2026!";

async function pollMembership(userId, timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const m = await prisma.glp1Membership.findUnique({ where: { userId } });
    if (m?.status === "PAID") return m;
    await new Promise((r) => setTimeout(r, 2500));
  }
  return prisma.glp1Membership.findUnique({ where: { userId } });
}

async function fillStripeCheckout(page, userEmail) {
  await page.waitForTimeout(4000);
  await page.getByTestId("card-accordion-item-button").click({ force: true }).catch(() => {});
  await page.waitForTimeout(4000);

  const checkoutFrame = page.frames().find((f) => f.url().includes("checkout.stripe.com/c/pay"));
  if (!checkoutFrame) return false;

  const emailField = checkoutFrame.locator('input[name="email"]');
  if (await emailField.count()) await emailField.fill(userEmail);

  const cardNumber = checkoutFrame.locator('input[name="cardNumber"]');
  if (!(await cardNumber.count())) return false;

  await cardNumber.fill("4242424242424242");
  await checkoutFrame.locator('input[name="cardExpiry"]').fill("12/34");
  await checkoutFrame.locator('input[name="cardCvc"]').fill("123");

  const billingName = checkoutFrame.locator('input[name="billingName"]');
  if (await billingName.count()) await billingName.fill("Prod Pay Test");

  const postal = checkoutFrame.locator('input[name="billingPostalCode"]');
  if (await postal.count()) await postal.fill("H2X1Y4");

  await page.getByRole("button", { name: "S'abonner" }).click({ timeout: 30000 });
  return true;
}

async function main() {
  console.log(`\n=== Test paiement prod ${PROD} ===`);
  console.log(`Email: ${email}\n`);

  const reg = await fetch(`${PROD}/api/auth/inscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prenom: "Prod", nom: "Pay", email, password }),
  });
  if (reg.status !== 201) {
    console.error("❌ Inscription", reg.status, await reg.text());
    process.exit(1);
  }
  console.log("✓ Inscription");

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    console.error("❌ User absent en DB");
    process.exit(1);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: `${PROD}/paiement?paid=1&onboarding=1`,
    cancel_url: `${PROD}/paiement?cancelled=1`,
    client_reference_id: user.id,
    customer_email: user.email,
    metadata: { userId: user.id, purpose: "onboarding", product: "glp1-membership" },
    subscription_data: { metadata: { userId: user.id, purpose: "onboarding" } },
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "cad",
          product_data: { name: "Anne-sante — Programme GLP-1" },
          unit_amount: GLP1_MONTHLY_PRICE_CENTS,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
  });

  console.log("✓ Session Stripe:", session.id);
  const poll = pollMembership(user.id);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let filled = false;
  try {
    await page.goto(session.url, { timeout: 120000 });
    filled = await fillStripeCheckout(page, email);
    if (!filled) {
      console.error("❌ Champs carte introuvables");
      await page.screenshot({ path: "stripe-checkout-debug.png", fullPage: true });
    } else {
      console.log("✓ Carte 4242 / 12/34 / 123 — attente webhook…");
      await page.waitForTimeout(25000);
    }
  } finally {
    await browser.close();
  }

  const membership = await poll;
  const paidSession = await stripe.checkout.sessions.retrieve(session.id);

  console.log("\n--- Stripe ---");
  console.log("payment_status:", paidSession.payment_status);
  console.log("status:", paidSession.status);

  const events = await stripe.events.list({ limit: 30, type: "checkout.session.completed" });
  const evt = events.data.find((e) => e.data?.object?.id === session.id);

  console.log("\n--- Webhook Stripe → prod ---");
  if (evt) {
    const delivered = evt.pending_webhooks === 0;
    console.log("event:", evt.id);
    console.log("pending_webhooks:", evt.pending_webhooks, delivered ? "✓ livré" : "⚠ en attente/échec");
  } else {
    console.log("checkout.session.completed: non listé (paiement peut-être incomplet)");
  }

  console.log("\n--- Base de données ---");
  console.log("Glp1Membership.status:", membership?.status ?? "absent");
  console.log("paidAt:", membership?.paidAt ?? "—");
  console.log("stripeSessionId:", membership?.stripeSessionId ?? "—");

  const ok = filled && paidSession.payment_status === "paid" && membership?.status === "PAID";
  console.log(ok ? "\n🎉 SUCCÈS\n" : "\n❌ ÉCHEC\n");
  process.exit(ok ? 0 : 1);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

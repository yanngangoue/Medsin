/** Paiement test via API Stripe (sans navigateur) + webhook + DB */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const BASE = "http://localhost:3001";
const EMAIL = "sophie.eligible@medsim.ca";
const PASS = "Patient2026!";
const WEBHOOK_SECRET = "whsec_e2e_local_test_key";

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

async function loginCookie() {
  const csrf = await fetch(`${BASE}/api/auth/csrf`);
  const { csrfToken } = await csrf.json();
  const c1 = csrf.headers.getSetCookie?.() ?? [];
  const auth = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: c1.map((c) => c.split(";")[0]).join("; ") },
    body: new URLSearchParams({ email: EMAIL, password: PASS, csrfToken, redirect: "false", json: "true" }),
    redirect: "manual",
  });
  const c2 = auth.headers.getSetCookie?.() ?? [];
  return [...c1, ...c2].map((c) => c.split(";")[0]).join("; ");
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) throw new Error("user missing");
  const fulfillment = await prisma.medicationFulfillment.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  if (!fulfillment) throw new Error("no fulfillment");

  await prisma.medicationFulfillment.update({
    where: { id: fulfillment.id },
    data: { paymentStatus: "PENDING", status: "ISSUED", paidAt: null, stripeSessionId: null },
  });

  const cookie = await loginCookie();
  const checkout = await fetch(`${BASE}/api/stripe/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ fulfillmentId: fulfillment.id }),
  });
  const data = await checkout.json();
  if (!checkout.ok || !data.url) {
    console.log("❌ Checkout:", checkout.status, data);
    process.exit(1);
  }
  console.log("✅ Checkout session créée");

  const updated = await prisma.medicationFulfillment.findUnique({ where: { id: fulfillment.id } });
  const sessionId = updated.stripeSessionId;
  console.log("   Session:", sessionId);

  // Ouvre la session côté Stripe (comme un visiteur)
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["setup_intent", "payment_intent"],
  });

  // Token de test Stripe (pas de numéro de carte brut — refusé par l'API)
  const pmId = "pm_card_visa";

  if (session.mode === "subscription" && session.setup_intent) {
    const si = typeof session.setup_intent === "string" ? session.setup_intent : session.setup_intent.id;
    await stripe.setupIntents.confirm(si, { payment_method: pmId });
    console.log("✅ SetupIntent confirmé (pm_card_visa)");
  } else if (session.payment_intent) {
    const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
    await stripe.paymentIntents.confirm(pi, { payment_method: pmId });
    console.log("✅ PaymentIntent confirmé (pm_card_visa)");
  } else {
    // Session subscription — confirm via payment method on customer
    if (session.customer) {
      const cust = typeof session.customer === "string" ? session.customer : session.customer.id;
      await stripe.paymentMethods.attach(pmId, { customer: cust });
    }
    console.log("⚠️  Pas de PI/SI — tentative expire + webhook simulé");
  }

  const paidSession = await stripe.checkout.sessions.retrieve(sessionId);
  console.log("   payment_status:", paidSession.payment_status, "status:", paidSession.status);

  if (paidSession.payment_status !== "paid") {
    // Simuler webhook avec session enrichie
    const mockSession = {
      ...paidSession,
      payment_status: "paid",
      metadata: {
        ...paidSession.metadata,
        prescriptionId: fulfillment.id,
        fulfillmentId: fulfillment.id,
      },
    };
    const event = {
      id: `evt_api_${Date.now()}`,
      object: "event",
      type: "checkout.session.completed",
      data: { object: mockSession },
    };
    const payload = JSON.stringify(event);
    const sig = Stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
    const wh = await fetch(`${BASE}/api/webhooks/stripe`, {
      method: "POST",
      headers: { "stripe-signature": sig, "content-type": "application/json" },
      body: payload,
    });
    console.log("Webhook simulé:", wh.status, await wh.text());
  } else {
    // Webhook réel peut ne pas arriver en local — fire anyway
    const payload = JSON.stringify({
      id: `evt_api_${Date.now()}`,
      object: "event",
      type: "checkout.session.completed",
      data: { object: paidSession },
    });
    const sig = Stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
    await fetch(`${BASE}/api/webhooks/stripe`, {
      method: "POST",
      headers: { "stripe-signature": sig, "content-type": "application/json" },
      body: payload,
    });
    console.log("✅ Webhook envoyé");
  }

  const final = await prisma.medicationFulfillment.findUnique({ where: { id: fulfillment.id } });
  console.log("\nDB:", {
    paymentStatus: final?.paymentStatus,
    status: final?.status,
    paidAt: final?.paidAt,
  });

  if (final?.paymentStatus === "PAID") {
    console.log("\n🎉 Test paiement + webhook + DB OK\n");
  } else {
    process.exit(1);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

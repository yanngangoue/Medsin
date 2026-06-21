/**
 * Vérifie le handler webhook + mise à jour DB (sans Stripe Checkout réel).
 * Usage : npx tsx scripts/test-stripe-webhook-db.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const BASE_URL = process.env.MEDSIM_E2E_BASE ?? "http://localhost:3001";
const EMAIL = "sophie.eligible@medsim.ca";
const WEBHOOK_SECRET =
  process.env.STRIPE_IPE_WEBHOOK_SECRET ?? "whsec_e2e_local_test_key";

function loadEnv() {
  try {
    const lines = readFileSync(resolve(process.cwd(), ".env"), "utf8").split("\n");
    for (const line of lines) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* ignore */
  }
}

async function main() {
  loadEnv();
  const prisma = new PrismaClient();
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  const stripe = stripeKey && !stripeKey.includes("...") ? new Stripe(stripeKey) : null;

  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) throw new Error(`Patient ${EMAIL} introuvable`);

  let fulfillment = await prisma.medicationFulfillment.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  if (!fulfillment) throw new Error("Fulfillment introuvable");

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
  console.log("✅ Fulfillment réinitialisé:", fulfillment.id);

  const sessionId = `cs_test_e2e_${Date.now()}`;
  const session = {
    id: sessionId,
    object: "checkout.session",
    payment_status: "paid",
    metadata: {
      prescriptionId: fulfillment.id,
      fulfillmentId: fulfillment.id,
      userId: user.id,
      product: "glp1-medication",
    },
    payment_intent: `pi_test_e2e_${Date.now()}`,
    subscription: `sub_test_e2e_${Date.now()}`,
  } as Stripe.Checkout.Session;

  const event = {
    id: `evt_e2e_${Date.now()}`,
    object: "event",
    type: "checkout.session.completed",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    data: { object: session },
  };

  const payload = JSON.stringify(event);
  const signature = stripe
    ? stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET })
    : Stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });

  const res = await fetch(`${BASE_URL}/api/webhooks/stripe`, {
    method: "POST",
    headers: { "stripe-signature": signature, "content-type": "application/json" },
    body: payload,
  });
  const body = await res.text();
  console.log(`Webhook HTTP ${res.status}:`, body);

  const updated = await prisma.medicationFulfillment.findUnique({
    where: { id: fulfillment.id },
  });
  const program = await prisma.weightProgram.findUnique({ where: { userId: user.id } });
  const notif = await prisma.appNotification.findFirst({
    where: { userId: user.id, type: "PAYMENT_CONFIRMED" },
    orderBy: { createdAt: "desc" },
  });

  console.log("DB fulfillment:", {
    paymentStatus: updated?.paymentStatus,
    status: updated?.status,
    paidAt: updated?.paidAt,
    stripeSessionId: updated?.stripeSessionId,
  });
  console.log("DB program:", { isActive: program?.isActive, status: program?.status });
  console.log("DB notif:", notif?.title ?? null);

  const ok =
    res.ok &&
    updated?.paymentStatus === "PAID" &&
    updated?.status === "IN_PREPARATION" &&
    program?.isActive === true;

  if (!ok) process.exit(1);
  console.log("\n🎉 Webhook + DB OK\n");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

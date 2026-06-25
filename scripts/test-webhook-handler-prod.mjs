/**
 * Test handler prod : webhook signé (secret local) → membership PAID pour un vrai userId.
 * Valide le code webhook, pas la livraison Stripe dashboard.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const PROD = "https://anne-sante.vercel.app";

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
const wh = process.env.STRIPE_IPE_WEBHOOK_SECRET?.trim();
const prisma = new PrismaClient();

const email = `handler.test.${Date.now()}@medsim.test`;

const reg = await fetch(`${PROD}/api/auth/inscription`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prenom: "Handler", nom: "Test", email, password: "HandlerTest2026!" }),
});
if (reg.status !== 201) {
  console.error("Inscription failed", reg.status);
  process.exit(1);
}

const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
if (!user) {
  console.error("User not in DB");
  process.exit(1);
}

const sessionId = `cs_test_handler_${Date.now()}`;
const event = {
  id: `evt_handler_${Date.now()}`,
  object: "event",
  type: "checkout.session.completed",
  data: {
    object: {
      id: sessionId,
      object: "checkout.session",
      payment_status: "paid",
      metadata: { userId: user.id, purpose: "onboarding", product: "glp1-membership" },
      client_reference_id: user.id,
      subscription: `sub_test_${Date.now()}`,
    },
  },
};

const payload = JSON.stringify(event);
const sig = Stripe.webhooks.generateTestHeaderString({ payload, secret: wh });
const res = await fetch(`${PROD}/api/webhooks/stripe`, {
  method: "POST",
  headers: { "content-type": "application/json", "stripe-signature": sig },
  body: payload,
});
console.log("Webhook POST →", res.status, await res.text());

await new Promise((r) => setTimeout(r, 2000));
const m = await prisma.glp1Membership.findUnique({ where: { userId: user.id } });
console.log("Glp1Membership:", m?.status, m?.paidAt);
console.log(m?.status === "PAID" ? "✅ Handler OK" : "❌ Handler failed");
await prisma.$disconnect();
process.exit(m?.status === "PAID" ? 0 : 1);

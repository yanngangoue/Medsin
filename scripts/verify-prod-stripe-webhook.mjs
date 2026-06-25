/**
 * Vérifie webhook Stripe prod sans afficher les secrets complets.
 * Usage: node scripts/verify-prod-stripe-webhook.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Stripe from "stripe";

const PROD_BASE = "https://anne-sante.vercel.app";
const WEBHOOK_PATH = "/api/webhooks/stripe";

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

function mask(s) {
  if (!s) return "(absent)";
  if (s.length < 12) return "(trop court)";
  return `${s.slice(0, 8)}…${s.slice(-4)}`;
}

loadEnv();

const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
const localWh =
  process.env.STRIPE_IPE_WEBHOOK_SECRET?.trim() ||
  process.env.STRIPE_WEBHOOK_SECRET?.trim() ||
  "";

console.log("=== Webhook Stripe — diagnostic prod ===\n");
console.log("Local STRIPE_IPE_WEBHOOK_SECRET :", mask(process.env.STRIPE_IPE_WEBHOOK_SECRET));
console.log("Local STRIPE_WEBHOOK_SECRET     :", mask(process.env.STRIPE_WEBHOOK_SECRET));
console.log("Secret utilisé pour test        :", mask(localWh));

if (!stripeKey) {
  console.error("\n❌ STRIPE_SECRET_KEY absent dans .env");
  process.exit(1);
}

const stripe = new Stripe(stripeKey);

const endpoints = await stripe.webhookEndpoints.list({ limit: 20 });
const prodUrl = `${PROD_BASE}${WEBHOOK_PATH}`;
const matching = endpoints.data.filter(
  (e) => e.url === prodUrl || e.url.includes("anne-sante.vercel.app"),
);

console.log("\n--- Endpoints Stripe (dashboard) ---");
if (matching.length === 0) {
  console.log(`⚠️  Aucun endpoint trouvé pour ${prodUrl}`);
  for (const e of endpoints.data) {
    console.log(`   • ${e.status} ${e.url}`);
  }
} else {
  for (const e of matching) {
    console.log(`✓ ${e.status} ${e.url}`);
    console.log(`  id: ${e.id}`);
    console.log(`  events: ${e.enabled_events?.slice(0, 5).join(", ")}${(e.enabled_events?.length ?? 0) > 5 ? "…" : ""}`);
  }
}

console.log("\n--- Sonde prod (sans secret valide) ---");
const probe = await fetch(`${PROD_BASE}${WEBHOOK_PATH}`, {
  method: "POST",
  headers: { "content-type": "application/json", "stripe-signature": "t=0,v1=invalid" },
  body: "{}",
});
const probeText = await probe.text();
console.log(`POST ${WEBHOOK_PATH} → HTTP ${probe.status}`);
if (probe.status === 503) {
  console.log("❌ Webhook NON CONFIGURÉ sur Vercel (STRIPE_IPE_WEBHOOK_SECRET manquant côté prod)");
} else if (probe.status === 400) {
  console.log("✓ Secret configuré sur Vercel (signature rejetée comme attendu)");
} else {
  console.log("⚠️  Réponse inattendue:", probeText.slice(0, 120));
}

if (localWh && !localWh.includes("...")) {
  const event = {
    id: `evt_verify_${Date.now()}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: `cs_verify_${Date.now()}`,
        object: "checkout.session",
        payment_status: "paid",
        metadata: { purpose: "onboarding", userId: "verify-no-op-user" },
        client_reference_id: "verify-no-op-user",
        subscription: "sub_verify_fake",
      },
    },
  };
  const payload = JSON.stringify(event);
  const sig = Stripe.webhooks.generateTestHeaderString({ payload, secret: localWh });
  const signed = await fetch(`${PROD_BASE}${WEBHOOK_PATH}`, {
    method: "POST",
    headers: { "content-type": "application/json", "stripe-signature": sig },
    body: payload,
  });
  const signedText = await signed.text();
  console.log("\n--- Test signature avec secret local (.env) ---");
  console.log(`→ HTTP ${signed.status}`);
  if (signed.status === 400) {
    console.log("❌ Secret local ≠ secret Vercel (signature invalide en prod)");
  } else if (signed.status === 200) {
    console.log("✅ Secret local accepté par prod (correspondance probable avec Vercel)");
  } else if (signed.status === 500) {
    console.log("✅ Signature OK — handler a traité (user test absent → erreur DB attendue)");
    console.log("   ", signedText.slice(0, 100));
  } else {
    console.log("   ", signedText.slice(0, 150));
  }
} else {
  console.log("\n⚠️  Pas de secret local pour test de correspondance");
}

console.log("\n--- Variables Vercel (noms) ---");
console.log("Le code lit: STRIPE_IPE_WEBHOOK_SECRET (lib/stripe/env.ts)");
console.log("Vercel prod liste: STRIPE_WEBHOOK_SECRET (sans prefix IPE) — vérifier alignement");

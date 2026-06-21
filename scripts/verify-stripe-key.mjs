import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Stripe from "stripe";

function loadEnv() {
  const content = readFileSync(resolve(process.cwd(), ".env"), "utf8");
  for (const line of content.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const key = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
const priceId =
  process.env.STRIPE_IPE_PRICE_ID?.trim() ??
  process.env.STRIPE_PRICE_ID?.trim() ??
  "";
const pk =
  process.env.NEXT_PUBLIC_STRIPE_IPE_PUBLISHABLE_KEY?.trim() ??
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ??
  "";
const wh = process.env.STRIPE_IPE_WEBHOOK_SECRET?.trim() ?? "";

function mask(s) {
  if (!s) return "(absent)";
  if (s.includes("...")) return "(placeholder — invalide)";
  if (s.length < 12) return "(trop court)";
  return `${s.slice(0, 7)}…${s.slice(-4)}`;
}

console.log("=== Vérification Stripe (.env) ===\n");
console.log("STRIPE_SECRET_KEY      :", mask(key));
console.log("STRIPE_IPE_PRICE_ID    :", mask(priceId));
console.log("NEXT_PUBLIC_STRIPE_IPE :", mask(pk));
console.log("STRIPE_IPE_WEBHOOK     :", mask(wh));

if (!key || key.includes("...")) {
  console.log("\n❌ STRIPE_SECRET_KEY manquante ou placeholder.");
  process.exit(1);
}

if (!key.startsWith("sk_test_") && !key.startsWith("sk_live_")) {
  console.log("\n❌ Format invalide — doit commencer par sk_test_ ou sk_live_");
  process.exit(1);
}

const stripe = new Stripe(key);

try {
  const balance = await stripe.balance.retrieve();
  console.log("\n✅ Clé secrète valide — connexion Stripe OK");
  console.log("   Mode:", balance.livemode ? "LIVE ⚠️" : "test");
  if (priceId && !priceId.includes("...")) {
    try {
      const price = await stripe.prices.retrieve(priceId);
      console.log("✅ STRIPE_IPE_PRICE_ID valide —", price.unit_amount ? `${price.unit_amount / 100} ${price.currency}` : price.id);
    } catch (e) {
      console.log("⚠️  STRIPE_IPE_PRICE_ID invalide ou absent:", e.message);
    }
  } else {
    console.log("⚠️  STRIPE_IPE_PRICE_ID non configuré — checkout utilisera price_data dynamique");
  }
  if (!wh || wh.includes("...")) {
    console.log("⚠️  STRIPE_IPE_WEBHOOK_SECRET manquant — webhooks locaux à configurer");
  }
} catch (e) {
  console.log("\n❌ Stripe a rejeté la clé:", e.message);
  process.exit(1);
}

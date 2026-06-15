/**
 * Génère les secrets manquants dans .env.local (min 32 car.) et optionnellement pousse sur Vercel.
 * Usage: node scripts/ensure-prod-secrets.mjs [--vercel]
 */
import { randomBytes } from "node:crypto";
import { execSync } from "node:child_process";
import fs from "node:fs";

const ENV_FILE = ".env.local";
const PROD_URL = process.env.MEDSIM_PROD_URL ?? "https://medsim-roan.vercel.app";
const LOCAL_URL = "http://localhost:3001";
const isProdPush = process.argv.includes("--vercel");

const GENERATE_KEYS = [
  "ENCRYPTION_KEY",
  "MEDSIM_CRON_SECRET",
  "CRON_SECRET",
  "MEDSIM_SERVICE_TOKEN",
  "MEDSIM_PARTNER_WEBHOOK_SECRET",
];

function secret() {
  return randomBytes(32).toString("base64url");
}

function parseEnv(text) {
  const map = new Map();
  const order = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 1) continue;
    const k = line.slice(0, i).trim();
    order.push(k);
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    map.set(k, v);
  }
  return { map, order };
}

function serializeEnv(text, updates) {
  const lines = text.split(/\r?\n/);
  const seen = new Set();
  const out = lines.map((line) => {
    if (!line.trim() || line.trim().startsWith("#")) return line;
    const i = line.indexOf("=");
    if (i < 1) return line;
    const k = line.slice(0, i).trim();
    if (!updates.has(k)) return line;
    seen.add(k);
    return `${k}="${updates.get(k)}"`;
  });
  for (const [k, v] of updates) {
    if (!seen.has(k)) out.push(`${k}="${v}"`);
  }
  return out.join("\n") + "\n";
}

function pushVercel(key, value) {
  execSync(`vercel env add ${key} production --force --yes`, {
    input: value,
    stdio: ["pipe", "pipe", "inherit"],
  });
  console.log(`  ✓ Vercel: ${key}`);
}

const raw = fs.readFileSync(ENV_FILE, "utf8");
const { map } = parseEnv(raw);
const updates = new Map();

updates.set("NEXTAUTH_URL", isProdPush ? PROD_URL : LOCAL_URL);
updates.set("NEXT_PUBLIC_APP_URL", isProdPush ? PROD_URL : LOCAL_URL);
updates.set("MEDSIM_DEMO_MODE", "false");
updates.set("MEDSIM_DEV_PASSWORD_RESET", "false");
updates.set("MEDSIM_ENABLE_DEV_INTEROP_PAGE", "false");

for (const key of GENERATE_KEYS) {
  const current = map.get(key)?.trim() ?? "";
  if (!current) {
    const v = secret();
    updates.set(key, v);
    console.log(`Généré: ${key}`);
  }
}

// CRON_SECRET = même valeur que MEDSIM_CRON_SECRET si l'un manque
const cron = updates.get("MEDSIM_CRON_SECRET") ?? map.get("MEDSIM_CRON_SECRET")?.trim();
if (cron && !(map.get("CRON_SECRET")?.trim() || updates.has("CRON_SECRET"))) {
  updates.set("CRON_SECRET", cron);
}

const next = serializeEnv(raw, updates);
fs.writeFileSync(ENV_FILE, next);
console.log(`Mis à jour ${ENV_FILE}`);

if (process.argv.includes("--vercel")) {
  console.log("\nPush Vercel production…");
  const all = new Map(map);
  for (const [k, v] of updates) all.set(k, v);
  for (const [k, v] of all) {
    if (!v?.trim()) continue;
    pushVercel(k, v);
  }
}

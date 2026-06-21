/** Démarre Next.js en forçant les variables du fichier .env (écrase le shell Windows). */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const envPath = resolve(process.cwd(), ".env");
const parsed = {};

for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq === -1) continue;
  const k = t.slice(0, eq).trim();
  let v = t.slice(eq + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  parsed[k] = v;
}

  if (!parsed.STRIPE_IPE_WEBHOOK_SECRET || parsed.STRIPE_IPE_WEBHOOK_SECRET.includes("...")) {
  parsed.STRIPE_IPE_WEBHOOK_SECRET = "whsec_e2e_local_test_key";
}

const childEnv = { ...process.env, ...parsed };

console.log("Dev avec .env — STRIPE_SECRET_KEY longueur:", parsed.STRIPE_SECRET_KEY?.length ?? 0);

const child = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  shell: true,
  env: childEnv,
  cwd: process.cwd(),
});

child.on("exit", (code) => process.exit(code ?? 0));

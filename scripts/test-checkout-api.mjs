/** Quick checkout API test — no browser */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE = "http://localhost:3001";
const EMAIL = "sophie.eligible@medsim.ca";
const PASS = "Patient2026!";

function loadEnv() {
  for (const line of readFileSync(resolve(process.cwd(), ".env"), "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const csrf = await fetch(`${BASE}/api/auth/csrf`);
const { csrfToken } = await csrf.json();
const c1 = csrf.headers.getSetCookie?.() ?? [];
const cookie = c1.map((c) => c.split(";")[0]).join("; ");

const auth = await fetch(`${BASE}/api/auth/callback/credentials`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookie },
  body: new URLSearchParams({ email: EMAIL, password: PASS, csrfToken, redirect: "false", json: "true" }),
  redirect: "manual",
});

const c2 = auth.headers.getSetCookie?.() ?? [];
const session = [...c1, ...c2].map((c) => c.split(";")[0]).join("; ");

const checkout = await fetch(`${BASE}/api/stripe/checkout`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: session },
  body: JSON.stringify({}),
});

console.log("checkout HTTP", checkout.status);
const body = await checkout.text();
console.log(body.slice(0, 500));
if (checkout.ok) {
  const { url } = JSON.parse(body);
  console.log("stripe url starts with checkout.stripe.com:", url?.includes("checkout.stripe.com"));
}

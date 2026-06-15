/**
 * Audit fonctionnel MVP Medsim — pages + APIs par rôle.
 * Prérequis : `npm run dev` (port 3001), seed : npx tsx prisma/seed.ts
 *
 * node scripts/mvp-audit.mjs
 */
const BASE = process.env.MEDSIM_SMOKE_BASE ?? "http://localhost:3001";

const ACCOUNTS = {
  patient: { email: "sophie.eligible@medsim.ca", password: "Patient2026!" },
  medecin: { email: "medecin@medsim.ca", password: "Medecin2026!" },
  admin: { email: "admin@medsim.ca", password: "Admin2026!" },
};

const PUBLIC_PAGES = [
  "/",
  "/eligibilite",
  "/questionnaire",
  "/auth/inscription",
  "/connexion",
  "/connexion/mot-de-passe-oublie",
  "/landing",
  "/confidentialite",
  "/conditions-utilisation",
  "/contact",
];

const PATIENT_PAGES = [
  "/dashboard/patient",
  "/dashboard/patient/poids",
  "/dashboard/patient/poids?tab=coach",
  "/dashboard/patient/ordonnance",
  "/dashboard/patient/clavardage",
  "/dashboard/patient/confidentialite",
  "/dashboard/patient/dossier",
];

const MEDECIN_PAGES = [
  "/medecin",
  "/medecin/file",
  "/medecin/patients",
  "/medecin/ordonnances",
  "/medecin/messages",
  "/medecin/agenda",
  "/dashboard/ips",
  "/dashboard/ips/patients",
  "/dashboard/ips/rapports",
];

const ADMIN_PAGES = ["/admin", "/admin/patients", "/admin/dashboard", "/admin/messages"];

function parseSetCookie(res) {
  if (typeof res.headers.getSetCookie === "function") return res.headers.getSetCookie();
  const raw = res.headers.get("set-cookie");
  return raw ? [raw] : [];
}

function mergeCookies(jar, res) {
  for (const line of parseSetCookie(res)) {
    const part = line.split(";")[0]?.trim();
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq < 1) continue;
    jar.set(part.slice(0, eq), part.slice(eq + 1));
  }
}

function cookieHeader(jar) {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function fetchJar(jar, url, init = {}) {
  const headers = new Headers(init.headers);
  const c = cookieHeader(jar);
  if (c) headers.set("Cookie", c);
  const res = await fetch(url, { ...init, headers, redirect: "manual" });
  mergeCookies(jar, res);
  return res;
}

async function login(jar, { email, password }) {
  const csrfRes = await fetchJar(jar, `${BASE}/api/auth/csrf`);
  if (!csrfRes.ok) throw new Error(`CSRF failed for ${email}`);
  const { csrfToken } = await csrfRes.json();
  const loginRes = await fetchJar(jar, `${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      csrfToken,
      email,
      password,
      callbackUrl: `${BASE}/`,
      json: "true",
    }),
  });
  const loc = loginRes.headers.get("location") ?? "";
  if (loc.includes("error=")) throw new Error(`Login refused ${email}: ${loc}`);
  if (loginRes.status === 302 && loc) {
    const nextUrl = loc.startsWith("http") ? loc : `${BASE}${loc}`;
    await fetchJar(jar, nextUrl);
  }
  const hasSession = [...jar.keys()].some((k) => k.includes("session-token"));
  if (!hasSession) throw new Error(`No session cookie for ${email}`);
  const sessionRes = await fetchJar(jar, `${BASE}/api/auth/session`);
  const session = await sessionRes.json();
  return session?.user ?? null;
}

async function checkPages(label, jar, paths) {
  const results = [];
  for (const path of paths) {
    const res = await fetchJar(jar, `${BASE}${path}`);
    const ok = res.status === 200;
    results.push({ path, status: res.status, ok });
    const icon = ok ? "✓" : "✗";
    console.log(`  ${icon} ${path} → ${res.status}`);
  }
  return results;
}

async function checkApi(jar, method, path, body) {
  const init = { method, headers: {} };
  if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const res = await fetchJar(jar, `${BASE}${path}`, init);
  let detail = "";
  try {
    const text = await res.text();
    detail = text.slice(0, 120);
  } catch {
    detail = "";
  }
  return { status: res.status, detail };
}

async function main() {
  let ok = 0;
  let fail = 0;
  let skip = 0;

  console.log("\n=== Pages publiques ===");
  const pubJar = new Map();
  for (const path of PUBLIC_PAGES) {
    const res = await fetchJar(pubJar, `${BASE}${path}`);
    const pass = res.status === 200;
    console.log(`  ${pass ? "✓" : "✗"} ${path} → ${res.status}`);
    pass ? ok++ : fail++;
  }

  console.log("\n=== Connexion comptes seed ===");
  const jars = {};
  for (const [role, creds] of Object.entries(ACCOUNTS)) {
    const jar = new Map();
    try {
      const user = await login(jar, creds);
      jars[role] = jar;
      console.log(`  ✓ ${role} (${user?.email}, role=${user?.role})`);
      ok++;
    } catch (e) {
      console.log(`  ✗ ${role} — ${e.message} (lancez: npx tsx prisma/seed.ts)`);
      fail++;
    }
  }

  if (jars.patient) {
    console.log("\n=== Dashboard patient (Sophie) ===");
    for (const r of await checkPages("patient", jars.patient, PATIENT_PAGES)) {
      r.ok ? ok++ : fail++;
    }

    console.log("\n=== APIs patient ===");
    const apis = [
      ["GET", "/api/patient/weight-program"],
      ["GET", "/api/patient/weight-program/coach"],
      ["POST", "/api/patient/weight-program/coach", { message: "Bonjour Anne" }],
      ["GET", "/api/me"],
    ];
    for (const [method, path, body] of apis) {
      const r = await checkApi(jars.patient, method, path, body);
      const expected =
        path.includes("/coach") && method === "POST"
          ? [404, 402, 403].includes(r.status) || r.status === 200
          : r.status < 500;
      const icon = expected ? "✓" : "✗";
      console.log(`  ${icon} ${method} ${path} → ${r.status}${r.detail ? ` (${r.detail.slice(0, 80)})` : ""}`);
      expected ? ok++ : fail++;
    }
  }

  if (jars.medecin) {
    console.log("\n=== Portail médecin + IPS ===");
    for (const r of await checkPages("medecin", jars.medecin, MEDECIN_PAGES)) {
      r.ok ? ok++ : fail++;
    }
  }

  if (jars.admin) {
    console.log("\n=== Portail admin ===");
    for (const r of await checkPages("admin", jars.admin, ADMIN_PAGES)) {
      r.ok ? ok++ : fail++;
    }
  }

  console.log("\n=== Inscription (nouveau compte) ===");
  const regJar = new Map();
  const email = `audit_${Date.now()}@medsim.test`;
  const reg = await fetchJar(regJar, `${BASE}/api/auth/inscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prenom: "Audit", nom: "Test", email, password: "TestMedsim1!" }),
  });
  if (reg.status === 201) {
    console.log(`  ✓ POST /api/auth/inscription → 201 (${email})`);
    ok++;
    try {
      await login(regJar, { email, password: "TestMedsim1!" });
      console.log("  ✓ Connexion immédiate après inscription");
      ok++;
    } catch (e) {
      console.log(`  ✗ Connexion post-inscription — ${e.message}`);
      fail++;
    }
  } else {
    console.log(`  ✗ Inscription → ${reg.status}`);
    fail++;
  }

  console.log("\n=== Paiement Stripe (attendu: échec sans vraies clés) ===");
  if (jars.patient) {
    const checkout = await checkApi(jars.patient, "POST", "/api/stripe/checkout", {
      fulfillmentId: "seed-nonexistent",
    });
    const stripeOk = checkout.status === 400 || checkout.status === 404 || checkout.status === 503;
    console.log(
      `  ${stripeOk ? "⚠" : "✗"} POST /api/stripe/checkout → ${checkout.status} (normal sans Stripe configuré)`,
    );
    skip++;
  }

  console.log(`\n--- Résumé audit MVP ---`);
  console.log(`  OK: ${ok}  |  Échecs: ${fail}  |  Ignorés (Stripe): ${skip}`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error("\nAudit MVP échoué:", e.message);
  process.exit(1);
});

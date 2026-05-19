/**
 * Smoke test Medsim — pages publiques + parcours patient (mode démo).
 * Prérequis : `npm run dev` sur le port 3001.
 */
const BASE = process.env.MEDSIM_SMOKE_BASE ?? "http://localhost:3001";

function parseSetCookie(res) {
  if (typeof res.headers.getSetCookie === "function") {
    return res.headers.getSetCookie();
  }
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

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const jar = new Map();
  let passed = 0;

  const home = await fetchJar(jar, `${BASE}/`);
  assert(home.status === 200, `Accueil: attendu 200, reçu ${home.status}`);
  const homeHtml = await home.text();
  assert(/Medsim|GLP-1/i.test(homeHtml), "Accueil: contenu Medsim absent");
  console.log("✓ Page d'accueil (200, branding)");
  passed++;

  const home = await fetchJar(jar, `${BASE}/`);
  assert(home.status === 200, `Accueil catalogue: attendu 200, reçu ${home.status}`);
  const homeHtml = await home.text();
  assert(homeHtml.includes("Medsim"), "Accueil: shell Medsim absent");
  const homeLoc = home.headers.get("location") ?? "";
  assert(!homeLoc.includes("connexion"), `Accueil: ne doit pas rediriger vers connexion (${homeLoc})`);
  console.log("✓ / affiche le catalogue services (page principale)");
  passed++;

  const email = `smoke_${Date.now()}@medsim.test`;
  const password = "TestMedsim1!";

  const reg = await fetchJar(jar, `${BASE}/api/auth/inscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prenom: "Smoke", email, password }),
  });
  if (reg.status === 201) {
    console.log("✓ Inscription patient (201)");
    passed++;

    const csrfRes = await fetchJar(jar, `${BASE}/api/auth/csrf`);
    assert(csrfRes.ok, "CSRF token fetch failed");
    const { csrfToken } = await csrfRes.json();

    const login = await fetchJar(jar, `${BASE}/api/auth/callback/credentials`, {
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
    const loginLoc = login.headers.get("location") ?? "";
    assert(
      login.status === 200 || login.status === 302,
      `Connexion: statut inattendu ${login.status}`,
    );
    assert(!loginLoc.includes("error="), `Connexion refusée (${loginLoc || "sans redirection"})`);
    if (login.status === 302 && loginLoc) {
      const nextUrl = loginLoc.startsWith("http") ? loginLoc : `${BASE}${loginLoc}`;
      await fetchJar(jar, nextUrl);
    }
    assert(jar.has("authjs.session-token"), "Connexion: cookie de session absent");
    console.log("✓ Connexion credentials");
    passed++;

    const sessionRes = await fetchJar(jar, `${BASE}/api/auth/session`);
    const session = await sessionRes.json();
    assert(session?.user?.email === email.toLowerCase(), "Session: email patient attendu");
    console.log(`✓ Session active (${session.user.role})`);
    passed++;

    const homeAuth = await fetchJar(jar, `${BASE}/`);
    assert(homeAuth.status === 200, `Accueil connecté: attendu 200, reçu ${homeAuth.status}`);
    console.log("✓ Accueil accessible après connexion");
    passed++;
  } else if (reg.status === 409) {
    console.log("⚠ Inscription ignorée (email déjà utilisé) — relancez ou changez l’email");
  } else {
    const err = await reg.text();
    console.log(
      `⚠ Inscription ${reg.status} — parcours patient authentifié non testé (démo/DB ?). Détail: ${err.slice(0, 120)}`,
    );
  }

  console.log(`\nSmoke Medsim : ${passed} vérification(s) OK sur ${BASE}`);
}

main().catch((e) => {
  console.error("\n✗ Smoke Medsim échoué:", e.message);
  process.exit(1);
});

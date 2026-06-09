/**
 * Ajoute le champ `code` aux réponses d'erreur JSON des routes API.
 */
import fs from "node:fs";
import path from "node:path";

const API_ROOT = path.join(process.cwd(), "app", "api");

const RULES = [
  { status: 401, code: "UNAUTHORIZED", patterns: ["Non autorisé", "Non authentifié"] },
  { status: 403, code: "FORBIDDEN", patterns: ["Accès refusé", "Accès réservé", "Réservé aux"] },
  { status: 404, code: "NOT_FOUND", patterns: ["Introuvable", "introuvable"] },
  { status: 409, code: "CONFLICT", patterns: ["déjà", "Déjà"] },
  { status: 400, code: "VALIDATION_ERROR", patterns: [] },
  { status: 503, code: "SERVICE_UNAVAILABLE", patterns: ["non configuré", "Webhook"] },
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name === "route.ts") files.push(full);
  }
  return files;
}

function addCodes(source) {
  let changed = false;
  let out = source;

  // NextResponse.json({ error: "..." }, { status: N }) sans code
  out = out.replace(
    /NextResponse\.json\(\s*\{\s*error:\s*("(?:[^"\\]|\\.)*")\s*\}\s*,\s*\{\s*status:\s*(\d+)\s*\}\s*\)/g,
    (match, msg, statusStr) => {
      if (match.includes("code:")) return match;
      const status = Number(statusStr);
      const rule =
        RULES.find((r) => r.status === status && r.patterns.some((p) => msg.includes(p))) ??
        RULES.find((r) => r.status === status);
      const code = rule?.code ?? "INTERNAL_ERROR";
      changed = true;
      return `NextResponse.json({ error: ${msg}, code: "${code}" }, { status: ${status} })`;
    },
  );

  return { out, changed };
}

let total = 0;
for (const file of walk(API_ROOT)) {
  const source = fs.readFileSync(file, "utf8");
  const { out, changed } = addCodes(source);
  if (changed) {
    fs.writeFileSync(file, out, "utf8");
    total++;
    console.log("codes:", path.relative(process.cwd(), file));
  }
}
console.log(`Done. ${total} file(s) updated.`);

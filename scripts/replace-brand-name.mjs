/**
 * Remplace « Anne Santé » par « Anne-sante » dans les textes visibles.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SKIP_DIRS = new Set(["node_modules", ".next", "export-parcours-glp1", ".git", "test-screenshots", "stripe-test-screenshots"]);

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      if (!SKIP_DIRS.has(ent.name)) walk(path.join(dir, ent.name), files);
    } else if (/\.(tsx?|jsx?|md|html|css|json)$/.test(ent.name) && ent.name !== "replace-brand-name.mjs") {
      files.push(path.join(dir, ent.name));
    }
  }
  return files;
}

let changed = 0;
for (const file of walk(ROOT)) {
  if (file.includes(`${path.sep}scripts${path.sep}rebrand-anne-sante.mjs`)) continue;
  const raw = fs.readFileSync(file, "utf8");
  if (!raw.includes("Anne Santé")) continue;
  const out = raw.replaceAll("Anne Santé", "Anne-sante");
  if (out !== raw) {
    fs.writeFileSync(file, out, "utf8");
    changed++;
    console.log("updated:", path.relative(ROOT, file));
  }
}
console.log(`\nDone — ${changed} file(s).`);

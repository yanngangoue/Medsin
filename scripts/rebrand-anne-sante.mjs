/**
 * Remplace MedSim/Medsim par Anne Santé dans les textes visibles.
 * Préserve : MedsimLogo, medsim-logo, @medsim.ca, MEDSIM_, chemins techniques.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "export-parcours-glp1",
  ".git",
  "test-screenshots",
  "stripe-test-screenshots",
]);
const SKIP_FILES = new Set(["rebrand-anne-sante.mjs", "package-lock.json", "package.json"]);

function shouldSkipDir(name) {
  return SKIP_DIRS.has(name);
}

function shouldSkipContentReplace(line) {
  const keep = [
    "MedsimLogo",
    "medsim-logo",
    "@medsim",
    "medsim.ca",
    "MEDSIM_",
    "medsim-",
    "medsim/",
    "medsim.",
    "yanngangoue/Medsin",
    "medsim-roan",
    "--font-medsim",
    "APP_BRAND",
    "Anne Santé",
  ];
  return keep.some((k) => line.includes(k));
}

function rebrandLine(line) {
  if (shouldSkipContentReplace(line)) return line;
  let out = line;
  if (out.includes("MedSim")) out = out.replaceAll("MedSim", "Anne Santé");
  if (out.includes("Medsim")) out = out.replaceAll("Medsim", "Anne Santé");
  return out;
}

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      if (!shouldSkipDir(ent.name)) walk(path.join(dir, ent.name), files);
    } else if (/\.(tsx?|jsx?|md|css|html|json)$/.test(ent.name) && !SKIP_FILES.has(ent.name)) {
      files.push(path.join(dir, ent.name));
    }
  }
  return files;
}

let changed = 0;
for (const file of walk(ROOT)) {
  if (file.includes(`${path.sep}scripts${path.sep}`) && !file.endsWith(".mjs")) continue;
  const raw = fs.readFileSync(file, "utf8");
  const lines = raw.split(/\r?\n/);
  const next = lines.map(rebrandLine);
  const out = next.join("\n");
  if (out !== raw) {
    fs.writeFileSync(file, out.endsWith("\n") || raw.endsWith("\n") ? out : out, "utf8");
    changed++;
    console.log("updated:", path.relative(ROOT, file));
  }
}

console.log(`\nDone — ${changed} file(s) updated.`);

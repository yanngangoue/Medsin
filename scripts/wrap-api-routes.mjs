/**
 * Ajoute catchRouteError aux handlers HTTP des routes app/api non encore enveloppés.
 * Usage: node scripts/wrap-api-routes.mjs
 */
import fs from "node:fs";
import path from "node:path";

const API_ROOT = path.join(process.cwd(), "app", "api");
const HTTP_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);
const IMPORT_LINE =
  'import { catchRouteError } from "@/lib/api/catch-route-error";\n';

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name === "route.ts") files.push(full);
  }
  return files;
}

function routeLabel(filePath) {
  const rel = path.relative(API_ROOT, filePath).replace(/\\/g, "/");
  return rel.replace(/\/route\.ts$/, "");
}

function findExportFunctions(source) {
  const results = [];
  const re = /export\s+async\s+function\s+(\w+)\s*\(/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const name = m[1];
    if (!HTTP_METHODS.has(name)) continue;
    const openParen = source.indexOf("(", m.index);
    let i = openParen;
    let depth = 0;
    while (i < source.length) {
      const ch = source[i];
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        if (depth === 0) {
          i++;
          break;
        }
      }
      i++;
    }
    while (i < source.length && /\s/.test(source[i])) i++;
    if (source[i] !== "{") continue;
    const bodyStart = i + 1;
    depth = 1;
    i = bodyStart;
    while (i < source.length && depth > 0) {
      const ch = source[i];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      i++;
    }
    const bodyEnd = i - 1;
    const body = source.slice(bodyStart, bodyEnd);
    if (/catchRouteError\s*\(/.test(body)) continue;
    results.push({
      name,
      headerStart: m.index,
      bodyStart,
      bodyEnd,
      body,
      signature: source.slice(m.index, bodyStart),
    });
  }
  return results;
}

function indentBlock(text, spaces) {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line.length ? pad + line : line))
    .join("\n");
}

function wrapFile(filePath) {
  let source = fs.readFileSync(filePath, "utf8");
  const fns = findExportFunctions(source);
  if (fns.length === 0) return false;

  const label = routeLabel(filePath);
  let offset = 0;
  for (const fn of fns) {
    const trimmed = fn.body.trim();
    const wrapped =
      `\n  return catchRouteError("${label}/${fn.name}", async () => {\n` +
      indentBlock(trimmed, 4) +
      "\n  });\n";
    const start = fn.bodyStart + offset;
    const end = fn.bodyEnd + offset;
    source = source.slice(0, start) + wrapped + source.slice(end);
    offset += wrapped.length - (end - start);
  }

  if (!source.includes('from "@/lib/api/catch-route-error"')) {
    const importMatch = source.match(/^import .+;\n/m);
    if (importMatch) {
      const pos = importMatch.index + importMatch[0].length;
      source = source.slice(0, pos) + IMPORT_LINE + source.slice(pos);
    } else {
      source = IMPORT_LINE + source;
    }
  }

  fs.writeFileSync(filePath, source, "utf8");
  return true;
}

const files = walk(API_ROOT);
let changed = 0;
for (const file of files) {
  if (wrapFile(file)) {
    changed++;
    console.log("wrapped:", path.relative(process.cwd(), file));
  }
}
console.log(`Done. ${changed} file(s) updated.`);

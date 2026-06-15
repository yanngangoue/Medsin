import fs from "node:fs";

const file = process.argv[2] ?? ".env.local";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
for (const line of lines) {
  if (!line.trim() || line.trim().startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i < 1) continue;
  const k = line.slice(0, i).trim();
  let v = line.slice(i + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  console.log(k, v ? "SET" : "EMPTY");
}

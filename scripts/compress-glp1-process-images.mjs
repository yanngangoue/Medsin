import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const DIR = join(process.cwd(), "public", "images");
const FILES = [
  "glp1-process-en-ligne.png",
  "glp1-process-livraison.png",
  "glp1-process-suivi-anne.png",
  "glp1-process-traitement-perso.png",
];

for (const file of FILES) {
  const input = join(DIR, file);
  const before = readFileSync(input).length;
  const buffer = await sharp(input)
    .resize(800, 800, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toBuffer();
  const out = join(DIR, file.replace(/\.png$/i, ".webp"));
  writeFileSync(out, buffer);
  console.log(`${file} → ${file.replace(/\.png$/i, ".webp")}: ${Math.round(before / 1024)}KB → ${Math.round(buffer.length / 1024)}KB`);
}

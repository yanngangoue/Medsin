import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "../public");

const BG = "#E8E8E6";
const FG = "#0B4D3B";

function faviconSvg(size) {
  const fontSize = Math.round(size * 0.36);
  const y = Math.round(size * 0.54);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${BG}"/>
  <text
    x="${size / 2}"
    y="${y}"
    text-anchor="middle"
    fill="${FG}"
    font-family="Georgia, 'Palatino Linotype', 'Times New Roman', serif"
    font-size="${fontSize}"
    font-weight="600"
    letter-spacing="-0.04em"
  >AS</text>
</svg>`;
}

async function renderPng(size) {
  return sharp(Buffer.from(faviconSvg(size))).png().toBuffer();
}

async function main() {
  const outputs = [
    { file: "favicon-16x16.png", size: 16 },
    { file: "favicon-32x32.png", size: 32 },
    { file: "apple-touch-icon.png", size: 180 },
    { file: "icon.png", size: 512 },
  ];

  const pngBuffers = {};

  for (const { file, size } of outputs) {
    const buffer = await renderPng(size);
    pngBuffers[size] = buffer;
    writeFileSync(resolve(publicDir, file), buffer);
    console.log(`Wrote ${file} (${size}x${size})`);
  }

  const ico = await toIco([pngBuffers[16], pngBuffers[32]]);
  writeFileSync(resolve(publicDir, "favicon.ico"), ico);
  console.log("Wrote favicon.ico");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

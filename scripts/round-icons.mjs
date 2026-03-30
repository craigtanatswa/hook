/**
 * Bakes rounded corners into logo PNGs (favicon / apple / logo).
 * Run: node scripts/round-icons.mjs
 */
import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const files = ["public/icon.png", "public/apple-icon.png", "public/logo.png"];
/** Corner radius as a fraction of the shorter side (matches common app-icon feel). */
const RADIUS_RATIO = 0.2;

async function roundOne(relPath) {
  const inputPath = join(root, relPath);
  const meta = await sharp(inputPath).metadata();
  const w = meta.width ?? 512;
  const h = meta.height ?? 512;
  const r = Math.max(8, Math.round(Math.min(w, h) * RADIUS_RATIO));

  const svg = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#ffffff"/>
    </svg>`
  );

  await sharp(inputPath)
    .ensureAlpha()
    .composite([{ input: svg, blend: "dest-in" }])
    .png()
    .toFile(inputPath + ".tmp");

  const fs = await import("fs/promises");
  await fs.rename(inputPath + ".tmp", inputPath);
  console.log("OK", relPath, `rx=${r}px`);
}

for (const f of files) {
  await roundOne(f);
}

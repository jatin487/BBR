/**
 * BBR Image Optimisation Script
 * ──────────────────────────────
 * Compresses oversized JPG images in public/vehicles/ using sharp.
 * Target: < 200KB per image at 1200px max width, 80% JPEG quality.
 *
 * Run:  node scripts/optimise-images.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT_DIR  = path.join(__dirname, '..', 'public', 'vehicles');
const MAX_WIDTH  = 1200;
const QUALITY    = 80;

const files = fs.readdirSync(INPUT_DIR).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

let saved = 0;

for (const file of files) {
  const filePath = path.join(INPUT_DIR, file);
  const before   = fs.statSync(filePath).size;

  const tmpPath = filePath + '.tmp';
  try {
    await sharp(filePath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
      .toFile(tmpPath);

    const after = fs.statSync(tmpPath).size;

    if (after < before) {
      fs.renameSync(tmpPath, filePath);
      const pct = (((before - after) / before) * 100).toFixed(1);
      console.log(`✅ ${file}: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB (saved ${pct}%)`);
      saved += (before - after);
    } else {
      fs.unlinkSync(tmpPath);
      console.log(`⏭️  ${file}: Already optimal (${(before/1024).toFixed(0)}KB)`);
    }
  } catch (err) {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    console.error(`❌ ${file}: ${err.message}`);
  }
}

console.log(`\n🏁 Total saved: ${(saved / 1024 / 1024).toFixed(2)} MB`);

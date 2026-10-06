/**
 * BBR Root Image Optimisation
 * Compresses the root-level public images (hero, gt650 variants).
 * Run:  node scripts/optimise-root-images.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_PUBLIC = path.join(__dirname, '..', 'public');

// Only process specific root images (not subdirs)
const TARGET_FILES = ['hero-bike.jpg', 'gt650-black.jpg', 'gt650-chrome.jpg', 'gt650-red.jpg'];

const MAX_WIDTH = 1920; // Hero images can be wider
const QUALITY = 82;

let saved = 0;

for (const file of TARGET_FILES) {
  const filePath = path.join(ROOT_PUBLIC, file);
  if (!fs.existsSync(filePath)) continue;

  const before = fs.statSync(filePath).size;
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

console.log(`\n🏁 Total saved: ${(saved / 1024).toFixed(0)} KB`);

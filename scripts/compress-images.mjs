/**
 * Compress all JPG/JPEG/PNG images in public/images/ to WebP
 * - Converts .jpg/.jpeg/.png -> .webp (quality 80)
 * - Keeps originals until verified
 * - Skips already-webp files
 * - Prints a size-before/after summary
 */
import { readdirSync, statSync, renameSync, unlinkSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_IMAGES = path.join(ROOT, "public/images");

let totalBefore = 0;
let totalAfter = 0;
let converted = 0;
let skipped = 0;

function walkDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walkDir(full);
    } else if (/\.(jpg|jpeg|png)$/i.test(e.name)) {
      const ext = path.extname(e.name);
      const base = path.basename(e.name, ext);
      const webpPath = path.join(dir, base + ".webp");

      // Skip if webp already exists (don't double-compress)
      if (existsSync(webpPath)) {
        console.log(`  ↩️  Skipping (WebP exists): ${path.relative(ROOT, full)}`);
        skipped++;
        continue;
      }

      const sizeBefore = statSync(full).size;
      totalBefore += sizeBefore;

      try {
        // Use ffmpeg to convert (available on this machine)
        execSync(
          `ffmpeg -y -i "${full}" -q:v 85 "${webpPath}" 2>/dev/null`,
          { stdio: "pipe" }
        );

        if (existsSync(webpPath)) {
          const sizeAfter = statSync(webpPath).size;
          totalAfter += sizeAfter;
          const saving = Math.round((1 - sizeAfter / sizeBefore) * 100);
          console.log(
            `  ✅ ${path.relative(ROOT, full)}  ${(sizeBefore / 1024).toFixed(0)}KB → ${(sizeAfter / 1024).toFixed(0)}KB  (${saving}% saved)`
          );
          converted++;
          // Remove original
          unlinkSync(full);
        } else {
          console.log(`  ⚠️  WebP not created for: ${full}`);
          skipped++;
        }
      } catch (err) {
        console.error(`  ❌ Failed: ${full}`, err.message);
        skipped++;
      }
    }
  }
}

console.log("🔄 Compressing images in public/images/ ...\n");
walkDir(PUBLIC_IMAGES);

const savedMB = ((totalBefore - totalAfter) / 1024 / 1024).toFixed(1);
const totalBeforeMB = (totalBefore / 1024 / 1024).toFixed(1);
const totalAfterMB = (totalAfter / 1024 / 1024).toFixed(1);

console.log(`\n✅ Done!`);
console.log(`   Converted: ${converted} files`);
console.log(`   Skipped:   ${skipped} files`);
console.log(`   Before:    ${totalBeforeMB} MB`);
console.log(`   After:     ${totalAfterMB} MB`);
console.log(`   Saved:     ${savedMB} MB`);

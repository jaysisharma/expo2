/**
 * Rename WhatsApp images to clean names and update all code references
 * Also fix any remaining .jpeg/.jpg/.png references to .webp
 */
import { renameSync, existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Old filename -> New clean filename (WebP)
const RENAMES = [
  ["WhatsApp Image 2026-08-27 at 06.52.05.webp",      "event-photo-1.webp"],
  ["WhatsApp Image 2026-08-27 at 06.52.05 (1).webp",  "event-photo-2.webp"],
  ["WhatsApp Image 2026-08-27 at 06.52.06.webp",      "event-photo-3.webp"],
  ["WhatsApp Image 2026-08-27 at 06.52.06 (1).webp",  "event-photo-4.webp"],
  ["WhatsApp Image 2026-08-27 at 06.52.06 (2).webp",  "event-photo-5.webp"],
  ["WhatsApp Image 2026-08-27 at 06.52.07.webp",      "event-photo-6.webp"],
  ["WhatsApp Image 2026-08-27 at 06.52.07 (1).webp",  "event-photo-7.webp"],
  ["WhatsApp Image 2026-08-27 at 06.52.07 (2).webp",  "event-photo-8.webp"],
  ["WhatsApp Image 2026-08-27 at 06.52.08.webp",      "event-photo-9.webp"],
  ["WhatsApp Image 2026-08-27 at 06.52.08 (1).webp",  "event-photo-10.webp"],
];

const IMAGES_DIR = path.join(ROOT, "public/images");

// Step 1: Rename files
console.log("📁 Renaming WhatsApp images to clean names...");
for (const [oldName, newName] of RENAMES) {
  const oldPath = path.join(IMAGES_DIR, oldName);
  const newPath = path.join(IMAGES_DIR, newName);
  if (existsSync(oldPath)) {
    renameSync(oldPath, newPath);
    console.log(`  ✅ ${oldName} → ${newName}`);
  } else {
    console.log(`  ⚠️  Not found: ${oldName}`);
  }
}

// Step 2: Build a replacement map: old code references -> new clean webp paths
const REF_MAP = [
  // WhatsApp images (various extensions in code)
  ["/images/WhatsApp Image 2026-08-27 at 06.52.05.jpeg",     "/images/event-photo-1.webp"],
  ["/images/WhatsApp Image 2026-08-27 at 06.52.05 (1).jpeg", "/images/event-photo-2.webp"],
  ["/images/WhatsApp Image 2026-08-27 at 06.52.06.jpeg",     "/images/event-photo-3.webp"],
  ["/images/WhatsApp Image 2026-08-27 at 06.52.06 (1).jpeg", "/images/event-photo-4.webp"],
  ["/images/WhatsApp Image 2026-08-27 at 06.52.06 (2).jpeg", "/images/event-photo-5.webp"],
  ["/images/WhatsApp Image 2026-08-27 at 06.52.07.jpeg",     "/images/event-photo-6.webp"],
  ["/images/WhatsApp Image 2026-08-27 at 06.52.07 (1).jpeg", "/images/event-photo-7.webp"],
  ["/images/WhatsApp Image 2026-08-27 at 06.52.07 (2).jpeg", "/images/event-photo-8.webp"],
  ["/images/WhatsApp Image 2026-08-27 at 06.52.08.jpeg",     "/images/event-photo-9.webp"],
  ["/images/WhatsApp Image 2026-08-27 at 06.52.08 (1).jpeg", "/images/event-photo-10.webp"],
  // Remaining non-webp references for images that were converted
  ["/images/background/5.jpg",   "/images/background/5.webp"],
  ["/images/background/22.jpg",  "/images/background/22.webp"],
  ["/images/hero.png",           "/images/hero.webp"],
];

// Step 3: Walk all src files and replace references
console.log("\n🔄 Updating code references...");
let filesUpdated = 0;
let totalReplacements = 0;

function walkSrc(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walkSrc(full);
    } else if (/\.(tsx|ts|js|jsx|mdx)$/.test(e.name)) {
      let content = readFileSync(full, "utf8");
      const original = content;
      for (const [oldRef, newRef] of REF_MAP) {
        while (content.includes(oldRef)) {
          content = content.replace(oldRef, newRef);
          totalReplacements++;
        }
      }
      if (content !== original) {
        writeFileSync(full, content, "utf8");
        console.log(`  ✅ Updated: ${path.relative(ROOT, full)}`);
        filesUpdated++;
      }
    }
  }
}

walkSrc(path.join(ROOT, "src"));
console.log(`\n✅ Done! Updated ${filesUpdated} files with ${totalReplacements} replacements.`);

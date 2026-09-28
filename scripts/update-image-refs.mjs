/**
 * Update all image references in src/ from .jpg/.jpeg/.png -> .webp
 * Only updates paths that actually have a converted .webp counterpart in public/
 */
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const PUBLIC = path.join(ROOT, "public");

// Collect all webp files that exist in public/
const webpSet = new Set();
function collectWebp(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) collectWebp(full);
    else if (e.name.endsWith(".webp")) {
      // Store the public-relative path e.g. /images/himalayan_dam_hero.webp
      webpSet.add("/" + path.relative(PUBLIC, full));
    }
  }
}
collectWebp(PUBLIC);

// Walk src/ and replace image extensions
let filesUpdated = 0;
let totalReplacements = 0;

function walkSrc(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walkSrc(full);
    } else if (/\.(tsx|ts|js|jsx|css|mdx)$/.test(e.name)) {
      let content = readFileSync(full, "utf8");
      const original = content;

      // Replace /images/...jpg -> /images/...webp (if webp exists)
      content = content.replace(
        /(['"`])(\/images\/[^'"`\s]+)\.(jpg|jpeg|png)(['"`])/gi,
        (match, q1, base, ext, q2) => {
          const webpPath = base + ".webp";
          if (webpSet.has(webpPath)) {
            totalReplacements++;
            return `${q1}${webpPath}${q2}`;
          }
          return match; // keep original if no webp exists
        }
      );

      // Also handle without quotes in JSX (e.g. src=/images/...)
      content = content.replace(
        /(src=|href=|poster=|url\()(\/images\/[^'"`\s)]+)\.(jpg|jpeg|png)/gi,
        (match, prefix, base, ext) => {
          const webpPath = base + ".webp";
          if (webpSet.has(webpPath)) {
            totalReplacements++;
            return `${prefix}${webpPath}`;
          }
          return match;
        }
      );

      if (content !== original) {
        writeFileSync(full, content, "utf8");
        console.log(`  ✅ Updated: ${path.relative(ROOT, full)}`);
        filesUpdated++;
      }
    }
  }
}

console.log("🔄 Updating image references in src/ ...\n");
walkSrc(SRC);
console.log(`\n✅ Done! Updated ${filesUpdated} files with ${totalReplacements} reference replacements.`);

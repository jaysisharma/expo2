/**
 * Upload heavy public assets (PDFs + Videos) to Cloudinary
 * then prints a mapping of old local path -> new Cloudinary URL
 */
import { v2 as cloudinary } from "cloudinary";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

cloudinary.config({
  cloud_name: "gztboref",
  api_key: "381425181498677",
  api_secret: "-UtA57btkmWE_VZ4gtE-2NhIxzg",
});

const ASSETS = [
  // PDFs
  {
    local: "public/files/Proposal.pdf",
    publicId: "higex/documents/Proposal",
    resourceType: "raw",
    label: "Proposal PDF",
  },
  // Videos
  {
    local: "public/videos/hero_showcase.mp4",
    publicId: "higex/videos/hero_showcase",
    resourceType: "video",
    label: "Hero Showcase Video",
  },
  {
    local: "public/videos/merged_hero.mp4",
    publicId: "higex/videos/merged_hero",
    resourceType: "video",
    label: "Merged Hero Video",
  },
  {
    local: "public/videos/River_water_flowing_down_spillways_20260921114935.mp4",
    publicId: "higex/videos/river_spillways",
    resourceType: "video",
    label: "River Spillways Video",
  },
  {
    local: "public/videos/Drone_flying_toward_hydroelectri\u2026_1080p_20260921114759.mp4",
    publicId: "higex/videos/drone_hydroelectric",
    resourceType: "video",
    label: "Drone Hydroelectric Video",
  },
];

const results = {};

for (const asset of ASSETS) {
  const fullPath = path.join(ROOT, asset.local);
  if (!existsSync(fullPath)) {
    console.log(`⚠️  Skipping (not found): ${asset.local}`);
    continue;
  }

  try {
    console.log(`⬆️  Uploading ${asset.label} (${asset.local})...`);
    const result = await cloudinary.uploader.upload(fullPath, {
      public_id: asset.publicId,
      resource_type: asset.resourceType,
      overwrite: true,
      use_filename: false,
    });
    results[asset.local] = result.secure_url;
    console.log(`✅  Done: ${result.secure_url}`);
  } catch (err) {
    console.error(`❌  Failed: ${asset.label}`, err.message);
  }
}

console.log("\n\n=== CLOUDINARY URL MAP ===");
console.log(JSON.stringify(results, null, 2));

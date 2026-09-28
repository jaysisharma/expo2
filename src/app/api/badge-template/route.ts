import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getFirebaseBadgeTemplates, saveFirebaseBadgeTemplates } from "@/lib/firebaseDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ROOT_DATA_DIR = path.join(process.cwd(), "data");
const SRC_DATA_DIR = path.join(process.cwd(), "src", "data");
const ROOT_TEMPLATES_FILE = path.join(ROOT_DATA_DIR, "badgeTemplates.json");
const SRC_TEMPLATES_FILE = path.join(SRC_DATA_DIR, "badgeTemplates.json");

function readBadgeTemplatesFromFile(): any | null {
  // Try root data directory first
  try {
    if (fs.existsSync(ROOT_TEMPLATES_FILE)) {
      return JSON.parse(fs.readFileSync(ROOT_TEMPLATES_FILE, "utf-8"));
    }
  } catch (e) {}

  // Fallback to src/data directory
  try {
    if (fs.existsSync(SRC_TEMPLATES_FILE)) {
      return JSON.parse(fs.readFileSync(SRC_TEMPLATES_FILE, "utf-8"));
    }
  } catch (e) {}

  return null;
}

let memoryBadgeTemplates: any = null;

export async function GET() {
  try {
    // 1. Try Firebase Firestore first for persistent cloud storage
    try {
      const fbData = await getFirebaseBadgeTemplates();
      if (fbData && (fbData.visitor || fbData.exhibitor)) {
        memoryBadgeTemplates = fbData;
        return NextResponse.json(
          { success: true, data: fbData, source: "firebase" },
          { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
        );
      }
    } catch (e) {
      console.warn("Firebase fetch badge templates error, falling back to local file", e);
    }

    // 2. Read from local files
    const fileData = readBadgeTemplatesFromFile();
    if (fileData) {
      memoryBadgeTemplates = fileData;
      return NextResponse.json(
        { success: true, data: fileData, source: "file" },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
      );
    }

    // 3. Fallback to memory
    if (memoryBadgeTemplates) {
      return NextResponse.json(
        { success: true, data: memoryBadgeTemplates, source: "memory" },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
      );
    }

    return NextResponse.json(
      { success: false, message: "Template file not found" },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
  } catch (error: any) {
    console.error("Failed to read badge templates:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load badge templates" },
      { status: 500, headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const payload = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    memoryBadgeTemplates = payload;

    // 1. Save to local files (root and src)
    try {
      if (!fs.existsSync(ROOT_DATA_DIR)) fs.mkdirSync(ROOT_DATA_DIR, { recursive: true });
      fs.writeFileSync(ROOT_TEMPLATES_FILE, JSON.stringify(payload, null, 2), "utf-8");
      if (fs.existsSync(SRC_DATA_DIR)) {
        fs.writeFileSync(SRC_TEMPLATES_FILE, JSON.stringify(payload, null, 2), "utf-8");
      }
    } catch (e) {
      console.warn("Filesystem write skipped (running in serverless runtime)");
    }

    // 2. Save to Firebase Firestore
    try {
      await saveFirebaseBadgeTemplates(payload);
    } catch (e) {
      console.warn("Firebase save badge templates error:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Badge template and QR placement saved successfully",
      data: payload,
    }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } });
  } catch (error: any) {
    console.error("Failed to save badge templates:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save badge templates" },
      { status: 500 }
    );
  }
}


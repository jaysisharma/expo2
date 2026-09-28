import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import defaultAboutData from "@/data/aboutPageData.json";

export const dynamic = "force-dynamic";

const ROOT_DATA_PATH = path.join(process.cwd(), "data", "aboutPageData.json");
const SRC_DATA_PATH = path.join(process.cwd(), "src", "data", "aboutPageData.json");

// In-memory cache for serverless environments
let memoryAboutData: any = null;

async function readAboutData() {
  if (memoryAboutData) {
    return memoryAboutData;
  }

  // Try ROOT_DATA_PATH
  try {
    const fileData = await fs.readFile(ROOT_DATA_PATH, "utf-8");
    const parsed = JSON.parse(fileData);
    memoryAboutData = parsed;
    return parsed;
  } catch (err: any) {
    if (err?.code !== "ENOENT") {
      console.warn("Error reading from ROOT_DATA_PATH:", err);
    }
  }

  // Fallback to SRC_DATA_PATH
  try {
    const fileData = await fs.readFile(SRC_DATA_PATH, "utf-8");
    const parsed = JSON.parse(fileData);
    memoryAboutData = parsed;
    return parsed;
  } catch (err: any) {
    if (err?.code !== "ENOENT") {
      console.warn("Error reading from SRC_DATA_PATH:", err);
    }
  }

  // Fallback to imported default
  memoryAboutData = defaultAboutData;
  return defaultAboutData;
}

export async function GET() {
  try {
    const data = await readAboutData();
    return NextResponse.json({
      success: true,
      data: data || defaultAboutData,
    });
  } catch (error: any) {
    console.error("Error reading about page data:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load about page data", data: defaultAboutData },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid data payload provided" },
        { status: 400 }
      );
    }

    // Merge with current data
    const current = await readAboutData();
    const updated = {
      ...current,
      ...body,
    };

    memoryAboutData = updated;

    const jsonStr = JSON.stringify(updated, null, 2);

    // Save to ROOT_DATA_PATH
    try {
      await fs.mkdir(path.dirname(ROOT_DATA_PATH), { recursive: true });
      await fs.writeFile(ROOT_DATA_PATH, jsonStr, "utf-8");
    } catch (err) {
      console.warn("Could not save to ROOT_DATA_PATH:", err);
    }

    // Save to SRC_DATA_PATH
    try {
      await fs.mkdir(path.dirname(SRC_DATA_PATH), { recursive: true });
      await fs.writeFile(SRC_DATA_PATH, jsonStr, "utf-8");
    } catch (err) {
      console.warn("Could not save to SRC_DATA_PATH:", err);
    }

    return NextResponse.json({
      success: true,
      message: "About page data updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating about page data:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update about page data" },
      { status: 500 }
    );
  }
}

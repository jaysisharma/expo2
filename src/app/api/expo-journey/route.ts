import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import defaultJourneyData from "@/data/expoJourneyData.json";

export const dynamic = "force-dynamic";

const ROOT_DATA_PATH = path.join(process.cwd(), "data", "expoJourneyData.json");
const SRC_DATA_PATH = path.join(process.cwd(), "src", "data", "expoJourneyData.json");

let memoryJourneyData: any = null;

async function readJourneyData() {
  if (memoryJourneyData) {
    return memoryJourneyData;
  }

  // 1. Try ROOT_DATA_PATH
  try {
    const fileData = await fs.readFile(ROOT_DATA_PATH, "utf-8");
    const parsed = JSON.parse(fileData);
    memoryJourneyData = parsed;
    return parsed;
  } catch (err: any) {
    if (err?.code !== "ENOENT") {
      console.warn("Error reading from ROOT_DATA_PATH:", err);
    }
  }

  // 2. Try SRC_DATA_PATH
  try {
    const fileData = await fs.readFile(SRC_DATA_PATH, "utf-8");
    const parsed = JSON.parse(fileData);
    memoryJourneyData = parsed;
    return parsed;
  } catch (err: any) {
    if (err?.code !== "ENOENT") {
      console.warn("Error reading from SRC_DATA_PATH:", err);
    }
  }

  // 3. Fallback to imported default
  memoryJourneyData = defaultJourneyData;
  return defaultJourneyData;
}

export async function GET() {
  try {
    const data = await readJourneyData();
    return NextResponse.json({
      success: true,
      data: data || defaultJourneyData,
    });
  } catch (error: any) {
    console.error("Error reading journey data:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load journey data", data: defaultJourneyData },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid data format" },
        { status: 400 }
      );
    }

    memoryJourneyData = body;
    const content = JSON.stringify(body, null, 2);

    try {
      await fs.mkdir(path.dirname(ROOT_DATA_PATH), { recursive: true });
      await fs.writeFile(ROOT_DATA_PATH, content, "utf-8");
    } catch (err) {
      console.warn("Could not write to ROOT_DATA_PATH:", err);
    }

    try {
      await fs.mkdir(path.dirname(SRC_DATA_PATH), { recursive: true });
      await fs.writeFile(SRC_DATA_PATH, content, "utf-8");
    } catch (err) {
      console.warn("Could not write to SRC_DATA_PATH:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Expo Journey data updated successfully",
      data: body,
    });
  } catch (error: any) {
    console.error("Error saving journey data:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save journey data" },
      { status: 500 }
    );
  }
}

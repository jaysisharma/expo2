import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ROOT_DATA_PATH = path.join(process.cwd(), "data", "savedCustomFloorPlan.json");
const SRC_DATA_PATH = path.join(process.cwd(), "src", "data", "savedCustomFloorPlan.json");

async function readFloorPlanData() {
  // Try ROOT_DATA_PATH first
  try {
    const fileData = await fs.readFile(ROOT_DATA_PATH, "utf-8");
    return JSON.parse(fileData);
  } catch (err: any) {
    if (err?.code !== "ENOENT") throw err;
  }

  // Fallback to SRC_DATA_PATH
  try {
    const fileData = await fs.readFile(SRC_DATA_PATH, "utf-8");
    return JSON.parse(fileData);
  } catch (err: any) {
    if (err?.code !== "ENOENT") throw err;
  }

  return null;
}

export async function GET() {
  try {
    const json = await readFloorPlanData();
    if (json) {
      return NextResponse.json({ success: true, data: json });
    }
    return NextResponse.json({
      success: true,
      data: {
        elements: [],
        bgImageSrc: "/images/floor-plan-official.png",
        blueprintOpacity: 0.65,
      },
    });
  } catch (error) {
    console.error("Error reading saved floor plan:", error);
    return NextResponse.json({ success: false, elements: [] }, { status: 200 });
  }
}

let floorPlanSaveQueue: Promise<void> = Promise.resolve();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dataToSave = {
      elements: body.elements || [],
      updatedAt: new Date().toISOString(),
      bgImageSrc: body.bgImageSrc || "/images/floor-plan-official.png",
      blueprintOpacity: body.blueprintOpacity ?? 0.65,
    };

    const content = JSON.stringify(dataToSave, null, 2);

    await (floorPlanSaveQueue = floorPlanSaveQueue
      .then(async () => {
        // Save to ROOT_DATA_PATH
        await fs.mkdir(path.dirname(ROOT_DATA_PATH), { recursive: true });
        await fs.writeFile(ROOT_DATA_PATH, content, "utf-8");

        // Also sync to SRC_DATA_PATH if src/data directory exists
        try {
          await fs.mkdir(path.dirname(SRC_DATA_PATH), { recursive: true });
          await fs.writeFile(SRC_DATA_PATH, content, "utf-8");
        } catch {
          // Non-critical
        }
      })
      .catch(() => {}));

    return NextResponse.json({
      success: true,
      message: "Floor plan saved successfully to server database!",
      updatedAt: dataToSave.updatedAt,
      count: dataToSave.elements.length,
    });
  } catch (error) {
    console.error("Error saving floor plan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save floor plan to server." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getFirebaseFloorPlan, saveFirebaseFloorPlan } from "@/lib/firebaseDb";

export const dynamic = "force-dynamic";

const ROOT_DATA_PATH = path.join(process.cwd(), "data", "savedCustomFloorPlan.json");
const SRC_DATA_PATH = path.join(process.cwd(), "src", "data", "savedCustomFloorPlan.json");

let memoryFloorPlan: any = null;

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
    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    };

    // 1. Try Firebase Firestore first (persistent source of truth on Vercel)
    try {
      const fbData = await getFirebaseFloorPlan();
      if (fbData && Array.isArray(fbData.elements) && fbData.elements.length > 0) {
        memoryFloorPlan = fbData;
        return NextResponse.json(
          {
            success: true,
            data: {
              ...fbData,
              canvasWidth: fbData.canvasWidth || 1200,
              canvasHeight: fbData.canvasHeight || 850,
              canvasBgMode: fbData.canvasBgMode || "cad-dark",
              showBgImage: fbData.showBgImage !== undefined ? fbData.showBgImage : true,
              bgImageSrc: fbData.bgImageSrc || "/images/floor-plan-official.webp",
              blueprintOpacity: fbData.blueprintOpacity ?? 0.65,
            },
          },
          { headers }
        );
      }
    } catch (e) {
      console.warn("Firebase floor plan fetch error, falling back to local files:", e);
    }

    if (memoryFloorPlan && Array.isArray(memoryFloorPlan.elements) && memoryFloorPlan.elements.length > 0) {
      return NextResponse.json(
        {
          success: true,
          data: {
            ...memoryFloorPlan,
            canvasWidth: memoryFloorPlan.canvasWidth || 1200,
            canvasHeight: memoryFloorPlan.canvasHeight || 850,
            canvasBgMode: memoryFloorPlan.canvasBgMode || "cad-dark",
            showBgImage: memoryFloorPlan.showBgImage !== undefined ? memoryFloorPlan.showBgImage : true,
            bgImageSrc: memoryFloorPlan.bgImageSrc || "/images/floor-plan-official.webp",
            blueprintOpacity: memoryFloorPlan.blueprintOpacity ?? 0.65,
          },
        },
        { headers }
      );
    }

    const json = await readFloorPlanData();
    if (json) {
      return NextResponse.json(
        {
          success: true,
          data: {
            ...json,
            canvasWidth: json.canvasWidth || 1200,
            canvasHeight: json.canvasHeight || 850,
            canvasBgMode: json.canvasBgMode || "cad-dark",
            showBgImage: json.showBgImage !== undefined ? json.showBgImage : true,
            bgImageSrc: json.bgImageSrc || "/images/floor-plan-official.webp",
            blueprintOpacity: json.blueprintOpacity ?? 0.65,
          },
        },
        { headers }
      );
    }
    return NextResponse.json(
      {
        success: true,
        data: {
          elements: [],
          canvasWidth: 1200,
          canvasHeight: 850,
          bgImageSrc: "/images/floor-plan-official.webp",
          blueprintOpacity: 0.65,
          canvasBgMode: "cad-dark",
          showBgImage: true,
        },
      },
      { headers }
    );
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
      bgImageSrc: body.bgImageSrc || "/images/floor-plan-official.webp",
      blueprintOpacity: body.blueprintOpacity ?? 0.65,
      canvasBgMode: body.canvasBgMode || "cad-dark",
      showBgImage: body.showBgImage !== undefined ? body.showBgImage : true,
      canvasWidth: Number(body.canvasWidth) || 1200,
      canvasHeight: Number(body.canvasHeight) || 850,
    };

    memoryFloorPlan = dataToSave;

    // 1. Save to Firebase Firestore (essential for persistence across Vercel serverless instances)
    try {
      await saveFirebaseFloorPlan(dataToSave);
    } catch (fbErr) {
      console.warn("Firestore saveFloorPlan error:", fbErr);
    }

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
      message: "Floor plan saved successfully to server database & cloud storage!",
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

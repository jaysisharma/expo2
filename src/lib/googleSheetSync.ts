import fs from "fs/promises";
import path from "path";
import {
  setFirebaseBoothOverride,
  getFirebaseBoothOverrides,
  getFirebaseFloorPlan,
  saveFirebaseFloorPlan,
} from "./firebaseDb";

const ROOT_ADMIN_DATA_PATH = path.join(process.cwd(), "data", "adminData.json");
const SRC_ADMIN_DATA_PATH = path.join(process.cwd(), "src", "data", "adminData.json");
const ROOT_FLOOR_PATH = path.join(process.cwd(), "data", "savedCustomFloorPlan.json");
const SRC_FLOOR_PATH = path.join(process.cwd(), "src", "data", "savedCustomFloorPlan.json");

export interface SheetStallItem {
  stallNo: string;
  status: "Available" | "Reserved" | "Booked" | string;
  companyName?: string;
  bookedDate?: string;
  contact?: string;
}

/** Normalize status string to standard "Available" | "Reserved" | "Booked" */
export function normalizeStallStatus(raw: string | undefined): "Available" | "Reserved" | "Booked" {
  if (!raw) return "Available";
  const s = raw.trim().toLowerCase();
  if (s.includes("book") || s.includes("sold") || s.includes("confirm") || s.includes("occup")) {
    return "Booked";
  }
  if (s.includes("reserv") || s.includes("hold") || s.includes("pending")) {
    return "Reserved";
  }
  return "Available";
}

/** Push single stall change to Google Apps Script webhook (if configured) */
export async function pushStallToGoogleSheet(item: SheetStallItem) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_stall",
        stallNo: item.stallNo.trim(),
        status: normalizeStallStatus(item.status),
        companyName: item.companyName || "",
        bookedDate: item.bookedDate || new Date().toISOString().slice(0, 10),
        contact: item.contact || "",
      }),
      redirect: "follow",
    });
    return await res.json().catch(() => ({ ok: res.ok }));
  } catch (error) {
    console.warn("[googleSheetSync] Failed to push to Google Sheet:", error);
    return null;
  }
}

/** Sync multiple rows from Google Sheet directly into DB (Firestore + local files) */
export async function syncSheetRowsToDb(rows: SheetStallItem[]) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { success: false, count: 0, message: "No valid rows provided" };
  }

  // 1. Read adminData
  let adminData: any = null;
  try {
    adminData = JSON.parse(await fs.readFile(ROOT_ADMIN_DATA_PATH, "utf-8"));
  } catch {
    try {
      adminData = JSON.parse(await fs.readFile(SRC_ADMIN_DATA_PATH, "utf-8"));
    } catch {
      adminData = { boothOverrides: {} };
    }
  }
  if (!adminData.boothOverrides) adminData.boothOverrides = {};

  // 2. Read floor plan
  let floorPlan: any = null;
  try {
    floorPlan = JSON.parse(await fs.readFile(ROOT_FLOOR_PATH, "utf-8"));
  } catch {
    try {
      floorPlan = JSON.parse(await fs.readFile(SRC_FLOOR_PATH, "utf-8"));
    } catch {}
  }

  const updatedStalls: string[] = [];
  const now = new Date().toISOString();

  // 3. Process each row
  for (const row of rows) {
    if (!row.stallNo || typeof row.stallNo !== "string") continue;
    const stallNo = row.stallNo.trim().toUpperCase();
    if (!stallNo) continue;

    const normalizedStatus = normalizeStallStatus(row.status);
    const exhibitor = normalizedStatus === "Available" ? "" : (row.companyName || "").trim();

    // Local adminData override
    adminData.boothOverrides[stallNo] = {
      ...(adminData.boothOverrides[stallNo] || {}),
      status: normalizedStatus,
      exhibitorName: exhibitor,
      contact: row.contact || "",
      bookedDate: row.bookedDate || "",
      updatedAt: now,
      syncedFrom: "GoogleSheets",
    };

    // Firebase Firestore override
    await setFirebaseBoothOverride(stallNo, {
      status: normalizedStatus,
      exhibitorName: exhibitor,
    }).catch(() => {});

    // Update floor plan elements if present
    if (floorPlan && Array.isArray(floorPlan.elements)) {
      floorPlan.elements = floorPlan.elements.map((el: any) => {
        if (el?.number && el.number.trim().toUpperCase() === stallNo) {
          return {
            ...el,
            status: normalizedStatus,
            exhibitorName: exhibitor,
          };
        }
        return el;
      });
    }

    updatedStalls.push(stallNo);
  }

  // 4. Save back local files
  try {
    const adminContent = JSON.stringify(adminData, null, 2);
    await fs.writeFile(ROOT_ADMIN_DATA_PATH, adminContent, "utf-8").catch(() => {});
    await fs.writeFile(SRC_ADMIN_DATA_PATH, adminContent, "utf-8").catch(() => {});
  } catch (err) {
    console.warn("[googleSheetSync] Failed saving adminData:", err);
  }

  if (floorPlan) {
    try {
      const floorContent = JSON.stringify(floorPlan, null, 2);
      await fs.writeFile(ROOT_FLOOR_PATH, floorContent, "utf-8").catch(() => {});
      await fs.writeFile(SRC_FLOOR_PATH, floorContent, "utf-8").catch(() => {});
      await saveFirebaseFloorPlan(floorPlan).catch(() => {});
    } catch (err) {
      console.warn("[googleSheetSync] Failed saving floorPlan:", err);
    }
  }

  return {
    success: true,
    count: updatedStalls.length,
    updatedStalls,
    timestamp: now,
  };
}

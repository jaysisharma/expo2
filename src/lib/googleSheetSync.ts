import fs from "fs/promises";
import path from "path";
import {
  setFirebaseBoothOverride,
  getFirebaseBoothOverrides,
  getFirebaseFloorPlan,
  saveFirebaseFloorPlan,
  getFirebaseSettings,
} from "./firebaseDb";
import { boothsData, extractBoothsFromElements } from "@/data/booths";
import { Booth } from "./types";

const ROOT_ADMIN_DATA_PATH = path.join(process.cwd(), "data", "adminData.json");
const SRC_ADMIN_DATA_PATH = path.join(process.cwd(), "src", "data", "adminData.json");
const ROOT_FLOOR_PATH = path.join(process.cwd(), "data", "savedCustomFloorPlan.json");
const SRC_FLOOR_PATH = path.join(process.cwd(), "src", "data", "savedCustomFloorPlan.json");

export interface SheetStallItem {
  stallNo: string;
  hall?: string;
  sizeSqM?: number;
  dimensions?: string;
  sizeType?: string;
  companyName?: string;
  priceUSD?: string;
  priceNPR?: string;
  status: "Available" | "Reserved" | "Booked" | string;
  bookedDate?: string;
  contact?: string;
}

/**
 * Normalizes stall number formats so:
 * "A01", "A-01", "A-1", "a1", "A 1" -> all become canonical "A1"
 */
export function normalizeStallNumber(raw: string): string {
  if (!raw) return "";
  const cleaned = raw.trim().toUpperCase().replace(/[\s-_#]/g, "");
  // Match prefix letter(s) and numbers: e.g. "A01" -> letter "A", number "01" -> "A1"
  const match = cleaned.match(/^([A-Z]+)0*(\d+)$/);
  if (match) {
    return `${match[1]}${parseInt(match[2], 10)}`;
  }
  return cleaned;
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
  let webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    const settings = await getFirebaseSettings().catch(() => null);
    webhookUrl = settings?.googleSheetsWebhookUrl;
  }
  if (!webhookUrl) return;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_stall",
        stallNo: normalizeStallNumber(item.stallNo),
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
    const rawStallNo = row.stallNo.trim().toUpperCase();
    if (!rawStallNo) continue;

    const canonicalStallNo = normalizeStallNumber(rawStallNo);
    const rawCompany = (row.companyName || "").trim();
    const isUnassigned = !rawCompany || rawCompany.toLowerCase() === "unassigned";
    let normalizedStatus = normalizeStallStatus(row.status);
    if (!isUnassigned && normalizedStatus === "Available") {
      normalizedStatus = "Reserved";
    }
    const exhibitor = isUnassigned ? "" : rawCompany;

    const overridePayload = {
      status: normalizedStatus,
      exhibitorName: exhibitor,
      contact: row.contact || "",
      bookedDate: row.bookedDate || "",
      updatedAt: now,
      syncedFrom: "GoogleSheets",
    };

    // Save under canonical (e.g. A1) AND original raw (e.g. A01)
    adminData.boothOverrides[canonicalStallNo] = {
      ...(adminData.boothOverrides[canonicalStallNo] || {}),
      ...overridePayload,
    };
    if (rawStallNo !== canonicalStallNo) {
      adminData.boothOverrides[rawStallNo] = {
        ...(adminData.boothOverrides[rawStallNo] || {}),
        ...overridePayload,
      };
    }

    // Firebase Firestore overrides
    await setFirebaseBoothOverride(canonicalStallNo, {
      status: normalizedStatus,
      exhibitorName: exhibitor,
    }).catch(() => {});

    if (rawStallNo !== canonicalStallNo) {
      await setFirebaseBoothOverride(rawStallNo, {
        status: normalizedStatus,
        exhibitorName: exhibitor,
      }).catch(() => {});
    }

    // Update floor plan elements if present
    if (floorPlan && Array.isArray(floorPlan.elements)) {
      floorPlan.elements = floorPlan.elements.map((el: any) => {
        const elNum = el?.number ? el.number.trim().toUpperCase() : "";
        const elNorm = normalizeStallNumber(elNum);
        if (elNum === canonicalStallNo || elNorm === canonicalStallNo || elNum === rawStallNo) {
          return {
            ...el,
            status: normalizedStatus,
            exhibitorName: exhibitor,
          };
        }
        return el;
      });
    }

    updatedStalls.push(canonicalStallNo);
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

/**
 * Loads all stalls (all 91 stalls from floor plan / boothsData),
 * merges live status and exhibitor data from Firestore and local overrides,
 * and returns canonical SheetStallItem array in floor-plan order.
 */
export async function getAllStallsForSheet(): Promise<SheetStallItem[]> {
  // 1. Get floor plan elements
  let floorPlan: any = null;
  try {
    floorPlan = await getFirebaseFloorPlan();
  } catch {}
  if (!floorPlan || !Array.isArray(floorPlan.elements) || floorPlan.elements.length === 0) {
    try {
      floorPlan = JSON.parse(await fs.readFile(ROOT_FLOOR_PATH, "utf-8"));
    } catch {
      try {
        floorPlan = JSON.parse(await fs.readFile(SRC_FLOOR_PATH, "utf-8"));
      } catch {}
    }
  }

  // 2. Extract booths from elements, or fallback to boothsData
  let booths: Booth[] = [];
  if (floorPlan && Array.isArray(floorPlan.elements) && floorPlan.elements.length > 0) {
    booths = extractBoothsFromElements(floorPlan.elements);
  }
  if (!booths || booths.length === 0) {
    booths = boothsData;
  }

  // 3. Get admin overrides and firebase overrides
  let adminOverrides: Record<string, any> = {};
  try {
    const adminData = JSON.parse(await fs.readFile(ROOT_ADMIN_DATA_PATH, "utf-8"));
    adminOverrides = adminData?.boothOverrides || {};
  } catch {
    try {
      const adminData = JSON.parse(await fs.readFile(SRC_ADMIN_DATA_PATH, "utf-8"));
      adminOverrides = adminData?.boothOverrides || {};
    } catch {}
  }

  let fbOverrides: Record<string, any> = {};
  try {
    fbOverrides = (await getFirebaseBoothOverrides()) || {};
  } catch {}

  // 4. Map each booth to sheet format
  return booths.map((b) => {
    const canonical = normalizeStallNumber(b.number);
    const raw = b.number.trim().toUpperCase();
    const zeroPadded = raw.replace(/^([A-Z]+)(\d)$/, "$10$2");

    const override =
      fbOverrides[canonical] ||
      fbOverrides[raw] ||
      fbOverrides[zeroPadded] ||
      adminOverrides[canonical] ||
      adminOverrides[raw] ||
      adminOverrides[zeroPadded] ||
      {};

    const status = normalizeStallStatus(override.status || b.status);
    const exhibitor = (override.exhibitorName || b.exhibitorName || "").trim();
    const companyName = exhibitor && exhibitor.toLowerCase() !== "unassigned" ? exhibitor : "Unassigned";
    const bookedDate = override.bookedDate || "";
    const contact = override.contact || "";

    const usdVal = Number(
      override.priceUSD !== undefined && override.priceUSD !== null
        ? override.priceUSD
        : b.priceUSD || 0
    );
    const nprVal = Number(
      override.priceNPR !== undefined && override.priceNPR !== null
        ? override.priceNPR
        : b.priceNPR !== undefined && b.priceNPR !== null && Number(b.priceNPR) > 0
        ? b.priceNPR
        : Math.round(usdVal * 134.5)
    );
    const formattedUSD = "$" + usdVal.toLocaleString("en-US");
    const formattedNPR = "NPR " + nprVal.toLocaleString("en-US");

    let sizeType = b.type || "Space";
    if (b.isPrime && !sizeType.includes("PRIME")) {
      sizeType = `${sizeType} — ★ PRIME (+25%)`;
    }

    return {
      stallNo: b.number,
      hall: b.hall || "Block A",
      sizeSqM: b.sizeSqM || 36,
      dimensions: b.dimensions || "6m × 6m",
      sizeType,
      companyName,
      priceUSD: formattedUSD,
      priceNPR: formattedNPR,
      status,
      bookedDate,
      contact,
    };
  });
}

/** Push all 91 stalls into Google Sheet Web App */
export async function pushAllStallsToGoogleSheet(passedWebhookUrl?: string) {
  let webhookUrl = passedWebhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    const settings = await getFirebaseSettings().catch(() => null);
    webhookUrl = settings?.googleSheetsWebhookUrl;
  }
  if (!webhookUrl) {
    throw new Error("Google Sheets Webhook URL is not configured. Please paste your Apps Script URL first.");
  }

  const stalls = await getAllStallsForSheet();

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "populate_all",
      stalls,
    }),
    redirect: "follow",
  });

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    if (text.includes("ServiceLogin") || text.includes("<!DOCTYPE") || text.includes("<html")) {
      throw new Error(
        "Google access restricted: In Apps Script, click Deploy -> Manage deployments -> Edit (pencil icon), set 'Who has access' to 'Anyone', and click Deploy."
      );
    }
    throw new Error("Invalid response from Google Apps Script: " + text.slice(0, 100));
  }

  return { success: true, count: stalls.length, response: json };
}

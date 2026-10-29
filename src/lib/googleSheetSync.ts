import fs from "fs/promises";
import { timingSafeEqual } from "crypto";
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
  /** Pricing columns from the "Booked list" sheet (numbers, prime charge as an amount) */
  dealNPR?: number | string;
  dealUSD?: number | string;
  primeChargeNPR?: number | string;
  primeChargeUSD?: number | string;
  /** "Stall size" column, e.g. "6mx6m" or "Irregular Space" */
  stallSize?: string;
}

const MAX_PRICE = 100_000_000;
// A sheet price below this is a typo, not a real stall price; ignore it rather than sell the stall for it
const MIN_STALL_PRICE_NPR = 1000;

function sheetAmount(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(String(v).replace(/[,\s]/g, ""));
  return Number.isFinite(n) && n >= 0 && n <= MAX_PRICE ? n : undefined;
}

interface SheetPricing {
  priceNPR?: number;
  priceUSD?: number;
  isPrime?: boolean;
  primeChargeNPR?: number;
  primeChargeUSD?: number;
  sizeSqM?: number;
  dimensions?: string;
}

/** "6mx6m" -> "6m × 6m" (the website's format); other text such as "Irregular Space" is kept */
function sheetDimensions(v: unknown): string | undefined {
  const text = String(v ?? "").trim().slice(0, 40);
  if (!text) return undefined;
  const m = text.match(/^(\d+(?:\.\d+)?)\s*m?\s*[x×]\s*(\d+(?:\.\d+)?)\s*m?$/i);
  return m ? `${m[1]}m × ${m[2]}m` : text;
}

/** Price fields for a booth override, or {} when the row carries no price */
export function sheetPricing(row: SheetStallItem): SheetPricing {
  const priceNPR = sheetAmount(row.dealNPR);
  if (!priceNPR || priceNPR < MIN_STALL_PRICE_NPR) return {};
  const priceUSD = sheetAmount(row.dealUSD);
  const primeChargeNPR = sheetAmount(row.primeChargeNPR) || 0;
  const primeChargeUSD = sheetAmount(row.primeChargeUSD) || 0;
  const sizeSqM = sheetAmount(row.sizeSqM);
  const dimensions = sheetDimensions(row.stallSize);
  return {
    ...(dimensions ? { dimensions } : {}),
    priceNPR,
    ...(priceUSD ? { priceUSD } : {}),
    isPrime: primeChargeNPR > 0,
    primeChargeNPR,
    primeChargeUSD,
    ...(sizeSqM ? { sizeSqM } : {}),
  };
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

/** Apps Script web app URL with the shared secret, for reading the sheet (doGet) */
export function sheetReadUrl(webhookUrl: string) {
  const url = new URL(webhookUrl);
  url.searchParams.set("secret", process.env.GOOGLE_SHEET_SYNC_SECRET || "");
  return url.toString();
}

/** True when the request carries the GOOGLE_SHEET_SYNC_SECRET (sent by the sheet's Apps Script) */
export function isValidSheetSecret(secret: unknown) {
  const expected = process.env.GOOGLE_SHEET_SYNC_SECRET;
  if (!expected || typeof secret !== "string") return false;
  const given = Buffer.from(secret);
  const wanted = Buffer.from(expected);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
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
        secret: process.env.GOOGLE_SHEET_SYNC_SECRET || "",
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

  // 2. Read floor plan (Firestore first: the bundled file is stale on Vercel and saving it
  // back would overwrite newer floor plan studio edits)
  let floorPlan: any = await getFirebaseFloorPlan().catch(() => null);
  if (!floorPlan || !Array.isArray(floorPlan.elements) || floorPlan.elements.length === 0) {
    floorPlan = null;
    try {
      floorPlan = JSON.parse(await fs.readFile(ROOT_FLOOR_PATH, "utf-8"));
    } catch {
      try {
        floorPlan = JSON.parse(await fs.readFile(SRC_FLOOR_PATH, "utf-8"));
      } catch {}
    }
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
    const pricing = sheetPricing(row);

    const overridePayload = {
      status: normalizedStatus,
      exhibitorName: exhibitor,
      ...pricing,
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
      ...pricing,
    }).catch(() => {});

    if (rawStallNo !== canonicalStallNo) {
      await setFirebaseBoothOverride(rawStallNo, {
        status: normalizedStatus,
        exhibitorName: exhibitor,
        ...pricing,
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
            ...(pricing.priceNPR !== undefined
              ? { priceNPR: pricing.priceNPR, isPrime: pricing.isPrime, ...(pricing.priceUSD ? { priceUSD: pricing.priceUSD } : {}) }
              : {}),
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
      secret: process.env.GOOGLE_SHEET_SYNC_SECRET || "",
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

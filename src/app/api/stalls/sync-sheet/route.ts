import { NextResponse } from "next/server";
import {
  syncSheetRowsToDb,
  pushStallToGoogleSheet,
  getAllStallsForSheet,
  pushAllStallsToGoogleSheet,
  isValidSheetSecret,
  sheetReadUrl,
  SheetStallItem,
} from "@/lib/googleSheetSync";
import { getAdminSession } from "@/lib/session";
import fs from "fs/promises";
import path from "path";
import {
  getFirebaseBoothOverrides,
  getFirebaseSettings,
  updateFirebaseSettings,
  clearAllFirebaseBoothOverrides,
  saveFirebaseFloorPlan,
} from "@/lib/firebaseDb";
import { boothsData } from "@/data/booths";

export const dynamic = "force-dynamic";

// Callers: the admin Stalls page (admin login cookie) and the "Booked list" sheet's Apps
// Script (GOOGLE_SHEET_SYNC_SECRET). The sheet can only sync stall rows; everything else
// is admin-only. Rows carry prices, so an unauthenticated write would let anyone reprice a stall.
const ADMIN_ONLY_ACTIONS = [
  "reset_all_stalls",
  "sync_floor_plan_from_file",
  "save_webhook_url",
  "push_all_to_sheet",
  "populate_sheet",
  "fetch_and_sync",
];

const unauthorized = () => NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, secret, rows, stallNo, status, companyName, bookedDate, contact, webhookUrl } = body;

    const isAdmin = Boolean(await getAdminSession(req));
    if (!isAdmin && (!isValidSheetSecret(secret) || ADMIN_ONLY_ACTIONS.includes(action))) {
      return unauthorized();
    }

    // Reset all stalls override in Firestore
    if (action === "reset_all_stalls") {
      await clearAllFirebaseBoothOverrides();
      return NextResponse.json({ success: true, message: "All stalls reset in database" });
    }

    // Synchronize savedCustomFloorPlan.json to Firestore
    if (action === "sync_floor_plan_from_file") {
      const ROOT_FLOOR_PATH = path.join(process.cwd(), "data", "savedCustomFloorPlan.json");
      const SRC_FLOOR_PATH = path.join(process.cwd(), "src", "data", "savedCustomFloorPlan.json");
      let fpData: any = null;
      try {
        fpData = JSON.parse(await fs.readFile(ROOT_FLOOR_PATH, "utf-8"));
      } catch {
        fpData = JSON.parse(await fs.readFile(SRC_FLOOR_PATH, "utf-8"));
      }
      if (fpData) {
        await saveFirebaseFloorPlan(fpData);
        return NextResponse.json({ success: true, message: "Floor plan synchronized to Firestore", elementsCount: fpData.elements?.length });
      }
      return NextResponse.json({ success: false, error: "Floor plan file not found" }, { status: 404 });
    }

    // Save webhook URL if provided
    if (action === "save_webhook_url" && webhookUrl) {
      await updateFirebaseSettings({ googleSheetsWebhookUrl: webhookUrl }).catch(() => {});
      return NextResponse.json({ success: true, message: "Webhook URL saved successfully" });
    }

    // Push all 91 stalls into Google Sheet
    if (action === "push_all_to_sheet" || action === "populate_sheet") {
      try {
        const result = await pushAllStallsToGoogleSheet(webhookUrl);
        return NextResponse.json(result);
      } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
      }
    }

    // Case 1: Fetch directly from Google Apps Script webhook URL and sync
    if (action === "fetch_and_sync") {
      let targetUrl = webhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
      if (!targetUrl) {
        const settings = await getFirebaseSettings();
        targetUrl = settings?.googleSheetsWebhookUrl;
      }

      if (!targetUrl) {
        return NextResponse.json(
          { success: false, error: "GOOGLE_SHEETS_WEBHOOK_URL is not configured" },
          { status: 400 }
        );
      }

      const res = await fetch(sheetReadUrl(targetUrl), { redirect: "follow" });
      const text = await res.text();
      let sheetJson: any;
      try {
        sheetJson = JSON.parse(text);
      } catch {
        if (text.includes("ServiceLogin") || text.includes("<!DOCTYPE") || text.includes("<html")) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Google access restricted: In Apps Script, click Deploy -> Manage deployments -> Edit (pencil icon), set 'Who has access' to 'Anyone', and click Deploy.",
            },
            { status: 403 }
          );
        }
        return NextResponse.json(
          { success: false, error: "Invalid response from Google: " + text.slice(0, 100) },
          { status: 502 }
        );
      }

      const sheetRows: SheetStallItem[] = Array.isArray(sheetJson)
        ? sheetJson
        : sheetJson.rows || sheetJson.data || [];
      const result = await syncSheetRowsToDb(sheetRows);
      return NextResponse.json(result);
    }

    // Case 2: Batch rows provided directly (from Google Sheet "Push to DB" menu button)
    if (Array.isArray(rows) && rows.length > 0) {
      const result = await syncSheetRowsToDb(rows);
      return NextResponse.json(result);
    }

    // Case 3: Single stall update from Google Sheet onEdit trigger
    if (stallNo) {
      const result = await syncSheetRowsToDb([{ stallNo, status, companyName, bookedDate, contact }]);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: "Invalid payload: provide rows array or stallNo" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[api/stalls/sync-sheet] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const passedUrl = searchParams.get("url");
  const isAdmin = Boolean(await getAdminSession(req));

  // The sheet's "Fill in bookings from website" reads this with the secret
  if (!isAdmin && !((action === "get_all_stalls" || action === "export_all") && isValidSheetSecret(searchParams.get("secret")))) {
    return unauthorized();
  }

  // Return all 91 stalls with live status for Google Sheet population
  if (action === "get_all_stalls" || action === "export_all") {
    try {
      const stalls = await getAllStallsForSheet();
      return NextResponse.json(
        { success: true, count: stalls.length, stalls },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          },
        }
      );
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  // If user requests a pull from Google Sheet
  if (action === "pull") {
    let webhookUrl = passedUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (!webhookUrl) {
      const settings = await getFirebaseSettings();
      webhookUrl = settings?.googleSheetsWebhookUrl;
    }

    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: "GOOGLE_SHEETS_WEBHOOK_URL is not configured yet" },
        { status: 400 }
      );
    }

    try {
      const res = await fetch(sheetReadUrl(webhookUrl), { redirect: "follow" });
      const text = await res.text();
      let sheetJson: any;
      try {
        sheetJson = JSON.parse(text);
      } catch {
        if (text.includes("ServiceLogin") || text.includes("<!DOCTYPE") || text.includes("<html")) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Google access restricted: In Apps Script, click Deploy -> Manage deployments -> Edit (pencil icon), set 'Who has access' to 'Anyone', and click Deploy.",
            },
            { status: 403 }
          );
        }
        return NextResponse.json(
          { success: false, error: "Invalid response from Google: " + text.slice(0, 100) },
          { status: 502 }
        );
      }

      const sheetRows: SheetStallItem[] = Array.isArray(sheetJson)
        ? sheetJson
        : sheetJson.rows || sheetJson.data || [];
      const result = await syncSheetRowsToDb(sheetRows);
      return NextResponse.json(result);
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  // Otherwise return status info
  const settings = await getFirebaseSettings();
  const configuredUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || settings?.googleSheetsWebhookUrl || "";

  return NextResponse.json({
    success: true,
    configured: Boolean(configuredUrl),
    webhookUrl: configuredUrl,
    sheetUrl: "https://docs.google.com/spreadsheets/d/1OCExy81NgcVEtRURf0SB0zJmTv6tVebFIMtmj0CVYC0/edit",
  });
}

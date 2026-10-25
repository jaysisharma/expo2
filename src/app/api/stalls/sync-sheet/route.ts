import { NextResponse } from "next/server";
import { syncSheetRowsToDb, pushStallToGoogleSheet, SheetStallItem } from "@/lib/googleSheetSync";
import { getFirebaseBoothOverrides, getFirebaseSettings, updateFirebaseSettings } from "@/lib/firebaseDb";
import { boothsData } from "@/data/booths";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, secret, rows, stallNo, status, companyName, bookedDate, contact, webhookUrl } = body;

    // Optional secret check if set
    const expectedSecret = process.env.GOOGLE_SHEET_SYNC_SECRET || "expo2_secret_sync_2027";
    if (secret && secret !== expectedSecret) {
      return NextResponse.json({ success: false, error: "Unauthorized: Invalid secret" }, { status: 401 });
    }

    // Save webhook URL if provided
    if (action === "save_webhook_url" && webhookUrl) {
      await updateFirebaseSettings({ googleSheetsWebhookUrl: webhookUrl }).catch(() => {});
      return NextResponse.json({ success: true, message: "Webhook URL saved successfully" });
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

      const res = await fetch(targetUrl, { redirect: "follow" });
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
      const res = await fetch(webhookUrl, { redirect: "follow" });
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
    sheetUrl: "https://docs.google.com/spreadsheets/d/1nG2uJ3TDNseKGNTyldxnii8Fm6DuuIN1nIOIXQX2RVc/edit",
  });
}

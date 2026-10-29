// Google Apps Script for the "Booked list HIGEX 2027" sheet, copied from the Sheet Setup popup.
// Source of truth for the sync logic in the sheet; keep in step with src/lib/googleSheetSync.ts.
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// ============================================================================
// HIMALAYAN GREEN ENERGY EXPO 2027 - "Booked list HIGEX 2027" STALL SYNC
// ============================================================================
// Works with the tabs "list" (Blocks A/B/C) and "Hydro Competition" (H1-H8).
// Columns are found by their header names (Stall No, Status, Company Name,
// Contact Number, Email Address), so moving columns around is fine.
//
// Prices come FROM the sheet: Stall size, Sqm, Dealed Amount and Prime Charge (NRs. and
// US Dollar sections) are sent to the website, which then charges exactly that
// (+13% VAT). The website never writes prices back here.
//
// The script only ever writes the Status, Company Name, Contact Number and
// Email Address cells of an existing stall row. Rates, prime charge, VAT,
// totals, advance/due amounts, remarks and the BLOCK header rows are never
// touched, and rows are never added or cleared.
//
// SETUP: Project Settings (gear icon) -> Script Properties -> add
//   SYNC_SECRET = the same value as GOOGLE_SHEET_SYNC_SECRET on the website.

const WEBSITE_SYNC_URL = "https://www.himalayanenergyexpo.com/api/stalls/sync-sheet";
const STALL_TABS = ["list", "Hydro Competition"];

function getSyncSecret() {
  var secret = PropertiesService.getScriptProperties().getProperty("SYNC_SECRET");
  if (!secret) throw new Error("SYNC_SECRET is not set. Add it under Project Settings -> Script Properties.");
  return secret;
}

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("⚡ Expo Stall Sync")
      .addItem("📥 Fill in bookings from website", "pullBookingsFromWebsite")
      .addItem("📤 Sync sheet to website", "pushAllStallsToWebsite")
      .addSeparator()
      .addItem("🔁 Turn on auto-sync when I edit", "enableAutoSync")
      .addToUi();
  } catch (e) {
    Logger.log("onOpen error: " + e.toString());
  }
}

/** Safe alert that works both inside Google Sheet and in the script editor */
function showAlert(msg) {
  try {
    SpreadsheetApp.getUi().alert(msg);
  } catch (e) {
    Logger.log(msg);
  }
}

/** "A01", "A-1", "a 1" -> "A1" */
function normalizeStallNo(val) {
  if (!val) return "";
  var cleaned = String(val).toUpperCase().replace(/[^A-Z0-9]/g, "");
  var m = cleaned.match(/^([A-Z]+)0*([0-9]+)$/);
  return m ? m[1] + parseInt(m[2], 10) : "";
}

function headerKey(val) {
  return String(val || "").replace(/[ \\n\\r\\t]+/g, " ").trim().toLowerCase();
}

/** Website status -> what this sheet uses in the Status column */
function sheetStatus(status) {
  var s = String(status || "").toLowerCase();
  if (s.indexOf("book") !== -1) return "BOOKED";
  if (s.indexOf("reserv") !== -1) return "RESERVED";
  return "";
}

/** Reads one tab and finds its header row (the row with "Stall No") */
function readTab(sheet) {
  var data = sheet.getDataRange().getValues();
  for (var r = 0; r < Math.min(10, data.length); r++) {
    var cols = {};
    for (var c = 0; c < data[r].length; c++) {
      var h = headerKey(data[r][c]);
      var key = null;
      if (h === "stall no" || h === "stall no.") key = "stall";
      else if (h === "status") key = "status";
      else if (h === "company name") key = "company";
      else if (h === "contact number") key = "phone";
      else if (h === "email address" || h === "email") key = "email";
      else if (h === "sqm") key = "sqm";
      else if (h === "stall size") key = "size";
      // The NRs. section comes first and the US Dollar section second
      else if (h === "dealed amount" || h === "deal amount" || h === "full amount") key = cols.dealNPR === undefined ? "dealNPR" : "dealUSD";
      else if (h === "prime charge") key = cols.primeNPR === undefined ? "primeNPR" : "primeUSD";
      if (key && cols[key] === undefined) cols[key] = c;
    }
    if (cols.stall !== undefined && cols.status !== undefined) {
      return { sheet: sheet, data: data, headerRow: r, cols: cols };
    }
  }
  return null;
}

function readAllTabs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabs = [];
  for (var i = 0; i < STALL_TABS.length; i++) {
    var sheet = ss.getSheetByName(STALL_TABS[i]);
    var tab = sheet ? readTab(sheet) : null;
    if (tab) tabs.push(tab);
  }
  return tabs;
}

function cell(tab, r, key) {
  var c = tab.cols[key];
  return c === undefined ? "" : String(tab.data[r][c] || "").trim();
}

/** Numeric cell value, or "" when empty / not a number (formulas give their result) */
function amount(tab, r, key) {
  var c = tab.cols[key];
  if (c === undefined) return "";
  var v = tab.data[r][c];
  if (v === "" || v === null) return "";
  var n = Number(String(v).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? "" : n;
}

/** One stall row in the shape the website expects */
function rowToItem(tab, r) {
  var stallNo = normalizeStallNo(tab.data[r][tab.cols.stall]);
  if (!stallNo) return null; // BLOCK header or empty row
  return {
    stallNo: stallNo,
    status: cell(tab, r, "status") || "Available",
    companyName: cell(tab, r, "company"),
    contact: cell(tab, r, "phone") || cell(tab, r, "email"),
    bookedDate: "",
    sizeSqM: amount(tab, r, "sqm"),
    stallSize: cell(tab, r, "size"),
    dealNPR: amount(tab, r, "dealNPR"),
    dealUSD: amount(tab, r, "dealUSD"),
    primeChargeNPR: amount(tab, r, "primeNPR"),
    primeChargeUSD: amount(tab, r, "primeUSD")
  };
}

function collectAllRows() {
  var tabs = readAllTabs();
  var rows = [];
  for (var t = 0; t < tabs.length; t++) {
    for (var r = tabs[t].headerRow + 1; r < tabs[t].data.length; r++) {
      var item = rowToItem(tabs[t], r);
      if (item) rows.push(item);
    }
  }
  return rows;
}

function findStall(tabs, stallNo) {
  var target = normalizeStallNo(stallNo);
  for (var t = 0; t < tabs.length; t++) {
    for (var r = tabs[t].headerRow + 1; r < tabs[t].data.length; r++) {
      if (normalizeStallNo(tabs[t].data[r][tabs[t].cols.stall]) === target) {
        return { tab: tabs[t], r: r };
      }
    }
  }
  return null;
}

function setCell(tab, r, key, value) {
  var c = tab.cols[key];
  if (c === undefined) return;
  tab.sheet.getRange(r + 1, c + 1).setValue(value);
  tab.data[r][c] = value;
}

/**
 * Writes a website booking into the sheet.
 * fillBlanksOnly: only fill stalls whose Status cell is still empty
 * (used for bulk fills, so bookings typed into the sheet are never overwritten).
 */
function applyBooking(tabs, item, fillBlanksOnly) {
  var hit = findStall(tabs, item.stallNo);
  if (!hit) return false;
  var status = sheetStatus(item.status);
  var company = item.companyName && item.companyName !== "Unassigned" ? item.companyName : "";

  if (fillBlanksOnly) {
    if (!status || cell(hit.tab, hit.r, "status")) return false;
  }

  setCell(hit.tab, hit.r, "status", status);
  if (!status) {
    setCell(hit.tab, hit.r, "company", "");
    return true;
  }
  if (company && (!fillBlanksOnly || !cell(hit.tab, hit.r, "company"))) {
    setCell(hit.tab, hit.r, "company", company);
  }
  var contact = String(item.contact || "").trim();
  if (contact) {
    var key = contact.indexOf("@") !== -1 ? "email" : "phone";
    if (!cell(hit.tab, hit.r, key)) setCell(hit.tab, hit.r, key, contact);
  }
  return true;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Fill website bookings into stalls that are still empty in the sheet */
function pullBookingsFromWebsite() {
  try {
    var res = UrlFetchApp.fetch(WEBSITE_SYNC_URL + "?action=get_all_stalls&secret=" + encodeURIComponent(getSyncSecret()), {
      method: "get",
      followRedirects: true,
      muteHttpExceptions: true
    });
    if (res.getResponseCode() !== 200) {
      showAlert("Server returned HTTP " + res.getResponseCode() + ": " + res.getContentText().slice(0, 150));
      return;
    }
    var json = JSON.parse(res.getContentText());
    if (!json.success || !Array.isArray(json.stalls)) {
      showAlert("Could not fetch stalls: " + (json.error || "Unknown"));
      return;
    }
    var tabs = readAllTabs();
    var filled = 0;
    for (var i = 0; i < json.stalls.length; i++) {
      if (applyBooking(tabs, json.stalls[i], true)) filled++;
    }
    showAlert("Done. Filled in " + filled + " booked/reserved stalls from the website. Stalls already marked in the sheet were left as they are.");
  } catch (err) {
    showAlert("Error: " + err.toString());
  }
}

function postRowsToWebsite(rows) {
  var res = UrlFetchApp.fetch(WEBSITE_SYNC_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ secret: getSyncSecret(), rows: rows }),
    followRedirects: true,
    muteHttpExceptions: true
  });
  var text = res.getContentText();
  if (res.getResponseCode() !== 200) throw new Error("HTTP " + res.getResponseCode() + ": " + text.slice(0, 150));
  var json = JSON.parse(text);
  if (!json.success) throw new Error(json.error || "Unknown sync error");
  return json;
}

/** Send every stall row in the sheet to the website */
function pushAllStallsToWebsite() {
  var rows = collectAllRows();
  if (rows.length === 0) {
    showAlert("No stall rows found. Check that the tabs are named: " + STALL_TABS.join(", "));
    return;
  }
  try {
    var json = postRowsToWebsite(rows);
    showAlert("Success! Synced " + (json.count || 0) + " stalls to the website & floor plan.");
  } catch (err) {
    showAlert("Sync error: " + err.toString());
  }
}

/** Installs the trigger that sends a row to the website whenever it is edited */
function enableAutoSync() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "onStallEdit") ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger("onStallEdit").forSpreadsheet(ss).onEdit().create();
  showAlert("Auto-sync is on. Editing a stall's Status, Company Name, contact, Sqm, Dealed Amount or Prime Charge now updates the website.");
}

/** Installable onEdit trigger (see enableAutoSync) */
function onStallEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (STALL_TABS.indexOf(sheet.getName()) === -1) return;
  var tab = readTab(sheet);
  if (!tab) return;

  var watched = [
    tab.cols.status, tab.cols.company, tab.cols.phone, tab.cols.email,
    tab.cols.sqm, tab.cols.size, tab.cols.dealNPR, tab.cols.dealUSD, tab.cols.primeNPR, tab.cols.primeUSD
  ];
  var firstCol = e.range.getColumn() - 1;
  var lastCol = firstCol + e.range.getNumColumns() - 1;
  var touched = false;
  for (var w = 0; w < watched.length; w++) {
    if (watched[w] !== undefined && watched[w] >= firstCol && watched[w] <= lastCol) touched = true;
  }
  if (!touched) return;

  var rows = [];
  var firstRow = e.range.getRow() - 1;
  for (var r = firstRow; r < firstRow + e.range.getNumRows(); r++) {
    if (r <= tab.headerRow || r >= tab.data.length) continue;
    var item = rowToItem(tab, r);
    if (item) rows.push(item);
  }
  if (rows.length === 0) return;

  try {
    postRowsToWebsite(rows);
  } catch (err) {
    SpreadsheetApp.getActiveSpreadsheet().toast("Website sync failed: " + err.toString(), "Expo Stall Sync", 10);
  }
}

function hasValidSecret(given) {
  try {
    return Boolean(given) && given === getSyncSecret();
  } catch (err) {
    return false;
  }
}

/** Called by the website to read all stall rows */
function doGet(e) {
  if (!hasValidSecret(e && e.parameter && e.parameter.secret)) return jsonOut({ success: false, error: "Unauthorized" });
  var rows = collectAllRows();
  return jsonOut({ success: true, count: rows.length, rows: rows });
}

/** Called by the website when a stall is booked online or changed in the admin panel */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    if (!hasValidSecret(payload.secret)) return jsonOut({ success: false, error: "Unauthorized" });
    var tabs = readAllTabs();

    // Bulk fill from the admin panel: only stalls still empty in the sheet
    if (payload.action === "populate_all" && Array.isArray(payload.stalls)) {
      var filled = 0;
      for (var i = 0; i < payload.stalls.length; i++) {
        if (applyBooking(tabs, payload.stalls[i], true)) filled++;
      }
      return jsonOut({ success: true, count: filled });
    }

    if (!payload.stallNo) return jsonOut({ success: false, error: "Missing stallNo" });
    if (!applyBooking(tabs, payload, false)) {
      return jsonOut({ success: false, error: "Stall " + payload.stallNo + " not found in sheet" });
    }
    return jsonOut({ success: true, stallNo: normalizeStallNo(payload.stallNo), status: sheetStatus(payload.status) });
  } catch (err) {
    return jsonOut({ success: false, error: err.toString() });
  }
}
`;

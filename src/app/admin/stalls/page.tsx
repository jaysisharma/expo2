"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Download,
  CheckCircle2,
  X,
  Store,
  RotateCcw,
  Edit2,
  Check,
  LayoutGrid,
  List,
  ExternalLink,
  AlertCircle,
  Loader2,
  Sparkles,
  Plus,
  FileSpreadsheet,
  RefreshCw,
  Copy,
  MoreHorizontal,
  Link2,
} from "lucide-react";
import { Booth } from "@/lib/types";
import { formatCurrencyUSD, formatCurrencyNPR } from "@/lib/utils";
import {
  BLOCKS,
  STALL_STATUSES,
  STATUS_STYLES,
  blockOf,
  mergeBoothOverrides,
  resolveBooths,
} from "@/lib/stallInventory";
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from "./sheetSyncScript";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1iDHOjkA6eNwazEpnwrMVmVD5I99sJvhF444Pn3tCNeE/edit";
const STATUSES = STALL_STATUSES;

export default function AdminStallsPage() {
  const [data, setData] = useState<any>(null);
  const [floorPlanElements, setFloorPlanElements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHall, setSelectedHall] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Selection & Bulk Actions
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Edit Modal
  const [editingBooth, setEditingBooth] = useState<Booth | null>(null);
  const [modalStatus, setModalStatus] = useState<"Available" | "Reserved" | "Booked">("Available");
  const [modalExhibitor, setModalExhibitor] = useState<string>("");
  const [modalPriceUSD, setModalPriceUSD] = useState<number>(0);
  const [modalPriceNPR, setModalPriceNPR] = useState<number>(0);
  const [modalIsPrime, setModalIsPrime] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Quick Book Modal
  const [showQuickBookModal, setShowQuickBookModal] = useState(false);
  const [quickStallNumber, setQuickStallNumber] = useState("");
  const [quickClientName, setQuickClientName] = useState("");
  const [quickStatus, setQuickStatus] = useState<"Booked" | "Reserved">("Booked");
  const [isQuickBooking, setIsQuickBooking] = useState(false);

  // Reset Confirmation Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Google Sheet Sync Modal & State
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [isPopulatingSheet, setIsPopulatingSheet] = useState(false);
  const [sheetWebhookUrl, setSheetWebhookUrl] = useState("");
  const [copiedScript, setCopiedScript] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type?: "success" | "error" } | null>(null);

  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  const notify = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchBoothsData = async () => {
    setIsLoading(true);
    try {
      const [adminRes, floorRes] = await Promise.all([
        fetch("/api/admin/data?t=" + Date.now(), { cache: "no-store" }),
        fetch("/api/floor-plan/save?t=" + Date.now(), { cache: "no-store" }).catch(() => null),
      ]);
      const json = await adminRes.json();
      if (json.success) {
        setData(json.data);
      }
      if (floorRes && floorRes.ok) {
        const floorJson = await floorRes.json();
        if (floorJson?.success && Array.isArray(floorJson?.data?.elements) && floorJson.data.elements.length > 0) {
          setFloorPlanElements(floorJson.data.elements);
        }
      }
    } catch {
      notify("Failed to fetch stall data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoothsData();
    fetch("/api/stalls/sync-sheet")
      .then((r) => r.json())
      .then((d) => {
        if (d?.webhookUrl) setSheetWebhookUrl(d.webhookUrl);
      })
      .catch(() => {});
  }, []);

  const exchangeRate = data?.settings?.currencyRateUSD_NPR || 134.5;
  const primePct = data?.settings?.primeStallSurchargePercent ?? 25;
  const primeRate = primePct / 100;

  const mergedBooths: Booth[] = useMemo(
    () => mergeBoothOverrides(floorPlanElements, data?.boothOverrides),
    [floorPlanElements, data?.boothOverrides]
  );

  const filteredBooths = useMemo(() => {
    return mergedBooths.filter((b) => {
      const matchesHall = selectedHall === "All" || blockOf(b) === selectedHall;

      const matchesStatus = selectedStatus === "All" || b.status === selectedStatus;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        b.number.toLowerCase().includes(query) ||
        (b.exhibitorName && b.exhibitorName.toLowerCase().includes(query)) ||
        b.type.toLowerCase().includes(query) ||
        (b.hall && b.hall.toLowerCase().includes(query));

      return matchesHall && matchesStatus && matchesSearch;
    });
  }, [mergedBooths, selectedHall, selectedStatus, searchQuery]);

  // Master Checkbox State
  const filteredNumbers = useMemo(() => filteredBooths.map((b) => b.number), [filteredBooths]);
  const isAllFilteredSelected =
    filteredNumbers.length > 0 && filteredNumbers.every((num) => selectedNumbers.includes(num));
  const isPartiallySelected =
    filteredNumbers.some((num) => selectedNumbers.includes(num)) && !isAllFilteredSelected;

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isPartiallySelected;
    }
  }, [isPartiallySelected]);

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedNumbers((prev) => prev.filter((num) => !filteredNumbers.includes(num)));
    } else {
      setSelectedNumbers((prev) => Array.from(new Set([...prev, ...filteredNumbers])));
    }
  };

  const handleToggleSelectOne = (number: string) => {
    setSelectedNumbers((prev) =>
      prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number]
    );
  };

  // What customers are charged (sheet prices, prime surcharge, sheet sizes), same as checkout
  const resolvedByNumber = useMemo(
    () => resolveBooths(mergedBooths, floorPlanElements, data?.boothOverrides, primePct),
    [mergedBooths, floorPlanElements, data?.boothOverrides, primePct]
  );

  const blockCounts = useMemo(() => {
    const counts: Record<string, { total: number; taken: number }> = { All: { total: 0, taken: 0 } };
    for (const b of mergedBooths) {
      const block = blockOf(b);
      const taken = b.status !== "Available" ? 1 : 0;
      counts[block] = { total: (counts[block]?.total || 0) + 1, taken: (counts[block]?.taken || 0) + taken };
      counts.All = { total: counts.All.total + 1, taken: counts.All.taken + taken };
    }
    return counts;
  }, [mergedBooths]);

  const bookedValueNPR = mergedBooths
    .filter((b) => b.status === "Booked")
    .reduce((sum, b) => sum + (resolvedByNumber.get(b.number)?.priceNPR || 0), 0);
  const isSheetConnected = Boolean(sheetWebhookUrl.trim());

  const bookedCount = mergedBooths.filter((b) => b.status === "Booked").length;
  const reservedCount = mergedBooths.filter((b) => b.status === "Reserved").length;
  const availableCount = mergedBooths.filter((b) => b.status === "Available").length;
  const totalCount = mergedBooths.length || 1;
  const occupancyPct = Math.round(((bookedCount + reservedCount) / totalCount) * 100);

  const handleOpenEdit = (booth: Booth) => {
    setEditingBooth(booth);
    setModalStatus(booth.status as "Available" | "Reserved" | "Booked");
    setModalExhibitor(booth.exhibitorName || "");
    const initialUSD = booth.priceUSD || 0;
    const initialNPR = booth.priceNPR || Math.round(initialUSD * exchangeRate);
    setModalPriceUSD(initialUSD);
    setModalPriceNPR(initialNPR);
    setModalIsPrime(Boolean(booth.isPrime));
  };

  const handleSaveBooth = async () => {
    if (isSaving || !editingBooth) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_booth",
          payload: {
            boothNumber: editingBooth.number,
            status: modalStatus,
            exhibitorName: modalExhibitor,
            priceUSD: Number(modalPriceUSD),
            priceNPR: Number(modalPriceNPR),
            isPrime: modalIsPrime,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        notify(`Stall ${editingBooth.number} updated successfully`);
        setEditingBooth(null);
        fetchBoothsData();
      }
    } catch {
      notify("Failed to update booth", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Book Handler
  const handleQuickBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const stall = quickStallNumber.trim().toUpperCase();
    if (!stall) {
      notify("Please select or enter a stall number", "error");
      return;
    }
    if (!quickClientName.trim()) {
      notify("Please enter the client / exhibitor company name", "error");
      return;
    }

    const matched = mergedBooths.find((b) => b.number.toUpperCase() === stall);

    setIsQuickBooking(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_booth",
          payload: {
            boothNumber: matched ? matched.number : stall,
            status: quickStatus,
            exhibitorName: quickClientName.trim(),
            ...(matched?.priceUSD ? { priceUSD: matched.priceUSD } : {}),
            ...(matched?.priceNPR ? { priceNPR: matched.priceNPR } : {}),
            ...(matched?.isPrime !== undefined ? { isPrime: matched.isPrime } : {}),
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        notify(`Stall ${stall} successfully marked as ${quickStatus} for "${quickClientName.trim()}"`);
        setShowQuickBookModal(false);
        setQuickStallNumber("");
        setQuickClientName("");
        fetchBoothsData();
      } else {
        notify(json.error || "Failed to update stall", "error");
      }
    } catch {
      notify("Failed to book stall", "error");
    } finally {
      setIsQuickBooking(false);
    }
  };

  // Bulk Prime Update
  const handleBulkSetPrime = async (isPrime: boolean) => {
    if (selectedNumbers.length === 0 || isBulkUpdating) return;
    setIsBulkUpdating(true);

    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch_update_booths",
          payload: {
            boothNumbers: selectedNumbers,
            isPrime,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        notify(`Updated ${selectedNumbers.length} stalls to ${isPrime ? `Prime (+${primePct}%)` : "Standard"}`);
        setSelectedNumbers([]);
        fetchBoothsData();
      }
    } catch {
      notify("Failed to update prime status", "error");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Bulk Status Update
  const handleBulkSetStatus = async (status: "Available" | "Reserved" | "Booked") => {
    if (selectedNumbers.length === 0 || isBulkUpdating) return;
    setIsBulkUpdating(true);

    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch_update_booths",
          payload: {
            boothNumbers: selectedNumbers,
            status,
            ...(status === "Available" ? { exhibitorName: "" } : {}),
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        notify(`Updated ${selectedNumbers.length} stalls to ${status}`);
        setSelectedNumbers([]);
        fetchBoothsData();
      }
    } catch {
      notify("Failed to update selected stalls", "error");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleReleaseBooth = async (booth: Booth) => {
    if (!confirm(`Release Stall ${booth.number} (${booth.exhibitorName || "Client"}) back to Available?`)) return;
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_booth",
          payload: { boothNumber: booth.number, status: "Available", exhibitorName: "" },
        }),
      });
      if ((await res.json()).success) {
        notify(`Stall ${booth.number} released to Available`);
        fetchBoothsData();
      }
    } catch {
      notify("Failed to release stall", "error");
    }
  };

  const openQuickBook = (stallNumber = "") => {
    setQuickStallNumber(stallNumber);
    setQuickClientName("");
    setQuickStatus("Booked");
    setShowQuickBookModal(true);
  };

  const handleResetAllBooths = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_all_booths" }),
      });
      const json = await res.json();
      if (json.success) {
        notify("All stalls have been reset to Available");
        setShowResetModal(false);
        setSelectedNumbers([]);
        fetchBoothsData();
      }
    } catch {
      notify("Failed to reset stalls", "error");
    } finally {
      setIsResetting(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Booth Number",
      "Hall",
      "Size (m²)",
      "Dimensions",
      "Type",
      "Status",
      "Exhibitor Name",
      "Price (USD)",
      "Price (NPR)",
    ];
    const rows = filteredBooths.map((b) => [
      b.number,
      b.hall || "Hall A",
      b.sizeSqM,
      b.dimensions,
      b.type,
      b.status,
      b.exhibitorName || "—",
      b.priceUSD,
      b.priceNPR || Math.round(b.priceUSD * exchangeRate),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Himalayan_Expo_Stalls_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("Stall inventory exported to CSV");
  };

  const handleSyncGoogleSheet = async (overrideUrl?: string) => {
    setIsSyncingSheet(true);
    try {
      const urlToUse = overrideUrl || sheetWebhookUrl;
      const endpoint =
        "/api/stalls/sync-sheet?action=pull" + (urlToUse ? `&url=${encodeURIComponent(urlToUse)}` : "");
      const res = await fetch(endpoint);
      const json = await res.json();
      if (json.success) {
        notify(`Synced ${json.count || 0} stalls from Google Sheet!`);
        setShowSheetModal(false);
        fetchBoothsData();
      } else {
        notify(json.error || "Please configure your Google Apps Script Webhook URL first", "error");
        setShowSheetModal(true);
      }
    } catch {
      notify("Failed to connect to Google Sheet", "error");
      setShowSheetModal(true);
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const handlePopulateGoogleSheet = async (overrideUrl?: string) => {
    const urlToUse = (overrideUrl || sheetWebhookUrl || "").trim();
    if (!urlToUse) {
      notify("Please paste and save your Google Apps Script Web App URL first", "error");
      return;
    }
    setIsPopulatingSheet(true);
    try {
      const res = await fetch("/api/stalls/sync-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "push_all_to_sheet",
          webhookUrl: urlToUse,
        }),
      });
      const json = await res.json();
      if (json.success) {
        notify(`Done! Filled ${json.response?.count ?? 0} website bookings into your Google Sheet.`, "success");
        setShowSheetModal(false);
        fetchBoothsData();
      } else {
        notify(json.error || "Failed to populate stalls into Google Sheet", "error");
      }
    } catch (err: any) {
      notify(err.message || "Failed to connect to Google Sheet", "error");
    } finally {
      setIsPopulatingSheet(false);
    }
  };

  const handleSaveWebhookUrl = async (url: string) => {
    if (!url.trim()) return;
    try {
      const res = await fetch("/api/stalls/sync-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_webhook_url", webhookUrl: url.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setSheetWebhookUrl(url.trim());
        notify("Google Apps Script Webhook URL saved!");
      }
    } catch {
      notify("Failed to save Webhook URL", "error");
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-lg flex items-center gap-2 transition-all ${
            toastMsg.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {toastMsg.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header: title, primary action, everything else in "More" */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            Exhibition Hall
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Stalls & Bookings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Book stalls to exhibitors, track availability and keep the Google Sheet in sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/floor-plan"
            className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span>Floor Plan</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowMoreMenu((v) => !v)}
              className="px-2.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs flex items-center transition-colors cursor-pointer"
              title="More actions"
              aria-haspopup="menu"
              aria-expanded={showMoreMenu}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMoreMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMoreMenu(false)} />
                <div
                  role="menu"
                  className="absolute right-0 mt-1.5 z-40 w-52 p-1 rounded-xl bg-white border border-slate-200 shadow-xl text-xs"
                >
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowMoreMenu(false);
                      exportCSV();
                    }}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer text-left"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export CSV ({filteredBooths.length})</span>
                  </button>
                  {(bookedCount > 0 || reservedCount > 0) && (
                    <>
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        role="menuitem"
                        onClick={() => {
                          setShowMoreMenu(false);
                          setShowResetModal(true);
                        }}
                        className="w-full px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-700 flex items-center gap-2 cursor-pointer text-left"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset all stalls…</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => openQuickBook()}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Book Stall</span>
          </button>
        </div>
      </div>

      {/* Google Sheet connection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900 truncate">Booked list HIGEX 2027</span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  isSheetConnected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSheetConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
                {isSheetConnected ? "Connected" : "Not connected"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {isSheetConnected
                ? "Prices and bookings come from the sheet. Edits there update this page automatically."
                : "Open Setup to connect the sheet's Apps Script."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={SHEET_URL}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium flex items-center gap-1"
          >
            <span>Open</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => handleSyncGoogleSheet()}
            disabled={isSyncingSheet || !isSheetConnected}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title={isSheetConnected ? "Pull bookings and prices from the sheet now" : "Connect the sheet first"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheet ? "animate-spin" : ""}`} />
            <span>{isSyncingSheet ? "Syncing…" : "Sync now"}</span>
          </button>
          <button
            onClick={() => setShowSheetModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Setup</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="col-span-2 lg:col-span-1 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Occupancy</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-slate-900">{occupancyPct}%</span>
            <span className="text-[11px] text-slate-500">
              of {mergedBooths.length} stalls
            </span>
          </div>
          <div className="mt-2.5 h-1.5 rounded-full bg-slate-100 overflow-hidden flex">
            <div className="bg-emerald-500" style={{ width: `${(bookedCount / totalCount) * 100}%` }} />
            <div className="bg-amber-400" style={{ width: `${(reservedCount / totalCount) * 100}%` }} />
          </div>
        </div>

        {STATUSES.slice()
          .reverse()
          .map((st) => {
            const count = st === "Booked" ? bookedCount : st === "Reserved" ? reservedCount : availableCount;
            const active = selectedStatus === st;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(active ? "All" : st)}
                className={`p-4 rounded-xl border shadow-xs text-left transition-colors cursor-pointer ${
                  active ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 hover:border-slate-300"
                }`}
                title={active ? "Show all statuses" : `Show only ${st.toLowerCase()} stalls`}
              >
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider opacity-70">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[st].dot}`} />
                  {st}
                </span>
                <span className="block text-2xl font-bold mt-1">{count}</span>
              </button>
            );
          })}

        <div className="col-span-2 lg:col-span-1 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Booked value</span>
          <span className="block text-lg font-bold text-slate-900 mt-1">{formatCurrencyNPR(bookedValueNPR)}</span>
          <span className="text-[11px] text-slate-500">{bookedCount} stalls, before VAT</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 overflow-x-auto scrollbar-none">
          {(["All", ...BLOCKS] as const).map((hall) => {
            const isActive = selectedHall === hall;
            const c = blockCounts[hall] || { total: 0, taken: 0 };
            return (
              <button
                key={hall}
                onClick={() => setSelectedHall(hall)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive ? "bg-white text-slate-900 font-semibold shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{hall === "All" ? "All blocks" : hall}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {c.taken}/{c.total}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 lg:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stall # or company…"
              className="w-full pl-8 pr-7 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
            {(
              [
                ["table", List, "Table view"],
                ["grid", LayoutGrid, "Map view by block"],
              ] as const
            ).map(([mode, Icon, label]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === mode ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
                title={label}
                aria-label={label}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedStatus !== "All" && (
        <div className="-mt-2 flex items-center gap-2 text-[11px] text-slate-500">
          <span>
            Showing <strong className="text-slate-700">{selectedStatus.toLowerCase()}</strong> stalls only
          </span>
          <button onClick={() => setSelectedStatus("All")} className="text-emerald-700 hover:underline cursor-pointer">
            Show all
          </button>
        </div>
      )}

      {/* Bulk actions for selected stalls */}
      {selectedNumbers.length > 0 && (
        <div className="sticky top-4 z-20 p-2.5 px-4 rounded-xl bg-slate-900 text-white shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <span className="text-xs font-medium text-slate-200">
            {selectedNumbers.length === 1 ? "1 stall selected" : `${selectedNumbers.length} stalls selected`}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 hidden sm:inline mr-1">Mark as</span>
            {STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => handleBulkSetStatus(st)}
                disabled={isBulkUpdating}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                  st === "Booked"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : st === "Reserved"
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                    : "bg-slate-700 hover:bg-slate-600 text-slate-100"
                }`}
              >
                {st}
              </button>
            ))}
            <span className="w-px h-4 bg-slate-700 mx-1" />
            <button
              onClick={() => handleBulkSetPrime(true)}
              disabled={isBulkUpdating}
              className="px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-amber-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" />
              <span>Prime</span>
            </button>
            <button
              onClick={() => handleBulkSetPrime(false)}
              disabled={isBulkUpdating}
              className="px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Standard
            </button>
            <button
              onClick={() => setSelectedNumbers([])}
              className="px-2 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Clear selection"
              aria-label="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Stalls */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-[#218A59] mb-2" />
          <span className="text-xs">Loading stalls…</span>
        </div>
      ) : filteredBooths.length === 0 ? (
        <div className="py-16 px-4 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No stalls found</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            Nothing matches these filters. Try another block or clear the search.
          </p>
          <button
            onClick={() => {
              setSelectedHall("All");
              setSelectedStatus("All");
              setSearchQuery("");
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 pl-4 pr-2 w-10">
                    <input
                      ref={masterCheckboxRef}
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-[#218A59] focus:ring-[#218A59] cursor-pointer"
                      aria-label={isAllFilteredSelected ? "Deselect all" : "Select all"}
                    />
                  </th>
                  <th className="py-2.5 px-3">Stall</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Exhibitor</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 pr-4 pl-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBooths.map((booth) => {
                  const isSelected = selectedNumbers.includes(booth.number);
                  const r = resolvedByNumber.get(booth.number);
                  return (
                    <tr
                      key={booth.id}
                      className={`group hover:bg-slate-50/70 transition-colors ${isSelected ? "bg-emerald-50/40" : ""}`}
                    >
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(booth.number)}
                          className="w-4 h-4 rounded border-slate-300 text-[#218A59] focus:ring-[#218A59] cursor-pointer"
                          aria-label={`Select stall ${booth.number}`}
                        />
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(booth)}
                            className="font-mono font-bold text-[#234679] hover:underline cursor-pointer"
                          >
                            {booth.number}
                          </button>
                          {(r?.isPrime ?? booth.isPrime) && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                              ★ Prime
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{blockOf(booth)}</span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono font-medium text-slate-900">{r?.sizeSqM ?? booth.sizeSqM} m²</span>
                        <span className="text-[11px] text-slate-400 block">{r?.dimensions || booth.dimensions}</span>
                      </td>

                      <td className="py-3 px-3">
                        {booth.exhibitorName ? (
                          <span className="font-semibold text-slate-900 truncate block max-w-[220px]">
                            {booth.exhibitorName}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className="font-mono font-semibold text-slate-900">
                          {formatCurrencyNPR(r?.priceNPR ?? booth.priceNPR ?? 0)}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          {formatCurrencyUSD(r?.priceUSD ?? booth.priceUSD)}
                          {r?.isPrime ? " · incl. prime" : ""}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                            STATUS_STYLES[booth.status]?.badge || STATUS_STYLES.Available.badge
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[booth.status]?.dot || "bg-slate-300"}`} />
                          {booth.status}
                        </span>
                      </td>

                      <td className="py-3 pr-4 pl-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {booth.status === "Available" ? (
                            <button
                              onClick={() => openQuickBook(booth.number)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Book
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReleaseBooth(booth)}
                              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors cursor-pointer"
                              title="Release back to Available"
                            >
                              Release
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(booth)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title={`Edit stall ${booth.number}`}
                            aria-label={`Edit stall ${booth.number}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 px-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Showing {filteredBooths.length} of {mergedBooths.length} stalls
            </span>
            <span>Prices exclude 13% VAT</span>
          </div>
        </div>
      ) : (
        /* Map view: stalls grouped by block, coloured by status */
        <div className="space-y-4">
          {BLOCKS.filter((block) => filteredBooths.some((b) => blockOf(b) === block)).map((block) => (
            <div key={block} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900">{block}</h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {blockCounts[block]?.taken || 0}/{blockCounts[block]?.total || 0} taken
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-12 gap-2">
                {filteredBooths
                  .filter((b) => blockOf(b) === block)
                  .map((booth) => {
                    const isSelected = selectedNumbers.includes(booth.number);
                    const r = resolvedByNumber.get(booth.number);
                    return (
                      <button
                        key={booth.id}
                        onClick={() => handleOpenEdit(booth)}
                        className={`relative p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                          STATUS_STYLES[booth.status]?.tile || STATUS_STYLES.Available.tile
                        } ${isSelected ? "ring-2 ring-emerald-500" : ""}`}
                        title={`${booth.number} · ${booth.status}${booth.exhibitorName ? ` · ${booth.exhibitorName}` : ""} · ${formatCurrencyNPR(r?.priceNPR ?? 0)}`}
                      >
                        <span className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[11px] text-slate-900">{booth.number}</span>
                          {r?.isPrime && <span className="text-[9px] text-amber-600">★</span>}
                        </span>
                        <span className="block text-[10px] text-slate-500 truncate">
                          {booth.exhibitorName || `${r?.sizeSqM ?? booth.sizeSqM} m²`}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-4 text-[11px] text-slate-500 px-1">
            {STATUSES.map((st) => (
              <span key={st} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${STATUS_STYLES[st].dot}`} />
                {st}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="text-amber-600">★</span> Prime
            </span>
            <span className="ml-auto">Click a stall to edit it</span>
          </div>
        </div>
      )}

      {/* Quick Book Stall Modal */}
      {showQuickBookModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Book a stall
                  </h3>
                  <p className="text-xs text-slate-500">
                    Assign it to an exhibitor; the website and sheet update right away.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickBookModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickBook} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  STALL NUMBER *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="available-stalls-list"
                    value={quickStallNumber}
                    onChange={(e) => setQuickStallNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. C5, A1, B12..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-emerald-600 focus:bg-white uppercase"
                    required
                    autoFocus
                  />
                  <datalist id="available-stalls-list">
                    {mergedBooths
                      .filter((b) => b.status === "Available")
                      .map((b) => (
                        <option key={b.number} value={b.number}>
                          {b.number} - {b.hall || "Hall"} ({b.sizeSqM}m²)
                        </option>
                      ))}
                  </datalist>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Type any stall number or choose an available booth.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  CLIENT / COMPANY NAME *
                </label>
                <input
                  type="text"
                  value={quickClientName}
                  onChange={(e) => setQuickClientName(e.target.value)}
                  placeholder="e.g. Nepal Electricity Authority / Sanima Hydro"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium text-xs focus:outline-none focus:border-emerald-600 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  STATUS
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickStatus("Booked")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      quickStatus === "Booked"
                        ? "bg-emerald-700 border-emerald-700 text-white shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Booked (Confirmed)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickStatus("Reserved")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      quickStatus === "Reserved"
                        ? "bg-amber-600 border-amber-600 text-white shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>Reserved (Hold)</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickBookModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isQuickBooking}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isQuickBooking ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Confirm Booking</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stall Modal */}
      {editingBooth && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Edit Stall {editingBooth.number}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingBooth.hall || "Hall A"} · {editingBooth.sizeSqM}m² ({editingBooth.dimensions})
                </p>
              </div>
              <button
                onClick={() => setEditingBooth(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1.5">
                  STALL STATUS
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Available", "Reserved", "Booked"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setModalStatus(st)}
                      className={`py-2 rounded-xl border text-center font-semibold text-xs transition-colors cursor-pointer ${
                        modalStatus === st
                          ? "bg-slate-900 border-slate-900 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                  ASSIGNED EXHIBITOR COMPANY
                </label>
                <input
                  type="text"
                  value={modalExhibitor}
                  onChange={(e) => setModalExhibitor(e.target.value)}
                  placeholder="e.g. Voith Hydro International"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                    PRICE (USD $)
                  </label>
                  <input
                    type="number"
                    value={modalPriceUSD}
                    onChange={(e) => {
                      const usd = Number(e.target.value);
                      setModalPriceUSD(usd);
                    }}
                    placeholder="USD"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-[#218A59] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                    PRICE (NPR)
                  </label>
                  <input
                    type="number"
                    value={modalPriceNPR}
                    onChange={(e) => setModalPriceNPR(Number(e.target.value))}
                    placeholder="NPR"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-emerald-700 font-mono font-bold text-xs focus:outline-none focus:border-[#218A59] focus:bg-white"
                  />
                </div>
              </div>

              {/* Prime Stall Toggle */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Prime Stall (+{primePct}% Premium)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalIsPrime}
                      onChange={(e) => setModalIsPrime(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Mark this stall as a Prime Stall. In accordance with configured tariffs, a {primePct}% prime surcharge is applied and showcased on the public floor plan.
                </p>
                {modalIsPrime && (
                  <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[10px] font-mono font-bold text-amber-950">
                    <span>+{primePct}% Prime Extra: NPR {Math.round(modalPriceNPR * primeRate).toLocaleString()}</span>
                    <span>Tariff: NPR {Math.round(modalPriceNPR * (1 + primeRate)).toLocaleString()} (+ VAT)</span>
                  </div>
                )}
              </div>

              {isSheetConnected && (
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Prices and prime status come from the Google Sheet. Changes to them here are replaced the next
                  time that stall is edited in the sheet; status and exhibitor changes are written to the sheet.
                </p>
              )}

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Power Specification</span>
                <span className="text-slate-700 font-medium">{editingBooth.powerIncluded || "15A 3-Phase"}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setEditingBooth(null)}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBooth}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-medium cursor-pointer shadow-xs disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Stall"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset All Modal Confirmation */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Reset All Stalls?</h3>
              <p className="text-xs text-slate-500">
                This will reset all booked and reserved stalls back to &quot;Available&quot; and clear custom overrides.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetAllBooths}
                disabled={isResetting}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isResetting ? "Resetting..." : "Reset All"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Google Sheet Setup */}
      {showSheetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between p-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Google Sheet</h3>
                  <p className="text-xs text-slate-500">
                    The sheet holds the real prices and bookings; the website follows it.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSheetModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* 1. Connection */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">Connection</h4>
                  <a
                    href={SHEET_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    Booked list HIGEX 2027 <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <label className="block text-xs font-semibold text-slate-700" htmlFor="sheet-webhook-url">
                  Apps Script web app URL
                </label>
                <div className="flex gap-2">
                  <input
                    id="sheet-webhook-url"
                    type="url"
                    value={sheetWebhookUrl}
                    onChange={(e) => setSheetWebhookUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/…/exec"
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveWebhookUrl(sheetWebhookUrl)}
                    disabled={!sheetWebhookUrl.trim()}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold cursor-pointer shrink-0 disabled:opacity-40"
                  >
                    Save
                  </button>
                </div>
              </section>

              {/* 2. Actions */}
              <section className="space-y-2">
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">Sync</h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSyncGoogleSheet(sheetWebhookUrl)}
                    disabled={isSyncingSheet || !sheetWebhookUrl.trim()}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isSyncingSheet ? "animate-spin" : ""}`} />
                      {isSyncingSheet ? "Syncing…" : "Sheet → website"}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-1 leading-snug">
                      Pull every stall&apos;s status, company, size and price from the sheet now.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePopulateGoogleSheet(sheetWebhookUrl)}
                    disabled={isPopulatingSheet || !sheetWebhookUrl.trim()}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                      {isPopulatingSheet ? "Filling…" : "Website → sheet"}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-1 leading-snug">
                      Mark website bookings in empty sheet rows. Filled rows and prices are left alone.
                    </span>
                  </button>
                </div>
              </section>

              {/* 3. Setup */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    First-time setup
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2500);
                      notify("Apps Script copied to clipboard");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? "Copied" : "Copy Apps Script"}</span>
                  </button>
                </div>
                <ol className="space-y-2 text-[11px] text-slate-600 leading-relaxed">
                  {[
                    <>
                      In the sheet, open <strong>Extensions → Apps Script</strong>, replace everything with the copied
                      script and click <strong>Save</strong>.
                    </>,
                    <>
                      <strong>Project Settings → Script Properties</strong>: add <code className="px-1 rounded bg-slate-100 font-mono">SYNC_SECRET</code>{" "}
                      with the same value as <code className="px-1 rounded bg-slate-100 font-mono">GOOGLE_SHEET_SYNC_SECRET</code> on Vercel.
                    </>,
                    <>
                      <strong>Deploy → New deployment → Web app</strong>, execute as <strong>Me</strong>, access{" "}
                      <strong>Anyone</strong>. Paste the <code className="px-1 rounded bg-slate-100 font-mono">/exec</code> URL above and Save.
                    </>,
                    <>
                      Reload the sheet and choose <strong>⚡ Expo Stall Sync → 🔁 Turn on auto-sync when I edit</strong>.
                    </>,
                  ].map((step, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

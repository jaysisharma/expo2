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
} from "lucide-react";
import { boothsData, extractBoothsFromElements } from "@/data/booths";
import { Booth } from "@/lib/types";
import { formatCurrencyUSD, formatCurrencyNPR } from "@/lib/utils";

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
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Reset Confirmation Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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
  }, []);

  const exchangeRate = data?.settings?.currencyRateUSD_NPR || 134.5;

  const baseBooths: Booth[] = useMemo(() => {
    if (floorPlanElements && floorPlanElements.length > 0) {
      const extracted = extractBoothsFromElements(floorPlanElements);
      if (extracted.length > 0) return extracted;
    }
    return boothsData;
  }, [floorPlanElements]);

  const mergedBooths: Booth[] = useMemo(() => {
    return baseBooths.map((b) => {
      const override = data?.boothOverrides?.[b.number];
      return override
        ? {
            ...b,
            status: (override.status || b.status) as any,
            exhibitorName:
              override.exhibitorName !== undefined ? override.exhibitorName : b.exhibitorName,
            priceUSD: override.priceUSD !== undefined ? Number(override.priceUSD) : b.priceUSD,
            priceNPR: override.priceNPR !== undefined ? Number(override.priceNPR) : b.priceNPR,
          }
        : b;
    });
  }, [baseBooths, data?.boothOverrides]);

  const filteredBooths = useMemo(() => {
    return mergedBooths.filter((b) => {
      const matchesHall =
        selectedHall === "All" ||
        (selectedHall === "Block A" && (b.hall?.includes("A") || b.number.startsWith("A"))) ||
        (selectedHall === "Block B" && (b.hall?.includes("B") || b.number.startsWith("B"))) ||
        (selectedHall === "Block C" && (b.hall?.includes("C") || b.number.startsWith("C"))) ||
        (selectedHall === "Outdoor & Special" &&
          (b.hall?.includes("Outdoor") ||
            b.hall?.includes("Special") ||
            b.number.startsWith("H") ||
            b.number.startsWith("F") ||
            b.number.startsWith("OUT")));

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
      Math.round(b.priceUSD * exchangeRate),
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold uppercase tracking-wider">
              Exhibition Hall
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Stalls & Floor Inventory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage floor allocations, stall booking statuses, and assigned exhibitors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(bookedCount > 0 || reservedCount > 0) && (
            <button
              onClick={() => setShowResetModal(true)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-medium border border-slate-200 hover:border-rose-200 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset all stalls back to Available"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          )}

          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/admin/floor-plan"
            className="px-3.5 py-1.5 rounded-lg bg-[#218A59] hover:bg-[#1b734a] text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Floor Plan</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Total Inventory
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-500 font-mono">stalls</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Occupancy Rate
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-slate-900">{occupancyPct}%</span>
            <span className="text-xs text-slate-500 font-mono">
              ({bookedCount + reservedCount} occupied)
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Confirmed Booked
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-emerald-700">{bookedCount}</span>
            <span className="text-xs text-slate-500 font-mono">
              ({Math.round((bookedCount / totalCount) * 100)}%)
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Available Open
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-slate-700">{availableCount}</span>
            <span className="text-xs text-slate-500 font-mono">
              ({reservedCount} reserved)
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {/* Hall Selection Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {["All", "Block A", "Block B", "Block C", "Outdoor & Special"].map((hall) => {
            const isActive = selectedHall === hall;
            const count =
              hall === "All"
                ? mergedBooths.length
                : hall === "Block A"
                ? mergedBooths.filter((b) => b.hall?.includes("A") || b.number.startsWith("A")).length
                : hall === "Block B"
                ? mergedBooths.filter((b) => b.hall?.includes("B") || b.number.startsWith("B")).length
                : hall === "Block C"
                ? mergedBooths.filter((b) => b.hall?.includes("C") || b.number.startsWith("C")).length
                : mergedBooths.filter(
                    (b) =>
                      b.hall?.includes("Outdoor") ||
                      b.hall?.includes("Special") ||
                      b.number.startsWith("H") ||
                      b.number.startsWith("F") ||
                      b.number.startsWith("OUT")
                  ).length;

            return (
              <button
                key={hall}
                onClick={() => setSelectedHall(hall)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>{hall}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Status Filter, Search, View Mode */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#218A59] focus:bg-white cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Booked">Booked</option>
          </select>

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stall #, company..."
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59] focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedNumbers.length > 0 && (
        <div className="sticky top-4 z-30 p-2.5 px-4 rounded-xl bg-slate-900 text-white shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[11px]">
              {selectedNumbers.length}
            </span>
            <span className="font-medium text-slate-200">
              {selectedNumbers.length === 1 ? "1 stall selected" : `${selectedNumbers.length} stalls selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Set Status:</span>
            <button
              onClick={() => handleBulkSetStatus("Available")}
              disabled={isBulkUpdating}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              Available
            </button>
            <button
              onClick={() => handleBulkSetStatus("Reserved")}
              disabled={isBulkUpdating}
              className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
            >
              Reserved
            </button>
            <button
              onClick={() => handleBulkSetStatus("Booked")}
              disabled={isBulkUpdating}
              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Booked
            </button>
            <button
              onClick={() => setSelectedNumbers([])}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Content: Table or Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-[#218A59] mb-2" />
          <span className="text-xs">Loading floor stalls...</span>
        </div>
      ) : filteredBooths.length === 0 ? (
        <div className="py-16 px-4 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No stalls found</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            No stalls match your selected filters. Try choosing a different hall or clearing search keywords.
          </p>
          <button
            onClick={() => {
              setSelectedHall("All");
              setSelectedStatus("All");
              setSearchQuery("");
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* Minimal Clean Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  <th className="py-3 pl-4 pr-2 w-10">
                    <input
                      ref={masterCheckboxRef}
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-[#218A59] focus:ring-[#218A59] cursor-pointer"
                      title={isAllFilteredSelected ? "Deselect all" : "Select all"}
                    />
                  </th>
                  <th className="py-3 px-3">Stall #</th>
                  <th className="py-3 px-3">Hall / Zone</th>
                  <th className="py-3 px-3">Size & Type</th>
                  <th className="py-3 px-3">Assigned Exhibitor</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 pr-4 pl-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBooths.map((booth) => {
                  const isSelected = selectedNumbers.includes(booth.number);

                  return (
                    <tr
                      key={booth.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? "bg-emerald-50/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(booth.number)}
                          className="w-4 h-4 rounded border-slate-300 text-[#218A59] focus:ring-[#218A59] cursor-pointer"
                        />
                      </td>

                      {/* Stall # */}
                      <td className="py-3 px-3 font-mono font-bold text-[#234679]">
                        <button
                          onClick={() => handleOpenEdit(booth)}
                          className="hover:underline cursor-pointer"
                        >
                          {booth.number}
                        </button>
                      </td>

                      {/* Zone */}
                      <td className="py-3 px-3 text-slate-600">
                        <span className="font-medium text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {booth.hall || "Hall A"}
                        </span>
                      </td>

                      {/* Size & Type */}
                      <td className="py-3 px-3 text-slate-600">
                        <span className="font-mono font-medium text-slate-900">{booth.sizeSqM}m²</span>
                        <span className="text-[11px] text-slate-400 block">{booth.dimensions} · {booth.type}</span>
                      </td>

                      {/* Exhibitor */}
                      <td className="py-3 px-3">
                        {booth.exhibitorName ? (
                          <span className="font-semibold text-slate-900 truncate block max-w-[200px]">
                            {booth.exhibitorName}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Unassigned</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 font-mono">
                        <span className="font-medium text-slate-800">{formatCurrencyUSD(booth.priceUSD)}</span>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          ≈ {formatCurrencyNPR(booth.priceUSD * exchangeRate)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                            booth.status === "Booked"
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : booth.status === "Reserved"
                              ? "text-amber-800 bg-amber-50 border-amber-200"
                              : "text-slate-600 bg-slate-100 border-slate-200"
                          }`}
                        >
                          {booth.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 pr-4 pl-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(booth)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3 px-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Showing {filteredBooths.length} of {mergedBooths.length} stalls
            </span>
            <span>
              {bookedCount} booked · {reservedCount} reserved · {availableCount} available
            </span>
          </div>
        </div>
      ) : (
        /* Minimal Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredBooths.map((booth) => {
            const isSelected = selectedNumbers.includes(booth.number);

            return (
              <div
                key={booth.id}
                onClick={() => handleToggleSelectOne(booth.number)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between gap-2 shadow-xs ${
                  isSelected
                    ? "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{booth.number}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      booth.status === "Booked"
                        ? "bg-emerald-100 text-emerald-800"
                        : booth.status === "Reserved"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {booth.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 truncate">
                  {booth.exhibitorName || <span className="text-slate-400 italic">Available</span>}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{booth.sizeSqM}m²</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(booth);
                    }}
                    className="text-slate-600 hover:text-slate-900 underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
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
                      setModalPriceNPR(Math.round(usd * exchangeRate));
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
    </div>
  );
}

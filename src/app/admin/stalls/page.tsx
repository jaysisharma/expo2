"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  Compass,
  Search,
  Download,
  Edit,
  CheckCircle2,
  X,
  Save,
} from "lucide-react";
import { boothsData } from "@/data/booths";
import { Booth } from "@/lib/types";
import { formatCurrencyUSD } from "@/lib/utils";

export default function AdminStallsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHall, setSelectedHall] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingBooth, setEditingBooth] = useState<Booth | null>(null);
  const [modalStatus, setModalStatus] = useState<"Available" | "Reserved" | "Booked">("Available");
  const [modalExhibitor, setModalExhibitor] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchBoothsData = async () => {
    try {
      const res = await fetch("/api/admin/data");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.warn("Error fetching admin data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoothsData();
  }, []);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const mergedBooths: Booth[] = boothsData.map((b) => {
    const override = data?.boothOverrides?.[b.number];
    return override
      ? {
          ...b,
          status: override.status || b.status,
          exhibitorName: override.exhibitorName !== undefined ? override.exhibitorName : b.exhibitorName,
        }
      : b;
  });

  const filteredBooths = mergedBooths.filter((b) => {
    const matchesHall =
      selectedHall === "All" ||
      (selectedHall === "Hall A" && (b.hall?.includes("Hall A") || b.number.startsWith("A"))) ||
      (selectedHall === "Hall B" && (b.hall?.includes("Hall B") || b.number.startsWith("B"))) ||
      (selectedHall === "Outdoor" && (b.hall?.includes("Outdoor") || b.number.startsWith("OUT")));

    const matchesStatus = selectedStatus === "All" || b.status === selectedStatus;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      b.number.toLowerCase().includes(query) ||
      (b.exhibitorName && b.exhibitorName.toLowerCase().includes(query)) ||
      b.type.toLowerCase().includes(query);

    return matchesHall && matchesStatus && matchesSearch;
  });

  const bookedCount = mergedBooths.filter((b) => b.status === "Booked").length;
  const reservedCount = mergedBooths.filter((b) => b.status === "Reserved").length;
  const availableCount = mergedBooths.filter((b) => b.status === "Available").length;

  const handleOpenEdit = (booth: Booth) => {
    setEditingBooth(booth);
    setModalStatus(booth.status as "Available" | "Reserved" | "Booked");
    setModalExhibitor(booth.exhibitorName || "");
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
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        notify(`Stall ${editingBooth.number} updated`);
        setEditingBooth(null);
        fetchBoothsData();
      }
    } catch (e) {
      notify("Failed to update booth");
    } finally {
      setIsSaving(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Booth Number", "Hall", "Size (m²)", "Type", "Status", "Exhibitor Name", "Price (USD)"];
    const rows = filteredBooths.map((b) => [
      b.number,
      b.hall || "Hall A",
      b.sizeSqM,
      b.type,
      b.status,
      b.exhibitorName || "—",
      b.priceUSD,
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
  };

  return (
    <div className="space-y-5 font-sans">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 text-xs font-medium shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Stalls & Booths</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage floor allocations, statuses, and assigned exhibitors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
          <Link
            href="/admin/floor-plan"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Floor Plan Studio</span>
          </Link>
        </div>
      </div>

      {/* Metric chips */}
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        <span className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-xs">
          Total: <strong className="text-slate-900 dark:text-white">{mergedBooths.length}</strong>
        </span>
        <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium">
          Booked: <strong>{bookedCount}</strong>
        </span>
        <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
          Reserved: <strong>{reservedCount}</strong>
        </span>
        <span className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 shadow-xs">
          Available: <strong className="text-slate-900 dark:text-slate-200">{availableCount}</strong>
        </span>
      </div>

      {/* Minimal Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          {["All", "Hall A", "Hall B", "Outdoor"].map((hall) => (
            <button
              key={hall}
              onClick={() => setSelectedHall(hall)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                selectedHall === hall
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {hall}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Booked">Booked</option>
          </select>

          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stall #..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Clean Minimal Table */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-[#051320] text-slate-500 dark:text-slate-400 font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 uppercase">
              <tr>
                <th className="p-3 font-semibold">Stall #</th>
                <th className="p-3 font-semibold">Zone</th>
                <th className="p-3 font-semibold">Size</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Exhibitor</th>
                <th className="p-3 font-semibold">Price</th>
                <th className="p-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredBooths.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No stalls found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredBooths.map((booth) => (
                  <tr key={booth.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                      {booth.number}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                      {booth.hall || "Hall A"}
                    </td>
                    <td className="p-3 font-mono text-slate-700 dark:text-slate-300">
                      {booth.sizeSqM}m²
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          booth.status === "Booked"
                            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                            : booth.status === "Reserved"
                            ? "text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20"
                            : "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"
                        }`}
                      >
                        {booth.status}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {booth.exhibitorName || <span className="text-slate-400 dark:text-slate-600 font-mono">—</span>}
                    </td>
                    <td className="p-3 font-mono text-slate-700 dark:text-slate-300">
                      {formatCurrencyUSD(booth.priceUSD)}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleOpenEdit(booth)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingBooth && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Edit Stall: {editingBooth.number} ({editingBooth.sizeSqM}m²)
              </h3>
              <button
                onClick={() => setEditingBooth(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                  STATUS
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Available", "Reserved", "Booked"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setModalStatus(st)}
                      className={`p-1.5 rounded-lg border text-center font-medium text-xs transition-colors cursor-pointer ${
                        modalStatus === st
                          ? "bg-slate-900 dark:bg-slate-800 border-slate-900 dark:border-slate-600 text-white font-semibold"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                  EXHIBITOR COMPANY
                </label>
                <input
                  type="text"
                  value={modalExhibitor}
                  onChange={(e) => setModalExhibitor(e.target.value)}
                  placeholder="e.g. Voith Hydro"
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setEditingBooth(null)}
                className="px-3 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBooth}
                disabled={isSaving}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

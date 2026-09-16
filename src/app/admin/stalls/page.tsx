"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Download,
  CheckCircle2,
  X,
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

  const handleResetAllBooths = async () => {
    if (!confirm("Are you sure you want to reset all stalls to Available?")) return;
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_all_booths" }),
      });
      const json = await res.json();
      if (json.success) {
        notify("All stalls have been reset to Available");
        fetchBoothsData();
      }
    } catch (e) {
      notify("Failed to reset stalls");
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
    <div className="space-y-6 font-sans">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">Stalls & Booths</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage floor allocations, stall booking statuses, and assigned exhibitors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(bookedCount > 0 || reservedCount > 0) && (
            <button
              onClick={handleResetAllBooths}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Reset All to Available</span>
            </button>
          )}

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <Link
            href="/admin/floor-plan"
            className="px-4 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Floor Plan Map</span>
          </Link>
        </div>
      </div>

      {/* Metric chips */}
      <div className="flex flex-wrap gap-2.5 text-xs font-mono">
        <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs">
          Total: <strong className="text-slate-900">{mergedBooths.length}</strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold shadow-xs">
          Booked: <strong>{bookedCount}</strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-semibold shadow-xs">
          Reserved: <strong>{reservedCount}</strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-xs">
          Available: <strong className="text-slate-900">{availableCount}</strong>
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 overflow-x-auto">
          {["All", "Hall A", "Hall B", "Outdoor"].map((hall) => (
            <button
              key={hall}
              onClick={() => setSelectedHall(hall)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedHall === hall
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-bold"
                  : "text-slate-600 hover:text-slate-900"
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
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#218A59] shadow-xs cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Booked">Booked</option>
          </select>

          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stall #, company..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:outline-none focus:border-[#218A59]"
            />
          </div>
        </div>
      </div>

      {/* Clean Light Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] tracking-wider border-b border-slate-200 uppercase">
              <tr>
                <th className="p-3.5 font-bold">Stall #</th>
                <th className="p-3.5 font-bold">Zone</th>
                <th className="p-3.5 font-bold">Size</th>
                <th className="p-3.5 font-bold">Status</th>
                <th className="p-3.5 font-bold">Exhibitor</th>
                <th className="p-3.5 font-bold">Price</th>
                <th className="p-3.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooths.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    No stalls found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredBooths.map((booth) => (
                  <tr key={booth.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#234679]">
                      {booth.number}
                    </td>
                    <td className="p-3.5 text-slate-600 truncate max-w-[160px]">
                      {booth.hall || "Hall A"}
                    </td>
                    <td className="p-3.5 font-mono text-slate-700">
                      {booth.sizeSqM}m²
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                          booth.status === "Booked"
                            ? "text-emerald-800 bg-emerald-50 border border-emerald-200"
                            : booth.status === "Reserved"
                            ? "text-amber-800 bg-amber-50 border border-amber-200"
                            : "text-slate-700 bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {booth.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 truncate max-w-[180px]">
                      {booth.exhibitorName || <span className="text-slate-400 font-normal font-mono">—</span>}
                    </td>
                    <td className="p-3.5 font-mono font-medium text-slate-700">
                      {formatCurrencyUSD(booth.priceUSD)}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenEdit(booth)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
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
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-sm text-slate-900">
                Edit Stall: {editingBooth.number} ({editingBooth.sizeSqM}m²)
              </h3>
              <button
                onClick={() => setEditingBooth(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">
                  STATUS
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Available", "Reserved", "Booked"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setModalStatus(st)}
                      className={`p-2 rounded-xl border text-center font-semibold text-xs transition-colors cursor-pointer ${
                        modalStatus === st
                          ? "bg-[#234679] border-[#234679] text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">
                  EXHIBITOR COMPANY
                </label>
                <input
                  type="text"
                  value={modalExhibitor}
                  onChange={(e) => setModalExhibitor(e.target.value)}
                  placeholder="e.g. Voith Hydro"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                />
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
                className="px-4 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-semibold cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

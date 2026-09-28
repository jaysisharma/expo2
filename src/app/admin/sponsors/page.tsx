"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  X,
  Save,
  LayoutGrid,
  List,
  AlertCircle,
  Award,
  Download,
  Building2,
  Loader2,
} from "lucide-react";
import { sponsorsData as initialSponsors } from "@/data/sponsors";
import { SponsorCategory } from "@/lib/types";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

interface FlatSponsor {
  id: string;
  name: string;
  logo: string;
  type: string;
  url: string;
  tier: string;
}

export default function AdminSponsorsPage() {
  const [categories, setCategories] = useState<SponsorCategory[]>(initialSponsors);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Modals & Editing
  const [editingSponsor, setEditingSponsor] = useState<FlatSponsor | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalLogo, setAddModalLogo] = useState("/images/logo.webp");
  const [isSaving, setIsSaving] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type?: "success" | "error" } | null>(null);

  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  const notify = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Fetch sponsors from backend or localStorage
  const fetchSponsors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/data?t=" + Date.now(), { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.sponsors) && json.data.sponsors.length > 0) {
        setCategories(json.data.sponsors);
      } else {
        try {
          const stored = localStorage.getItem("expo_sponsors_data");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCategories(parsed);
            }
          }
        } catch {}
      }
    } catch {
      notify("Failed to load sponsors", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  // Save changes to backend and localStorage
  const persistCategories = async (updated: SponsorCategory[]) => {
    setCategories(updated);
    try {
      localStorage.setItem("expo_sponsors_data", JSON.stringify(updated));
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_sponsors", payload: { categories: updated } }),
      });
    } catch {
      console.warn("Failed to persist sponsors to backend");
    }
  };

  // Flatten all sponsors for table search & selection
  const flatSponsors: FlatSponsor[] = useMemo(() => {
    const list: FlatSponsor[] = [];
    categories.forEach((cat) => {
      cat.sponsors.forEach((s) => {
        list.push({
          id: `${cat.tier}:::${s.name}`,
          name: s.name,
          logo: s.logo || "/images/logo.webp",
          type: s.type || "Official Partner",
          url: s.url || "",
          tier: cat.tier,
        });
      });
    });
    return list;
  }, [categories]);

  // Filtered list
  const filteredSponsors = useMemo(() => {
    return flatSponsors.filter((s) => {
      const matchesTier = selectedTier === "All" || s.tier === selectedTier;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        s.tier.toLowerCase().includes(q) ||
        s.url.toLowerCase().includes(q);

      return matchesTier && matchesSearch;
    });
  }, [flatSponsors, selectedTier, searchQuery]);

  // Master Checkbox State
  const filteredIds = useMemo(() => filteredSponsors.map((s) => s.id), [filteredSponsors]);
  const isAllFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));
  const isPartiallySelected =
    filteredIds.some((id) => selectedIds.includes(id)) && !isAllFilteredSelected;

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isPartiallySelected;
    }
  }, [isPartiallySelected]);

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Single Delete
  const handleDeleteSponsor = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}"?`)) return;

    const [tier, sponsorName] = id.split(":::");
    const updated = categories.map((cat) =>
      cat.tier === tier
        ? { ...cat, sponsors: cat.sponsors.filter((s) => s.name !== sponsorName) }
        : cat
    );

    await persistCategories(updated);
    setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    notify(`Removed ${name}`);
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);

    const idsSet = new Set(selectedIds);
    const count = selectedIds.length;

    const updated = categories.map((cat) => ({
      ...cat,
      sponsors: cat.sponsors.filter((s) => !idsSet.has(`${cat.tier}:::${s.name}`)),
    }));

    try {
      await persistCategories(updated);
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
      notify(`${count} partner${count > 1 ? "s" : ""} removed successfully`);
    } catch {
      notify("Failed to remove partners", "error");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Add Partner Submit
  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string)?.trim();
    const tier = formData.get("tier") as string;
    const type = (formData.get("type") as string)?.trim() || "Official Partner";
    const url = (formData.get("url") as string)?.trim() || "";
    const logo = (formData.get("logo") as string)?.trim() || "/images/logo.webp";

    if (!name || !tier) {
      setIsSaving(false);
      return;
    }

    const newPartner = { name, logo, type, url };

    let updated: SponsorCategory[];
    const exists = categories.some((c) => c.tier === tier);
    if (exists) {
      updated = categories.map((cat) =>
        cat.tier === tier ? { ...cat, sponsors: [newPartner, ...cat.sponsors] } : cat
      );
    } else {
      updated = [
        ...categories,
        { tier, description: "Official partners and sponsors", sponsors: [newPartner] },
      ];
    }

    await persistCategories(updated);
    setIsSaving(false);
    setShowAddModal(false);
    notify(`Added ${name} to ${tier}`);
  };

  // Save Edit Submit
  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSponsor) return;
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string)?.trim();
    const tier = formData.get("tier") as string;
    const type = (formData.get("type") as string)?.trim() || "Official Partner";
    const url = (formData.get("url") as string)?.trim() || "";
    const logo = (formData.get("logo") as string)?.trim() || editingSponsor.logo;

    const [oldTier, oldName] = editingSponsor.id.split(":::");

    let updated: SponsorCategory[];

    if (oldTier === tier) {
      updated = categories.map((cat) =>
        cat.tier === tier
          ? {
              ...cat,
              sponsors: cat.sponsors.map((s) =>
                s.name === oldName ? { name, logo, type, url } : s
              ),
            }
          : cat
      );
    } else {
      // Moved to a different tier
      const removed = categories.map((cat) =>
        cat.tier === oldTier
          ? { ...cat, sponsors: cat.sponsors.filter((s) => s.name !== oldName) }
          : cat
      );

      const targetExists = removed.some((c) => c.tier === tier);
      if (targetExists) {
        updated = removed.map((cat) =>
          cat.tier === tier
            ? { ...cat, sponsors: [{ name, logo, type, url }, ...cat.sponsors] }
            : cat
        );
      } else {
        updated = [
          ...removed,
          { tier, description: "Official partners", sponsors: [{ name, logo, type, url }] },
        ];
      }
    }

    await persistCategories(updated);
    setIsSaving(false);
    setEditingSponsor(null);
    notify(`Updated ${name}`);
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ["Organization", "Tier", "Designation Role", "Website URL"];
    const rows = filteredSponsors.map((s) => [s.name, s.tier, s.type, s.url]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Himalayan_Expo_Partners_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("Partner list exported to CSV");
  };

  const totalPartners = flatSponsors.length;

  return (
    <div className="space-y-5 font-sans">
      {/* Toast */}
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
              Partnership Management
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Sponsors & Partners
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage official patrons, international cooperation missions, and supporting bodies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#218A59] hover:bg-[#1b734a] text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Partner</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Total Partners
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-slate-900">{totalPartners}</span>
            <span className="text-xs text-slate-500 font-mono">organizations</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Active Tiers
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-slate-900">{categories.length}</span>
            <span className="text-xs text-slate-500 font-mono">tiers</span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end">
          <Link
            href="/sponsors"
            target="_blank"
            className="text-xs font-medium text-slate-600 hover:text-[#218A59] flex items-center gap-1.5 transition-colors"
          >
            <span>View Public Showcase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {/* Tier Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          <button
            onClick={() => setSelectedTier("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedTier === "All"
                ? "bg-slate-900 text-white font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedTier === "All" ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-500"
              }`}
            >
              {totalPartners}
            </span>
          </button>

          {categories.map((cat) => {
            const isActive = selectedTier === cat.tier;
            return (
              <button
                key={cat.tier}
                onClick={() => setSelectedTier(cat.tier)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span className="truncate max-w-[150px]">{cat.tier}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {cat.sponsors.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & View Mode */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search partner, role..."
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
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-30 p-2.5 px-4 rounded-xl bg-slate-900 text-white shadow-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[11px]">
              {selectedIds.length}
            </span>
            <span className="font-medium text-slate-200">
              {selectedIds.length === 1 ? "1 partner selected" : `${selectedIds.length} partners selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Deselect All
            </button>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Content: Table or Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-[#218A59] mb-2" />
          <span className="text-xs">Loading partners...</span>
        </div>
      ) : filteredSponsors.length === 0 ? (
        <div className="py-16 px-4 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No partners found</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            {searchQuery || selectedTier !== "All"
              ? "Try selecting another tier or clearing your search term."
              : "Get started by adding your first official sponsor or supporting partner."}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#218A59] hover:bg-[#1b734a] text-white text-xs font-medium cursor-pointer shadow-xs"
          >
            Add Partner
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* Minimal Table View */
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
                  <th className="py-3 px-3">Organization & Partner</th>
                  <th className="py-3 px-3">Sponsorship Tier</th>
                  <th className="py-3 px-3">Designation Role</th>
                  <th className="py-3 px-3">Website</th>
                  <th className="py-3 pr-4 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSponsors.map((sponsor) => {
                  const isSelected = selectedIds.includes(sponsor.id);

                  return (
                    <tr
                      key={sponsor.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? "bg-emerald-50/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(sponsor.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#218A59] focus:ring-[#218A59] cursor-pointer"
                        />
                      </td>

                      {/* Partner & Logo */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {sponsor.logo ? (
                              <Image
                                src={sponsor.logo}
                                alt={sponsor.name}
                                fill
                                unoptimized
                                className="object-contain p-1"
                              />
                            ) : (
                              <Building2 className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {sponsor.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {sponsor.tier}
                        </span>
                      </td>

                      {/* Designation */}
                      <td className="py-3 px-3 text-slate-600">
                        <span className="text-[#218A59] font-medium">
                          {sponsor.type}
                        </span>
                      </td>

                      {/* URL */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {sponsor.url ? (
                          <a
                            href={sponsor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-[#218A59] font-mono text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <span className="truncate max-w-[160px]">
                              {sponsor.url.replace(/^https?:\/\//, "")}
                            </span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 pr-4 pl-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingSponsor(sponsor)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#218A59] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSponsor(sponsor.id, sponsor.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-3 px-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Showing {filteredSponsors.length} of {totalPartners} partners
            </span>
            <span>{categories.length} sponsorship tiers</span>
          </div>
        </div>
      ) : (
        /* Minimal Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredSponsors.map((sponsor) => {
            const isSelected = selectedIds.includes(sponsor.id);

            return (
              <div
                key={sponsor.id}
                className={`bg-white rounded-xl border p-3.5 flex flex-col justify-between gap-3 transition-all shadow-xs ${
                  isSelected
                    ? "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(sponsor.id)}
                      className="w-4 h-4 rounded border-slate-300 text-[#218A59] focus:ring-[#218A59] cursor-pointer"
                    />
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium truncate max-w-[140px]">
                      {sponsor.tier}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="relative w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {sponsor.logo ? (
                        <Image
                          src={sponsor.logo}
                          alt={sponsor.name}
                          fill
                          unoptimized
                          className="object-contain p-1"
                        />
                      ) : (
                        <Building2 className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-xs text-slate-900 line-clamp-1">
                        {sponsor.name}
                      </h4>
                      <p className="text-[11px] text-[#218A59] font-medium line-clamp-1 mt-0.5">
                        {sponsor.type}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  {sponsor.url ? (
                    <a
                      href={sponsor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-mono text-[10px] truncate max-w-[120px]"
                    >
                      <span className="truncate">{sponsor.url.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-400 text-[10px]">—</span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingSponsor(sponsor)}
                      className="p-1 rounded-md text-slate-400 hover:text-[#218A59] hover:bg-slate-100 cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSponsor(sponsor.id, sponsor.name)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Remove {selectedIds.length} {selectedIds.length === 1 ? "partner" : "partners"}?
              </h3>
              <p className="text-xs text-slate-500">
                This will remove the selected organizations from the official sponsors showcase.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isBulkDeleting}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isBulkDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Add Partner or Sponsor</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                  ORGANIZATION NAME *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. World Bank Nepal / Voith Hydro"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                    SPONSORSHIP TIER *
                  </label>
                  <select
                    name="tier"
                    defaultValue={categories[0]?.tier || "Government & Patron"}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] focus:bg-white cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.tier} value={c.tier}>
                        {c.tier}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                    DESIGNATION ROLE
                  </label>
                  <input
                    type="text"
                    name="type"
                    placeholder="e.g. Platinum Partner"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59] focus:bg-white"
                  />
                </div>
              </div>

              <ImageUploadField
                name="logo"
                label="Sponsor Logo"
                value={addModalLogo}
                onChange={setAddModalLogo}
                folder="sponsors"
              />

              <div>
                <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                  OFFICIAL WEBSITE URL
                </label>
                <input
                  type="url"
                  name="url"
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-medium flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving..." : "Add Partner"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {editingSponsor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Edit Partner</h3>
              <button
                onClick={() => setEditingSponsor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                  ORGANIZATION NAME *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingSponsor.name}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                    SPONSORSHIP TIER *
                  </label>
                  <select
                    name="tier"
                    defaultValue={editingSponsor.tier}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] focus:bg-white cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.tier} value={c.tier}>
                        {c.tier}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                    DESIGNATION ROLE
                  </label>
                  <input
                    type="text"
                    name="type"
                    defaultValue={editingSponsor.type}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] focus:bg-white"
                  />
                </div>
              </div>

              <ImageUploadField
                name="logo"
                label="Sponsor Logo"
                value={editingSponsor.logo}
                onChange={(url) =>
                  setEditingSponsor({ ...editingSponsor, logo: url })
                }
                folder="sponsors"
              />

              <div>
                <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                  OFFICIAL WEBSITE URL
                </label>
                <input
                  type="url"
                  name="url"
                  defaultValue={editingSponsor.url}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSponsor(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-medium flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

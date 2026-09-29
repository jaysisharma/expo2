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
  Sparkles,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";
import { sponsorsData as initialSponsors } from "@/data/sponsors";
import { SponsorCategory } from "@/lib/types";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

interface CurrentPartner {
  id: string;
  name: string;
  category: string;
  logo: string;
  url?: string;
  order: number;
  active: boolean;
  addedAt: string;
}

const SPONSORSHIP_TIERS_2027 = [
  "Title Sponsor",
  "In Association With",
  "Powered By",
  "Sponsorship",
  "Sponsor",
  "Co-Sponsor",
  "Principal Partner",
  "Official Partner",
  "Diamond Sponsor",
  "Platinum Partner",
  "Gold Sponsor",
  "Silver Sponsor",
  "Official Bank Partner",
  "Mobility Partner",
  "Technology Partner",
  "Media Partner",
  "Associate Partner",
  "Supporter",
  "Supporting Organization",
];

interface FlatSponsor {
  id: string;
  name: string;
  logo: string;
  type: string;
  url: string;
  tier: string;
}

export default function AdminSponsorsPage() {
  const [activeTab, setActiveTab] = useState<"current2027" | "archive">("current2027");

  // 2027 Edition Partners State
  const [currentPartners, setCurrentPartners] = useState<CurrentPartner[]>([]);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true);
  const [search2027, setSearch2027] = useState("");
  const [showAdd2027Modal, setShowAdd2027Modal] = useState(false);
  const [editing2027Partner, setEditing2027Partner] = useState<CurrentPartner | null>(null);
  const [add2027Logo, setAdd2027Logo] = useState("/images/logo.webp");
  const [add2027Category, setAdd2027Category] = useState("Title Sponsor");
  const [selected2027Tier, setSelected2027Tier] = useState<string>("All");
  const [isSaving2027, setIsSaving2027] = useState(false);

  // Archive / Previous Sponsors State
  const [categories, setCategories] = useState<SponsorCategory[]>(initialSponsors);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Modals & Editing (Archive)
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

  // Fetch 2027 Edition Partners
  const fetchCurrentPartners = async () => {
    setIsLoadingCurrent(true);
    try {
      const res = await fetch("/api/partners/current?all=true&t=" + Date.now(), { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.partners)) {
        setCurrentPartners(json.partners);
      }
    } catch {
      notify("Failed to load 2027 edition partners", "error");
    } finally {
      setIsLoadingCurrent(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
    fetchCurrentPartners();
  }, []);

  // 2027 Action: Add Partner
  const handleAdd2027Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving2027(true);
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string)?.trim();
    const category = (formData.get("category") as string)?.trim() || "Official Partner";
    const url = (formData.get("url") as string)?.trim() || "";
    const active = formData.get("active") === "on";

    try {
      const res = await fetch("/api/partners/current", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          payload: {
            name,
            category,
            logo: add2027Logo || "/images/logo.webp",
            url,
            active,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCurrentPartners(json.partners);
        setShowAdd2027Modal(false);
        setAdd2027Logo("/images/logo.webp");
        notify(`Added "${name}" to 2027 Edition Partners`);
      } else {
        notify(json.message || "Failed to add partner", "error");
      }
    } catch {
      notify("Error saving 2027 partner", "error");
    } finally {
      setIsSaving2027(false);
    }
  };

  // 2027 Action: Edit Partner
  const handleEdit2027Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing2027Partner) return;
    setIsSaving2027(true);
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string)?.trim();
    const category = (formData.get("category") as string)?.trim() || "Official Partner";
    const url = (formData.get("url") as string)?.trim() || "";
    const active = formData.get("active") === "on";

    try {
      const res = await fetch("/api/partners/current", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          payload: {
            id: editing2027Partner.id,
            name,
            category,
            logo: editing2027Partner.logo || "/images/logo.webp",
            url,
            active,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCurrentPartners(json.partners);
        setEditing2027Partner(null);
        notify(`Updated "${name}"`);
      } else {
        notify(json.message || "Failed to update partner", "error");
      }
    } catch {
      notify("Error updating partner", "error");
    } finally {
      setIsSaving2027(false);
    }
  };

  // 2027 Action: Toggle Active
  const handleToggle2027Active = async (id: string, name: string) => {
    try {
      const res = await fetch("/api/partners/current", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_active", payload: { id } }),
      });
      const json = await res.json();
      if (json.success) {
        setCurrentPartners(json.partners);
        notify(json.message);
      }
    } catch {
      notify("Failed to update partner visibility", "error");
    }
  };

  // 2027 Action: Delete Partner
  const handleDelete2027Partner = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the 2027 Edition Partners?`)) return;
    try {
      const res = await fetch("/api/partners/current", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", payload: { id } }),
      });
      const json = await res.json();
      if (json.success) {
        setCurrentPartners(json.partners);
        notify(`Removed "${name}" from 2027 Edition`);
      } else {
        notify(json.message || "Failed to remove partner", "error");
      }
    } catch {
      notify("Error deleting partner", "error");
    }
  };

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

  // 2027 Filtered & Computed Counts
  const filtered2027 = useMemo(() => {
    let list = currentPartners;
    if (selected2027Tier !== "All") {
      list = list.filter((p) => p.category === selected2027Tier);
    }
    const q = search2027.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.url && p.url.toLowerCase().includes(q))
    );
  }, [currentPartners, search2027, selected2027Tier]);

  const tiers2027Present = useMemo(() => {
    const map = new Map<string, number>();
    currentPartners.forEach((p) => {
      map.set(p.category, (map.get(p.category) || 0) + 1);
    });
    return Array.from(map.entries()).map(([tier, count]) => ({ tier, count }));
  }, [currentPartners]);

  const active2027Count = useMemo(() => {
    return currentPartners.filter((p) => p.active !== false).length;
  }, [currentPartners]);

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

      {/* Clean Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sponsors &amp; Partners
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage 2027 Edition partners displayed on the homepage and historical summit sponsors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "archive" && (
            <button
              onClick={exportCSV}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={() => {
              if (activeTab === "current2027") {
                setAdd2027Logo("/images/logo.webp");
                setAdd2027Category("Title Sponsor");
                setShowAdd2027Modal(true);
              } else {
                setShowAddModal(true);
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{activeTab === "current2027" ? "Add 2027 Partner" : "Add Archive Partner"}</span>
          </button>
        </div>
      </div>

      {/* Segmented Control & Minimal Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Segmented Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold self-start">
          <button
            onClick={() => setActiveTab("current2027")}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "current2027"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === "current2027" ? "text-[#218A59]" : "text-slate-400"}`} />
            <span>2027 Edition (Landing Page)</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeTab === "current2027"
                  ? "bg-emerald-50 text-emerald-700 font-bold"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {currentPartners.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("archive")}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "archive"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Award className={`w-3.5 h-3.5 ${activeTab === "archive" ? "text-slate-800" : "text-slate-400"}`} />
            <span>Previous Editions Archive</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeTab === "archive"
                  ? "bg-slate-900 text-white font-bold"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {totalPartners}
            </span>
          </button>
        </div>

        {/* Minimal Live Status Bar */}
        {activeTab === "current2027" && (
          <div className="flex items-center gap-3 text-xs self-start sm:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  active2027Count > 0
                    ? "bg-emerald-500 shadow-[0_0_8px_#10B981]"
                    : "bg-slate-300"
                }`}
              />
              <span className="text-slate-700 font-medium text-[11px]">
                {active2027Count > 0 ? (
                  <>
                    Homepage Strip: <strong className="text-emerald-700 font-semibold">Live</strong> ({active2027Count} active)
                  </>
                ) : (
                  <>
                    Homepage Strip: <span className="text-slate-500 font-normal">Hidden</span> (0 active)
                  </>
                )}
              </span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="text-[11px] font-medium text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 transition-colors"
            >
              <span>Preview Homepage</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        )}
      </div>

      {activeTab === "current2027" ? (
        <div className="space-y-4 pt-1">
          {/* Minimal Toolbar */}
          {currentPartners.length > 0 && (
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 md:pb-0">
                <button
                  onClick={() => setSelected2027Tier("All")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selected2027Tier === "All"
                      ? "bg-slate-900 text-white font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  All ({currentPartners.length})
                </button>

                {tiers2027Present.map(({ tier, count }) => {
                  const isActive = selected2027Tier === tier;
                  return (
                    <button
                      key={tier}
                      onClick={() => setSelected2027Tier(tier)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        isActive
                          ? "bg-slate-900 text-white font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <span className="truncate max-w-[140px]">{tier}</span>
                      <span className={`text-[10px] ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative md:w-60 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search2027}
                  onChange={(e) => setSearch2027(e.target.value)}
                  placeholder="Filter by name or tier..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
                {search2027 && (
                  <button
                    onClick={() => setSearch2027("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Partners Grid */}
          {isLoadingCurrent ? (
            <div className="p-16 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              <span className="text-xs text-slate-400">Loading partners...</span>
            </div>
          ) : currentPartners.length === 0 ? (
            <div className="py-16 px-6 bg-white rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-slate-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">No 2027 Partners Added</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The homepage partner strip is automatically hidden until you add active partners.
                </p>
              </div>
              <button
                onClick={() => {
                  setAdd2027Logo("/images/logo.webp");
                  setAdd2027Category("Title Sponsor");
                  setShowAdd2027Modal(true);
                }}
                className="mt-1 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add 2027 Partner</span>
              </button>
            </div>
          ) : filtered2027.length === 0 ? (
            <div className="p-10 bg-white rounded-2xl border border-slate-200 text-center">
              <p className="text-xs text-slate-500">No partners match &quot;{search2027}&quot;</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered2027.map((partner) => (
                <div
                  key={partner.id}
                  className={`bg-white rounded-2xl border p-4 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group ${
                    partner.active
                      ? "border-slate-200 hover:border-slate-300"
                      : "border-slate-200/60 bg-slate-50/40 opacity-70"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top row: Category Badge & Visibility Toggle */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/80 truncate">
                        {partner.category}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggle2027Active(partner.id, partner.name)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
                        title={partner.active ? "Click to hide from landing page" : "Click to show on landing page"}
                      >
                        <span className={`w-2 h-2 rounded-full ${partner.active ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <span className="text-[10px] font-mono">{partner.active ? "Live" : "Hidden"}</span>
                      </button>
                    </div>

                    {/* Logo Box */}
                    <div className="h-24 w-full relative flex items-center justify-center bg-slate-50/70 rounded-xl p-3 border border-slate-100 group-hover:bg-slate-50 transition-colors">
                      <Image
                        src={partner.logo || "/images/logo.webp"}
                        alt={partner.name}
                        fill
                        sizes="180px"
                        className="object-contain p-2"
                      />
                    </div>

                    {/* Partner Name & Website */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 truncate" title={partner.name}>
                        {partner.name}
                      </h4>
                      {partner.url ? (
                        <a
                          href={partner.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 mt-0.5 truncate max-w-full transition-colors"
                        >
                          <Globe className="w-3 h-3 shrink-0" />
                          <span className="truncate">{partner.url.replace(/^https?:\/\//, "")}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">No URL</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Order: {partner.order || 1}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditing2027Partner(partner)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Partner"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete2027Partner(partner.id, partner.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Partner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {/* Archive Minimal Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
            {/* Tier Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 md:pb-0">
              <button
                onClick={() => setSelectedTier("All")}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedTier === "All"
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>All</span>
                <span
                  className={`text-[10px] ${
                    selectedTier === "All" ? "text-slate-300" : "text-slate-400"
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
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-slate-900 text-white font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span className="truncate max-w-[140px]">{cat.tier}</span>
                    <span
                      className={`text-[10px] ${
                        isActive ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      {cat.sponsors.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Actions, Search & View Switcher */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter archive..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
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

              {/* View Switcher */}
              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/80 shrink-0">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white text-slate-900 shadow-2xs"
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
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>

              <Link
                href="/sponsors"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-medium px-1.5 transition-colors"
                title="View public showcase"
              >
                <span>Public Page</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
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
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400 mb-2" />
              <span className="text-xs">Loading partners...</span>
            </div>
          ) : filteredSponsors.length === 0 ? (
            <div className="py-16 px-4 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Award className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No partners found</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                {searchQuery || selectedTier !== "All"
                  ? "Try selecting another tier or clearing your search term."
                  : "Get started by adding your first historical partner."}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              >
                Add Partner
              </button>
            </div>
          ) : viewMode === "table" ? (
            /* Minimal Table View */
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3 pl-4 pr-2 w-10">
                        <input
                          ref={masterCheckboxRef}
                          type="checkbox"
                          checked={isAllFilteredSelected}
                          onChange={handleToggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                          title={isAllFilteredSelected ? "Deselect all" : "Select all"}
                        />
                      </th>
                      <th className="py-3 px-3">Organization</th>
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
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? "bg-slate-50" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 pl-4 pr-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(sponsor.id)}
                              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                            />
                          </td>

                          {/* Partner & Logo */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <div className="relative w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
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
                              <span className="font-semibold text-slate-900 truncate max-w-xs">
                                {sponsor.name}
                              </span>
                            </div>
                          </td>

                          {/* Tier */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-mono font-medium">
                              {sponsor.tier}
                            </span>
                          </td>

                          {/* Designation */}
                          <td className="py-3 px-3 text-slate-600 font-medium">
                            {sponsor.type || <span className="text-slate-400">—</span>}
                          </td>

                          {/* URL */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {sponsor.url ? (
                              <a
                                href={sponsor.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-slate-700 font-mono text-[11px] inline-flex items-center gap-1 transition-colors"
                              >
                                <span className="truncate max-w-[160px]">
                                  {sponsor.url.replace(/^https?:\/\//, "")}
                                </span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
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
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
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
              <div className="p-3 px-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>
                  Showing {filteredSponsors.length} of {totalPartners} partners
                </span>
                <span>{categories.length} sponsorship tiers</span>
              </div>
            </div>
          ) : (
            /* Minimal Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredSponsors.map((sponsor) => {
                const isSelected = selectedIds.includes(sponsor.id);

                return (
                  <div
                    key={sponsor.id}
                    className={`bg-white rounded-2xl border p-4 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group ${
                      isSelected
                        ? "border-slate-900 ring-1 ring-slate-900"
                        : "border-slate-200/90 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(sponsor.id)}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-medium truncate max-w-[140px]">
                          {sponsor.tier}
                        </span>
                      </div>

                      <div className="h-20 w-full relative flex items-center justify-center bg-slate-50/70 rounded-xl p-3 border border-slate-100 group-hover:bg-slate-50 transition-colors my-2.5">
                        {sponsor.logo ? (
                          <Image
                            src={sponsor.logo}
                            alt={sponsor.name}
                            fill
                            unoptimized
                            className="object-contain p-2"
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-semibold text-xs text-slate-900 truncate" title={sponsor.name}>
                          {sponsor.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium truncate">
                          {sponsor.type || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      {sponsor.url ? (
                        <a
                          href={sponsor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-700 inline-flex items-center gap-1 font-mono text-[10px] truncate max-w-[120px] transition-colors"
                        >
                          <span className="truncate">{sponsor.url.replace(/^https?:\/\//, "")}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[10px]">—</span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingSponsor(sponsor)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSponsor(sponsor.id, sponsor.name)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
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
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200/90 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                Remove {selectedIds.length} {selectedIds.length === 1 ? "partner" : "partners"}?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will remove the selected organizations from the official sponsors showcase.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isBulkDeleting}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 transition-colors"
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

      {/* Add Partner Modal (Archive) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Add Historical Partner</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. World Bank Nepal / Voith Hydro"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Sponsorship Tier *
                  </label>
                  <select
                    name="tier"
                    defaultValue={categories[0]?.tier || "Government & Patron"}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white cursor-pointer transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c.tier} value={c.tier}>
                        {c.tier}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Designation Role
                  </label>
                  <input
                    type="text"
                    name="type"
                    placeholder="e.g. Platinum Partner"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <ImageUploadField
                name="logo"
                label="Partner Logo"
                value={addModalLogo}
                onChange={setAddModalLogo}
                folder="sponsors"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Official Website URL
                </label>
                <input
                  type="url"
                  name="url"
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving..." : "Add Partner"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Partner Modal (Archive) */}
      {editingSponsor && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Edit Historical Partner</h3>
              <button
                onClick={() => setEditingSponsor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingSponsor.name}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Sponsorship Tier *
                  </label>
                  <select
                    name="tier"
                    defaultValue={editingSponsor.tier}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white cursor-pointer transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c.tier} value={c.tier}>
                        {c.tier}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Designation Role
                  </label>
                  <input
                    type="text"
                    name="type"
                    defaultValue={editingSponsor.type}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <ImageUploadField
                name="logo"
                label="Partner Logo"
                value={editingSponsor.logo}
                onChange={(url) =>
                  setEditingSponsor({ ...editingSponsor, logo: url })
                }
                folder="sponsors"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Official Website URL
                </label>
                <input
                  type="url"
                  name="url"
                  defaultValue={editingSponsor.url}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSponsor(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add 2027 Partner Modal */}
      {showAdd2027Modal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold uppercase tracking-wider">
                  2027 Edition
                </span>
                <h3 className="font-bold text-sm text-slate-900">Add 2027 Partner</h3>
              </div>
              <button
                onClick={() => setShowAdd2027Modal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd2027Submit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Nepal Electricity Authority / Huawei Digital Power"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Sponsorship Category / Tier *
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Presets or custom text
                  </span>
                </div>

                {/* Quick Selection Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {["Title Sponsor", "In Association With", "Sponsorship", "Powered By", "Co-Sponsor", "Official Partner"].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setAdd2027Category(chip)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                        add2027Category === chip
                          ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name="category"
                    required
                    value={add2027Category}
                    onChange={(e) => setAdd2027Category(e.target.value)}
                    list="sponsorship-tiers-add-list"
                    placeholder="e.g. Title Sponsor, In Association With, Sponsorship..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white text-xs font-medium transition-colors"
                  />
                  <datalist id="sponsorship-tiers-add-list">
                    {SPONSORSHIP_TIERS_2027.map((tier) => (
                      <option key={tier} value={tier} />
                    ))}
                  </datalist>
                </div>
              </div>

              <ImageUploadField
                name="logo"
                label="Partner Logo"
                value={add2027Logo}
                onChange={setAdd2027Logo}
                folder="sponsors"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Official Website URL
                </label>
                <input
                  type="url"
                  name="url"
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={true}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Display on Homepage Marquee Strip
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 ml-6 mt-0.5">
                  When enabled, this partner appears in the live 2027 Edition Strip on the landing page.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdd2027Modal(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving2027}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60 transition-colors"
                >
                  {isSaving2027 ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{isSaving2027 ? "Saving..." : "Add Partner"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit 2027 Partner Modal */}
      {editing2027Partner && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold uppercase tracking-wider">
                  2027 Edition
                </span>
                <h3 className="font-bold text-sm text-slate-900">Edit 2027 Partner</h3>
              </div>
              <button
                onClick={() => setEditing2027Partner(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEdit2027Submit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editing2027Partner.name}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Sponsorship Category / Tier *
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Presets or custom text
                  </span>
                </div>

                {/* Quick Selection Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {["Title Sponsor", "In Association With", "Sponsorship", "Powered By", "Co-Sponsor", "Official Partner"].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        setEditing2027Partner({ ...editing2027Partner, category: chip })
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                        editing2027Partner.category === chip
                          ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name="category"
                    required
                    value={editing2027Partner.category}
                    onChange={(e) =>
                      setEditing2027Partner({ ...editing2027Partner, category: e.target.value })
                    }
                    list="sponsorship-tiers-edit-list"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white text-xs font-medium transition-colors"
                  />
                  <datalist id="sponsorship-tiers-edit-list">
                    {SPONSORSHIP_TIERS_2027.map((tier) => (
                      <option key={tier} value={tier} />
                    ))}
                  </datalist>
                </div>
              </div>

              <ImageUploadField
                name="logo"
                label="Partner Logo"
                value={editing2027Partner.logo}
                onChange={(url) =>
                  setEditing2027Partner({ ...editing2027Partner, logo: url })
                }
                folder="sponsors"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Official Website URL
                </label>
                <input
                  type="url"
                  name="url"
                  defaultValue={editing2027Partner.url || ""}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={editing2027Partner.active !== false}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Display on Homepage Marquee Strip
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 ml-6 mt-0.5">
                  Uncheck to immediately hide this partner from the landing page.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditing2027Partner(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving2027}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60 transition-colors"
                >
                  {isSaving2027 ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{isSaving2027 ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

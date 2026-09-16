"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Award,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Save,
  Building,
} from "lucide-react";
import { sponsorsData as initialSponsors } from "@/data/sponsors";
import { SponsorCategory } from "@/lib/types";

export default function AdminSponsorsPage() {
  const [categories, setCategories] = useState<SponsorCategory[]>(initialSponsors);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("Government & Patron");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddSponsor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const tier = formData.get("tier") as string;
    const type = formData.get("type") as string;
    const url = formData.get("url") as string;

    const newSponsor = {
      name,
      logo: "/images/logo.png",
      type: type || "Official Partner",
      url: url || "https://example.com",
    };

    setCategories((prev) =>
      prev.map((cat) =>
        cat.tier === tier ? { ...cat, sponsors: [...cat.sponsors, newSponsor] } : cat
      )
    );

    notify(`Added ${name} to ${tier}`);
    setShowAddModal(false);
  };

  const handleDeleteSponsor = (tierName: string, sponsorName: string) => {
    if (!confirm(`Are you sure you want to remove ${sponsorName}?`)) return;

    setCategories((prev) =>
      prev.map((cat) =>
        cat.tier === tierName
          ? { ...cat, sponsors: cat.sponsors.filter((s) => s.name !== sponsorName) }
          : cat
      )
    );
    notify(`Removed ${sponsorName}`);
  };

  const totalSponsors = categories.reduce((sum, c) => sum + c.sponsors.length, 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold uppercase">
              Partners & Patrons
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Sponsorship & Alliance Manager
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Organize official sovereign ministries, country partners, endorsing chambers, and sponsors.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Partner / Sponsor</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">TOTAL PARTNERS</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{totalSponsors}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-500 block mt-0.5">Across all endorsement tiers</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-500/30">
          <span className="text-[11px] text-amber-600 dark:text-amber-400 block font-mono">TIERS & CATEGORIES</span>
          <span className="text-2xl font-black text-amber-700 dark:text-amber-300">{categories.length}</span>
          <span className="text-[10px] text-amber-600/80 dark:text-amber-500/80 block mt-0.5">Government, OEM & Media</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-500/30">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-mono">PATRON BODIES</span>
          <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
            {categories.find((c) => c.tier.includes("Government"))?.sponsors.length || 4}
          </span>
          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-500/80 block mt-0.5">Ministry, NEA, ERC, HIDCL</span>
        </div>
      </div>

      {/* Tiers List */}
      <div className="space-y-6">
        {categories.map((cat) => (
          <div
            key={cat.tier}
            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>{cat.tier}</span>
                  <span className="text-[10px] font-mono font-normal text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                    {cat.sponsors.length} Partners
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{cat.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cat.sponsors.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-white block line-clamp-1">
                        {s.name}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block line-clamp-1">
                        {s.type}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteSponsor(cat.tier, s.name)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Partner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {s.url && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-mono flex items-center gap-1 truncate"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{s.url.replace(/^https?:\/\//, "")}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#091A28] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Add New Partner or Sponsor</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSponsor} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ORGANIZATION / SPONSOR NAME
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. World Bank Nepal / Voith Hydro"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    SPONSORSHIP TIER
                  </label>
                  <select
                    name="tier"
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.tier} value={c.tier}>
                        {c.tier}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    DESIGNATION ROLE
                  </label>
                  <input
                    type="text"
                    name="type"
                    placeholder="e.g. Platinum Sponsor / Knowledge Partner"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                  WEBSITE URL
                </label>
                <input
                  type="url"
                  name="url"
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Publish Partner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

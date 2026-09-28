"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Save,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Users,
  Building2,
  Calendar,
  Globe,
  Loader2,
  Award,
  Zap,
} from "lucide-react";
import defaultAboutData from "@/data/aboutPageData.json";

export default function AdminAboutCMSPage() {
  const [data, setData] = useState<any>(defaultAboutData);
  const [activeTab, setActiveTab] = useState<string>("header");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadAboutData() {
      try {
        const res = await fetch("/api/about");
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Error loading about page data:", err);
      }
    }
    loadAboutData();
  }, []);

  const notify = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        notify("About page content saved successfully!");
      } else {
        notify(json.error || "Failed to save changes", "error");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      notify("Network error while saving changes", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all About page fields to default values?")) {
      setData(defaultAboutData);
      notify("Reset to default content. Click 'Save Changes' to apply.");
    }
  };

  const updateSection = (section: string, field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const tabs = [
    { id: "header", label: "01. Header & Metrics", icon: Layers },
    { id: "whyExpo", label: "02. Why The Expo", icon: Sparkles },
    { id: "energyJourney", label: "03. Energy Journey & 2035", icon: Zap },
    { id: "journeyExpo", label: "04. Four Editions History", icon: Calendar },
    { id: "ecosystem", label: "05. Ecosystem & Experience", icon: Globe },
    { id: "organizers", label: "06. Organizers & People", icon: Users },
    { id: "fifthEdition", label: "07. 5th Edition Showcase", icon: Award },
  ];

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border text-xs font-semibold shadow-xl flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-top-3 ${
            toastMsg.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-rose-50 border-rose-300 text-rose-900"
          }`}
        >
          {toastMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Page Header with Floating Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#218A59] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#218A59]" />
            <span>Content Management System</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            About Page CMS &amp; Editor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Modify text, headlines, milestone targets, committee members, and images. All changes update live on the public About page.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/about"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Live Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
            title="Reset to default content"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                isActive
                  ? "bg-white text-[#218A59] border-[#218A59] shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 border-transparent hover:bg-slate-100/60"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#218A59]" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        {/* =========================================================================
            TAB 1: HEADER & METRICS
           ========================================================================= */}
        {activeTab === "header" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">01. Header Banner &amp; Quick Metrics</h2>
              <p className="text-xs text-slate-500">The primary green banner shown at the top of the About page.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Page Title</label>
                <input
                  type="text"
                  value={data?.header?.title || ""}
                  onChange={(e) => updateSection("header", "title", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dates &amp; Venue Subtitle</label>
                <input
                  type="text"
                  value={data?.header?.subtitle || ""}
                  onChange={(e) => updateSection("header", "subtitle", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Button Label</label>
                <input
                  type="text"
                  value={data?.header?.ctaRegisterText || ""}
                  onChange={(e) => updateSection("header", "ctaRegisterText", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stall Booking Button Label</label>
                <input
                  type="text"
                  value={data?.header?.ctaStallText || ""}
                  onChange={(e) => updateSection("header", "ctaStallText", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#218A59]"
                />
              </div>
            </div>

            {/* Quick Metrics Editor */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quick Metrics Badges</h3>
                  <p className="text-[11px] text-slate-500">Highlighted badges displayed beneath the header description.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const metrics = [...(data?.header?.metrics || [])];
                    metrics.push({ label: "New Metric", isHighlighted: false });
                    updateSection("header", "metrics", metrics);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Metric</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(data?.header?.metrics || []).map((m: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">Metric #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const metrics = [...data.header.metrics];
                          metrics.splice(idx, 1);
                          updateSection("header", "metrics", metrics);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={m.label}
                      onChange={(e) => {
                        const metrics = [...data.header.metrics];
                        metrics[idx].label = e.target.value;
                        updateSection("header", "metrics", metrics);
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                    />
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(m.isHighlighted)}
                        onChange={(e) => {
                          const metrics = [...data.header.metrics];
                          metrics[idx].isHighlighted = e.target.checked;
                          updateSection("header", "metrics", metrics);
                        }}
                        className="rounded text-[#218A59] focus:ring-0"
                      />
                      <span>Highlighted Badge (Green)</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: WHY THE EXPO
           ========================================================================= */}
        {activeTab === "whyExpo" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">02. Why The Expo (Editorial Section)</h2>
              <p className="text-xs text-slate-500">The theme headline and comprehensive narrative on clean energy and resilience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section Badge</label>
                <input
                  type="text"
                  value={data?.whyExpo?.badge || ""}
                  onChange={(e) => updateSection("whyExpo", "badge", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Feature Image URL</label>
                <input
                  type="text"
                  value={data?.whyExpo?.featureImage || ""}
                  onChange={(e) => updateSection("whyExpo", "featureImage", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline Line 1</label>
                <input
                  type="text"
                  value={data?.whyExpo?.titleLine1 || ""}
                  onChange={(e) => updateSection("whyExpo", "titleLine1", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline Line 2 (Emerald Accent)</label>
                <input
                  type="text"
                  value={data?.whyExpo?.titleLine2 || ""}
                  onChange={(e) => updateSection("whyExpo", "titleLine2", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-emerald-700 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sub-Statement</label>
                <input
                  type="text"
                  value={data?.whyExpo?.substatement || ""}
                  onChange={(e) => updateSection("whyExpo", "substatement", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Feature Image Caption Badge</label>
                <input
                  type="text"
                  value={data?.whyExpo?.featureCaption || ""}
                  onChange={(e) => updateSection("whyExpo", "featureCaption", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#218A59]"
                />
              </div>
            </div>

            {/* Paragraphs Editor */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Editorial Paragraphs</h3>
                <button
                  type="button"
                  onClick={() => {
                    const pars = [...(data?.whyExpo?.paragraphs || [])];
                    pars.push("New narrative paragraph discussing energy growth, infrastructure, or resilience.");
                    updateSection("whyExpo", "paragraphs", pars);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Paragraph</span>
                </button>
              </div>

              <div className="space-y-3">
                {(data?.whyExpo?.paragraphs || []).map((p: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">Paragraph #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const pars = [...data.whyExpo.paragraphs];
                          pars.splice(idx, 1);
                          updateSection("whyExpo", "paragraphs", pars);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={p}
                      onChange={(e) => {
                        const pars = [...data.whyExpo.paragraphs];
                        pars[idx] = e.target.value;
                        updateSection("whyExpo", "paragraphs", pars);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs leading-relaxed bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: ENERGY JOURNEY & 2035 TARGETS
           ========================================================================= */}
        {activeTab === "energyJourney" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">03. Nepal&apos;s Energy Journey &amp; 30,000 MW Target</h2>
              <p className="text-xs text-slate-500">Edit the three milestone cards: 1911 Pharping, 2035 AD National Target, and Regional Power Trade Allocation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section Badge</label>
                <input
                  type="text"
                  value={data?.energyJourney?.badge || ""}
                  onChange={(e) => updateSection("energyJourney", "badge", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dark Backdrop Image URL</label>
                <input
                  type="text"
                  value={data?.energyJourney?.backgroundImage || ""}
                  onChange={(e) => updateSection("energyJourney", "backgroundImage", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline Line 1</label>
                <input
                  type="text"
                  value={data?.energyJourney?.titleLine1 || ""}
                  onChange={(e) => updateSection("energyJourney", "titleLine1", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline Line 2</label>
                <input
                  type="text"
                  value={data?.energyJourney?.titleLine2 || ""}
                  onChange={(e) => updateSection("energyJourney", "titleLine2", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-emerald-700 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section Description</label>
                <input
                  type="text"
                  value={data?.energyJourney?.description || ""}
                  onChange={(e) => updateSection("energyJourney", "description", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#218A59]"
                />
              </div>
            </div>

            {/* 3 Milestone Cards */}
            <div className="pt-4 border-t border-slate-100 space-y-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Milestone Cards</h3>

              {/* Card 1: 1911 AD */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <span className="text-xs font-mono font-bold text-[#087EA4] uppercase block">Card 1 · Historic Origin</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Year (e.g. 1911 AD)"
                    value={data?.energyJourney?.card1?.year || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card1, year: e.target.value };
                      updateSection("energyJourney", "card1", c);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Badge (e.g. HISTORIC ORIGIN)"
                    value={data?.energyJourney?.card1?.badge || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card1, badge: e.target.value };
                      updateSection("energyJourney", "card1", c);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Capacity (e.g. 0.5)"
                    value={data?.energyJourney?.card1?.capacity || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card1, capacity: e.target.value };
                      updateSection("energyJourney", "card1", c);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Title (e.g. Pharping Powerhouse)"
                    value={data?.energyJourney?.card1?.title || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card1, title: e.target.value };
                      updateSection("energyJourney", "card1", c);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={data?.energyJourney?.card1?.image || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card1, image: e.target.value };
                      updateSection("energyJourney", "card1", c);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Card description"
                  value={data?.energyJourney?.card1?.description || ""}
                  onChange={(e) => {
                    const c = { ...data.energyJourney.card1, description: e.target.value };
                    updateSection("energyJourney", "card1", c);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>

              {/* Card 2: 2035 AD National Target */}
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/30 space-y-3">
                <span className="text-xs font-mono font-bold text-emerald-800 uppercase block">Card 2 · National 30,000 MW Target</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Year (e.g. 2035 AD)"
                    value={data?.energyJourney?.card2?.year || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card2, year: e.target.value };
                      updateSection("energyJourney", "card2", c);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Target (e.g. 30,000)"
                    value={data?.energyJourney?.card2?.targetCapacity || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card2, targetCapacity: e.target.value };
                      updateSection("energyJourney", "card2", c);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Existing Capacity (e.g. 4,145.7 MW)"
                    value={data?.energyJourney?.card2?.installedCapacity || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card2, installedCapacity: e.target.value };
                      updateSection("energyJourney", "card2", c);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Title (e.g. Sovereign Clean Power Target)"
                    value={data?.energyJourney?.card2?.title || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card2, title: e.target.value };
                      updateSection("energyJourney", "card2", c);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={data?.energyJourney?.card2?.image || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card2, image: e.target.value };
                      updateSection("energyJourney", "card2", c);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Card description"
                  value={data?.energyJourney?.card2?.description || ""}
                  onChange={(e) => {
                    const c = { ...data.energyJourney.card2, description: e.target.value };
                    updateSection("energyJourney", "card2", c);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>

              {/* Card 3: Regional Power Trade Breakdown */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <span className="text-xs font-mono font-bold text-slate-800 uppercase block">Card 3 · Regional Trade &amp; Demand Breakdown</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 font-bold block mb-1">India Export</label>
                    <input
                      type="text"
                      value={data?.energyJourney?.card3?.indiaExport || ""}
                      onChange={(e) => {
                        const c = { ...data.energyJourney.card3, indiaExport: e.target.value };
                        updateSection("energyJourney", "card3", c);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 font-bold block mb-1">Bangladesh Export</label>
                    <input
                      type="text"
                      value={data?.energyJourney?.card3?.bangladeshExport || ""}
                      onChange={(e) => {
                        const c = { ...data.energyJourney.card3, bangladeshExport: e.target.value };
                        updateSection("energyJourney", "card3", c);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 font-bold block mb-1">Domestic Demand</label>
                    <input
                      type="text"
                      value={data?.energyJourney?.card3?.domesticDemand || ""}
                      onChange={(e) => {
                        const c = { ...data.energyJourney.card3, domesticDemand: e.target.value };
                        updateSection("energyJourney", "card3", c);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Title (e.g. Power Flow & Regional Trade)"
                    value={data?.energyJourney?.card3?.title || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card3, title: e.target.value };
                      updateSection("energyJourney", "card3", c);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={data?.energyJourney?.card3?.image || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card3, image: e.target.value };
                      updateSection("energyJourney", "card3", c);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: FOUR EDITIONS HISTORY & PRESS MEET
           ========================================================================= */}
        {activeTab === "journeyExpo" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">04. Four Editions History &amp; 5th Milestone Teaser</h2>
              <p className="text-xs text-slate-500">Edit the 4 historical edition cards (2018, 2019, 2022, 2024) and the official press announcement card.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section Badge</label>
                <input
                  type="text"
                  value={data?.journeyExpo?.badge || ""}
                  onChange={(e) => updateSection("journeyExpo", "badge", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gallery Link Text</label>
                <input
                  type="text"
                  value={data?.journeyExpo?.galleryLinkText || ""}
                  onChange={(e) => updateSection("journeyExpo", "galleryLinkText", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#218A59]"
                />
              </div>
            </div>

            {/* Edition Cards Editor */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Historical Edition Cards</h3>
                <button
                  type="button"
                  onClick={() => {
                    const eds = [...(data?.journeyExpo?.editions || [])];
                    eds.push({ year: "2026", edition: "SPECIAL EDITION", image: "/images/event-photo-3.webp", desc: "Brief description of the edition." });
                    updateSection("journeyExpo", "editions", eds);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Edition</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(data?.journeyExpo?.editions || []).map((ed: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">Edition #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const eds = [...data.journeyExpo.editions];
                          eds.splice(idx, 1);
                          updateSection("journeyExpo", "editions", eds);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Year"
                        value={ed.year}
                        onChange={(e) => {
                          const eds = [...data.journeyExpo.editions];
                          eds[idx].year = e.target.value;
                          updateSection("journeyExpo", "editions", eds);
                        }}
                        className="w-20 px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Edition label"
                        value={ed.edition}
                        onChange={(e) => {
                          const eds = [...data.journeyExpo.editions];
                          eds[idx].edition = e.target.value;
                          updateSection("journeyExpo", "editions", eds);
                        }}
                        className="flex-1 px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Image URL"
                      value={ed.image}
                      onChange={(e) => {
                        const eds = [...data.journeyExpo.editions];
                        eds[idx].image = e.target.value;
                        updateSection("journeyExpo", "editions", eds);
                      }}
                      className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs bg-white"
                    />

                    <textarea
                      rows={2}
                      placeholder="Description"
                      value={ed.desc}
                      onChange={(e) => {
                        const eds = [...data.journeyExpo.editions];
                        eds[idx].desc = e.target.value;
                        updateSection("journeyExpo", "editions", eds);
                      }}
                      className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Milestone Teaser Card */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">5th Milestone Announcement Banner Card</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={data?.journeyExpo?.milestoneCard?.badge || ""}
                    onChange={(e) => {
                      const m = { ...data.journeyExpo.milestoneCard, badge: e.target.value };
                      updateSection("journeyExpo", "milestoneCard", m);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Image URL</label>
                  <input
                    type="text"
                    value={data?.journeyExpo?.milestoneCard?.bannerImage || ""}
                    onChange={(e) => {
                      const m = { ...data.journeyExpo.milestoneCard, bannerImage: e.target.value };
                      updateSection("journeyExpo", "milestoneCard", m);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Copy</label>
                  <textarea
                    rows={3}
                    value={data?.journeyExpo?.milestoneCard?.description || ""}
                    onChange={(e) => {
                      const m = { ...data.journeyExpo.milestoneCard, description: e.target.value };
                      updateSection("journeyExpo", "milestoneCard", m);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: ECOSYSTEM & EXPERIENCE
           ========================================================================= */}
        {activeTab === "ecosystem" && (
          <div className="space-y-8">
            {/* Section 05: Ecosystem */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">05. What The Expo Connects (Ecosystem)</h2>
                <p className="text-xs text-slate-500">Edit the orbital tags representing developers, OEMs, EPC contractors, utilities, etc.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section Badge</label>
                  <input
                    type="text"
                    value={data?.ecosystemSection?.badge || ""}
                    onChange={(e) => updateSection("ecosystemSection", "badge", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Headline Line 2 (Accent)</label>
                  <input
                    type="text"
                    value={data?.ecosystemSection?.titleLine2 || ""}
                    onChange={(e) => updateSection("ecosystemSection", "titleLine2", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Ecosystem Sectors &amp; Stakeholders ({data?.ecosystemSection?.items?.length || 0})</span>
                  <button
                    type="button"
                    onClick={() => {
                      const items = [...(data?.ecosystemSection?.items || [])];
                      items.push("NEW SECTOR / PARTNER CATEGORY");
                      updateSection("ecosystemSection", "items", items);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Sector</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {(data?.ecosystemSection?.items || []).map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-200 bg-slate-50">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const items = [...data.ecosystemSection.items];
                          items[idx] = e.target.value;
                          updateSection("ecosystemSection", "items", items);
                        }}
                        className="flex-1 px-2 py-1 rounded border border-slate-300 text-xs font-mono bg-white uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const items = [...data.ecosystemSection.items];
                          items.splice(idx, 1);
                          updateSection("ecosystemSection", "items", items);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 06: Experience Blocks */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">06. The Experience Blocks</h2>
                <p className="text-xs text-slate-500">Edit the 4 interactive experience categories (Exhibition, Conference, Networking, Business).</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(data?.experienceSection?.blocks || []).map((b: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={b.label}
                        onChange={(e) => {
                          const blocks = [...data.experienceSection.blocks];
                          blocks[idx].label = e.target.value;
                          updateSection("experienceSection", "blocks", blocks);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                      />
                      <span className="text-[10px] font-mono text-slate-400">Experience #{idx + 1}</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={b.img}
                      onChange={(e) => {
                        const blocks = [...data.experienceSection.blocks];
                        blocks[idx].img = e.target.value;
                        updateSection("experienceSection", "blocks", blocks);
                      }}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                    <textarea
                      rows={2}
                      placeholder="Description"
                      value={b.desc}
                      onChange={(e) => {
                        const blocks = [...data.experienceSection.blocks];
                        blocks[idx].desc = e.target.value;
                        updateSection("experienceSection", "blocks", blocks);
                      }}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: ORGANIZERS & LEADERSHIP
           ========================================================================= */}
        {activeTab === "organizers" && (
          <div className="space-y-8">
            {/* Organizers: IPPAN & Event Solution */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">07. The Joint Organizers</h2>
                <p className="text-xs text-slate-500">Edit institutional profile, vector logo, and official site URLs for IPPAN and Event Solution.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* IPPAN Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <span className="text-xs font-mono font-bold text-emerald-800 uppercase block">Organizer 1 · IPPAN</span>
                  <input
                    type="text"
                    placeholder="Vector Logo URL"
                    value={data?.organizersSection?.ippan?.logo || ""}
                    onChange={(e) => {
                      const o = { ...data.organizersSection.ippan, logo: e.target.value };
                      updateSection("organizersSection", "ippan", o);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Organization Name"
                    value={data?.organizersSection?.ippan?.title || ""}
                    onChange={(e) => {
                      const o = { ...data.organizersSection.ippan, title: e.target.value };
                      updateSection("organizersSection", "ippan", o);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Website URL"
                    value={data?.organizersSection?.ippan?.website || ""}
                    onChange={(e) => {
                      const o = { ...data.organizersSection.ippan, website: e.target.value };
                      updateSection("organizersSection", "ippan", o);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <textarea
                    rows={4}
                    placeholder="Organization profile description"
                    value={data?.organizersSection?.ippan?.description || ""}
                    onChange={(e) => {
                      const o = { ...data.organizersSection.ippan, description: e.target.value };
                      updateSection("organizersSection", "ippan", o);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>

                {/* Event Solution Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <span className="text-xs font-mono font-bold text-sky-800 uppercase block">Organizer 2 · Event Solution</span>
                  <input
                    type="text"
                    placeholder="Vector Logo URL"
                    value={data?.organizersSection?.eventSolution?.logo || ""}
                    onChange={(e) => {
                      const o = { ...data.organizersSection.eventSolution, logo: e.target.value };
                      updateSection("organizersSection", "eventSolution", o);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={data?.organizersSection?.eventSolution?.title || ""}
                    onChange={(e) => {
                      const o = { ...data.organizersSection.eventSolution, title: e.target.value };
                      updateSection("organizersSection", "eventSolution", o);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Website URL"
                    value={data?.organizersSection?.eventSolution?.website || ""}
                    onChange={(e) => {
                      const o = { ...data.organizersSection.eventSolution, website: e.target.value };
                      updateSection("organizersSection", "eventSolution", o);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <textarea
                    rows={4}
                    placeholder="Company profile description"
                    value={data?.organizersSection?.eventSolution?.description || ""}
                    onChange={(e) => {
                      const o = { ...data.organizersSection.eventSolution, description: e.target.value };
                      updateSection("organizersSection", "eventSolution", o);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Committee: IPPAN Leadership */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">IPPAN Leadership Members</h2>
                  <p className="text-xs text-slate-500">Photos, names, and official executive designations.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const members = [...(data?.peopleSection?.ippanMembers || [])];
                    members.push({ name: "Executive Name", title: "Vice President, IPPAN", photo: "/images/committee/mohan-kumar-dangi.webp" });
                    updateSection("peopleSection", "ippanMembers", members);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add IPPAN Member</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(data?.peopleSection?.ippanMembers || []).map((p: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex gap-3 items-center">
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                      {p.photo && (
                        <Image src={p.photo} alt={p.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => {
                          const members = [...data.peopleSection.ippanMembers];
                          members[idx].name = e.target.value;
                          updateSection("peopleSection", "ippanMembers", members);
                        }}
                        className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-bold bg-white"
                        placeholder="Full Name"
                      />
                      <input
                        type="text"
                        value={p.title}
                        onChange={(e) => {
                          const members = [...data.peopleSection.ippanMembers];
                          members[idx].title = e.target.value;
                          updateSection("peopleSection", "ippanMembers", members);
                        }}
                        className="w-full px-2 py-0.5 rounded border border-slate-300 text-[11px] font-mono bg-white text-emerald-700"
                        placeholder="Title"
                      />
                      <input
                        type="text"
                        value={p.photo}
                        onChange={(e) => {
                          const members = [...data.peopleSection.ippanMembers];
                          members[idx].photo = e.target.value;
                          updateSection("peopleSection", "ippanMembers", members);
                        }}
                        className="w-full px-2 py-0.5 rounded border border-slate-300 text-[10px] bg-white text-slate-500"
                        placeholder="Photo URL"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const members = [...data.peopleSection.ippanMembers];
                        members.splice(idx, 1);
                        updateSection("peopleSection", "ippanMembers", members);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer self-start"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Committee: Event Solution Team */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Event Solution Team Members</h2>
                  <p className="text-xs text-slate-500">Directors and operational executives.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const members = [...(data?.peopleSection?.eventSolutionMembers || [])];
                    members.push({ name: "Team Member", title: "Operations Director", photo: "/images/eventsolution/sunil-bhandari.webp" });
                    updateSection("peopleSection", "eventSolutionMembers", members);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Event Solution Member</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(data?.peopleSection?.eventSolutionMembers || []).map((p: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex gap-3 items-center">
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                      {p.photo && (
                        <Image src={p.photo} alt={p.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => {
                          const members = [...data.peopleSection.eventSolutionMembers];
                          members[idx].name = e.target.value;
                          updateSection("peopleSection", "eventSolutionMembers", members);
                        }}
                        className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-bold bg-white"
                        placeholder="Full Name"
                      />
                      <input
                        type="text"
                        value={p.title}
                        onChange={(e) => {
                          const members = [...data.peopleSection.eventSolutionMembers];
                          members[idx].title = e.target.value;
                          updateSection("peopleSection", "eventSolutionMembers", members);
                        }}
                        className="w-full px-2 py-0.5 rounded border border-slate-300 text-[11px] font-mono bg-white text-sky-700"
                        placeholder="Title"
                      />
                      <input
                        type="text"
                        value={p.photo}
                        onChange={(e) => {
                          const members = [...data.peopleSection.eventSolutionMembers];
                          members[idx].photo = e.target.value;
                          updateSection("peopleSection", "eventSolutionMembers", members);
                        }}
                        className="w-full px-2 py-0.5 rounded border border-slate-300 text-[10px] bg-white text-slate-500"
                        placeholder="Photo URL"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const members = [...data.peopleSection.eventSolutionMembers];
                        members.splice(idx, 1);
                        updateSection("peopleSection", "eventSolutionMembers", members);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer self-start"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 7: 5TH EDITION SHOWCASE (DARK SECTION)
           ========================================================================= */}
        {activeTab === "fifthEdition" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">07. The 5th Edition Showcase (Dark Finale Section)</h2>
              <p className="text-xs text-slate-500">The grand finale hero section with background imagery, official logo, and registration CTA.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Logo Image URL (Navbar Expo Logo)</label>
                <input
                  type="text"
                  value={data?.fifthEditionDark?.logo || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "logo", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Background Backdrop Image URL</label>
                <input
                  type="text"
                  value={data?.fifthEditionDark?.backgroundImage || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "backgroundImage", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sub-badge 1</label>
                <input
                  type="text"
                  value={data?.fifthEditionDark?.badge1 || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "badge1", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono text-[#218A59] focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sub-badge 2</label>
                <input
                  type="text"
                  value={data?.fifthEditionDark?.badge2 || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "badge2", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline Part 1</label>
                <input
                  type="text"
                  value={data?.fifthEditionDark?.titleLine1 || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "titleLine1", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline Highlight (Emerald Word)</label>
                <input
                  type="text"
                  value={data?.fifthEditionDark?.titleHighlight || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "titleHighlight", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-emerald-700 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline Part 2</label>
                <input
                  type="text"
                  value={data?.fifthEditionDark?.titleLine2 || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "titleLine2", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Finale Narrative Paragraph</label>
                <textarea
                  rows={3}
                  value={data?.fifthEditionDark?.description || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "description", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Explore Button Label</label>
                <input
                  type="text"
                  value={data?.fifthEditionDark?.exploreButtonText || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "exploreButtonText", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Register Button Label</label>
                <input
                  type="text"
                  value={data?.fifthEditionDark?.registerButtonText || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "registerButtonText", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#218A59]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Save Bar on bottom for quick access */}
      <div className="sticky bottom-6 z-40 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-300 shadow-xl flex items-center justify-between gap-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#218A59]" />
          <span className="text-xs text-slate-600 font-medium">Ready to update About page live.</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/about"
            target="_blank"
            className="text-xs text-slate-600 hover:text-slate-900 font-medium"
          >
            Preview on site ↗
          </Link>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

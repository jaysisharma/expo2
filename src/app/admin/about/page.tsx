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
import { ImageUploadField } from "@/components/admin/ImageUploadField";

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
    { id: "header", label: "Header & Metrics", icon: Layers, number: "01" },
    { id: "whyExpo", label: "Why The Expo", icon: Sparkles, number: "02" },
    { id: "energyJourney", label: "Energy Journey & 2035", icon: Zap, number: "03" },
    { id: "journeyExpo", label: "Four Editions", icon: Calendar, number: "04" },
    { id: "ecosystem", label: "Ecosystem & Experience", icon: Globe, number: "05" },
    { id: "organizers", label: "Organizers & People", icon: Users, number: "06" },
    { id: "fifthEdition", label: "5th Edition Showcase", icon: Award, number: "07" },
  ];

  return (
    <div className="space-y-6 pb-24 font-sans text-slate-800">
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Content Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            About Page CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage narratives, historical milestones, stakeholder ecosystems, executive leadership, and uploaded assets for the public About page.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/about"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Live Preview</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
            title="Reset to default content"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
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

      {/* Segmented Pill Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white text-slate-900 font-semibold shadow-xs border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <span className={`text-[10px] font-mono px-1 py-0.5 rounded ${isActive ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-400"}`}>
                {tab.number}
              </span>
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Panels */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
        {/* =========================================================================
            TAB 1: HEADER & METRICS
           ========================================================================= */}
        {activeTab === "header" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">Header Banner &amp; Quick Metrics</h2>
              <p className="text-xs text-slate-500 mt-0.5">Top editorial banner, dates headline, and fast key metric badges.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Page Title
                </label>
                <input
                  type="text"
                  value={data?.header?.title || ""}
                  onChange={(e) => updateSection("header", "title", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Dates &amp; Venue Subtitle
                </label>
                <input
                  type="text"
                  value={data?.header?.subtitle || ""}
                  onChange={(e) => updateSection("header", "subtitle", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Registration Button Label
                </label>
                <input
                  type="text"
                  value={data?.header?.ctaRegisterText || ""}
                  onChange={(e) => updateSection("header", "ctaRegisterText", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Stall Booking Button Label
                </label>
                <input
                  type="text"
                  value={data?.header?.ctaStallText || ""}
                  onChange={(e) => updateSection("header", "ctaStallText", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Quick Metrics Editor */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
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
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Metric</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {(data?.header?.metrics || []).map((m: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">Metric #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const metrics = [...data.header.metrics];
                          metrics.splice(idx, 1);
                          updateSection("header", "metrics", metrics);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
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
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-slate-400"
                    />
                    <label className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer pt-0.5">
                      <input
                        type="checkbox"
                        checked={Boolean(m.isHighlighted)}
                        onChange={(e) => {
                          const metrics = [...data.header.metrics];
                          metrics[idx].isHighlighted = e.target.checked;
                          updateSection("header", "metrics", metrics);
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-0"
                      />
                      <span>Highlighted Badge</span>
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
              <h2 className="text-base font-bold text-slate-900">Why The Expo (Editorial Narrative)</h2>
              <p className="text-xs text-slate-500 mt-0.5">The primary theme headline, feature photography, and narrative paragraphs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Section Badge
                </label>
                <input
                  type="text"
                  value={data?.whyExpo?.badge || ""}
                  onChange={(e) => updateSection("whyExpo", "badge", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Feature Image Caption Badge
                </label>
                <input
                  type="text"
                  value={data?.whyExpo?.featureCaption || ""}
                  onChange={(e) => updateSection("whyExpo", "featureCaption", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Headline Line 1
                </label>
                <input
                  type="text"
                  value={data?.whyExpo?.titleLine1 || ""}
                  onChange={(e) => updateSection("whyExpo", "titleLine1", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Headline Line 2 (Accent Color)
                </label>
                <input
                  type="text"
                  value={data?.whyExpo?.titleLine2 || ""}
                  onChange={(e) => updateSection("whyExpo", "titleLine2", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-bold text-emerald-700 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Sub-Statement
                </label>
                <input
                  type="text"
                  value={data?.whyExpo?.substatement || ""}
                  onChange={(e) => updateSection("whyExpo", "substatement", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              {/* Feature Image with direct upload */}
              <div className="md:col-span-2 p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50">
                <ImageUploadField
                  label="Editorial Feature Image"
                  value={data?.whyExpo?.featureImage || ""}
                  onChange={(url) => updateSection("whyExpo", "featureImage", url)}
                  folder="about"
                  placeholder="Upload or paste editorial photo URL"
                />
              </div>
            </div>

            {/* Paragraphs Editor */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Editorial Narrative Paragraphs</h3>
                  <p className="text-[11px] text-slate-500">Multi-paragraph article exploring clean energy and resilience.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const pars = [...(data?.whyExpo?.paragraphs || [])];
                    pars.push("New narrative paragraph discussing energy growth, infrastructure, or regional grid trade.");
                    updateSection("whyExpo", "paragraphs", pars);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Paragraph</span>
                </button>
              </div>

              <div className="space-y-3.5">
                {(data?.whyExpo?.paragraphs || []).map((p: string, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">Paragraph #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const pars = [...data.whyExpo.paragraphs];
                          pars.splice(idx, 1);
                          updateSection("whyExpo", "paragraphs", pars);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
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
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs leading-relaxed bg-white focus:outline-none focus:border-slate-400"
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
              <h2 className="text-base font-bold text-slate-900">Nepal&apos;s Energy Journey &amp; 30,000 MW Target</h2>
              <p className="text-xs text-slate-500 mt-0.5">The three historical and visionary milestone cards (1911 Pharping, 2035 Target, Regional Power Trade).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Section Badge
                </label>
                <input
                  type="text"
                  value={data?.energyJourney?.badge || ""}
                  onChange={(e) => updateSection("energyJourney", "badge", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Section Description
                </label>
                <input
                  type="text"
                  value={data?.energyJourney?.description || ""}
                  onChange={(e) => updateSection("energyJourney", "description", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Headline Line 1
                </label>
                <input
                  type="text"
                  value={data?.energyJourney?.titleLine1 || ""}
                  onChange={(e) => updateSection("energyJourney", "titleLine1", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Headline Line 2 (Accent)
                </label>
                <input
                  type="text"
                  value={data?.energyJourney?.titleLine2 || ""}
                  onChange={(e) => updateSection("energyJourney", "titleLine2", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-bold text-emerald-700 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              {/* Dark Section Background Image */}
              <div className="md:col-span-2 p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50">
                <ImageUploadField
                  label="Section Dark Backdrop Image"
                  value={data?.energyJourney?.backgroundImage || ""}
                  onChange={(url) => updateSection("energyJourney", "backgroundImage", url)}
                  folder="about"
                  placeholder="Upload or paste background image URL"
                />
              </div>
            </div>

            {/* 3 Milestone Cards */}
            <div className="pt-6 border-t border-slate-100 space-y-6">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Milestone Cards</h3>

              {/* Card 1: 1911 AD */}
              <div className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-800 uppercase tracking-wider">Card 1 · Historic Origin</span>
                  <span className="text-[10px] text-slate-400 font-mono">1911 AD Pharping</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Year (e.g. 1911 AD)"
                    value={data?.energyJourney?.card1?.year || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card1, year: e.target.value };
                      updateSection("energyJourney", "card1", c);
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:border-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Badge (e.g. HISTORIC ORIGIN)"
                    value={data?.energyJourney?.card1?.badge || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card1, badge: e.target.value };
                      updateSection("energyJourney", "card1", c);
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Capacity (e.g. 0.5)"
                    value={data?.energyJourney?.card1?.capacity || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card1, capacity: e.target.value };
                      updateSection("energyJourney", "card1", c);
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Title (e.g. Pharping Powerhouse)"
                    value={data?.energyJourney?.card1?.title || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card1, title: e.target.value };
                      updateSection("energyJourney", "card1", c);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-slate-400 mb-3"
                  />
                  <textarea
                    rows={2}
                    placeholder="Card narrative description"
                    value={data?.energyJourney?.card1?.description || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card1, description: e.target.value };
                      updateSection("energyJourney", "card1", c);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
                <ImageUploadField
                  label="Card 1 Illustration / Photo"
                  value={data?.energyJourney?.card1?.image || ""}
                  onChange={(url) => {
                    const c = { ...data.energyJourney.card1, image: url };
                    updateSection("energyJourney", "card1", c);
                  }}
                  folder="about"
                />
              </div>

              {/* Card 2: 2035 AD National Target */}
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">Card 2 · National 30,000 MW Target</span>
                  <span className="text-[10px] text-emerald-600 font-mono">2035 AD Vision</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Year (e.g. 2035 AD)"
                    value={data?.energyJourney?.card2?.year || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card2, year: e.target.value };
                      updateSection("energyJourney", "card2", c);
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:border-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Target (e.g. 30,000)"
                    value={data?.energyJourney?.card2?.targetCapacity || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card2, targetCapacity: e.target.value };
                      updateSection("energyJourney", "card2", c);
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white focus:outline-none focus:border-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Existing Capacity (e.g. 4,145.7 MW)"
                    value={data?.energyJourney?.card2?.installedCapacity || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card2, installedCapacity: e.target.value };
                      updateSection("energyJourney", "card2", c);
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Title (e.g. Sovereign Clean Power Target)"
                    value={data?.energyJourney?.card2?.title || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card2, title: e.target.value };
                      updateSection("energyJourney", "card2", c);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-slate-400 mb-3"
                  />
                  <textarea
                    rows={2}
                    placeholder="Card narrative description"
                    value={data?.energyJourney?.card2?.description || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card2, description: e.target.value };
                      updateSection("energyJourney", "card2", c);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
                <ImageUploadField
                  label="Card 2 Photo / Diagram"
                  value={data?.energyJourney?.card2?.image || ""}
                  onChange={(url) => {
                    const c = { ...data.energyJourney.card2, image: url };
                    updateSection("energyJourney", "card2", c);
                  }}
                  folder="about"
                />
              </div>

              {/* Card 3: Regional Power Trade Breakdown */}
              <div className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">Card 3 · Regional Trade &amp; Demand Allocation</span>
                  <span className="text-[10px] text-slate-400 font-mono">10k + 5k + 15k MW</span>
                </div>
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
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white focus:outline-none focus:border-slate-400"
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
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white focus:outline-none focus:border-slate-400"
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
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Title (e.g. Power Flow & Regional Trade)"
                    value={data?.energyJourney?.card3?.title || ""}
                    onChange={(e) => {
                      const c = { ...data.energyJourney.card3, title: e.target.value };
                      updateSection("energyJourney", "card3", c);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
                <ImageUploadField
                  label="Card 3 Diagram / Map"
                  value={data?.energyJourney?.card3?.image || ""}
                  onChange={(url) => {
                    const c = { ...data.energyJourney.card3, image: url };
                    updateSection("energyJourney", "card3", c);
                  }}
                  folder="about"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: FOUR EDITIONS HISTORY
           ========================================================================= */}
        {activeTab === "journeyExpo" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">Four Editions History &amp; 5th Milestone Announcement</h2>
              <p className="text-xs text-slate-500 mt-0.5">The four historical editions (2018, 2019, 2022, 2024) and the official press meet banner.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Section Badge
                </label>
                <input
                  type="text"
                  value={data?.journeyExpo?.badge || ""}
                  onChange={(e) => updateSection("journeyExpo", "badge", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Gallery Link Text
                </label>
                <input
                  type="text"
                  value={data?.journeyExpo?.galleryLinkText || ""}
                  onChange={(e) => updateSection("journeyExpo", "galleryLinkText", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Edition Cards Editor */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Historical Edition Cards</h3>
                  <p className="text-[11px] text-slate-500">Each edition features photo coverage, badge label, and key milestones.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const eds = [...(data?.journeyExpo?.editions || [])];
                    eds.push({ year: "2026", edition: "SPECIAL EDITION", image: "/images/event-photo-3.webp", desc: "Brief description of the edition." });
                    updateSection("journeyExpo", "editions", eds);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Edition</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(data?.journeyExpo?.editions || []).map((ed: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">Edition #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const eds = [...data.journeyExpo.editions];
                          eds.splice(idx, 1);
                          updateSection("journeyExpo", "editions", eds);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-2.5">
                      <input
                        type="text"
                        placeholder="Year"
                        value={ed.year}
                        onChange={(e) => {
                          const eds = [...data.journeyExpo.editions];
                          eds[idx].year = e.target.value;
                          updateSection("journeyExpo", "editions", eds);
                        }}
                        className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white focus:outline-none focus:border-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Edition label (e.g. 4TH EDITION)"
                        value={ed.edition}
                        onChange={(e) => {
                          const eds = [...data.journeyExpo.editions];
                          eds[idx].edition = e.target.value;
                          updateSection("journeyExpo", "editions", eds);
                        }}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:border-slate-400"
                      />
                    </div>

                    <ImageUploadField
                      label="Edition Cover Photo"
                      value={ed.image || ""}
                      onChange={(url) => {
                        const eds = [...data.journeyExpo.editions];
                        eds[idx].image = url;
                        updateSection("journeyExpo", "editions", eds);
                      }}
                      folder="about"
                    />

                    <textarea
                      rows={2}
                      placeholder="Edition accomplishments and highlights"
                      value={ed.desc}
                      onChange={(e) => {
                        const eds = [...data.journeyExpo.editions];
                        eds[idx].desc = e.target.value;
                        updateSection("journeyExpo", "editions", eds);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-400"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Milestone Teaser Card */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">5th Milestone Announcement Banner Card</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={data?.journeyExpo?.milestoneCard?.badge || ""}
                    onChange={(e) => {
                      const m = { ...data.journeyExpo.milestoneCard, badge: e.target.value };
                      updateSection("journeyExpo", "milestoneCard", m);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <ImageUploadField
                    label="Announcement Banner Image"
                    value={data?.journeyExpo?.milestoneCard?.bannerImage || ""}
                    onChange={(url) => {
                      const m = { ...data.journeyExpo.milestoneCard, bannerImage: url };
                      updateSection("journeyExpo", "milestoneCard", m);
                    }}
                    folder="about"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                    Announcement Copy
                  </label>
                  <textarea
                    rows={3}
                    value={data?.journeyExpo?.milestoneCard?.description || ""}
                    onChange={(e) => {
                      const m = { ...data.journeyExpo.milestoneCard, description: e.target.value };
                      updateSection("journeyExpo", "milestoneCard", m);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-400"
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
            {/* Section: Ecosystem */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">What The Expo Connects (Ecosystem)</h2>
                <p className="text-xs text-slate-500 mt-0.5">Orbiting tags representing developers, OEMs, EPC contractors, financial institutions, and utilities.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                    Section Badge
                  </label>
                  <input
                    type="text"
                    value={data?.ecosystemSection?.badge || ""}
                    onChange={(e) => updateSection("ecosystemSection", "badge", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                    Headline Line 2 (Accent)
                  </label>
                  <input
                    type="text"
                    value={data?.ecosystemSection?.titleLine2 || ""}
                    onChange={(e) => updateSection("ecosystemSection", "titleLine2", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-bold text-emerald-700 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700">
                    Ecosystem Stakeholder Sectors ({data?.ecosystemSection?.items?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const items = [...(data?.ecosystemSection?.items || [])];
                      items.push("NEW SECTOR / PARTNER CATEGORY");
                      updateSection("ecosystemSection", "items", items);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Sector</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {(data?.ecosystemSection?.items || []).map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200/90 bg-slate-50/60">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const items = [...data.ecosystemSection.items];
                          items[idx] = e.target.value;
                          updateSection("ecosystemSection", "items", items);
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono uppercase bg-white focus:outline-none focus:border-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const items = [...data.ecosystemSection.items];
                          items.splice(idx, 1);
                          updateSection("ecosystemSection", "items", items);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section: Experience Blocks */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">The Experience Blocks</h2>
                <p className="text-xs text-slate-500 mt-0.5">Edit the interactive experience categories (Exhibition, Conference, Networking, Business Deal-Making).</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(data?.experienceSection?.blocks || []).map((b: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">Experience #{idx + 1}</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Block title"
                      value={b.label}
                      onChange={(e) => {
                        const blocks = [...data.experienceSection.blocks];
                        blocks[idx].label = e.target.value;
                        updateSection("experienceSection", "blocks", blocks);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white focus:outline-none focus:border-slate-400"
                    />
                    <ImageUploadField
                      label="Block Cover Image"
                      value={b.img || ""}
                      onChange={(url) => {
                        const blocks = [...data.experienceSection.blocks];
                        blocks[idx].img = url;
                        updateSection("experienceSection", "blocks", blocks);
                      }}
                      folder="about"
                    />
                    <textarea
                      rows={2}
                      placeholder="Brief experience description"
                      value={b.desc}
                      onChange={(e) => {
                        const blocks = [...data.experienceSection.blocks];
                        blocks[idx].desc = e.target.value;
                        updateSection("experienceSection", "blocks", blocks);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-400"
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
                <h2 className="text-base font-bold text-slate-900">The Joint Organizers</h2>
                <p className="text-xs text-slate-500 mt-0.5">Institutional profiles, vector logos, and official websites for IPPAN and Event Solution.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* IPPAN Card */}
                <div className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">Organizer 1 · IPPAN</span>
                    <span className="text-[10px] text-slate-400 font-mono">Independent Power Producers</span>
                  </div>
                  <ImageUploadField
                    label="IPPAN Vector / Logo"
                    value={data?.organizersSection?.ippan?.logo || ""}
                    onChange={(url) => {
                      const o = { ...data.organizersSection.ippan, logo: url };
                      updateSection("organizersSection", "ippan", o);
                    }}
                    folder="organizers"
                  />
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={data?.organizersSection?.ippan?.title || ""}
                      onChange={(e) => {
                        const o = { ...data.organizersSection.ippan, title: e.target.value };
                        updateSection("organizersSection", "ippan", o);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={data?.organizersSection?.ippan?.website || ""}
                      onChange={(e) => {
                        const o = { ...data.organizersSection.ippan, website: e.target.value };
                        updateSection("organizersSection", "ippan", o);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1">
                      Profile Narrative
                    </label>
                    <textarea
                      rows={4}
                      value={data?.organizersSection?.ippan?.description || ""}
                      onChange={(e) => {
                        const o = { ...data.organizersSection.ippan, description: e.target.value };
                        updateSection("organizersSection", "ippan", o);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-400 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Event Solution Card */}
                <div className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-sky-800 uppercase tracking-wider">Organizer 2 · Event Solution</span>
                    <span className="text-[10px] text-slate-400 font-mono">Exhibition Management</span>
                  </div>
                  <ImageUploadField
                    label="Event Solution Logo"
                    value={data?.organizersSection?.eventSolution?.logo || ""}
                    onChange={(url) => {
                      const o = { ...data.organizersSection.eventSolution, logo: url };
                      updateSection("organizersSection", "eventSolution", o);
                    }}
                    folder="organizers"
                  />
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={data?.organizersSection?.eventSolution?.title || ""}
                      onChange={(e) => {
                        const o = { ...data.organizersSection.eventSolution, title: e.target.value };
                        updateSection("organizersSection", "eventSolution", o);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={data?.organizersSection?.eventSolution?.website || ""}
                      onChange={(e) => {
                        const o = { ...data.organizersSection.eventSolution, website: e.target.value };
                        updateSection("organizersSection", "eventSolution", o);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1">
                      Profile Narrative
                    </label>
                    <textarea
                      rows={4}
                      value={data?.organizersSection?.eventSolution?.description || ""}
                      onChange={(e) => {
                        const o = { ...data.organizersSection.eventSolution, description: e.target.value };
                        updateSection("organizersSection", "eventSolution", o);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-400 leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Committee: IPPAN Leadership */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">IPPAN Leadership Members</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Official committee members with photos, designations, and names.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const members = [...(data?.peopleSection?.ippanMembers || [])];
                    members.push({ name: "Executive Name", title: "Vice President, IPPAN", photo: "/images/committee/mohan-kumar-dangi.webp" });
                    updateSection("peopleSection", "ippanMembers", members);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add IPPAN Member</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(data?.peopleSection?.ippanMembers || []).map((p: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">IPPAN #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const members = [...data.peopleSection.ippanMembers];
                          members.splice(idx, 1);
                          updateSection("peopleSection", "ippanMembers", members);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => {
                          const members = [...data.peopleSection.ippanMembers];
                          members[idx].name = e.target.value;
                          updateSection("peopleSection", "ippanMembers", members);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-slate-400"
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
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono bg-white text-emerald-700 focus:outline-none focus:border-slate-400"
                        placeholder="Designation / Title"
                      />
                    </div>
                    <ImageUploadField
                      label="Portrait Photo"
                      value={p.photo || ""}
                      onChange={(url) => {
                        const members = [...data.peopleSection.ippanMembers];
                        members[idx].photo = url;
                        updateSection("peopleSection", "ippanMembers", members);
                      }}
                      folder="committee"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Committee: Event Solution Team */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Event Solution Team Members</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Directors and operational executives with portraits.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const members = [...(data?.peopleSection?.eventSolutionMembers || [])];
                    members.push({ name: "Team Member", title: "Operations Director", photo: "/images/eventsolution/sunil-bhandari.webp" });
                    updateSection("peopleSection", "eventSolutionMembers", members);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Event Solution Member</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(data?.peopleSection?.eventSolutionMembers || []).map((p: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">Team #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const members = [...data.peopleSection.eventSolutionMembers];
                          members.splice(idx, 1);
                          updateSection("peopleSection", "eventSolutionMembers", members);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => {
                          const members = [...data.peopleSection.eventSolutionMembers];
                          members[idx].name = e.target.value;
                          updateSection("peopleSection", "eventSolutionMembers", members);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-slate-400"
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
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono bg-white text-sky-700 focus:outline-none focus:border-slate-400"
                        placeholder="Designation / Title"
                      />
                    </div>
                    <ImageUploadField
                      label="Portrait Photo"
                      value={p.photo || ""}
                      onChange={(url) => {
                        const members = [...data.peopleSection.eventSolutionMembers];
                        members[idx].photo = url;
                        updateSection("peopleSection", "eventSolutionMembers", members);
                      }}
                      folder="committee"
                    />
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
              <h2 className="text-base font-bold text-slate-900">The 5th Edition Showcase (Dark Finale Section)</h2>
              <p className="text-xs text-slate-500 mt-0.5">The grand finale hero section with background imagery, official logo, and registration CTA.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50">
                <ImageUploadField
                  label="Official Logo Image"
                  value={data?.fifthEditionDark?.logo || ""}
                  onChange={(url) => updateSection("fifthEditionDark", "logo", url)}
                  folder="about"
                  placeholder="Upload or paste official logo URL"
                />
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50">
                <ImageUploadField
                  label="Dark Finale Background Backdrop"
                  value={data?.fifthEditionDark?.backgroundImage || ""}
                  onChange={(url) => updateSection("fifthEditionDark", "backgroundImage", url)}
                  folder="about"
                  placeholder="Upload or paste background image URL"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Sub-badge 1
                </label>
                <input
                  type="text"
                  value={data?.fifthEditionDark?.badge1 || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "badge1", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-mono text-emerald-700 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Sub-badge 2
                </label>
                <input
                  type="text"
                  value={data?.fifthEditionDark?.badge2 || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "badge2", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-mono text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Headline Part 1
                </label>
                <input
                  type="text"
                  value={data?.fifthEditionDark?.titleLine1 || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "titleLine1", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Headline Highlight (Emerald Word)
                </label>
                <input
                  type="text"
                  value={data?.fifthEditionDark?.titleHighlight || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "titleHighlight", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-bold text-emerald-700 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Headline Part 2
                </label>
                <input
                  type="text"
                  value={data?.fifthEditionDark?.titleLine2 || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "titleLine2", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Finale Narrative Paragraph
                </label>
                <textarea
                  rows={3}
                  value={data?.fifthEditionDark?.description || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "description", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-slate-400 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Explore Button Label
                </label>
                <input
                  type="text"
                  value={data?.fifthEditionDark?.exploreButtonText || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "exploreButtonText", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Register Button Label
                </label>
                <input
                  type="text"
                  value={data?.fifthEditionDark?.registerButtonText || ""}
                  onChange={(e) => updateSection("fifthEditionDark", "registerButtonText", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Save Bar */}
      <div className="sticky bottom-6 z-40 bg-white/95 backdrop-blur-md p-3.5 px-5 rounded-2xl border border-slate-200/90 shadow-xl flex items-center justify-between gap-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-600 font-medium">Ready to update About page live.</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/about"
            target="_blank"
            className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 transition-colors"
          >
            <span>Preview on site</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
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

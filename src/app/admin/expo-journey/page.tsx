"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Save,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Calendar,
  Layers,
  Loader2,
  Image as ImageIcon,
  Compass,
} from "lucide-react";
import defaultJourneyData from "@/data/expoJourneyData.json";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export default function AdminExpoJourneyPage() {
  const [data, setData] = useState<any>(defaultJourneyData);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/expo-journey");
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Error loading journey data:", err);
      }
    }
    loadData();
  }, []);

  const notify = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/expo-journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        notify("Expo Journey content saved successfully!");
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
    if (confirm("Are you sure you want to reset all Expo Journey content to default values?")) {
      setData(defaultJourneyData);
      notify("Reset to default content. Click 'Save Changes' to apply.");
    }
  };

  const updateHeader = (field: string, val: string) => {
    setData((prev: any) => ({
      ...prev,
      header: {
        ...(prev.header || {}),
        [field]: val,
      },
    }));
  };

  const updateEdition = (index: number, field: string, val: string) => {
    setData((prev: any) => {
      const updated = [...(prev.editions || [])];
      updated[index] = {
        ...updated[index],
        [field]: val,
      };
      return { ...prev, editions: updated };
    });
  };

  const addEdition = () => {
    setData((prev: any) => {
      const currentList = prev.editions || [];
      const newIndex = currentList.length + 1;
      const newEdition = {
        id: `edition-${Date.now()}`,
        year: `${2024 + newIndex}`,
        edition: `${newIndex}TH EDITION`,
        phase: "NEW MILESTONE",
        title: "Advancing clean energy in Nepal.",
        story: "Milestone story and historical significance of this edition.",
        meta: "Trade Floor · Global Visitors",
        image: "/images/event-photo-6.webp",
        caption: "Exhibition delegates and pavilions.",
      };
      return {
        ...prev,
        editions: [...currentList, newEdition],
      };
    });
  };

  const removeEdition = (index: number) => {
    if (confirm("Are you sure you want to delete this edition from the journey?")) {
      setData((prev: any) => {
        const updated = [...(prev.editions || [])];
        updated.splice(index, 1);
        return { ...prev, editions: updated };
      });
    }
  };

  const header = data.header || defaultJourneyData.header;
  const editions = data.editions || defaultJourneyData.editions;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-lg border flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            toastMsg.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
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
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Homepage Section CMS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            The Expo Journey CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Update the title, subtitle, historical milestone cards, stories, and showcase images for &quot;THE EXPO JOURNEY: Four Editions. One Green Journey.&quot; on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/#expo-journey"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Live View</span>
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

      {/* ─── 01: SECTION HEADER & TITLES ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Section Titles &amp; Branding</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Header Meta</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Text</label>
            <input
              type="text"
              value={header.badge || ""}
              onChange={(e) => updateHeader("badge", e.target.value)}
              placeholder="THE EXPO JOURNEY"
              className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline Pill</label>
            <input
              type="text"
              value={header.tagline || ""}
              onChange={(e) => updateHeader("tagline", e.target.value)}
              placeholder="A Decade of Verified Clean Impact"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title (First Part)</label>
            <input
              type="text"
              value={header.title || ""}
              onChange={(e) => updateHeader("title", e.target.value)}
              placeholder="Four Editions."
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title Highlight (Green Part)</label>
            <input
              type="text"
              value={header.titleHighlight || ""}
              onChange={(e) => updateHeader("titleHighlight", e.target.value)}
              placeholder="One Green Journey."
              className="w-full text-xs font-bold text-emerald-700 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle Description</label>
            <input
              type="text"
              value={header.subtitle || ""}
              onChange={(e) => updateHeader("subtitle", e.target.value)}
              placeholder="A verified track record of advancing clean energy and cross-border power in Nepal."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* ─── 02: JOURNEY EDITIONS LIST ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Edition Stories &amp; Visuals ({editions.length})
            </h3>
            <p className="text-xs text-slate-500">
              Each card corresponds to one milestone edition in the timeline.
            </p>
          </div>

          <button
            type="button"
            onClick={addEdition}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Edition</span>
          </button>
        </div>

        <div className="space-y-4">
          {editions.map((edition: any, index: number) => (
            <div
              key={edition.id || index}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4 relative group"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {edition.year || "Year"} · {edition.edition || "Edition"}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {edition.phase || "Phase"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeEdition(index)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete edition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left: Image Upload Field (5 cols) */}
                <div className="lg:col-span-5 space-y-2">
                  <ImageUploadField
                    label="Showcase Photography"
                    value={edition.image || ""}
                    onChange={(url) => updateEdition(index, "image", url)}
                    folder="journey"
                    placeholder="/images/gallery/... or upload"
                  />
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Image Caption Overlay
                    </label>
                    <input
                      type="text"
                      value={edition.caption || ""}
                      onChange={(e) => updateEdition(index, "caption", e.target.value)}
                      placeholder="Caption shown over photo..."
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Right: Text Fields (7 cols) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Year
                      </label>
                      <input
                        type="text"
                        value={edition.year || ""}
                        onChange={(e) => updateEdition(index, "year", e.target.value)}
                        placeholder="2018"
                        className="w-full text-xs font-mono font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Edition Badge
                      </label>
                      <input
                        type="text"
                        value={edition.edition || ""}
                        onChange={(e) => updateEdition(index, "edition", e.target.value)}
                        placeholder="1ST EDITION"
                        className="w-full text-xs font-mono p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Theme Phase
                      </label>
                      <input
                        type="text"
                        value={edition.phase || ""}
                        onChange={(e) => updateEdition(index, "phase", e.target.value)}
                        placeholder="THE INAUGURAL CONVERGENCE"
                        className="w-full text-xs font-mono p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Headline Title
                    </label>
                    <input
                      type="text"
                      value={edition.title || ""}
                      onChange={(e) => updateEdition(index, "title", e.target.value)}
                      placeholder="Where the clean energy movement began."
                      className="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Narrative Story
                    </label>
                    <textarea
                      rows={3}
                      value={edition.story || ""}
                      onChange={(e) => updateEdition(index, "story", e.target.value)}
                      placeholder="Full documentary story of this edition..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Meta Tagline (Bottom highlight)
                    </label>
                    <input
                      type="text"
                      value={edition.meta || ""}
                      onChange={(e) => updateEdition(index, "meta", e.target.value)}
                      placeholder="Inaugural Trade Floor · 10,000+ Visitors"
                      className="w-full text-xs font-mono text-emerald-800 p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Save Bar */}
      <div className="sticky bottom-6 z-30 bg-slate-900/95 text-white p-3 sm:p-4 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Changes are saved to the server and reflected instantly on the homepage.</span>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
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
  );
}

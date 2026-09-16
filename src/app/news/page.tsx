"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { newsData as defaultNews } from "@/data/news";
import { NewsArticle } from "@/lib/types";
import {
  ArrowRight,
  Calendar,
  ExternalLink,
  Newspaper,
  Sparkles,
  Search,
  Globe2,
  Plus,
  Loader2,
  CheckCircle2,
  X,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [articles, setArticles] = useState<NewsArticle[]>(defaultNews);

  // Add from URL modal / state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>("");
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [previewArticle, setPreviewArticle] = useState<Partial<NewsArticle> | null>(null);

  // Load custom added news from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("expo_custom_news");
      if (stored) {
        const customItems: NewsArticle[] = JSON.parse(stored);
        setArticles([...customItems, ...defaultNews]);
      }
    } catch {
      // ignore
    }
  }, []);

  const categories = [
    "ALL",
    "Policy & Market",
    "Technology",
    "Expo Update",
    "Press Release",
    "News Coverage",
  ];

  // Fetch OpenGraph metadata from entered URL
  const handleFetchPreview = async () => {
    if (!inputUrl.trim()) return;

    setIsScraping(true);
    setScrapeError(null);
    setPreviewArticle(null);

    try {
      const res = await fetch("/api/news/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to extract metadata from link");
      }

      setPreviewArticle({
        id: `news-${Date.now()}`,
        slug: `news-${Date.now()}`,
        title: data.title,
        summary: data.summary,
        image: data.image,
        sourceName: data.sourceName,
        sourceUrl: data.sourceUrl,
        date: data.date,
        category: data.category || "News Coverage",
        author: data.sourceName,
        readTime: "3 min read",
        featured: false,
        content: [data.summary],
      });
    } catch (err: any) {
      setScrapeError(err?.message || "Could not fetch metadata from link.");
    } finally {
      setIsScraping(false);
    }
  };

  // Add the scraped/custom news to the list & localStorage
  const handleAddNews = () => {
    if (!previewArticle || !previewArticle.title) return;

    const newArticle: NewsArticle = {
      id: previewArticle.id || `news-${Date.now()}`,
      slug: previewArticle.slug || `news-${Date.now()}`,
      title: previewArticle.title || "Untitled Article",
      summary: previewArticle.summary || "",
      image: previewArticle.image || "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
      sourceName: previewArticle.sourceName || "External Publisher",
      sourceUrl: previewArticle.sourceUrl || inputUrl,
      date: previewArticle.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      category: (previewArticle.category as any) || "News Coverage",
      author: previewArticle.sourceName || "Publisher",
      readTime: "3 min read",
      featured: false,
      content: [previewArticle.summary || ""],
    };

    const updatedList = [newArticle, ...articles];
    setArticles(updatedList);

    // Save custom items to local storage
    try {
      const stored = localStorage.getItem("expo_custom_news");
      const currentCustom: NewsArticle[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem("expo_custom_news", JSON.stringify([newArticle, ...currentCustom]));
    } catch {
      // ignore
    }

    // Reset form
    setShowAddModal(false);
    setInputUrl("");
    setPreviewArticle(null);
  };

  const filteredNews = useMemo(() => {
    return articles.filter((item) => {
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sourceName &&
          item.sourceName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, articles]);

  return (
    <div className="min-h-screen bg-[#F8FAFB] font-sans text-slate-900 flex flex-col">
      {/* =========================================================================
          01: HEADER (GREEN THEME)
         ========================================================================= */}
      <div className="bg-[#04281E] text-white pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-300/70 font-mono mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#34D399]">News & Media</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                News & Press Coverage
              </h1>
              <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-xl font-normal">
                National and international media dispatches, ministerial press releases, and editorial coverage of the Himalayan Green Energy Expo.
              </p>
            </div>

            {/* Top Action: Add News from Link Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 rounded-full bg-[#10B981] hover:bg-[#059669] text-slate-950 hover:text-white font-mono text-xs font-black flex items-center gap-2 transition-all shadow-md hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>ADD NEWS BY LINK</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02: MAIN NEWS GRID
         ========================================================================= */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#087EA4] text-white shadow-xs"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search coverage or outlet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-normal placeholder:text-slate-400 focus:outline-none focus:border-[#087EA4] shadow-xs"
              />
            </div>
          </div>

          {/* Quick Notice */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>SHOWING {filteredNews.length} ARTICLES & REPORTS</span>
            <span className="hidden sm:inline">CLICK ANY CARD TO OPEN ORIGINAL ARTICLE ↗</span>
          </div>

          {/* News Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredNews.map((article) => {
              const targetUrl = article.sourceUrl || `/news/${article.slug}`;
              const isExternal = Boolean(article.sourceUrl);

              return (
                <a
                  key={article.id}
                  href={targetUrl}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="group rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#087EA4]/50 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Thumbnail Image Container */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Top Source Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-md text-[10px] font-mono font-bold text-[#061A2A] uppercase tracking-wider shadow-sm">
                          {article.sourceName || "Media Coverage"}
                        </span>
                      </div>

                      {/* Top Right External Link Icon */}
                      <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 opacity-80 group-hover:opacity-100 group-hover:bg-[#087EA4] transition-all">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>

                      {/* Bottom Date inside Image */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/90">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#38BDF8]" />
                          {article.date}
                        </span>
                        <span className="text-[#34D399] font-bold uppercase text-[10px]">
                          {article.category}
                        </span>
                      </div>
                    </div>

                    {/* Article Content */}
                    <div className="p-5 space-y-2">
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-[#087EA4] transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-3">
                        {article.summary}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Bar */}
                  <div className="px-5 py-3.5 border-t border-slate-100 bg-[#F8FAFB] flex items-center justify-between text-xs font-mono font-bold text-[#087EA4] group-hover:text-[#059669] transition-colors">
                    <span>READ FULL ARTICLE</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              );
            })}
          </div>

          {filteredNews.length === 0 && (
            <div className="py-20 text-center space-y-3">
              <Newspaper className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">
                No matching news articles found
              </h3>
              <p className="text-xs text-slate-500">
                Try selecting a different category or clearing your search filter.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          03: "ADD NEWS BY LINK" INTERACTIVE MODAL
         ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#061A2A] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#38BDF8]" />
                <span className="font-bold text-sm">Add News Card by URL</span>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setPreviewArticle(null);
                  setInputUrl("");
                  setScrapeError(null);
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
              {/* Step 1: Input URL */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block">
                  Paste News Article URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://thehimalayantimes.com/nepal/..."
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#087EA4]"
                  />
                  <button
                    onClick={handleFetchPreview}
                    disabled={isScraping || !inputUrl.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#087EA4] hover:bg-[#061A2A] disabled:bg-slate-300 text-white font-mono text-xs font-bold flex items-center gap-2 transition-all"
                  >
                    {isScraping ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Fetch Preview</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Enter any article link from Kathmandu Post, Himalayan Times, OnlineKhabar, Urja Khabar, etc. to automatically pull the thumbnail, title, and description.
                </p>
              </div>

              {/* Scrape Error */}
              {scrapeError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {scrapeError}
                </div>
              )}

              {/* Step 2: Live Scraped Preview & Edit */}
              {previewArticle && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#059669] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Metadata Extracted Successfully
                    </span>
                  </div>

                  {/* Card Preview */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="relative h-40 w-full rounded-xl overflow-hidden bg-slate-800">
                      <Image
                        src={previewArticle.image || "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80"}
                        alt="Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                          Article Title
                        </label>
                        <input
                          type="text"
                          value={previewArticle.title || ""}
                          onChange={(e) =>
                            setPreviewArticle({
                              ...previewArticle,
                              title: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                          Description / Summary
                        </label>
                        <textarea
                          rows={2}
                          value={previewArticle.summary || ""}
                          onChange={(e) =>
                            setPreviewArticle({
                              ...previewArticle,
                              summary: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                            Publisher / Source
                          </label>
                          <input
                            type="text"
                            value={previewArticle.sourceName || ""}
                            onChange={(e) =>
                              setPreviewArticle({
                                ...previewArticle,
                                sourceName: e.target.value,
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                            Category
                          </label>
                          <select
                            value={previewArticle.category || "News Coverage"}
                            onChange={(e) =>
                              setPreviewArticle({
                                ...previewArticle,
                                category: e.target.value as any,
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800"
                          >
                            {categories.filter((c) => c !== "ALL").map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setPreviewArticle(null);
                  setInputUrl("");
                }}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleAddNews}
                disabled={!previewArticle || !previewArticle.title}
                className="px-6 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] disabled:bg-slate-300 text-slate-950 font-mono text-xs font-black shadow-md transition-all"
              >
                Publish to News Feed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

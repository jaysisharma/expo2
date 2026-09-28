"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { NewsArticle } from "@/lib/types";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Globe,
  Newspaper,
  Search,
  Loader2,
  X,
} from "lucide-react";

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load dynamic news from API & localStorage
  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/data?t=" + Date.now(), { cache: "no-store" });
      const json = await res.json();
      const adminNews: NewsArticle[] =
        json.success && Array.isArray(json.data?.news) ? json.data.news : [];

      let localNews: NewsArticle[] = [];
      try {
        const stored = localStorage.getItem("expo_custom_news");
        if (stored) localNews = JSON.parse(stored);
      } catch {}

      // Combine admin news + local news avoiding duplicates
      const seen = new Set<string>();
      const combined: NewsArticle[] = [];

      for (const item of [...adminNews, ...localNews]) {
        const key = item.id || item.slug || item.title;
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(item);
        }
      }

      setArticles(combined);
    } catch {
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredNews = useMemo(() => {
    return articles.filter((item) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        (item.sourceName && item.sourceName.toLowerCase().includes(query))
      );
    });
  }, [searchQuery, articles]);

  const showHeroCard = searchQuery.trim() === "" && filteredNews.length > 0;
  const leadArticle = showHeroCard ? filteredNews[0] : null;
  const gridArticles = showHeroCard ? filteredNews.slice(1) : filteredNews;

  return (
    <div className="min-h-screen bg-[#F8FAFB] font-sans text-slate-900 flex flex-col">
      {/* Page Header */}
      <div className="bg-[#04281E] text-white pt-28 sm:pt-32 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20 relative overflow-hidden">
        {/* Subtle Ambient Light Glow */}
        <div
          aria-hidden="true"
          className="absolute -top-24 right-1/4 w-[500px] h-[300px] bg-gradient-to-b from-[#12B981]/15 to-transparent blur-3xl pointer-events-none rounded-full"
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-300/70 font-mono mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#34D399]">News &amp; Media</span>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Official Media Hub &amp; Press Dispatches
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-inter-tight">
              News &amp; Press Coverage
            </h1>
            <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-2xl font-normal leading-relaxed">
              National and international media dispatches, ministerial announcements, and editorial coverage of the Himalayan Green Energy Expo 2027.
            </p>
          </div>
        </div>
      </div>

      {/* Main News Content */}
      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Toolbar: Articles Counter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            {/* Articles Status Indicator */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-[#005C42]" />
              <span>
                {filteredNews.length} {filteredNews.length === 1 ? "Article" : "Articles"} Published
              </span>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles, outlets, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#005C42] focus:ring-2 focus:ring-[#005C42]/15 shadow-xs transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#007A5E] mx-auto" />
              <p className="text-xs text-slate-500 font-mono">Loading published dispatches...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            /* Empty State */
            <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#007A5E] flex items-center justify-center mx-auto">
                <Newspaper className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-800">
                  {searchQuery ? `No articles matching "${searchQuery}"` : "No articles published yet"}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {searchQuery
                    ? "Try searching with different keywords like 'hydropower', 'expo', 'investment', or media outlet name."
                    : "Published media coverage and announcements will appear here."}
                </p>
              </div>

              {searchQuery && (
                <div className="pt-2 flex items-center justify-center">
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 rounded-xl bg-[#005C42] hover:bg-[#004833] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* ── Featured Lead Story Hero Card (When Unfiltered) ── */}
              {leadArticle && (
                <a
                  href={leadArticle.sourceUrl || (leadArticle.slug ? `/news/${leadArticle.slug}` : "/news")}
                  target={leadArticle.sourceUrl ? "_blank" : undefined}
                  rel={leadArticle.sourceUrl ? "noopener noreferrer" : undefined}
                  className="group relative rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_48px_-12px_rgba(0,92,66,0.16)] hover:border-emerald-300 transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12 cursor-pointer"
                >
                  {/* Top Ambient Highlight */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#005C42] via-[#12B981] to-[#5B9F35] z-20" />

                  {/* Image Column */}
                  <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[340px] lg:h-full w-full overflow-hidden bg-slate-900">
                    {leadArticle.image ? (
                      <Image
                        src={leadArticle.image}
                        alt={leadArticle.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-800">
                        <Newspaper className="w-12 h-12 opacity-40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Top Floating Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold text-slate-900 shadow-xs border border-white/60 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="truncate max-w-[160px]">{leadArticle.sourceName || "Media Coverage"}</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#005C42] text-white text-[10.5px] font-mono font-bold tracking-wider uppercase shadow-xs">
                        FEATURED
                      </span>
                    </div>

                    {/* Bottom Image Date Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{leadArticle.date}</span>
                      </span>
                      {leadArticle.readTime && (
                        <span className="flex items-center gap-1 text-slate-200">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span>{leadArticle.readTime}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Editorial Narrative Column */}
                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-9 flex flex-col justify-between space-y-5 bg-gradient-to-b from-white to-slate-50/50">
                    <div className="space-y-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold tracking-wide px-3 py-1 rounded-full bg-emerald-50 text-[#005C42] border border-emerald-200/80 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{leadArticle.sourceName || "Official Press"}</span>
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-bold font-inter-tight text-slate-900 group-hover:text-[#005C42] leading-snug transition-colors duration-200">
                        {leadArticle.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed line-clamp-3 lg:line-clamp-4">
                        {leadArticle.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate max-w-[140px] sm:max-w-[170px]">
                          {leadArticle.sourceName || "Official Publication"}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#005C42] group-hover:bg-[#004833] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs group-hover:shadow-md">
                        <span>Read Full Story</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </a>
              )}

              {/* ── Clean News Cards Grid ─────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {gridArticles.map((article) => {
                  const targetUrl =
                    article.sourceUrl || (article.slug ? `/news/${article.slug}` : "/news");
                  const isExternal = Boolean(article.sourceUrl);

                  return (
                    <a
                      key={article.id}
                      href={targetUrl}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="group relative rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_35px_-8px_rgba(0,92,66,0.12)] hover:border-emerald-300/80 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                    >
                      {/* Top Animated Accent Border on Hover */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#005C42] via-[#12B981] to-[#5B9F35] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

                      <div>
                        {/* Thumbnail Image Container */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                          {article.image ? (
                            <Image
                              src={article.image}
                              alt={article.title}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-800">
                              <Newspaper className="w-10 h-10 opacity-40" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

                          {/* Top Floating Source Badge */}
                          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
                            <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold text-slate-800 tracking-tight shadow-xs border border-white/60 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="truncate max-w-[150px]">
                                {article.sourceName || "Media Coverage"}
                              </span>
                            </span>
                          </div>

                          {/* Top Right External Arrow Indicator */}
                          <div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 group-hover:bg-[#005C42] group-hover:border-[#005C42] group-hover:scale-110 transition-all duration-300">
                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>

                          {/* Bottom Image Date & Read Time Overlay */}
                          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-[11px] font-medium text-white/90">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{article.date}</span>
                            </span>
                            {article.readTime && (
                              <span className="flex items-center gap-1 text-slate-200 text-[10.5px]">
                                <Clock className="w-3 h-3 text-slate-300" />
                                <span>{article.readTime}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 sm:p-6 space-y-2.5">
                          {/* Title */}
                          <h3 className="font-bold text-[17px] sm:text-[18px] text-slate-900 font-inter-tight group-hover:text-[#005C42] transition-colors duration-200 leading-[1.35] line-clamp-2">
                            {article.title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-[13px] text-slate-500 font-normal leading-relaxed line-clamp-2 sm:line-clamp-3">
                            {article.summary}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer Bar */}
                      <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs mt-auto">
                        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate max-w-[130px] sm:max-w-[150px]">
                            {article.sourceName || "Official Release"}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-[#005C42] group-hover:text-emerald-700 transition-colors">
                          <span>Read Story</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

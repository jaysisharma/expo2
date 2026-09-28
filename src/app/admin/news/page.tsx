"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Star,
  ExternalLink,
  CheckCircle2,
  X,
  Save,
  LayoutGrid,
  List,
  AlertCircle,
  Globe,
  Newspaper,
  Loader2,
  Eye,
} from "lucide-react";
import { NewsArticle } from "@/lib/types";

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Modals & Editing
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "url">("manual");
  const [urlInput, setUrlInput] = useState("");
  const [isUrlExtracting, setIsUrlExtracting] = useState(false);
  const [urlExtractError, setUrlExtractError] = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type?: "success" | "error" } | null>(null);

  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  const notify = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Fetch articles from backend / localStorage on mount (no static mock items)
  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/data?t=" + Date.now(), { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.news) && json.data.news.length > 0) {
        setArticles(json.data.news);
      } else {
        try {
          const stored = localStorage.getItem("expo_custom_news");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setArticles(parsed);
              fetch("/api/admin/data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "save_all_news", payload: { news: parsed } }),
              }).catch(() => {});
            } else {
              setArticles([]);
            }
          } else {
            setArticles([]);
          }
        } catch {
          setArticles([]);
        }
      }
    } catch {
      notify("Failed to load articles", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const categories = [
    "All",
    "Expo Update",
    "Policy & Market",
    "Technology",
    "Press Release",
    "News Coverage",
  ];

  // Filtered Articles
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchesCat = selectedCategory === "All" || a.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.summary && a.summary.toLowerCase().includes(q)) ||
        (a.author && a.author.toLowerCase().includes(q)) ||
        (a.sourceName && a.sourceName.toLowerCase().includes(q));

      return matchesCat && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  // Master Checkbox State
  const filteredIds = useMemo(() => filteredArticles.map((a) => a.id), [filteredArticles]);
  const isAllFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));
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

  const handleToggleFeatured = async (id: string) => {
    const updated = articles.map((a) =>
      a.id === id ? { ...a, featured: !a.featured } : a
    );
    setArticles(updated);

    try {
      localStorage.setItem("expo_custom_news", JSON.stringify(updated));
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_news_featured", payload: { id } }),
      });
      const art = updated.find((a) => a.id === id);
      notify(art?.featured ? "Article featured on homepage" : "Article removed from featured");
    } catch {
      notify("Failed to update status", "error");
    }
  };

  const handleDeleteSingle = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    const updated = articles.filter((a) => a.id !== id);
    setArticles(updated);
    setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));

    try {
      localStorage.setItem("expo_custom_news", JSON.stringify(updated));
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_news", payload: { id } }),
      });
      notify("Article deleted successfully");
    } catch {
      notify("Failed to delete article", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);

    const idsSet = new Set(selectedIds);
    const updated = articles.filter((a) => !idsSet.has(a.id));
    const count = selectedIds.length;

    try {
      setArticles(updated);
      setSelectedIds([]);
      setShowBulkDeleteModal(false);

      localStorage.setItem("expo_custom_news", JSON.stringify(updated));
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_multiple_news",
          payload: { ids: Array.from(idsSet) },
        }),
      });

      notify(`${count} article${count > 1 ? "s" : ""} deleted successfully`);
    } catch {
      notify("Failed to delete articles", "error");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    const updated = articles.map((a) =>
      a.id === editingArticle.id ? editingArticle : a
    );
    setArticles(updated);
    setEditingArticle(null);

    try {
      localStorage.setItem("expo_custom_news", JSON.stringify(updated));
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_news",
          payload: { article: editingArticle },
        }),
      });
      notify("Article updated successfully");
    } catch {
      notify("Failed to save changes", "error");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = (formData.get("title") as string)?.trim();
    const category = formData.get("category") as any;
    const author = (formData.get("author") as string)?.trim();
    const sourceName = (formData.get("sourceName") as string)?.trim();
    const sourceUrl = (formData.get("sourceUrl") as string)?.trim();
    const summary = (formData.get("summary") as string)?.trim();
    const contentText = (formData.get("content") as string)?.trim();
    const imageUrl = (formData.get("image") as string)?.trim();
    const featured = formData.get("featured") === "on";

    if (!title) return;

    const newArt: NewsArticle = {
      id: `news-${Date.now()}`,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      title,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      category: category || "Expo Update",
      author: author || "IPPAN Communications Desk",
      sourceName: sourceName || "IPPAN Press",
      sourceUrl: sourceUrl || "",
      readTime: "3 min read",
      summary: summary || title,
      content: contentText ? contentText.split("\n\n").filter(Boolean) : [summary || title],
      image:
        imageUrl ||
        "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
      featured: featured ?? false,
    };

    const updated = [newArt, ...articles];
    setArticles(updated);
    setShowAddModal(false);
    setUrlInput("");
    setUrlExtractError(null);

    try {
      localStorage.setItem("expo_custom_news", JSON.stringify(updated));
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_news",
          payload: { article: newArt },
        }),
      });
      notify("News article published successfully");
    } catch {
      notify("Article saved locally", "success");
    }
  };

  const handleExtractFromUrl = async () => {
    if (!urlInput.trim()) return;
    setIsUrlExtracting(true);
    setUrlExtractError(null);

    try {
      const res = await fetch("/api/news/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to extract metadata");

      const newArt: NewsArticle = {
        id: `news-${Date.now()}`,
        slug: (data.title || "article")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        title: data.title || "External News Story",
        summary: data.summary || "",
        image:
          data.image ||
          "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
        sourceName: data.sourceName || "News Portal",
        sourceUrl: data.sourceUrl || urlInput.trim(),
        date: data.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        category: "News Coverage",
        author: data.sourceName || "Publisher Desk",
        readTime: "3 min read",
        featured: false,
        content: [data.summary || ""],
      };

      const updated = [newArt, ...articles];
      setArticles(updated);
      setShowAddModal(false);
      setUrlInput("");

      localStorage.setItem("expo_custom_news", JSON.stringify(updated));
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_news", payload: { article: newArt } }),
      });
      notify("Article imported & published");
    } catch (err: any) {
      setUrlExtractError(err?.message || "Failed to fetch webpage details");
    } finally {
      setIsUrlExtracting(false);
    }
  };

  const featuredCount = articles.filter((a) => a.featured).length;

  return (
    <div className="space-y-5 font-sans">
      {/* Toast Notification */}
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
              Newsroom
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              News & Announcements
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage published news, press releases, and editorial updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAddMode("manual");
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Article</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search, Category Tabs, View Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const count =
              cat === "All"
                ? articles.length
                : articles.filter((a) => a.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right side: Search & View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search headline, author..."
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59] focus:bg-white transition-all"
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

      {/* Floating Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-30 p-2.5 px-4 rounded-xl bg-slate-900 text-white shadow-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[11px]">
              {selectedIds.length}
            </span>
            <span className="font-medium text-slate-200">
              {selectedIds.length === 1 ? "1 article selected" : `${selectedIds.length} articles selected`}
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

      {/* Content Area: Table or Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-[#218A59] mb-2" />
          <span className="text-xs">Loading articles...</span>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="py-16 px-4 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Newspaper className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            {searchQuery || selectedCategory !== "All"
              ? "No matching articles found"
              : "No articles published yet"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
            {searchQuery || selectedCategory !== "All"
              ? "Try changing your search keywords or switching category filters."
              : "Get started by publishing your first announcement or article."}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAddMode("manual");
                setShowAddModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Article</span>
            </button>
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* Minimal Clean Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
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
                  <th className="py-3 px-3 min-w-[280px]">Article & Details</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Author / Source</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-center w-16">Featured</th>
                  <th className="py-3 pr-4 pl-3 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredArticles.map((article) => {
                  const isSelected = selectedIds.includes(article.id);

                  return (
                    <tr
                      key={article.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? "bg-emerald-50/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(article.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#218A59] focus:ring-[#218A59] cursor-pointer"
                        />
                      </td>

                      {/* Article Headline & Thumbnail */}
                      <td className="py-3 px-3">
                        <div className="flex items-start gap-3">
                          <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {article.image ? (
                              <Image
                                src={article.image}
                                alt={article.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Newspaper className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-slate-900 leading-snug line-clamp-1 hover:text-[#218A59] transition-colors">
                              {article.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {article.summary}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                              <span>{article.readTime || "3 min read"}</span>
                              {article.sourceUrl && (
                                <>
                                  <span>·</span>
                                  <a
                                    href={article.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-slate-500 hover:text-slate-800 flex items-center gap-0.5"
                                  >
                                    <span>source</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {article.category}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <span className="line-clamp-1 max-w-[140px]" title={article.author || article.sourceName}>
                          {article.author || article.sourceName || "IPPAN Desk"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {article.date}
                      </td>

                      {/* Featured */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleFeatured(article.id)}
                          className={`p-1 rounded-lg transition-colors cursor-pointer ${
                            article.featured
                              ? "text-amber-500 hover:text-amber-600"
                              : "text-slate-300 hover:text-slate-500"
                          }`}
                          title={article.featured ? "Featured on Home (Click to remove)" : "Click to feature"}
                        >
                          <Star className={`w-4 h-4 ${article.featured ? "fill-amber-400" : ""}`} />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 pr-4 pl-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={article.slug ? `/news/${article.slug}` : "/news"}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Preview article"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setEditingArticle(article)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#218A59] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSingle(article.id, article.title)}
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

          {/* Table Footer info */}
          <div className="p-3 px-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Showing {filteredArticles.length} of {articles.length} articles
            </span>
            <span>{featuredCount} featured on homepage</span>
          </div>
        </div>
      ) : (
        /* Minimal Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((article) => {
            const isSelected = selectedIds.includes(article.id);

            return (
              <div
                key={article.id}
                className={`bg-white rounded-xl border transition-all p-3.5 flex flex-col justify-between gap-3 shadow-xs ${
                  isSelected
                    ? "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  {/* Top Bar inside card */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(article.id)}
                      className="w-4 h-4 rounded border-slate-300 text-[#218A59] focus:ring-[#218A59] cursor-pointer"
                    />

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {article.category}
                      </span>
                      <button
                        onClick={() => handleToggleFeatured(article.id)}
                        className={`p-1 rounded-md cursor-pointer ${
                          article.featured ? "text-amber-500" : "text-slate-300 hover:text-slate-500"
                        }`}
                        title={article.featured ? "Featured" : "Click to feature"}
                      >
                        <Star className={`w-3.5 h-3.5 ${article.featured ? "fill-amber-400" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail & Headline */}
                  <div className="flex gap-3 items-start">
                    <div className="relative w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {article.image ? (
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Newspaper className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-slate-900 text-xs leading-snug line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {article.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono text-[10px]">{article.date}</span>

                  <div className="flex items-center gap-1">
                    <Link
                      href={article.slug ? `/news/${article.slug}` : "/news"}
                      target="_blank"
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => setEditingArticle(article)}
                      className="p-1 rounded-md text-slate-400 hover:text-[#218A59] hover:bg-slate-100 cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSingle(article.id, article.title)}
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

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Delete {selectedIds.length} {selectedIds.length === 1 ? "article" : "articles"}?
              </h3>
              <p className="text-xs text-slate-500">
                This will permanently remove the selected articles from the website. This action cannot be undone.
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
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Articles</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Article Modal */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Edit News Article</h3>
                <p className="text-xs text-slate-500">Make changes to your published headline and body.</p>
              </div>
              <button
                onClick={() => setEditingArticle(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                  HEADLINE TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={editingArticle.title}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, title: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                    CATEGORY
                  </label>
                  <select
                    value={editingArticle.category}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, category: e.target.value as any })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] focus:bg-white cursor-pointer"
                  >
                    <option value="Expo Update">Expo Update</option>
                    <option value="Policy & Market">Policy & Market</option>
                    <option value="Technology">Technology</option>
                    <option value="Press Release">Press Release</option>
                    <option value="News Coverage">News Coverage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                    AUTHOR / DESK
                  </label>
                  <input
                    type="text"
                    value={editingArticle.author}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, author: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                  SHORT SUMMARY
                </label>
                <textarea
                  rows={2}
                  value={editingArticle.summary}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, summary: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                  IMAGE URL
                </label>
                <input
                  type="url"
                  value={editingArticle.image}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, image: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editFeatured"
                  checked={editingArticle.featured}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, featured: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-300 text-[#218A59] focus:ring-[#218A59] cursor-pointer"
                />
                <label htmlFor="editFeatured" className="text-xs text-slate-700 cursor-pointer select-none">
                  Feature this article on homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Article Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Create News Article</h3>
                <p className="text-xs text-slate-500">Publish manual news or import instantly from a web link.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher: Manual vs URL */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setAddMode("manual")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  addMode === "manual" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Manual Entry
              </button>
              <button
                type="button"
                onClick={() => setAddMode("url")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  addMode === "url" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Globe className="w-3 h-3 text-[#218A59]" />
                <span>Import from Web Link</span>
              </button>
            </div>

            {addMode === "url" ? (
              <div className="space-y-4 py-2">
                <div>
                  <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                    ARTICLE URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://thehimalayantimes.com/nepal/energy..."
                      className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#218A59] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleExtractFromUrl}
                      disabled={isUrlExtracting || !urlInput.trim()}
                      className="px-4 py-2.5 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shrink-0 shadow-xs"
                    >
                      {isUrlExtracting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Fetching...</span>
                        </>
                      ) : (
                        <span>Import</span>
                      )}
                    </button>
                  </div>
                  {urlExtractError && (
                    <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{urlExtractError}</span>
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Paste any article link from Kathmandu Post, Himalayan Times, or energy portals to automatically extract title, image, and summary.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                    ARTICLE TITLE *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Nepal Signs 10-Year Cross-Border Clean Energy Wheeling Agreement"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                      CATEGORY
                    </label>
                    <select
                      name="category"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] focus:bg-white cursor-pointer"
                    >
                      <option value="Expo Update">Expo Update</option>
                      <option value="Policy & Market">Policy & Market</option>
                      <option value="Technology">Technology</option>
                      <option value="Press Release">Press Release</option>
                      <option value="News Coverage">News Coverage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                      AUTHOR / DESK
                    </label>
                    <input
                      type="text"
                      name="author"
                      defaultValue="IPPAN Communications Desk"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                    SUMMARY / LEAD *
                  </label>
                  <textarea
                    name="summary"
                    rows={2}
                    required
                    placeholder="Brief synopsis summarizing key developments..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                    ARTICLE BODY (DOUBLE ENTER FOR PARAGRAPHS)
                  </label>
                  <textarea
                    name="content"
                    rows={3}
                    placeholder="Full text of the news release..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                      COVER IMAGE URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      defaultValue="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-slate-700 mb-1">
                      SOURCE LINK (OPTIONAL)
                    </label>
                    <input
                      type="url"
                      name="sourceUrl"
                      placeholder="https://..."
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="newFeatured"
                    name="featured"
                    className="w-4 h-4 rounded border-slate-300 text-[#218A59] focus:ring-[#218A59] cursor-pointer"
                  />
                  <label htmlFor="newFeatured" className="text-xs text-slate-700 cursor-pointer select-none">
                    Feature this article on homepage
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Publish Now</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Newspaper,
  Plus,
  Search,
  Star,
  RefreshCw,
  Edit,
  Trash2,
  Calendar,
  CheckCircle2,
  X,
  Save,
} from "lucide-react";
import { newsArticles as initialNews } from "@/data/news";
import { NewsArticle } from "@/lib/types";

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>(initialNews);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const categories = ["All", "Expo Update", "Policy & Market", "Technology", "Press Release"];

  const filteredArticles = articles.filter((a) => {
    const matchesCat = selectedCategory === "All" || a.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  const handleToggleFeatured = (id: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, featured: !a.featured } : a))
    );
    notify("Article featured status updated");
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    setArticles((prev) => prev.filter((a) => a.id !== id));
    notify("Article removed");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    setArticles((prev) =>
      prev.map((a) => (a.id === editingArticle.id ? editingArticle : a))
    );
    notify("Article updated successfully");
    setEditingArticle(null);
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const category = formData.get("category") as any;
    const author = formData.get("author") as string;
    const summary = formData.get("summary") as string;
    const contentText = formData.get("content") as string;
    const imageUrl = formData.get("image") as string;

    const newArt: NewsArticle = {
      id: `news-${Date.now()}`,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      title,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      category: category || "Expo Update",
      author: author || "IPPAN Communications Desk",
      readTime: "3 min read",
      summary: summary || title,
      content: contentText ? contentText.split("\n\n").filter(Boolean) : [summary],
      image: imageUrl || "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
      featured: true,
      sourceName: "IPPAN Official Press",
    };

    setArticles([newArt, ...articles]);
    notify("News article published successfully");
    setShowAddModal(false);
  };

  const triggerLiveScrape = async () => {
    setIsScraping(true);
    try {
      const res = await fetch("/api/news/scrape");
      const json = await res.json();
      if (json.success && json.articles && json.articles.length > 0) {
        setArticles([...json.articles, ...articles]);
        notify(`Scraped & imported ${json.articles.length} news articles from energy portals`);
      } else {
        notify("News feeds are up to date");
      }
    } catch (e) {
      notify("Auto-scrape completed with current feed");
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold uppercase">
              News & Media
            </span>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
              News & Announcements
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish event announcements, updates, and articles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerLiveScrape}
            disabled={isScraping}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isScraping ? "animate-spin" : ""}`} />
            <span>{isScraping ? "Refreshing..." : "Refresh News"}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Article</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search headline, summary, author..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            {/* Thumbnail */}
            <div className="relative h-44 w-full bg-slate-100">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs border border-white/20 text-[10px] font-mono font-bold text-white">
                  {article.category}
                </span>
              </div>
              <button
                onClick={() => handleToggleFeatured(article.id)}
                className={`absolute top-3 right-3 p-1.5 rounded-xl backdrop-blur-xs cursor-pointer ${
                  article.featured
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "bg-slate-900/70 text-slate-300 hover:text-white"
                }`}
                title={article.featured ? "Featured on Home" : "Click to feature"}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                  <Calendar className="w-3 h-3 text-[#234679]" />
                  <span>{article.date}</span>
                  <span>·</span>
                  <span>{article.readTime}</span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono truncate max-w-[150px]">
                  By {article.author}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setEditingArticle(article)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#234679] transition-colors cursor-pointer"
                    title="Edit Article"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(article.id, article.title)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete Article"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Article Modal */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Edit Article</h3>
              <button
                onClick={() => setEditingArticle(null)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  HEADLINE TITLE
                </label>
                <input
                  type="text"
                  required
                  value={editingArticle.title}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, title: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                    CATEGORY
                  </label>
                  <select
                    value={editingArticle.category}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, category: e.target.value as any })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] cursor-pointer"
                  >
                    <option value="Expo Update">Expo Update</option>
                    <option value="Policy & Market">Policy & Market</option>
                    <option value="Technology">Technology</option>
                    <option value="Press Release">Press Release</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                    AUTHOR
                  </label>
                  <input
                    type="text"
                    value={editingArticle.author}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, author: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  SHORT SUMMARY
                </label>
                <textarea
                  rows={2}
                  value={editingArticle.summary}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, summary: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  IMAGE URL
                </label>
                <input
                  type="url"
                  value={editingArticle.image}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, image: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Article</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Article Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Create New News Article</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  ARTICLE TITLE
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Nepal Signs 10-Year Cross-Border Clean Energy Wheeling Agreement"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                    CATEGORY
                  </label>
                  <select
                    name="category"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] cursor-pointer"
                  >
                    <option value="Expo Update">Expo Update</option>
                    <option value="Policy & Market">Policy & Market</option>
                    <option value="Technology">Technology</option>
                    <option value="Press Release">Press Release</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                    AUTHOR DESK
                  </label>
                  <input
                    type="text"
                    name="author"
                    defaultValue="IPPAN Communications Desk"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  SUMMARY / LEAD
                </label>
                <textarea
                  name="summary"
                  rows={2}
                  required
                  placeholder="Brief synopsis summarizing key agreements and impacts..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  ARTICLE BODY (SEPARATE PARAGRAPHS WITH DOUBLE ENTER)
                </label>
                <textarea
                  name="content"
                  rows={4}
                  placeholder="Full text of the news release..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  COVER IMAGE URL
                </label>
                <input
                  type="url"
                  name="image"
                  defaultValue="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Publish Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

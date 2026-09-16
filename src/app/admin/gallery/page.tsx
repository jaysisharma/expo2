"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  CheckCircle2,
  X,
  LayoutGrid,
  List,
  Eye,
  Calendar,
  Save,
} from "lucide-react";
import { galleryData as initialGallery } from "@/data/gallery";
import { GalleryItem } from "@/lib/types";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(initialGallery);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [previewingItem, setPreviewingItem] = useState<GalleryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const categories = [
    "All",
    "4TH EDITION (2024)",
    "3RD EDITION (2022)",
    "2ND EDITION (2019)",
    "1ST EDITION (2018)",
    "PRESS MEETS",
  ];

  const years = ["All", "2024", "2022", "2019", "2018", "Press Meet"];

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchesYear = selectedYear === "All" || item.year === selectedYear;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.caption.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.year.toLowerCase().includes(q);

    return matchesCat && matchesYear && matchesSearch;
  });

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
    notify("Photo removed from gallery");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setItems((prev) =>
      prev.map((item) => (item.id === editingItem.id ? editingItem : item))
    );
    notify("Gallery item updated successfully");
    setEditingItem(null);
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const year = formData.get("year") as string;
    const image = formData.get("image") as string;
    const caption = formData.get("caption") as string;
    const aspectRatio = (formData.get("aspectRatio") as any) || "landscape";

    const newItem: GalleryItem = {
      id: `g-${Date.now()}`,
      title,
      category: category || "4TH EDITION (2024)",
      image: image || "/images/gallery/2022/DSC_6673.webp",
      caption: caption || title,
      year: year || "2024",
      aspectRatio,
    };

    setItems([newItem, ...items]);
    notify(`Added "${title}" to gallery`);
    setShowAddModal(false);
  };

  const exportCSV = () => {
    const headers = ["ID", "Title", "Category", "Year", "Image URL", "Caption"];
    const rows = filteredItems.map((item) => [
      item.id,
      item.title,
      item.category,
      item.year,
      item.image,
      item.caption,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Expo_Gallery_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#218A59] border border-emerald-200 font-mono text-[10px] font-bold uppercase">
              Media & Photos
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight mt-1">
            Photo Gallery Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage official photo archives, past editions, dignitaries, and expo moments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Photo</span>
          </button>
        </div>
      </div>

      {/* Metric chips */}
      <div className="flex flex-wrap gap-2.5 text-xs font-mono">
        <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs">
          Total Photos: <strong className="text-slate-900">{items.length}</strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold shadow-xs">
          2024 Edition: <strong>{items.filter((i) => i.year === "2024").length}</strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-semibold shadow-xs">
          2022 Edition: <strong>{items.filter((i) => i.year === "2022").length}</strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 shadow-xs">
          Past Editions: <strong>{items.filter((i) => ["2019", "2018"].includes(i.year)).length}</strong>
        </span>
      </div>

      {/* Filters & Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#218A59] text-white font-bold shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right Controls: Year, Search, View Mode */}
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#218A59] cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y === "All" ? "All Years" : y}
                </option>
              ))}
            </select>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photo, caption..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#218A59]"
              />
            </div>

            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                title="Table View"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400 rounded-2xl bg-white border border-slate-200 text-xs">
              No photos found matching criteria. Click "+ Add Photo" to create one.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                {/* Photo Thumbnail */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold">
                      {item.year}
                    </span>
                  </div>

                  {/* Overlay Quick Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewingItem(item)}
                      title="Preview Photo"
                      className="p-2 rounded-xl bg-white/90 text-slate-900 hover:bg-white transition-colors cursor-pointer shadow-md"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingItem(item)}
                      title="Edit Photo"
                      className="p-2 rounded-xl bg-white/90 text-[#234679] hover:bg-white transition-colors cursor-pointer shadow-md"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      title="Delete Photo"
                      className="p-2 rounded-xl bg-white/90 text-rose-600 hover:bg-white transition-colors cursor-pointer shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Photo Caption / Details */}
                <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#218A59] block uppercase">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-xs text-slate-900 line-clamp-1 mt-0.5">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {item.caption}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono text-[10px]">
                    <span>ID: {item.id}</span>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="text-[#234679] hover:underline font-sans font-bold text-xs cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] tracking-wider border-b border-slate-200 uppercase">
                <tr>
                  <th className="p-3.5 font-bold">Image</th>
                  <th className="p-3.5 font-bold">Title</th>
                  <th className="p-3.5 font-bold">Category</th>
                  <th className="p-3.5 font-bold">Year</th>
                  <th className="p-3.5 font-bold">Caption</th>
                  <th className="p-3.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                      No photos found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div
                          onClick={() => setPreviewingItem(item)}
                          className="relative w-12 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer shrink-0"
                        >
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900 max-w-[200px]">
                        <div className="truncate">{item.title}</div>
                      </td>
                      <td className="p-3.5 text-[#218A59] font-mono text-[11px] font-bold">
                        {item.category}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {item.year}
                      </td>
                      <td className="p-3.5 text-slate-600 text-[11px] max-w-[260px] truncate">
                        {item.caption}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewingItem(item)}
                            title="Preview"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingItem(item)}
                            title="Edit"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#234679] transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            title="Delete"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lightbox Photo Preview Modal */}
      {previewingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl space-y-4">
            <div className="relative h-96 w-full bg-slate-900">
              <Image
                src={previewingItem.image}
                alt={previewingItem.title}
                fill
                className="object-contain"
              />
              <button
                onClick={() => setPreviewingItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#218A59] border border-emerald-200 text-[10px] font-mono font-bold uppercase">
                  {previewingItem.category} · {previewingItem.year}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {previewingItem.id}</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900">{previewingItem.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{previewingItem.caption}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Photo Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Edit Photo Details</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  PHOTO TITLE
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                    CATEGORY / EDITION
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] cursor-pointer"
                  >
                    <option value="4TH EDITION (2024)">4TH EDITION (2024)</option>
                    <option value="3RD EDITION (2022)">3RD EDITION (2022)</option>
                    <option value="2ND EDITION (2019)">2ND EDITION (2019)</option>
                    <option value="1ST EDITION (2018)">1ST EDITION (2018)</option>
                    <option value="PRESS MEETS">PRESS MEETS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                    YEAR / TAG
                  </label>
                  <input
                    type="text"
                    value={editingItem.year}
                    onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  IMAGE PATH / URL
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.image}
                  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  CAPTION / DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={editingItem.caption}
                  onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Photo Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Add New Photo to Gallery</h3>
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
                  PHOTO TITLE
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Inauguration & High-Level Dais"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                    CATEGORY / EDITION
                  </label>
                  <select
                    name="category"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] cursor-pointer"
                  >
                    <option value="4TH EDITION (2024)">4TH EDITION (2024)</option>
                    <option value="3RD EDITION (2022)">3RD EDITION (2022)</option>
                    <option value="2ND EDITION (2019)">2ND EDITION (2019)</option>
                    <option value="1ST EDITION (2018)">1ST EDITION (2018)</option>
                    <option value="PRESS MEETS">PRESS MEETS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                    YEAR / TAG
                  </label>
                  <input
                    type="text"
                    name="year"
                    defaultValue="2024"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  IMAGE PATH OR URL
                </label>
                <input
                  type="text"
                  name="image"
                  required
                  defaultValue="/images/WhatsApp Image 2026-08-27 at 06.52.06.jpeg"
                  placeholder="/images/... or https://..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  CAPTION / DESCRIPTION
                </label>
                <textarea
                  name="caption"
                  rows={3}
                  required
                  placeholder="Describe the occasion, dignitaries, and ceremony..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
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
                  <span>Publish Photo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

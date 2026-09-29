"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Tag,
  Sparkles,
  Layers,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";
import { galleryData as initialGallery } from "@/data/gallery";
import { GalleryItem } from "@/lib/types";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

interface Edition {
  name: string;
  year: string;
}

const DEFAULT_EDITIONS: Edition[] = [
  { name: "5TH EDITION (2027)", year: "2027" },
  { name: "4TH EDITION (2024)", year: "2024" },
  { name: "3RD EDITION (2022)", year: "2022" },
  { name: "2ND EDITION (2019)", year: "2019" },
  { name: "1ST EDITION (2018)", year: "2018" },
  { name: "PRESS MEETS", year: "Press Meet" },
];

export default function AdminGalleryPage() {
  // Editions state with local storage persistence
  const [editions, setEditions] = useState<Edition[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("expo_admin_gallery_editions_v2");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_EDITIONS;
  });

  // Items state with local storage persistence
  const [items, setItems] = useState<GalleryItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("expo_admin_gallery_items_v2");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialGallery;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditionsModal, setShowEditionsModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [previewingItem, setPreviewingItem] = useState<GalleryItem | null>(null);

  // Add Photo Form State
  const [addTitle, setAddTitle] = useState("");
  const [addCategory, setAddCategory] = useState("5TH EDITION (2027)");
  const [addYear, setAddYear] = useState("2027");
  const [addImage, setAddImage] = useState("");
  const [addCaption, setAddCaption] = useState("");
  const [addAspectRatio, setAddAspectRatio] = useState<"landscape" | "portrait" | "square">("landscape");

  // Inline Edition Drawer State inside Add/Edit Photo
  const [showInlineNewEdition, setShowInlineNewEdition] = useState(false);
  const [newEditionName, setNewEditionName] = useState("");
  const [newEditionYear, setNewEditionYear] = useState("");

  // Standalone Edition Management State
  const [manageEditionName, setManageEditionName] = useState("");
  const [manageEditionYear, setManageEditionYear] = useState("");

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Sync editions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("expo_admin_gallery_editions_v2", JSON.stringify(editions));
    } catch {}
  }, [editions]);

  // Sync items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("expo_admin_gallery_items_v2", JSON.stringify(items));
    } catch {}
  }, [items]);

  // Derive categories list dynamically
  const categoriesList = useMemo(() => {
    const list = ["All", ...editions.map((e) => e.name)];
    // Add any category present in items that might not be in editions
    items.forEach((item) => {
      if (item.category && !list.includes(item.category)) {
        list.push(item.category);
      }
    });
    return list;
  }, [editions, items]);

  // Derive years list dynamically
  const yearsList = useMemo(() => {
    const list = new Set<string>();
    editions.forEach((e) => e.year && list.add(e.year));
    items.forEach((i) => i.year && list.add(i.year));
    return ["All", ...Array.from(list)];
  }, [editions, items]);

  // Filtered gallery items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
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
  }, [items, selectedCategory, selectedYear, searchQuery]);

  // Function to create a new edition
  const handleCreateEdition = (name: string, year: string) => {
    const trimmedName = name.trim();
    const trimmedYear = year.trim();

    if (!trimmedName) {
      notify("Please provide an edition name");
      return null;
    }

    const existing = editions.find(
      (e) => e.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
      notify(`Edition "${trimmedName}" already exists`);
      return existing;
    }

    const newEd: Edition = {
      name: trimmedName,
      year: trimmedYear || new Date().getFullYear().toString(),
    };

    setEditions((prev) => [newEd, ...prev]);
    notify(`Created edition "${trimmedName}"`);
    return newEd;
  };

  // Delete an edition
  const handleDeleteEdition = (editionName: string) => {
    const countInEdition = items.filter((i) => i.category === editionName).length;
    if (countInEdition > 0) {
      if (!confirm(`This edition contains ${countInEdition} photos. Removing it will not delete the photos, but it will no longer be listed as a preset. Continue?`)) {
        return;
      }
    }
    setEditions((prev) => prev.filter((e) => e.name !== editionName));
    notify(`Edition "${editionName}" removed`);
  };

  // Add Photo Submit Handler
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!addTitle.trim()) {
      notify("Photo title is required");
      return;
    }

    const chosenImage = addImage.trim() || "/images/gallery/2022/DSC_6673.webp";

    const newItem: GalleryItem = {
      id: `g-${Date.now()}`,
      title: addTitle.trim(),
      category: addCategory || "5TH EDITION (2027)",
      image: chosenImage,
      caption: addCaption.trim() || addTitle.trim(),
      year: addYear.trim() || "2027",
      aspectRatio: addAspectRatio,
    };

    setItems((prev) => [newItem, ...prev]);
    notify(`Published "${newItem.title}" to gallery`);

    // Reset form
    setAddTitle("");
    setAddCaption("");
    setAddImage("");
    setShowAddModal(false);
    setShowInlineNewEdition(false);
  };

  // Save Edit Handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setItems((prev) =>
      prev.map((item) => (item.id === editingItem.id ? editingItem : item))
    );
    notify("Photo updated successfully");
    setEditingItem(null);
  };

  // Delete Photo Handler
  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
    notify("Photo removed from gallery");
  };

  // Export CSV
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
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Photo Gallery Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Curate and manage official visual archives across all expo editions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditionsModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>Manage Editions</span>
          </button>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setAddTitle("");
              setAddCaption("");
              setAddImage("");
              setAddCategory(editions[0]?.name || "5TH EDITION (2027)");
              setAddYear(editions[0]?.year || "2027");
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Photo</span>
          </button>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs flex items-center gap-1.5">
          <span className="text-slate-400">Total Photos:</span>
          <strong className="text-slate-900 font-semibold">{items.length}</strong>
        </span>

        {editions.slice(0, 4).map((ed) => {
          const count = items.filter((i) => i.category === ed.name).length;
          return (
            <span
              key={ed.name}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs flex items-center gap-1.5"
            >
              <span className="text-slate-500 truncate max-w-[130px]">{ed.name}:</span>
              <strong className="text-slate-900 font-semibold">{count}</strong>
            </span>
          );
        })}
      </div>

      {/* Unified Toolbar & Filters */}
      <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 md:pb-0">
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat;
              const count = cat === "All" ? items.length : items.filter((i) => i.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-slate-900 text-white font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate max-w-[140px]">{cat}</span>
                  <span
                    className={`text-[10px] ${
                      isActive ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Controls: Year, Search, View Mode */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white cursor-pointer transition-colors"
            >
              {yearsList.map((y) => (
                <option key={y} value={y}>
                  {y === "All" ? "All Years" : y}
                </option>
              ))}
            </select>

            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photo, caption..."
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
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                title="Table View"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-full py-16 px-4 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <ImageIcon className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No photos found</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                {searchQuery || selectedCategory !== "All" || selectedYear !== "All"
                  ? "Try clearing your filters or search term."
                  : "Get started by adding your first high-resolution photo."}
              </p>
              <button
                onClick={() => {
                  setAddTitle("");
                  setAddCaption("");
                  setAddImage("");
                  setShowAddModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              >
                Add Photo
              </button>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
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
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewingItem(item)}
                      title="Preview Photo"
                      className="p-2 rounded-xl bg-white text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shadow-md"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingItem(item)}
                      title="Edit Photo"
                      className="p-2 rounded-xl bg-white text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shadow-md"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      title="Delete Photo"
                      className="p-2 rounded-xl bg-white text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Photo Caption / Details */}
                <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/80 inline-block mb-1">
                      {item.category}
                    </span>
                    <h3 className="font-semibold text-xs text-slate-900 line-clamp-1 mt-0.5" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {item.caption}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{item.id}</span>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
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
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/70 text-slate-500 font-mono text-[11px] tracking-wider border-b border-slate-200/80 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-3.5">Image</th>
                  <th className="py-3 px-3.5">Title</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5">Year</th>
                  <th className="py-3 px-3.5">Caption</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
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
                      <td className="py-3 px-3.5">
                        <div
                          onClick={() => setPreviewingItem(item)}
                          className="relative w-12 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 cursor-pointer shrink-0"
                        >
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-slate-900 max-w-[200px]">
                        <div className="truncate">{item.title}</div>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold uppercase">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-600 text-[11px]">
                        {item.year}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 text-[11px] max-w-[260px] truncate">
                        {item.caption}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewingItem(item)}
                            title="Preview"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingItem(item)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
        <div
          onClick={() => setPreviewingItem(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="relative h-[420px] w-full bg-slate-950 flex items-center justify-center">
              <Image
                src={previewingItem.image}
                alt={previewingItem.title}
                fill
                className="object-contain"
              />
              <button
                onClick={() => setPreviewingItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-mono font-bold uppercase tracking-wider">
                  {previewingItem.category} · {previewingItem.year}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {previewingItem.id}</span>
              </div>
              <h3 className="font-bold text-base text-slate-900">{previewingItem.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{previewingItem.caption}</p>
            </div>
          </div>
        </div>
      )}

      {/* Manage Editions Modal */}
      {showEditionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Manage Expo Editions</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Configure categories and years available for photos.
                </p>
              </div>
              <button
                onClick={() => setShowEditionsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add New Edition Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!manageEditionName.trim()) return;
                handleCreateEdition(manageEditionName, manageEditionYear);
                setManageEditionName("");
                setManageEditionYear("");
              }}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5"
            >
              <span className="text-[11px] font-semibold text-slate-700 block">
                Add New Edition
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    required
                    value={manageEditionName}
                    onChange={(e) => setManageEditionName(e.target.value)}
                    placeholder="e.g. 5TH EDITION (2027)"
                    className="w-full p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    value={manageEditionYear}
                    onChange={(e) => setManageEditionYear(e.target.value)}
                    placeholder="Year (e.g. 2027)"
                    className="w-full p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Edition</span>
              </button>
            </form>

            {/* List of Existing Editions */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">
                Active Editions ({editions.length})
              </span>
              {editions.map((ed) => {
                const count = items.filter((i) => i.category === ed.name).length;
                return (
                  <div
                    key={ed.name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block">{ed.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Year: {ed.year} · {count} {count === 1 ? "photo" : "photos"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteEdition(ed.name)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                      title="Remove edition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowEditionsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Photo Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xl space-y-4 my-8 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Add New Photo to Gallery</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Attach official photography with edition categorization and captions.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowInlineNewEdition(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              {/* Photo Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  placeholder="e.g. Inauguration & High-Level Dais"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                />
              </div>

              {/* Category / Edition & Year */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Category / Edition *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowInlineNewEdition(!showInlineNewEdition)}
                        className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{showInlineNewEdition ? "Close" : "New Edition"}</span>
                      </button>
                    </div>

                    <select
                      value={addCategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__new__") {
                          setShowInlineNewEdition(true);
                          return;
                        }
                        setAddCategory(val);
                        const match = editions.find((ed) => ed.name === val);
                        if (match) setAddYear(match.year);
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors cursor-pointer"
                    >
                      {editions.map((ed) => (
                        <option key={ed.name} value={ed.name}>
                          {ed.name}
                        </option>
                      ))}
                      <option value="__new__">+ Add New Edition...</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Year / Tag *
                    </label>
                    <input
                      type="text"
                      required
                      value={addYear}
                      onChange={(e) => setAddYear(e.target.value)}
                      placeholder="e.g. 2027"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                    />
                  </div>
                </div>

                {/* Inline New Edition Drawer */}
                {showInlineNewEdition && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-800">
                        Create New Edition
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowInlineNewEdition(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap gap-1">
                      {["5TH EDITION (2027)", "6TH EDITION (2029)", "SPECIAL EXHIBITION", "PRESS & MEDIA"].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            setNewEditionName(chip);
                            const yrMatch = chip.match(/\d{4}/);
                            if (yrMatch) setNewEditionYear(yrMatch[0]);
                          }}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white border border-slate-200 text-slate-600 hover:border-slate-400 cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={newEditionName}
                          onChange={(e) => setNewEditionName(e.target.value)}
                          placeholder="Edition Name (e.g. 5TH EDITION (2027))"
                          className="w-full p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={newEditionYear}
                          onChange={(e) => setNewEditionYear(e.target.value)}
                          placeholder="Year (e.g. 2027)"
                          className="w-full p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowInlineNewEdition(false)}
                        className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newEditionName.trim()) return;
                          const created = handleCreateEdition(newEditionName, newEditionYear);
                          if (created) {
                            setAddCategory(created.name);
                            setAddYear(created.year);
                          }
                          setShowInlineNewEdition(false);
                          setNewEditionName("");
                          setNewEditionYear("");
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                      >
                        Save & Select
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Aspect Ratio Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Display Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "landscape", label: "Landscape (16:9)" },
                    { id: "portrait", label: "Portrait (3:4)" },
                    { id: "square", label: "Square (1:1)" },
                  ].map((ratio) => (
                    <button
                      key={ratio.id}
                      type="button"
                      onClick={() => setAddAspectRatio(ratio.id as any)}
                      className={`p-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        addAspectRatio === ratio.id
                          ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload Field */}
              <ImageUploadField
                label="Gallery Photo"
                value={addImage}
                onChange={setAddImage}
                folder="gallery"
                required
              />

              {/* Caption / Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Caption / Description
                </label>
                <textarea
                  rows={3}
                  value={addCaption}
                  onChange={(e) => setAddCaption(e.target.value)}
                  placeholder="Describe the occasion, dignitaries, and ceremony..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowInlineNewEdition(false);
                  }}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Publish Photo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Photo Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xl space-y-4 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Edit Photo Details</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">ID: {editingItem.id}</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Category / Edition *
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      const match = editions.find((ed) => ed.name === val);
                      setEditingItem({
                        ...editingItem,
                        category: val,
                        year: match ? match.year : editingItem.year,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors cursor-pointer"
                  >
                    {editions.map((ed) => (
                      <option key={ed.name} value={ed.name}>
                        {ed.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Year / Tag *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.year}
                    onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Display Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "landscape", label: "Landscape (16:9)" },
                    { id: "portrait", label: "Portrait (3:4)" },
                    { id: "square", label: "Square (1:1)" },
                  ].map((ratio) => (
                    <button
                      key={ratio.id}
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, aspectRatio: ratio.id as any })}
                      className={`p-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        (editingItem.aspectRatio || "landscape") === ratio.id
                          ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              <ImageUploadField
                label="Gallery Photo"
                value={editingItem.image}
                onChange={(url) => setEditingItem({ ...editingItem, image: url })}
                folder="gallery"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Caption / Description
                </label>
                <textarea
                  rows={3}
                  value={editingItem.caption}
                  onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

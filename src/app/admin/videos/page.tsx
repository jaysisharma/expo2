"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Film,
  Plus,
  Search,
  Edit,
  Trash2,
  Play,
  X,
  Save,
  CheckCircle2,
  ExternalLink,
  UploadCloud,
  Loader2,
  Sparkles,
  Star,
  Eye,
  Download,
  Link as LinkIcon,
  Video as VideoIcon,
  Layers,
} from "lucide-react";
import { VideoItem } from "@/lib/types";
import { videosData as defaultVideos } from "@/data/videos";
import { saveFirebaseVideos, getFirebaseVideos } from "@/lib/firebaseDb";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import DroneCinemaModal from "@/components/hero/DroneCinemaModal";

const PRESET_CATEGORIES = [
  "Featured Drone Film",
  "5TH EDITION (2027)",
  "4TH EDITION (2024)",
  "3RD EDITION (2022)",
  "2ND EDITION (2019)",
  "1ST EDITION (2018)",
  "Press Meets",
  "Documentary",
];

const REMOVED_VIDEO_IDS = new Set([
  "v-biz-online-inauguration-2024",
  "v-3rd-recap-2022",
  "v-4th-press-meet",
  "v-2nd-intl-pavilion",
]);

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("expo_admin_videos_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter((v: VideoItem) => !REMOVED_VIDEO_IDS.has(v.id));
          }
        }
      } catch {}
    }
    return defaultVideos.filter((v) => !REMOVED_VIDEO_IDS.has(v.id));
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [previewingVideo, setPreviewingVideo] = useState<VideoItem | null>(null);
  const [showCinemaTest, setShowCinemaTest] = useState(false);

  // Add Form State
  const [addTitle, setAddTitle] = useState("");
  const [addCategory, setAddCategory] = useState("Featured Drone Film");
  const [addYear, setAddYear] = useState("2024");
  const [addSourceType, setAddSourceType] = useState<"youtube" | "file" | "url">("youtube");
  const [addVideoUrl, setAddVideoUrl] = useState("");
  const [addThumbnail, setAddThumbnail] = useState("");
  const [addDuration, setAddDuration] = useState("");
  const [addCredits, setAddCredits] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addFeatured, setAddFeatured] = useState(false);

  // File Upload State for Direct MP4
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Sync with Firebase and LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("expo_admin_videos_v1", JSON.stringify(videos));
    } catch {}
    saveFirebaseVideos(videos).catch(() => {});
  }, [videos]);

  // Load from Firebase on mount
  useEffect(() => {
    getFirebaseVideos()
      .then((fbVideos) => {
        if (fbVideos && Array.isArray(fbVideos) && fbVideos.length > 0) {
          setVideos(fbVideos.filter((v: VideoItem) => !REMOVED_VIDEO_IDS.has(v.id)));
        }
      })
      .catch(() => {});
  }, []);

  // Category filter list
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    PRESET_CATEGORIES.forEach((c) => set.add(c));
    videos.forEach((v) => v.category && set.add(v.category));
    return ["All", ...Array.from(set)];
  }, [videos]);

  // Filtered list
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchesCat = selectedCategory === "All" || v.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (v.title || "").toLowerCase().includes(q) ||
        (v.description || "").toLowerCase().includes(q) ||
        (v.credits || "").toLowerCase().includes(q) ||
        (v.category || "").toLowerCase().includes(q) ||
        (v.year || "").toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [videos, selectedCategory, searchQuery]);

  // Auto-generate YouTube thumbnail when URL is pasted
  const handleUrlBlur = (url: string) => {
    if (!addThumbnail && (url.includes("youtube.com") || url.includes("youtu.be"))) {
      let id = "";
      if (url.includes("v=")) id = url.split("v=")[1]?.split("&")[0];
      else if (url.includes("youtu.be/")) id = url.split("youtu.be/")[1]?.split("?")[0];

      if (id) {
        setAddThumbnail(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
      }
    }
  };

  // Handle direct video file upload
  const handleVideoFileUpload = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      notify("Please select a valid video file (MP4, WebM, MOV)");
      return;
    }

    setIsUploadingVideo(true);
    setUploadProgress(`Uploading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "videos");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload video file");
      }

      setAddVideoUrl(data.url);
      notify("Video file uploaded successfully to Cloudinary");
    } catch (err: any) {
      notify(err?.message || "Failed to upload video");
    } finally {
      setIsUploadingVideo(false);
      setUploadProgress(null);
    }
  };

  // Add Video Submit Handler
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!addVideoUrl.trim()) {
      notify("Please provide a video URL or upload a video file");
      return;
    }

    let detectedSource: "youtube" | "vimeo" | "mp4" | "external" = "youtube";
    const lowUrl = addVideoUrl.toLowerCase();
    if (lowUrl.includes("vimeo.com")) detectedSource = "vimeo";
    else if (lowUrl.endsWith(".mp4") || lowUrl.endsWith(".webm") || lowUrl.includes("/video/upload/")) {
      detectedSource = "mp4";
    } else if (!lowUrl.includes("youtube") && !lowUrl.includes("youtu.be")) {
      detectedSource = "external";
    }

    const title = addTitle.trim() || `${addCategory} Glimpse`;
    const finalThumbnail =
      addThumbnail.trim() ||
      (detectedSource === "youtube"
        ? "/images/event-photo-6.webp"
        : "/images/event-photo-1.webp");

    const newVideo: VideoItem = {
      id: `v-${Date.now()}`,
      title,
      category: addCategory,
      year: addYear.trim() || "2024",
      thumbnail: finalThumbnail,
      videoUrl: addVideoUrl.trim(),
      duration: addDuration.trim() || undefined,
      description: addDescription.trim() || undefined,
      credits: addCredits.trim() || undefined,
      sourceType: detectedSource,
      featured: addFeatured,
    };

    // If marked as featured, toggle off previous featured
    let nextVideos = [newVideo, ...videos];
    if (addFeatured) {
      nextVideos = nextVideos.map((v) => (v.id === newVideo.id ? v : { ...v, featured: false }));
    }

    setVideos(nextVideos);
    notify(`Added "${newVideo.title}" to video archives`);

    // Reset Form
    setAddTitle("");
    setAddVideoUrl("");
    setAddThumbnail("");
    setAddDuration("");
    setAddCredits("");
    setAddDescription("");
    setAddFeatured(false);
    setShowAddModal(false);
  };

  // Set Video as Featured
  const handleSetFeatured = (id: string) => {
    setVideos((prev) =>
      prev.map((v) => ({
        ...v,
        featured: v.id === id,
      }))
    );
    notify("Updated featured hero drone film");
  };

  // Save Edit Handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    let nextVideos = videos.map((v) => (v.id === editingVideo.id ? editingVideo : v));
    if (editingVideo.featured) {
      nextVideos = nextVideos.map((v) =>
        v.id === editingVideo.id ? v : { ...v, featured: false }
      );
    }

    setVideos(nextVideos);
    notify("Video updated successfully");
    setEditingVideo(null);
  };

  // Delete Video Handler
  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    setVideos((prev) => prev.filter((v) => v.id !== id));
    notify("Video removed from archive");
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ["ID", "Title", "Category", "Year", "Video URL", "Duration", "Credits", "Featured"];
    const rows = filteredVideos.map((v) => [
      v.id,
      v.title || "",
      v.category || "",
      v.year || "",
      v.videoUrl || "",
      v.duration || "",
      v.credits || "",
      v.featured ? "Yes" : "No",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Expo_Videos_${Date.now()}.csv`);
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
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Drone Films &amp; Past Editions Glimpse Videos
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
              Hero Cinema &amp; Vault
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Curate the official drone films and past edition video recaps showcased in the &ldquo;Watch Drone Film&rdquo; popup and public gallery.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowCinemaTest(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>Preview Cinema Popup</span>
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAddTitle("");
              setAddVideoUrl("");
              setAddThumbnail("");
              setAddDuration("");
              setAddCredits("");
              setAddDescription("");
              setAddCategory(selectedCategory !== "All" ? selectedCategory : "4th Edition (2024)");
              setAddFeatured(false);
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload / Add Video</span>
          </button>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs flex items-center gap-1.5">
          <span className="text-slate-400">Total Videos:</span>
          <strong className="text-slate-900 font-semibold">{videos.length}</strong>
        </span>

        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs flex items-center gap-1.5">
          <Star className="w-3 h-3 fill-current text-emerald-600" />
          <span>Featured Hero Film:</span>
          <strong className="font-semibold truncate max-w-[200px]">
            {videos.find((v) => v.featured)?.title || "None Set"}
          </strong>
        </span>

        {PRESET_CATEGORIES.slice(0, 4).map((cat) => {
          const count = videos.filter((v) => v.category === cat).length;
          return (
            <span
              key={cat}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs flex items-center gap-1.5"
            >
              <span className="text-slate-500 truncate max-w-[140px]">{cat}:</span>
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
              const count = cat === "All" ? videos.length : videos.filter((v) => v.category === cat).length;

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
                  <span className="truncate max-w-[160px]">{cat}</span>
                  <span className={`text-[10px] ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search video, edition, credits..."
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
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 text-xs bg-white border border-slate-200 rounded-2xl">
            No videos found matching your filter criteria.
          </div>
        ) : (
          filteredVideos.map((video) => (
            <div
              key={video.id}
              className={`bg-white border rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group ${
                video.featured ? "border-emerald-400 ring-1 ring-emerald-300" : "border-slate-200/90"
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-black overflow-hidden">
                <Image
                  src={video.thumbnail || "/images/event-photo-6.webp"}
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />

                {/* Play Button Trigger */}
                <button
                  type="button"
                  onClick={() => setPreviewingVideo(video)}
                  className="absolute inset-0 flex items-center justify-center cursor-pointer group/play"
                  title="Play video preview"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-900/80 group-hover/play:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-transform group-hover/play:scale-110">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </button>

                {/* Featured Badge */}
                {video.featured && (
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span>Featured Hero Film</span>
                  </div>
                )}

                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px] font-medium shadow-xs">
                    {video.duration}
                  </div>
                )}
              </div>

              {/* Video Info Content */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200/80">
                      {video.category} · {video.year}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      {video.sourceType || "video"}
                    </span>
                  </div>

                  <h3 className="font-semibold text-xs text-slate-900 line-clamp-2 leading-snug" title={video.title}>
                    {video.title}
                  </h3>

                  {video.credits && (
                    <p className="text-[11px] text-emerald-700 font-medium mt-1 truncate">
                      Cinematography: {video.credits}
                    </p>
                  )}

                  {video.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {video.description}
                    </p>
                  )}
                </div>

                {/* Action Buttons Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleSetFeatured(video.id)}
                    className={`text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      video.featured
                        ? "text-emerald-700 font-semibold"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${video.featured ? "fill-emerald-600 text-emerald-600" : ""}`} />
                    <span>{video.featured ? "Hero Active" : "Set as Hero"}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewingVideo(video)}
                      title="Preview"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingVideo(video)}
                      title="Edit"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(video.id, video.title)}
                      title="Delete"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xl space-y-4 my-8 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Upload / Add Glimpse Video</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Link a YouTube/Vimeo video or upload an MP4 to show in the Hero Cinema and Video Vault.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              {/* Video Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Video Title <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  placeholder="e.g. 4th Edition 2024 Drone & Inaugural Glimpse"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                />
              </div>

              {/* Category / Edition & Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Category / Edition *
                  </label>
                  <select
                    value={addCategory}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAddCategory(val);
                      const yrMatch = val.match(/\d{4}/);
                      if (yrMatch) setAddYear(yrMatch[0]);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors cursor-pointer"
                  >
                    {PRESET_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
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
                    value={addYear}
                    onChange={(e) => setAddYear(e.target.value)}
                    placeholder="e.g. 2024"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                  />
                </div>
              </div>

              {/* Source Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Video Source *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "youtube", label: "YouTube / Vimeo" },
                    { id: "file", label: "Upload MP4 File" },
                    { id: "url", label: "Direct MP4 Link" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAddSourceType(tab.id as any)}
                      className={`p-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        addSourceType === tab.id
                          ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Input Body */}
              {addSourceType === "youtube" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    YouTube or Vimeo URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={addVideoUrl}
                    onChange={(e) => setAddVideoUrl(e.target.value)}
                    onBlur={(e) => handleUrlBlur(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=sJy3FVrESKk"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Supports standard YouTube links, Shorts, and Vimeo. High-res thumbnail will be fetched automatically.
                  </p>
                </div>
              ) : addSourceType === "file" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Upload MP4 / WebM File
                  </label>
                  <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl p-6 text-center transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 block">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      disabled={isUploadingVideo}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleVideoFileUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {isUploadingVideo ? uploadProgress : "Click to select MP4 / WebM file"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Uploaded directly to high-speed cloud storage CDN
                      </p>
                    </div>
                  </label>
                  {addVideoUrl && (
                    <p className="text-[11px] text-emerald-700 font-mono mt-1 truncate">
                      Uploaded URL: {addVideoUrl}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Direct Video Link (MP4 / CDN) *
                  </label>
                  <input
                    type="url"
                    required
                    value={addVideoUrl}
                    onChange={(e) => setAddVideoUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/.../drone_hydro.mp4"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                  />
                </div>
              )}

              {/* Custom Thumbnail Field */}
              <ImageUploadField
                label="Custom Thumbnail Image"
                value={addThumbnail}
                onChange={setAddThumbnail}
                folder="video_thumbnails"
                placeholder="https://... or upload poster image"
              />

              {/* Duration & Credits */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Duration <span className="text-slate-400 font-normal">(e.g. 03:45)</span>
                  </label>
                  <input
                    type="text"
                    value={addDuration}
                    onChange={(e) => setAddDuration(e.target.value)}
                    placeholder="03:45"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Cinematography / Credits
                  </label>
                  <input
                    type="text"
                    value={addCredits}
                    onChange={(e) => setAddCredits(e.target.value)}
                    placeholder="e.g. Saligram Dulal"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description / Synopsis <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  placeholder="Highlights of the edition, ministerial inaugurations, and aerial river valleys..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                />
              </div>

              {/* Set as Featured Hero Drone Film */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-950 block">
                    Feature as Hero Drone Film
                  </span>
                  <p className="text-[10px] text-emerald-700">
                    If checked, this video will be the primary film played when visitors click &ldquo;Watch Drone Film&rdquo; on the landing page.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={addFeatured}
                  onChange={(e) => setAddFeatured(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingVideo}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Publish Video</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xl space-y-4 my-8 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Edit Video Details</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">ID: {editingVideo.id}</p>
              </div>
              <button
                onClick={() => setEditingVideo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Video Title
                </label>
                <input
                  type="text"
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Category / Edition *
                  </label>
                  <select
                    value={editingVideo.category}
                    onChange={(e) =>
                      setEditingVideo({ ...editingVideo, category: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors cursor-pointer"
                  >
                    {PRESET_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingVideo.year}
                    onChange={(e) => setEditingVideo({ ...editingVideo, year: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Video URL *
                </label>
                <input
                  type="url"
                  required
                  value={editingVideo.videoUrl}
                  onChange={(e) => setEditingVideo({ ...editingVideo, videoUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                />
              </div>

              <ImageUploadField
                label="Thumbnail Image"
                value={editingVideo.thumbnail}
                onChange={(url) => setEditingVideo({ ...editingVideo, thumbnail: url })}
                folder="video_thumbnails"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={editingVideo.duration || ""}
                    onChange={(e) =>
                      setEditingVideo({ ...editingVideo, duration: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Credits / Cinematographer
                  </label>
                  <input
                    type="text"
                    value={editingVideo.credits || ""}
                    onChange={(e) =>
                      setEditingVideo({ ...editingVideo, credits: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingVideo.description || ""}
                  onChange={(e) =>
                    setEditingVideo({ ...editingVideo, description: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white text-xs transition-colors"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-950 block">
                    Feature as Hero Drone Film
                  </span>
                  <p className="text-[10px] text-emerald-700">
                    Primary video in the Hero &ldquo;Watch Drone Film&rdquo; popup.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(editingVideo.featured)}
                  onChange={(e) =>
                    setEditingVideo({ ...editingVideo, featured: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
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

      {/* Quick Playback Lightbox Modal */}
      {previewingVideo && (
        <div
          onClick={() => setPreviewingVideo(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-black border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-150"
          >
            <div className="p-3 bg-slate-950 flex items-center justify-between border-b border-white/10 text-white">
              <span className="text-xs font-bold truncate max-w-md">{previewingVideo.title}</span>
              <button
                type="button"
                onClick={() => setPreviewingVideo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              {previewingVideo.videoUrl.includes("youtube.com") ||
              previewingVideo.videoUrl.includes("youtu.be") ? (
                <iframe
                  src={
                    previewingVideo.videoUrl.includes("watch?v=")
                      ? `https://www.youtube-nocookie.com/embed/${previewingVideo.videoUrl.split("v=")[1]?.split("&")[0]}?autoplay=1`
                      : previewingVideo.videoUrl.includes("youtu.be/")
                      ? `https://www.youtube-nocookie.com/embed/${previewingVideo.videoUrl.split("youtu.be/")[1]?.split("?")[0]}?autoplay=1`
                      : previewingVideo.videoUrl
                  }
                  title={previewingVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <video
                  src={previewingVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Cinema Popup Preview (Exact Landing Page Experience) */}
      <DroneCinemaModal
        isOpen={showCinemaTest}
        onClose={() => setShowCinemaTest(false)}
      />
    </div>
  );
}

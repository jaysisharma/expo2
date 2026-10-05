"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { VideoItem } from "@/lib/types";
import { videosData as defaultVideos } from "@/data/videos";
import {
  X,
  Play,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Film,
  Calendar,
  Layers,
  Volume2,
} from "lucide-react";

interface DroneCinemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVideoId?: string;
}

const REMOVED_VIDEO_IDS = new Set([
  "v-biz-online-inauguration-2024",
  "v-3rd-recap-2022",
  "v-4th-press-meet",
  "v-2nd-intl-pavilion",
]);

export default function DroneCinemaModal({
  isOpen,
  onClose,
  initialVideoId,
}: DroneCinemaModalProps) {
  const [videos, setVideos] = useState<VideoItem[]>(() =>
    defaultVideos.filter((v) => !REMOVED_VIDEO_IDS.has(v.id))
  );
  const [activeVideoId, setActiveVideoId] = useState<string>(
    initialVideoId || defaultVideos[0]?.id || "v-drone-showcase-2022"
  );
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const playlistContainerRef = useRef<HTMLDivElement>(null);

  // Fetch latest videos from Firebase / API
  useEffect(() => {
    let isMounted = true;
    fetch("/api/videos")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          setVideos(data.videos.filter((v: VideoItem) => !REMOVED_VIDEO_IDS.has(v.id)));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Update active video if initialVideoId changes
  useEffect(() => {
    if (initialVideoId) {
      setActiveVideoId(initialVideoId);
    } else {
      // Default to featured video if available, else first video
      const featured = videos.find((v) => v.featured);
      if (featured) {
        setActiveVideoId(featured.id);
      } else if (videos[0]) {
        setActiveVideoId(videos[0].id);
      }
    }
  }, [initialVideoId, videos]);

  // Lock body scroll and listen for ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Derive categories for filter tabs
  const filterCategories = useMemo(() => {
    const set = new Set<string>();
    videos.forEach((v) => {
      if (v.category) set.add(v.category);
    });
    return ["All", ...Array.from(set)];
  }, [videos]);

  // Filtered videos for the playlist sidebar
  const filteredVideos = useMemo(() => {
    if (selectedFilter === "All") return videos;
    return videos.filter((v) => v.category === selectedFilter);
  }, [videos, selectedFilter]);

  // Active playing video object
  const activeVideo = useMemo(() => {
    return videos.find((v) => v.id === activeVideoId) || videos[0] || defaultVideos[0];
  }, [videos, activeVideoId]);

  // Helper to extract embed url
  const getEmbedInfo = (url?: string) => {
    if (!url) return { type: "none", src: "" };

    const trimmed = url.trim();

    // YouTube
    if (trimmed.includes("youtube.com/watch")) {
      const match = trimmed.match(/[?&]v=([^&]+)/);
      const id = match ? match[1] : "";
      return {
        type: "youtube",
        src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`,
      };
    }
    if (trimmed.includes("youtu.be/")) {
      const id = trimmed.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0];
      return {
        type: "youtube",
        src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`,
      };
    }
    if (trimmed.includes("youtube.com/embed/")) {
      return {
        type: "youtube",
        src: trimmed.includes("autoplay=1")
          ? trimmed
          : `${trimmed}${trimmed.includes("?") ? "&" : "?"}autoplay=1&rel=0&modestbranding=1`,
      };
    }

    // Vimeo
    if (trimmed.includes("vimeo.com/")) {
      const id = trimmed.split("vimeo.com/")[1]?.split("?")[0]?.split("&")[0];
      return {
        type: "vimeo",
        src: `https://player.vimeo.com/video/${id}?autoplay=1&color=00e599`,
      };
    }

    // Direct Video (MP4 / WebM / Cloudinary video)
    if (
      trimmed.endsWith(".mp4") ||
      trimmed.endsWith(".webm") ||
      trimmed.endsWith(".ogg") ||
      trimmed.includes("/video/upload/")
    ) {
      return {
        type: "video",
        src: trimmed,
      };
    }

    return { type: "external", src: trimmed };
  };

  const embedInfo = getEmbedInfo(activeVideo?.videoUrl);

  // Navigate to previous / next video in playlist
  const handlePrevVideo = () => {
    const currentIndex = videos.findIndex((v) => v.id === activeVideoId);
    if (currentIndex > 0) {
      setActiveVideoId(videos[currentIndex - 1].id);
    } else {
      setActiveVideoId(videos[videos.length - 1].id);
    }
  };

  const handleNextVideo = () => {
    const currentIndex = videos.findIndex((v) => v.id === activeVideoId);
    if (currentIndex < videos.length - 1) {
      setActiveVideoId(videos[currentIndex + 1].id);
    } else {
      setActiveVideoId(videos[0].id);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Himalayan Energy Expo Cinema Archive"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#030712]/92 backdrop-blur-xl transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Cinema Modal Container */}
      <div className="relative z-10 w-full max-w-6xl bg-[#060D1A] border border-white/20 rounded-2xl sm:rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200 text-white font-sans">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E599] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E599]"></span>
            </span>

            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#00E599]" />
              <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white font-inter-tight">
                Himalayan Energy Expo <span className="text-slate-400 font-normal">· Cinema Archive</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#00E599] cursor-pointer"
              aria-label="Close cinema modal"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Theater Screen (Left) + Edition Glimpse Playlist (Right) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* LEFT: Video Theater Screen */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-black/40 p-3 sm:p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-white/10 scrollbar-thin">
            {/* 16:9 Video Player Viewport */}
            <div className="relative w-full aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.8)] shrink-0">
              {embedInfo.type === "youtube" || embedInfo.type === "vimeo" ? (
                <iframe
                  src={embedInfo.src}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              ) : embedInfo.type === "video" ? (
                <video
                  src={embedInfo.src}
                  poster={activeVideo.thumbnail}
                  controls
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950">
                  <Film className="w-12 h-12 text-[#00E599] mb-3 opacity-80" />
                  <p className="text-sm font-semibold text-white mb-2">
                    {activeVideo.title}
                  </p>
                  <p className="text-xs text-slate-400 mb-4 max-w-md">
                    This video is hosted on an external archive link.
                  </p>
                  <a
                    href={activeVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00E599] text-slate-950 font-bold text-xs hover:bg-[#00c785] transition-colors"
                  >
                    <span>Open External Video</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Clean Video Title Below Player */}
            <div className="mt-3 sm:mt-4">
              <h4 className="text-sm sm:text-base font-bold text-white font-inter-tight leading-snug">
                {activeVideo.title}
              </h4>
            </div>
          </div>

          {/* RIGHT: Past Editions Glimpse Playlist Sidebar */}
          <div className="w-full lg:w-88 xl:w-96 flex flex-col bg-slate-950/70 shrink-0">
            {/* Playlist Header & Category Filter Tabs */}
            <div className="p-3.5 sm:p-4 border-b border-white/10 space-y-2.5 shrink-0 bg-slate-950/90">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-[#00E599]" />
                  <span>Past Editions &amp; Glimpses</span>
                </div>
                <span className="text-[11px] font-mono text-[#00E599] font-semibold bg-[#00E599]/15 px-2 py-0.5 rounded-full border border-[#00E599]/30">
                  {filteredVideos.length} Video{filteredVideos.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                {filterCategories.map((cat) => {
                  const isSelected = selectedFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide whitespace-nowrap transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#00E599] text-slate-950 font-bold shadow-xs"
                          : "bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Playlist Items List */}
            <div
              ref={playlistContainerRef}
              className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[280px] lg:max-h-none scrollbar-thin"
            >
              {filteredVideos.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No videos found for this filter.
                </div>
              ) : (
                filteredVideos.map((video, idx) => {
                  const isCurrent = video.id === activeVideoId;
                  return (
                    <div
                      key={video.id}
                      onClick={() => setActiveVideoId(video.id)}
                      className={`group relative flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[#00E599]/12 border-[#00E599] shadow-[0_0_20px_rgba(0,229,153,0.15)]"
                          : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/25"
                      }`}
                    >
                      {/* Thumbnail Container with Play Overlay */}
                      <div className="relative w-24 h-16 sm:w-28 sm:h-18 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                        <Image
                          src={video.thumbnail || "/images/event-photo-6.webp"}
                          alt={video.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div
                          className={`absolute inset-0 flex items-center justify-center transition-colors ${
                            isCurrent
                              ? "bg-black/30"
                              : "bg-black/40 group-hover:bg-black/20"
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                              isCurrent
                                ? "bg-[#00E599] text-slate-950 scale-105 shadow-[0_0_12px_rgba(0,229,153,0.6)]"
                                : "bg-white/70 text-slate-950 group-hover:bg-[#00E599] group-hover:text-slate-950"
                            }`}
                          >
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          </div>
                        </div>

                        {video.duration && (
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/80 font-mono text-[9px] text-white">
                            {video.duration}
                          </div>
                        )}
                      </div>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                              isCurrent
                                ? "bg-[#00E599]/20 text-[#00E599]"
                                : "bg-white/10 text-slate-400"
                            }`}
                          >
                            {video.category}
                          </span>
                          {isCurrent && (
                            <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-[#00E599] uppercase tracking-wider animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00E599]"></span>
                              Playing
                            </span>
                          )}
                        </div>

                        <h5
                          className={`text-xs font-semibold line-clamp-2 leading-snug transition-colors ${
                            isCurrent ? "text-white" : "text-slate-200 group-hover:text-white"
                          }`}
                        >
                          {video.title}
                        </h5>

                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {video.year} {video.credits && `· ${video.credits}`}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

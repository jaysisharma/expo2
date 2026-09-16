"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { galleryData } from "@/data/gallery";
import { videosData } from "@/data/videos";
import { GalleryItem, VideoItem } from "@/lib/types";
import ImageLightbox from "./ImageLightbox";
import VideoModal from "./VideoModal";
import { Play, Maximize2, Columns, LayoutGrid, Grid3X3, ArrowUpRight, Sparkles } from "lucide-react";

type GalleryTab = "ALL" | "2024" | "2022" | "2019" | "2018" | "VIDEOS";
type LayoutMode = "masonry" | "bento" | "grid";

export default function MasonryGallery({ limit }: { limit?: number }) {
  const [activeTab, setActiveTab] = useState<GalleryTab>("ALL");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("masonry");
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(limit || 36);

  const tabs: { id: GalleryTab; label: string; count: number }[] = [
    { id: "ALL", label: "ALL PLATES", count: galleryData.length },
    { id: "2024", label: "2024 · 4TH", count: galleryData.filter((i) => i.year === "2024").length },
    { id: "2022", label: "2022 · 3RD", count: galleryData.filter((i) => i.year === "2022").length },
    { id: "2019", label: "2019 · 2ND", count: galleryData.filter((i) => i.year === "2019").length },
    { id: "2018", label: "2018 · 1ST", count: galleryData.filter((i) => i.year === "2018").length },
    { id: "VIDEOS", label: "VIDEO VAULT", count: videosData.length },
  ];

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    if (activeTab === "VIDEOS") return [];
    if (activeTab === "ALL") return galleryData;
    return galleryData.filter((p) => p.year === activeTab);
  }, [activeTab]);

  const displayedPhotos = filteredPhotos.slice(0, visibleCount);

  // Lightbox Handlers
  const handleNextPhoto = () => {
    if (!activePhoto) return;
    const currentIndex = filteredPhotos.findIndex((p) => p.id === activePhoto.id);
    const nextIndex = (currentIndex + 1) % filteredPhotos.length;
    setActivePhoto(filteredPhotos[nextIndex]);
  };

  const handlePrevPhoto = () => {
    if (!activePhoto) return;
    const currentIndex = filteredPhotos.findIndex((p) => p.id === activePhoto.id);
    const prevIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setActivePhoto(filteredPhotos[prevIndex]);
  };

  // Animation variants for smooth Awwwards-style staggered entry
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 24,
      },
    },
  };

  return (
    <div className="w-full space-y-8 font-sans">
      {/* =======================================================================
          01: AWWWARDS FLOATING INTERACTIVE CONTROLS BAR
         ======================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-20 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-3xl bg-white/80 backdrop-blur-2xl border border-neutral-200/80 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)]"
      >
        {/* Animated Sliding Pill Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setVisibleCount(limit || 36);
                }}
                className={`relative px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-mono font-bold transition-colors whitespace-nowrap cursor-pointer z-10 flex items-center gap-2 ${
                  isActive
                    ? tab.id === "VIDEOS"
                      ? "text-slate-950"
                      : "text-white"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                {/* Sliding Pill Background with LayoutId */}
                {isActive && (
                  <motion.div
                    layoutId="activePill"
                    className={`absolute inset-0 rounded-2xl -z-10 shadow-md ${
                      tab.id === "VIDEOS" ? "bg-[#10B981]" : "bg-[#04281E]"
                    }`}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isActive
                      ? tab.id === "VIDEOS"
                        ? "bg-black/20 text-slate-950 font-black"
                        : "bg-white/20 text-white font-bold"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Layout Switcher (Masonry vs Bento vs Grid) */}
        {activeTab !== "VIDEOS" && (
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-neutral-100/80 border border-neutral-200/60 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setLayoutMode("masonry")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                layoutMode === "masonry"
                  ? "bg-white text-neutral-950 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
              title="Masonry Organic Flow"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode("bento")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                layoutMode === "bento"
                  ? "bg-white text-neutral-950 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
              title="Editorial Bento Mosaic"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode("grid")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                layoutMode === "grid"
                  ? "bg-white text-neutral-950 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
              title="Cinematic Uniform Grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>

      {/* =======================================================================
          02: PHOTO DISPLAY WITH AWWWARDS HOVER PHYSICS & FLUID TRANSITIONS
         ======================================================================= */}
      {activeTab !== "VIDEOS" && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${layoutMode}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="space-y-10"
          >
            {/* LAYOUT 1: AWWWARDS MASONRY (Pinterest / Unsplash natural proportions) */}
            {layoutMode === "masonry" && (
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
                {displayedPhotos.map((item, idx) => {
                  const aspectClass =
                    idx % 5 === 0
                      ? "aspect-[3/4]"
                      : idx % 3 === 0
                      ? "aspect-[4/5]"
                      : idx % 2 === 0
                      ? "aspect-[16/10]"
                      : "aspect-[4/3]";

                  return (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      onClick={() => setActivePhoto(item)}
                      className="group relative cursor-pointer rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-200/80 hover:border-[#10B981] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 break-inside-avoid mb-5 block"
                    >
                      <div className={`relative w-full ${aspectClass} overflow-hidden`}>
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          loading="lazy"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        />
                      </div>

                      {/* AWWWARDS HOVER OVERLAY: Ultra-smooth Frosted Glass Reveal */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
                        {/* Top Badge Tag */}
                        <div className="flex items-center justify-between translate-y-[-6px] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                          <span className="text-[10px] font-mono font-bold text-neutral-300 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                            #{String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        {/* Bottom Metadata Reveal */}
                        <div className="space-y-1 translate-y-3 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                          <div className="text-[10px] font-mono font-bold text-[#34D399] uppercase tracking-wider">
                            {item.year} · EXHIBITION ARCHIVE
                          </div>
                          <h4 className="font-sans font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug">
                            {item.title}
                          </h4>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* LAYOUT 2: AWWWARDS EDITORIAL BENTO MOSAIC */}
            {layoutMode === "bento" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {displayedPhotos.map((item, idx) => {
                  const isFeature = idx % 7 === 0 && idx !== 0;

                  return (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      onClick={() => setActivePhoto(item)}
                      className={`group relative cursor-pointer rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-200/80 hover:border-[#10B981] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 ${
                        isFeature ? "sm:col-span-2 sm:row-span-2 min-h-[340px] sm:min-h-[500px]" : "col-span-1 min-h-[240px] sm:min-h-[280px]"
                      }`}
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        loading="lazy"
                        sizes={
                          isFeature
                            ? "(max-width: 768px) 100vw, 50vw"
                            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        }
                        className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      />

                      {/* ON HOVER: Frosted Glass Reveal */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
                        <div className="flex items-center justify-between translate-y-[-6px] group-hover:translate-y-0 transition-transform duration-500">
                          <span className="text-[10px] font-mono font-bold text-neutral-300 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                            #{String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <div className="space-y-1 translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                          <div className="text-[10px] font-mono font-bold text-[#34D399] uppercase tracking-wider">
                            {item.year} · MASTERPIECE
                          </div>
                          <h4 className="font-sans font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug">
                            {item.title}
                          </h4>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* LAYOUT 3: AWWWARDS CLEAN UNIFORM GRID */}
            {layoutMode === "grid" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {displayedPhotos.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    onClick={() => setActivePhoto(item)}
                    className="group relative cursor-pointer rounded-3xl overflow-hidden bg-neutral-900 aspect-[3/2] border border-neutral-200/80 hover:border-[#10B981] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] transition-all duration-500"
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />

                    {/* ON HOVER: Frosted Glass Reveal */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
                      <div className="flex items-center justify-between translate-y-[-6px] group-hover:translate-y-0 transition-transform duration-500">
                        <span className="text-[10px] font-mono font-bold text-neutral-300 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                          #{String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <div className="space-y-1 translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="text-[10px] font-mono font-bold text-[#34D399] uppercase tracking-wider">
                          {item.year}
                        </div>
                        <h4 className="font-sans font-bold text-xs sm:text-sm text-white line-clamp-1 leading-snug">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Load More Button with Magnetic Pill */}
            {visibleCount < filteredPhotos.length && (
              <div className="text-center pt-6">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 24)}
                  className="px-9 py-3.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-900 font-mono text-xs font-bold border border-neutral-300 hover:border-[#10B981] hover:shadow-lg transition-all cursor-pointer"
                >
                  LOAD MORE PLATES ({filteredPhotos.length - visibleCount})
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* =======================================================================
          03: VIDEO VAULT THEATER (AWWWARDS CINEMA PRESENTATION)
         ======================================================================= */}
      {activeTab === "VIDEOS" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {videosData.map((video) => (
            <div
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group relative cursor-pointer rounded-3xl overflow-hidden bg-black aspect-video border border-neutral-200/80 hover:border-[#10B981] hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.25)] transition-all duration-500"
            >
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-106 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              />

              {/* Glowing Awwwards Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#10B981] text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] group-hover:scale-110 group-hover:bg-[#34D399] transition-all duration-300">
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </div>
              </div>

              {/* ON HOVER: Bottom Reveal */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 pointer-events-none">
                <div className="space-y-1 translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="text-[10px] font-mono font-bold text-[#34D399] uppercase tracking-wider">
                    {video.category} {video.duration && `· ${video.duration}`}
                  </div>
                  <h4 className="font-sans font-bold text-sm text-white line-clamp-1 leading-snug">
                    {video.title}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Lightbox for Photos */}
      <ImageLightbox
        item={activePhoto}
        onClose={() => setActivePhoto(null)}
        onNext={handleNextPhoto}
        onPrev={handlePrevPhoto}
      />

      {/* Video Modal Player for Videos */}
      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
}

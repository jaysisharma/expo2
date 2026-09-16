import React from "react";
import type { Metadata } from "next";
import MasonryGallery from "@/components/gallery/MasonryGallery";
import Link from "next/link";
import { Sparkles, Camera, Film, ArrowDownRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Archival Exhibition Gallery | Himalayan Hydro & Green Energy Expo",
  description:
    "Explore authentic high-resolution photographs and official video archives from the Himalayan Hydro Expo.",
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans text-neutral-900 flex flex-col selection:bg-[#10B981] selection:text-neutral-950">
      {/* =========================================================================
          01: AWWWARDS EDITORIAL HERO HEADER
         ========================================================================= */}
      <div className="bg-[#04281E] text-white pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20 relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-300/70 font-mono mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#34D399]">Exhibition Gallery</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono font-bold text-[#34D399] uppercase mb-4 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>OFFICIAL VISUAL ARCHIVE · 2018–2026</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.08]">
                Exhibition Gallery
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-emerald-100/80 shrink-0">
              <span className="px-4 py-2 rounded-2xl bg-emerald-900/50 border border-emerald-500/30 flex items-center gap-2 shadow-xs backdrop-blur-md">
                <Camera className="w-4 h-4 text-[#34D399]" />
                <span>40+ Curated Plates</span>
              </span>
              <span className="px-4 py-2 rounded-2xl bg-emerald-900/50 border border-emerald-500/30 flex items-center gap-2 shadow-xs backdrop-blur-md">
                <Film className="w-4 h-4 text-[#38BDF8]" />
                <span>Video Vault</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02: AWWWARDS INTERACTIVE GALLERY CANVAS
         ========================================================================= */}
      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-7xl mx-auto">
          <MasonryGallery />
        </div>
      </div>
    </div>
  );
}

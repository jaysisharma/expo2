"use client";

import React from "react";
import Link from "next/link";
import FloorPlanCanvasStudio from "@/components/floor-plan/FloorPlanCanvasStudio";
import { ExternalLink, Maximize2 } from "lucide-react";

export default function AdminFloorPlanPage() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#218A59] border border-emerald-200 font-mono text-[10px] font-bold uppercase">
              Blueprint Studio
            </span>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
              Interactive Floor Plan & Stall Mapper
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Draw, scale, reposition, and calibrate stalls on top of the official Bhrikutimandap complex layout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/floor-plan/builder"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#234679]" />
            <span>Launch Fullscreen Studio</span>
          </Link>
          <Link
            href="/floor-plan"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Floor Map</span>
          </Link>
        </div>
      </div>

      {/* Studio Canvas */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-white">
        <FloorPlanCanvasStudio />
      </div>
    </div>
  );
}

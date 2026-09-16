"use client";

import React from "react";
import Link from "next/link";
import FloorPlanCanvasStudio from "@/components/floor-plan/FloorPlanCanvasStudio";
import { Compass, ExternalLink, Maximize2 } from "lucide-react";

export default function AdminFloorPlanPage() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold uppercase">
              Blueprint Studio
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Interactive Floor Plan & Stall Mapper
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Draw, scale, reposition, and calibrate stalls on top of the official Bhrikutimandap complex layout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/floor-plan/builder"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>Launch Fullscreen Studio</span>
          </Link>
          <Link
            href="/floor-plan"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Floor Map</span>
          </Link>
        </div>
      </div>

      {/* Studio Canvas */}
      <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl">
        <FloorPlanCanvasStudio />
      </div>
    </div>
  );
}

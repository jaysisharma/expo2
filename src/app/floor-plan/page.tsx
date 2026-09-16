import React from "react";
import type { Metadata } from "next";
import InteractiveFloorPlan from "@/components/floor-plan/InteractiveFloorPlan";
import Link from "next/link";
import { ArrowRight, Layers, Building } from "lucide-react";

export const metadata: Metadata = {
  title: "Interactive Floor Plan & Booth Map | Himalayan Hydro Expo 2026",
  description:
    "Explore real-time booth availability across the Bhrikutimandap Exhibition Halls. Select and reserve your exhibition space.",
};

export default function FloorPlanPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* =========================================================================
          01: SIMPLE HEADER WITH BACKGROUND COLOR (GREEN THEME)
         ========================================================================= */}
      <div className="bg-[#04281E] text-white pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-300/70 font-mono mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#34D399]">Floor Plan</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Interactive Floor Plan
              </h1>
              <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-xl">
                Bhrikutimandap Main Pavilion & Outdoor Arena. Click any stall on the map to inspect dimensions, availability, and reserve your booth.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/book-stall"
                className="px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-slate-950 text-xs font-black flex items-center gap-2 transition-colors shadow-md"
              >
                <span>Direct Stall Booking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02: INTERACTIVE FLOOR PLAN MAP
         ========================================================================= */}
      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-6xl mx-auto">
          <InteractiveFloorPlan />
        </div>
      </div>
    </div>
  );
}

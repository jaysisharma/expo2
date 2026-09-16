"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Calendar } from "lucide-react";

const InteractiveFloorPlan = dynamic(() => import("./InteractiveFloorPlan"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-3xl bg-slate-900 flex items-center justify-center text-slate-400 font-mono text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Loading Interactive Floor Plan...</span>
      </div>
    </div>
  ),
});

export default function VenueFloorPlanSection() {
  return (
    <section
      id="floor-plan-section"
      className="relative w-full py-16 sm:py-24 bg-[#FFFFFF] text-[#061A2A] font-sans border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-slate-100 mb-10"
        >
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F8F7] border border-slate-200 text-xs font-mono font-bold text-[#087EA4] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>INTERACTIVE FLOOR PLAN & STALL SELECTOR</span>
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl text-[#061A2A] tracking-tight leading-tight">
              SELECT & RESERVE YOUR <br />
              <span className="text-[#087EA4]">EXHIBITION STALL</span>{" "}
              <span className="text-[#059669]">IN REAL TIME.</span>
            </h2>
          </div>

          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#10B981]" />
                Bhrikutimandap Complex
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#087EA4]" />
                Magh 2 - 4 · 2027
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Click any stall on the interactive floor map below to check dimensions, pricing, and instantly reserve your exhibition space.
            </p>
          </div>
        </motion.div>

        {/* Live Theater-Style Floor Plan Component */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <InteractiveFloorPlan />
        </motion.div>
      </div>
    </section>
  );
}

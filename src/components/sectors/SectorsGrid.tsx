"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { sectorsData } from "@/data/sectors";
import { Sector } from "@/lib/types";
import { ArrowUpRight, ArrowRight, ArrowLeft, Check, X, Shield, Cpu, Zap, Disc, Layers, Landmark, Sun, Briefcase, TrendingUp, Truck, Wrench, GraduationCap, Cog } from "lucide-react";

export default function SectorsGrid() {
  const [activeSector, setActiveSector] = useState<Sector | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Disc": return Disc;
      case "Cpu": return Cpu;
      case "Cog": return Cog;
      case "Shield": return Shield;
      case "Zap": return Zap;
      case "Layers": return Layers;
      case "Landmark": return Landmark;
      case "Sun": return Sun;
      case "Briefcase": return Briefcase;
      case "TrendingUp": return TrendingUp;
      case "Truck": return Truck;
      case "Wrench": return Wrench;
      case "GraduationCap": return GraduationCap;
      default: return Zap;
    }
  };

  return (
    <section className="relative py-28 sm:py-36 bg-hydro-wash text-slate-900 px-4 sm:px-6 lg:px-12 border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-technical text-hydro-primary tracking-widest uppercase mb-4 font-bold">
              <span className="w-2 h-2 rounded-full bg-hydro-primary" />
              05 / EXHIBITION PROFILE
            </div>
            <h2 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-slate-900 tracking-tight leading-[0.92]">
              EVERYTHING <br />
              POWERING <br />
              <span className="text-hydro-primary">THE INDUSTRY.</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 self-start lg:self-auto">
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm hidden sm:block">
              14 specialized industrial sectors covering water-to-wire electro-mechanical packages, high-voltage GIS substations, tunneling TBMs, and green hydrogen.
            </p>
            {/* Scroll navigation buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-3 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
                aria-label="Scroll left"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-3 rounded-xl bg-hydro-primary text-white hover:bg-hydro-deep transition-colors shadow-sm"
                aria-label="Scroll right"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Large Horizontal Scrolling Showcase Gallery */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-8 pt-2 snap-x snap-mandatory scroll-smooth no-scrollbar"
        >
          {sectorsData.map((sector) => {
            const IconComponent = getIcon(sector.iconName);
            return (
              <div
                key={sector.id}
                onClick={() => setActiveSector(sector)}
                className="group shrink-0 w-[300px] sm:w-[380px] lg:w-[420px] rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer snap-start"
              >
                {/* Visual Header */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
                  <Image
                    src={sector.image}
                    alt={sector.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                  />
                  <div className="absolute top-4 left-4 font-technical text-xs font-bold text-slate-900 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    SECTOR // {sector.number}
                  </div>

                  <div className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/95 backdrop-blur-md text-hydro-primary border border-slate-200 group-hover:bg-hydro-primary group-hover:text-white transition-colors shadow-sm">
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {sector.nepaliTitle && (
                    <div className="absolute bottom-4 left-4 text-xs text-white bg-slate-900/80 px-2.5 py-1 rounded-md font-medium tracking-wide">
                      {sector.nepaliTitle}
                    </div>
                  )}
                </div>

                {/* Content Body */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-display font-bold text-xl text-slate-900 group-hover:text-hydro-primary transition-colors leading-tight">
                      {sector.title}
                    </h3>
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 font-normal line-clamp-3 leading-relaxed">
                      {sector.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-technical text-hydro-primary font-bold">
                    <span>EXPLORE SECTOR SPECIFICATIONS</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sector Modal Inspector */}
      <AnimatePresence>
        {activeSector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-8 text-slate-900 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setActiveSector(null)}
                className="absolute top-6 right-6 p-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:text-hydro-primary transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded bg-hydro-water text-hydro-deep font-technical text-xs font-bold border border-hydro-sky">
                  SECTOR // {activeSector.number}
                </span>
                <span className="text-xs font-technical text-slate-500">
                  {activeSector.nepaliTitle}
                </span>
              </div>

              <h3 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
                {activeSector.title}
              </h3>

              <p className="mt-3 text-sm text-slate-600 leading-relaxed font-normal">
                {activeSector.description}
              </p>

              <div className="mt-6 p-5 rounded-2xl bg-hydro-wash border border-slate-200">
                <span className="text-[10px] font-technical text-hydro-deep tracking-widest block mb-1.5 font-bold">
                  KEY FOCUS & REGIONAL BENCHMARK
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {activeSector.highlights}
                </p>
              </div>

              <div className="mt-6">
                <h4 className="font-technical text-xs text-hydro-primary tracking-wider uppercase mb-3 font-bold">
                  Featured Product & Engineering Lines
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeSector.subsectors.map((sub, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700"
                    >
                      <Check className="w-4 h-4 text-hydro-green shrink-0 mt-0.5" />
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-4 items-center justify-between">
                <Link
                  href="/book-stall"
                  onClick={() => setActiveSector(null)}
                  className="px-6 py-3.5 rounded-xl bg-hydro-primary hover:bg-hydro-deep text-white font-technical text-xs font-bold tracking-wider shadow-sm transition-colors"
                >
                  EXHIBIT IN THIS SECTOR →
                </Link>
                <Link
                  href="/exhibitors"
                  onClick={() => setActiveSector(null)}
                  className="px-6 py-3.5 rounded-xl bg-white text-slate-900 font-technical text-xs font-bold border border-slate-300 hover:border-hydro-primary transition-colors"
                >
                  VIEW SECTOR EXHIBITORS
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

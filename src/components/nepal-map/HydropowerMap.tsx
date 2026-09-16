"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { hydroProjectsData } from "@/data/projects";
import { HydroProject } from "@/lib/types";
import { Zap, Compass, Globe, ArrowRight } from "lucide-react";

export default function HydropowerMap() {
  const [selectedProject, setSelectedProject] = useState<HydroProject>(hydroProjectsData[0]);
  const [selectedBasin, setSelectedBasin] = useState<string>("ALL");

  const basins = ["ALL", "Koshi Basin", "Gandaki Basin", "Karnali & Mahakali Basin", "Bagmati & Trishuli"];

  const filteredProjects =
    selectedBasin === "ALL"
      ? hydroProjectsData
      : hydroProjectsData.filter((p) => p.riverBasin === selectedBasin);

  return (
    <section className="relative py-28 sm:py-36 bg-white px-4 sm:px-6 lg:px-12 border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 text-xs font-technical text-hydro-primary tracking-widest uppercase mb-4 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-hydro-primary" />
              04 / NATIONAL STRATEGIC OPPORTUNITY
            </div>
            <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-slate-900 tracking-tight leading-[0.9]">
              WHY NEPAL? <br />
              <span className="text-hydro-primary">THE NEXT ENERGY FRONTIER.</span>
            </h2>
          </div>

          <div className="lg:col-span-4 lg:border-l border-slate-200 lg:pl-8">
            <div className="flex flex-wrap gap-4 text-xs font-technical">
              <div className="space-y-0.5">
                <span className="text-slate-500 text-[10px] font-semibold">ECONOMIC POTENTIAL</span>
                <div className="text-slate-900 font-black text-2xl font-display">42,000+ MW</div>
              </div>
              <div className="space-y-0.5 pl-6 border-l border-slate-200">
                <span className="text-slate-500 text-[10px] font-semibold">2035 EXPORT TARGET</span>
                <div className="text-hydro-deep font-black text-2xl font-display">15,000 MW</div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Energy Flow Ribbon */}
        <div className="mb-12 p-6 rounded-2xl bg-hydro-wash border border-slate-200 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[750px] text-xs font-technical text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-hydro-primary" />
              <span className="font-bold text-slate-900">01 / GLACIAL RUNOFF</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-hydro-deep" />
              <span className="font-bold text-slate-900">02 / HIGH-HEAD STORAGE</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-hydro-teal" />
              <span className="font-bold text-slate-900">03 / TURBINE GENERATION</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-hydro-primary" />
              <span className="font-bold text-slate-900">04 / 400kV TRANSMISSION</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-hydro-green" />
              <span className="font-bold text-hydro-green">05 / REGIONAL TRILATERAL EXPORT</span>
            </div>
          </div>
        </div>

        {/* River Basin Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
          {basins.map((basin) => (
            <button
              key={basin}
              onClick={() => setSelectedBasin(basin)}
              className={`px-4 py-2 rounded-xl text-xs font-technical tracking-wider whitespace-nowrap transition-all ${
                selectedBasin === basin
                  ? "bg-hydro-primary text-white font-bold shadow-sm"
                  : "bg-white text-slate-700 hover:text-hydro-primary border border-slate-200"
              }`}
            >
              {basin}
            </button>
          ))}
        </div>

        {/* Interactive Map Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main SVG Schematic Map (8 Cols) */}
          <div className="lg:col-span-8 relative bg-hydro-wash rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between min-h-[480px] sm:min-h-[540px]">
            <div className="flex items-center justify-between text-xs text-slate-600 font-technical border-b border-slate-200 pb-3">
              <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                <Compass className="w-4 h-4 text-hydro-primary" />
                NEPAL HYDROPOWER RIVER BASIN SCHEMATIC
              </span>
              <span className="text-hydro-primary font-bold">
                {filteredProjects.length} PROJECTS DISPLAYED
              </span>
            </div>

            {/* Simulated Vector Geometry & Pins on Crisp Light Canvas */}
            <div className="relative w-full h-[360px] sm:h-[420px] my-4 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full opacity-60" preserveAspectRatio="none" viewBox="0 0 800 400">
                <path d="M 40,140 Q 220,70 420,130 T 760,110" fill="none" stroke="#0284C7" strokeWidth="3" strokeDasharray="5,5" />
                <path d="M 60,230 Q 260,170 480,250 T 730,200" fill="none" stroke="#0369A1" strokeWidth="2.5" />
                <path d="M 30,310 Q 290,270 580,330 T 770,280" fill="none" stroke="#0891B2" strokeWidth="3" strokeDasharray="6,6" />
                <path d="M 600,270 L 760,360" fill="none" stroke="#059669" strokeWidth="3.5" strokeDasharray="4,4" />
              </svg>

              <div className="absolute top-4 left-4 text-[10px] font-technical text-slate-700 bg-white/90 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm font-semibold">
                HIGH HIMALAYAN WATERWAYS (3,000M - 8,000M ELEVATION)
              </div>

              <div className="absolute bottom-4 right-4 text-[11px] font-technical text-hydro-green bg-white/95 px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 font-bold">
                <Zap className="w-4 h-4 text-hydro-green" />
                CROSS-BORDER CORRIDORS (NEPAL ↔ INDIA ↔ BANGLADESH)
              </div>

              {filteredProjects.map((project) => {
                const isSelected = selectedProject.id === project.id;
                return (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    style={{
                      left: `${project.coordinates.mapXPercent}%`,
                      top: `${project.coordinates.mapYPercent}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none z-20"
                  >
                    <div className="relative flex items-center justify-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-hydro-primary text-white scale-125 shadow-md"
                            : "bg-white text-hydro-primary border border-hydro-sky hover:scale-110 hover:bg-hydro-water shadow-sm"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                      </div>

                      <div
                        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded text-[10px] font-technical font-bold whitespace-nowrap pointer-events-none transition-all ${
                          isSelected
                            ? "bg-slate-900 text-white opacity-100 shadow-md"
                            : "bg-white text-slate-800 opacity-0 group-hover:opacity-100 border border-slate-200 shadow-sm"
                        }`}
                      >
                        {project.name.split(" ")[0]} ({project.capacityMW} MW)
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] font-technical text-slate-600 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-hydro-green font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-hydro-green" />
                  Operational
                </span>
                <span className="flex items-center gap-1.5 text-hydro-primary font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-hydro-primary" />
                  Under Construction
                </span>
                <span className="flex items-center gap-1.5 text-hydro-deep font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-hydro-deep" />
                  Mega Storage / Planning
                </span>
              </div>
              <span className="text-hydro-primary font-bold">CLICK ANY PIN TO INSPECT PROJECT</span>
            </div>
          </div>

          {/* Selected Project Dynamic Detail Panel (4 Cols) */}
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedProject.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="p-8 rounded-lg bg-white border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded text-[10px] font-technical font-bold uppercase bg-[#EBF3F8] text-[#3977A9] border border-[#D7E7F2]">
                    {selectedProject.status}
                  </span>
                  <span className="font-technical text-xs text-slate-500 font-semibold">
                    {selectedProject.district}, NEPAL
                  </span>
                </div>

                <h3 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                  {selectedProject.name}
                </h3>

                <div className="my-6 p-5 rounded-md bg-white border border-slate-200 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-technical text-slate-500 font-semibold">INSTALLED CAPACITY</span>
                    <div className="font-display font-black text-3xl text-[#3977A9]">
                      {selectedProject.capacityMW} <span className="text-sm font-normal">MW</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-technical text-slate-500 font-semibold">HYDRAULIC HEAD</span>
                    <div className="font-display font-black text-3xl text-slate-900">
                      {selectedProject.headMeters} <span className="text-sm font-normal">M</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  <p>{selectedProject.details}</p>

                  <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-[#3977A9] shrink-0 mt-0.5" />
                      <span>
                        <strong>Turbines:</strong> {selectedProject.turbineType}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-[#3FA476] shrink-0 mt-0.5" />
                      <span>
                        <strong>Export Corridor:</strong> {selectedProject.exportDestination}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200">
                  <Link
                    href="/register"
                    className="w-full py-3.5 rounded-md bg-[#3977A9] hover:bg-[#2C5E87] text-white font-technical text-xs font-bold tracking-wider text-center block shadow-sm transition-colors"
                  >
                    CONNECT WITH DEVELOPERS →
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

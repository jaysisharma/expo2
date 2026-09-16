"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface TechHotspot {
  id: string;
  name: string;
  category: string;
  xPercent: number;
  yPercent: number;
  specs: string[];
  description: string;
}

export default function TechnologyViewer() {
  const hotspots: TechHotspot[] = [
    {
      id: "runner",
      name: "Tungsten-Carbide HVOF Pelton Runner",
      category: "HYDRAULIC CORE",
      xPercent: 32,
      yPercent: 48,
      specs: [
        "Head Range: 400m – 1,400m",
        "Peak Hydraulic Efficiency: 94.8%",
        "Hard Coating: HVOF WC-Co-Cr (>1,200 HV0.3)",
      ],
      description:
        "Monolithic CNC-milled runner engineered to withstand catastrophic abrasion from ultra-hard Himalayan quartz silt during peak monsoon flows.",
    },
    {
      id: "generator",
      name: "High-Voltage Synchronous Hydro Generator",
      category: "ELECTRICAL CONVERSION",
      xPercent: 54,
      yPercent: 30,
      specs: [
        "Capacity: 50MW – 250MW per unit",
        "Insulation: Class F/H Vacuum Pressure Impregnated",
        "Excitation: Brushless with Dual Redundant AVR",
      ],
      description:
        "Salient-pole machine engineered for continuous baseload duty, withstanding 200% overspeed conditions and extreme seismic acceleration.",
    },
    {
      id: "miv",
      name: "Spherical Main Inlet Valve (MIV) & HPU",
      category: "HYDRAULIC CONTROL",
      xPercent: 20,
      yPercent: 68,
      specs: [
        "Design Pressure: 120 Bar (1,200m head)",
        "Emergency Closure Time: <25 seconds",
        "Dual Counterweight Gravity Fail-Safe",
      ],
      description:
        "Zero-leakage biplane spherical isolation valve preventing penstock water hammer and ensuring rapid shutdown in emergency trips.",
    },
    {
      id: "gis",
      name: "400kV Compact Gas Insulated Switchgear (GIS)",
      category: "GRID INTERCONNECTION",
      xPercent: 78,
      yPercent: 42,
      specs: [
        "Rated Voltage: 400 kV / 50 kA",
        "Footprint: 85% smaller than conventional AIS",
        "Seismic Endurance: 0.5g Peak Ground Acceleration",
      ],
      description:
        "Enables high-capacity cross-border bulk energy export from steep mountain cavern substations into the South Asian regional power pool.",
    },
    {
      id: "scada",
      name: "AI Autonomous Cascade Dispatch & SCADA",
      category: "DIGITAL OT",
      xPercent: 65,
      yPercent: 72,
      specs: [
        "Telemetry: Synchrophasor PMU at 50 Hz",
        "Predictive AI: Vibration FFT & Cavitation Telemetry",
        "Protocol: IEC 61850 & Cyber-Hardened Zero Trust",
      ],
      description:
        "Coordinates multi-plant river basin cascade dispatch in real-time, eliminating dry-season water spillage and maximizing PPA revenue.",
    },
  ];

  const [activeHotspot, setActiveHotspot] = useState<TechHotspot>(hotspots[0]);

  return (
    <section className="relative py-28 sm:py-36 bg-white px-4 sm:px-6 lg:px-12 border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 text-xs font-technical text-hydro-primary tracking-widest uppercase mb-4 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-hydro-primary" />
              06 / ENGINEERING BENCHMARK
            </div>
            <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-slate-900 tracking-tight leading-[0.9]">
              TECHNOLOGY <br />
              <span className="text-hydro-primary">IN MOTION.</span>
            </h2>
          </div>

          <div className="lg:col-span-4 lg:border-l border-slate-200 lg:pl-8">
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Interactive CAD breakdown of high-head hydroelectric generation, abrasive quartz silt mitigation, and 400kV regional grid connectivity.
            </p>
          </div>
        </div>

        {/* CAD Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Visual with Clickable Hotspot Pins (8 Cols) */}
          <div className="lg:col-span-8 relative min-h-[440px] sm:min-h-[560px] rounded-3xl bg-slate-900 border border-slate-200 overflow-hidden shadow-lg flex flex-col justify-between p-6">
            <Image
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=88"
              alt="Hydropower Turbine & Generator Engineering"
              fill
              className="object-cover object-center filter brightness-90 contrast-110"
            />
            <div className="absolute inset-0 bg-slate-950/30" />

            {/* Top CAD Label */}
            <div className="relative z-10 font-technical text-xs text-slate-900 bg-white/95 px-3.5 py-1.5 rounded-lg border border-slate-200 w-fit shadow-sm font-bold">
              CAD SCHEMATIC // WATER-TO-WIRE 450MW
            </div>

            {/* Hotspot Pins */}
            {hotspots.map((spot) => {
              const isSelected = activeHotspot.id === spot.id;
              return (
                <button
                  key={spot.id}
                  onClick={() => setActiveHotspot(spot)}
                  style={{
                    left: `${spot.xPercent}%`,
                    top: `${spot.yPercent}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none z-20"
                >
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-hydro-primary text-white scale-125 shadow-xl"
                          : "bg-white text-hydro-deep border border-hydro-borderWater hover:scale-110 hover:bg-hydro-water shadow-md"
                      }`}
                    >
                      <span className="font-technical text-[10px] font-bold">
                        {spot.id === "runner" ? "01" : spot.id === "generator" ? "02" : spot.id === "miv" ? "03" : spot.id === "gis" ? "04" : "05"}
                      </span>
                    </div>

                    <div
                      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded-md text-[10px] font-technical font-bold whitespace-nowrap pointer-events-none transition-all ${
                        isSelected
                          ? "bg-slate-900 text-white opacity-100 shadow-md"
                          : "bg-white text-slate-900 opacity-0 group-hover:opacity-100 border border-slate-200 shadow-sm"
                      }`}
                    >
                      {spot.name}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Bottom Status Telemetry Bar */}
            <div className="relative z-10 flex flex-wrap items-center justify-between text-[11px] font-technical text-slate-700 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-hydro-deep font-bold">CLICK ANY NUMBERED COMPONENT FOR LIVE SPECIFICATIONS</span>
              <span className="hidden sm:inline font-semibold">TOLERANCE: ±0.02MM · HEAVY QUARTZ SILT RESILIENT</span>
            </div>
          </div>

          {/* Active Hotspot Specification Card (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHotspot.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="p-8 rounded-3xl bg-white border border-slate-200 shadow-lg h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded text-[10px] font-technical font-bold uppercase bg-hydro-water text-hydro-deep border border-hydro-sky">
                      {activeHotspot.category}
                    </span>
                    <span className="font-technical text-xs text-slate-500 font-semibold">
                      SYSTEM 0{hotspots.findIndex((h) => h.id === activeHotspot.id) + 1}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                    {activeHotspot.name}
                  </h3>

                  <p className="mt-4 text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    {activeHotspot.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-slate-200 space-y-2.5">
                    <span className="text-[10px] font-technical text-hydro-deep tracking-widest block font-bold">
                      ENGINEERING BENCHMARKS
                    </span>
                    {activeHotspot.specs.map((spec, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-hydro-wash border border-slate-200 text-xs text-slate-800 font-mono flex items-center gap-2.5"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-hydro-primary shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200">
                  <Link
                    href="/floor-plan"
                    className="w-full py-3.5 rounded-xl bg-hydro-wash hover:bg-hydro-water text-hydro-deep font-technical text-xs font-bold text-center tracking-wider border border-slate-300 hover:border-hydro-primary transition-all flex items-center justify-center gap-2"
                  >
                    <span>LOCATE OEMS ON FLOOR PLAN</span>
                    <ArrowRight className="w-4 h-4 text-hydro-primary" />
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

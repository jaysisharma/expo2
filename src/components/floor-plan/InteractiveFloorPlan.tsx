"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  officialStalls,
  OfficialStall,
  CATEGORY_COLORS,
} from "@/data/officialFloorPlanData";
import {
  Search,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  MapPin,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Building2,
  Calendar,
  Layers,
} from "lucide-react";

// Normalized coordinates (% based on 1024 x 723 image)
interface ClickableHotspot {
  id: string;
  left: string;
  top: string;
  width: string;
  height: string;
  rotate?: string;
}

const stallHotspots: Record<string, ClickableHotspot> = {
  // BLOCK C (Top Row C9 - C16)
  C9: { id: "C9", left: "45.0%", top: "28.5%", width: "4.8%", height: "8.5%", rotate: "-9deg" },
  C10: { id: "C10", left: "49.6%", top: "29.8%", width: "4.8%", height: "8.5%", rotate: "-9deg" },
  C11: { id: "C11", left: "54.1%", top: "31.0%", width: "4.8%", height: "8.5%", rotate: "-9deg" },
  C12: { id: "C12", left: "58.6%", top: "32.2%", width: "4.8%", height: "8.5%", rotate: "-9deg" },
  C13: { id: "C13", left: "63.1%", top: "33.5%", width: "4.8%", height: "8.5%", rotate: "-9deg" },
  C14: { id: "C14", left: "67.6%", top: "34.8%", width: "4.8%", height: "8.5%", rotate: "-9deg" },
  C15: { id: "C15", left: "72.1%", top: "36.0%", width: "4.8%", height: "8.5%", rotate: "-9deg" },
  C16: { id: "C16", left: "76.6%", top: "37.2%", width: "4.8%", height: "8.5%", rotate: "-9deg" },

  // BLOCK C (Bottom Row C1 - C8)
  C1: { id: "C1", left: "43.5%", top: "38.2%", width: "4.8%", height: "8.5%", rotate: "-9deg" },
  C2: { id: "C2", left: "48.1%", top: "39.4%", width: "4.8%", height: "8.5%", rotate: "-9deg" },
  C3: { id: "C3", left: "52.6%", top: "40.7%", width: "4.8%", height: "8.5%", rotate: "-9deg" },
  C4: { id: "C4", left: "57.1%", top: "41.9%", width: "4.8%", height: "8.5%", rotate: "-9deg" },
  C5: { id: "C5", left: "61.6%", top: "43.2%", width: "4.8%", height: "8.5%", rotate: "-9deg" },
  C6: { id: "C6", left: "66.1%", top: "44.4%", width: "4.8%", height: "8.5%", rotate: "-9deg" },
  C7: { id: "C7", left: "70.6%", top: "45.7%", width: "4.8%", height: "8.5%", rotate: "-9deg" },
  C8: { id: "C8", left: "75.1%", top: "46.9%", width: "4.8%", height: "8.5%", rotate: "-9deg" },

  // BLOCK B (Outer Column B1 - B11)
  B1: { id: "B1", left: "33.2%", top: "41.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B2: { id: "B2", left: "32.0%", top: "39.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B3: { id: "B3", left: "30.8%", top: "37.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B4: { id: "B4", left: "29.6%", top: "35.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B5: { id: "B5", left: "28.4%", top: "33.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B6: { id: "B6", left: "27.2%", top: "31.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B7: { id: "B7", left: "26.0%", top: "29.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B8: { id: "B8", left: "24.8%", top: "27.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B9: { id: "B9", left: "23.6%", top: "25.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B10: { id: "B10", left: "22.4%", top: "23.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B11: { id: "B11", left: "21.2%", top: "21.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },

  // BLOCK B (Inner Column B12 - B22)
  B12: { id: "B12", left: "22.8%", top: "22.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B13: { id: "B13", left: "24.0%", top: "24.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B14: { id: "B14", left: "25.2%", top: "26.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B15: { id: "B15", left: "26.4%", top: "28.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B16: { id: "B16", left: "27.6%", top: "30.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B17: { id: "B17", left: "28.8%", top: "32.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B18: { id: "B18", left: "30.0%", top: "34.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B19: { id: "B19", left: "31.2%", top: "36.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B20: { id: "B20", left: "32.4%", top: "38.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B21: { id: "B21", left: "33.6%", top: "40.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },
  B22: { id: "B22", left: "34.8%", top: "42.0%", width: "2.3%", height: "3.4%", rotate: "-60deg" },

  // BLOCK A (Outer Curve A9 - A22)
  A9: { id: "A9", left: "5.1%", top: "74.8%", width: "2.8%", height: "3.8%", rotate: "0deg" },
  A10: { id: "A10", left: "5.1%", top: "70.5%", width: "2.8%", height: "3.8%", rotate: "0deg" },
  A11: { id: "A11", left: "5.1%", top: "66.2%", width: "2.8%", height: "3.8%", rotate: "0deg" },
  A12: { id: "A12", left: "5.1%", top: "62.0%", width: "2.8%", height: "3.8%", rotate: "0deg" },
  A13: { id: "A13", left: "5.1%", top: "57.6%", width: "2.8%", height: "3.8%", rotate: "0deg" },
  A14: { id: "A14", left: "5.6%", top: "53.2%", width: "2.8%", height: "3.8%", rotate: "-15deg" },
  A15: { id: "A15", left: "6.7%", top: "49.0%", width: "2.8%", height: "3.8%", rotate: "-30deg" },
  A16: { id: "A16", left: "9.2%", top: "42.0%", width: "2.8%", height: "3.8%", rotate: "-45deg" },
  A17: { id: "A17", left: "12.0%", top: "37.5%", width: "2.8%", height: "3.8%", rotate: "-40deg" },
  A18: { id: "A18", left: "14.6%", top: "34.8%", width: "2.8%", height: "3.8%", rotate: "-30deg" },
  A19: { id: "A19", left: "17.4%", top: "32.8%", width: "2.8%", height: "3.8%", rotate: "-25deg" },
  A20: { id: "A20", left: "20.3%", top: "30.8%", width: "2.8%", height: "3.8%", rotate: "-25deg" },
  A21: { id: "A21", left: "23.1%", top: "29.0%", width: "2.8%", height: "3.8%", rotate: "-25deg" },
  A22: { id: "A22", left: "25.8%", top: "27.2%", width: "2.8%", height: "3.8%", rotate: "-25deg" },

  // BLOCK A (Bottom Grey A8 - A5)
  A8: { id: "A8", left: "7.8%", top: "79.8%", width: "2.6%", height: "3.4%", rotate: "0deg" },
  A7: { id: "A7", left: "10.4%", top: "79.8%", width: "2.6%", height: "3.4%", rotate: "0deg" },
  A6: { id: "A6", left: "13.6%", top: "79.8%", width: "2.6%", height: "3.4%", rotate: "0deg" },
  A5: { id: "A5", left: "16.2%", top: "79.8%", width: "2.6%", height: "3.4%", rotate: "0deg" },

  // BLOCK A (Central Space A47)
  A47: { id: "A47", left: "12.8%", top: "52.8%", width: "4.4%", height: "6.0%", rotate: "-35deg" },

  // BLOCK A (Island 1: A23 - A30)
  A23: { id: "A23", left: "25.8%", top: "33.2%", width: "2.6%", height: "3.6%", rotate: "-60deg" },
  A24: { id: "A24", left: "27.2%", top: "35.8%", width: "2.6%", height: "3.6%", rotate: "-60deg" },
  A25: { id: "A25", left: "28.6%", top: "38.4%", width: "2.6%", height: "3.6%", rotate: "-60deg" },
  A26: { id: "A26", left: "30.0%", top: "41.0%", width: "2.6%", height: "3.6%", rotate: "-60deg" },
  A27: { id: "A27", left: "29.2%", top: "49.0%", width: "2.6%", height: "3.6%", rotate: "-60deg" },
  A28: { id: "A28", left: "27.0%", top: "50.2%", width: "2.6%", height: "3.6%", rotate: "-60deg" },
  A29: { id: "A29", left: "24.8%", top: "51.4%", width: "2.6%", height: "3.6%", rotate: "-60deg" },
  A30: { id: "A30", left: "22.6%", top: "52.6%", width: "2.6%", height: "3.6%", rotate: "-60deg" },

  // BLOCK A (Island 2: A31 - A38)
  A38: { id: "A38", left: "15.8%", top: "44.5%", width: "2.6%", height: "3.6%", rotate: "-30deg" },
  A37: { id: "A37", left: "18.2%", top: "43.2%", width: "2.6%", height: "3.6%", rotate: "-30deg" },
  A36: { id: "A36", left: "20.6%", top: "41.9%", width: "2.6%", height: "3.6%", rotate: "-30deg" },
  A35: { id: "A35", left: "23.0%", top: "40.6%", width: "2.6%", height: "3.6%", rotate: "-30deg" },
  A34: { id: "A34", left: "24.2%", top: "43.8%", width: "2.6%", height: "3.6%", rotate: "-30deg" },
  A33: { id: "A33", left: "21.8%", top: "45.1%", width: "2.6%", height: "3.6%", rotate: "-30deg" },
  A32: { id: "A32", left: "19.4%", top: "46.4%", width: "2.6%", height: "3.6%", rotate: "-30deg" },
  A31: { id: "A31", left: "17.0%", top: "47.7%", width: "2.6%", height: "3.6%", rotate: "-30deg" },

  // BLOCK A (Island 3: A39 - A46)
  A39: { id: "A39", left: "10.0%", top: "62.0%", width: "2.7%", height: "3.6%", rotate: "0deg" },
  A40: { id: "A40", left: "10.0%", top: "65.8%", width: "2.7%", height: "3.6%", rotate: "0deg" },
  A41: { id: "A41", left: "10.0%", top: "69.6%", width: "2.7%", height: "3.6%", rotate: "0deg" },
  A42: { id: "A42", left: "10.0%", top: "73.4%", width: "2.7%", height: "3.6%", rotate: "0deg" },
  A46: { id: "A46", left: "12.8%", top: "62.0%", width: "2.7%", height: "3.6%", rotate: "0deg" },
  A45: { id: "A45", left: "12.8%", top: "65.8%", width: "2.7%", height: "3.6%", rotate: "0deg" },
  A44: { id: "A44", left: "12.8%", top: "69.6%", width: "2.7%", height: "3.6%", rotate: "0deg" },
  A43: { id: "A43", left: "12.8%", top: "73.4%", width: "2.7%", height: "3.6%", rotate: "0deg" },

  // BLOCK A (Island 4: A1 - A4)
  A1: { id: "A1", left: "18.2%", top: "64.8%", width: "2.6%", height: "3.6%", rotate: "0deg" },
  A2: { id: "A2", left: "18.2%", top: "68.6%", width: "2.6%", height: "3.6%", rotate: "0deg" },
  A3: { id: "A3", left: "18.2%", top: "72.4%", width: "2.6%", height: "3.6%", rotate: "0deg" },
  A4: { id: "A4", left: "18.2%", top: "76.2%", width: "2.6%", height: "3.6%", rotate: "0deg" },

  // BARE SPACE 20x60 (Upper & Lower)
  BS1: { id: "BS1", left: "25.2%", top: "50.5%", width: "11.2%", height: "6.8%", rotate: "-30deg" },
  BS2: { id: "BS2", left: "20.8%", top: "66.5%", width: "4.8%", height: "15.0%", rotate: "0deg" },

  // FOOD COURT (F1, F2)
  F1: { id: "F1", left: "38.8%", top: "15.2%", width: "3.0%", height: "4.4%", rotate: "0deg" },
  F2: { id: "F2", left: "42.0%", top: "15.2%", width: "3.0%", height: "4.4%", rotate: "0deg" },
};

export default function InteractiveFloorPlan({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [selectedStalls, setSelectedStalls] = useState<string[]>(["C1"]);
  const [hoveredStall, setHoveredStall] = useState<OfficialStall | null>(null);
  const [activeStall, setActiveStall] = useState<OfficialStall>(
    officialStalls.find((s) => s.id === "C1") || officialStalls[0]
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const toggleStall = (stall: OfficialStall) => {
    if (stall.status === "Booked" || stall.category === "SEMINAR HALL") return;

    setActiveStall(stall);
    setSelectedStalls((prev) =>
      prev.includes(stall.id)
        ? prev.filter((id) => id !== stall.id)
        : [...prev, stall.id]
    );
  };

  const selectedStallObjects = officialStalls.filter((s) =>
    selectedStalls.includes(s.id)
  );

  const totalAreaSqM = selectedStallObjects.reduce((acc, curr) => acc + curr.sizeSqM, 0);
  const totalAreaSqFt = selectedStallObjects.reduce((acc, curr) => acc + curr.sizeSqFt, 0);
  const totalPriceNPR = selectedStallObjects.reduce((acc, curr) => acc + curr.priceNPR, 0);
  const totalPriceUSD = selectedStallObjects.reduce((acc, curr) => acc + curr.priceUSD, 0);

  return (
    <div className="w-full font-sans select-none space-y-6">
      {/* =========================================================================
          01: CONTROLS & SEARCH BAR
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-slate-200 shadow-sm font-mono text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#087EA4]" />
          <span className="font-bold text-[#061A2A] uppercase tracking-wider">
            OFFICIAL EXHIBITION FLOOR PLAN (THEATER SEAT SELECTION)
          </span>
        </div>

        {/* Zoom & Search Controls + Canvas Studio Link */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/floor-plan/builder"
            className="px-3 py-1.5 rounded-lg bg-[#061A2A] hover:bg-[#087EA4] text-[#19BFE8] hover:text-white font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#19BFE8]" />
            <span>DRAW & EDIT STALLS STUDIO ↗</span>
          </Link>

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Stall (e.g. C1, A12, B5)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#087EA4]"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
              className="p-1.5 rounded hover:bg-white text-slate-700 font-bold"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.8))}
              className="p-1.5 rounded hover:bg-white text-slate-700 font-bold"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded hover:bg-white text-slate-700 font-bold"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02: EXACT BLUEPRINT IMAGE CANVAS WITH INTERACTIVE CLICKABLE STALL OVERLAYS
         ========================================================================= */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#FFFFFF] border-2 border-slate-200 shadow-md">
        <div className="relative w-full overflow-auto bg-slate-50 p-2 sm:p-6 flex items-center justify-center min-h-[580px]">
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease-out",
            }}
            className="relative w-[1024px] h-[723px] max-w-none bg-white rounded-xl shadow-lg border border-slate-300"
          >
            {/* The Exact Official Blueprint Image Background */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/floor-plan-official.png"
              alt="Official Floor Plan Layout"
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* Interactive Clickable Hotspots mapped directly over the blueprint */}
            {Object.entries(stallHotspots).map(([stallId, hotspot]) => {
              const stall = officialStalls.find((s) => s.id === stallId);
              if (!stall) return null;

              const isSelected = selectedStalls.includes(stall.id);
              const isHovered = hoveredStall?.id === stall.id;
              const isBooked = stall.status === "Booked";
              const isMatchSearch =
                searchQuery !== "" &&
                (stall.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  stall.category.toLowerCase().includes(searchQuery.toLowerCase()));

              return (
                <button
                  key={stall.id}
                  onClick={() => toggleStall(stall)}
                  onMouseEnter={() => {
                    setHoveredStall(stall);
                    setActiveStall(stall);
                  }}
                  onMouseLeave={() => setHoveredStall(null)}
                  disabled={isBooked}
                  style={{
                    left: hotspot.left,
                    top: hotspot.top,
                    width: hotspot.width,
                    height: hotspot.height,
                    transform: hotspot.rotate ? `rotate(${hotspot.rotate})` : undefined,
                  }}
                  className={`absolute rounded-sm transition-all duration-150 flex items-center justify-center font-mono font-bold cursor-pointer ${
                    isSelected
                      ? "bg-[#061A2A]/90 text-[#19BFE8] border-2 border-[#19BFE8] ring-4 ring-[#19BFE8]/40 shadow-2xl scale-110 z-30"
                      : isHovered
                      ? "bg-[#087EA4]/40 border-2 border-[#061A2A] shadow-lg scale-105 z-20"
                      : isMatchSearch
                      ? "ring-4 ring-[#F59E0B] bg-amber-400/40 z-10"
                      : isBooked
                      ? "bg-slate-900/60 cursor-not-allowed z-0"
                      : "hover:bg-[#087EA4]/30 z-10"
                  }`}
                >
                  {/* Visual Checkmark for Selected State */}
                  {isSelected && (
                    <span className="text-[10px] sm:text-xs font-black text-[#19BFE8]">
                      ✓ {stall.number}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Hover Tooltip Floating Card */}
        {hoveredStall && (
          <div className="absolute top-4 left-4 z-40 pointer-events-none p-3.5 rounded-xl bg-[#061A2A]/95 text-white backdrop-blur-md border border-white/20 shadow-2xl font-mono text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-base text-white">
                STALL {hoveredStall.number}
              </span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                  hoveredStall.status === "Available"
                    ? "bg-[#22C55E] text-white"
                    : hoveredStall.status === "Reserved"
                    ? "bg-[#F59E0B] text-white"
                    : "bg-slate-600 text-white"
                }`}
              >
                {hoveredStall.status}
              </span>
            </div>
            <div className="text-[#19BFE8] font-bold text-[11px]">
              {hoveredStall.category} · {hoveredStall.dimensions}
            </div>
            <div className="text-slate-300 text-[10px]">
              Area: {hoveredStall.sizeSqM} m² ({hoveredStall.sizeSqFt} sq.ft) · {hoveredStall.powerIncluded}
            </div>
            <div className="text-[#43D69A] font-bold text-xs pt-0.5">
              NPR {hoveredStall.priceNPR.toLocaleString()} / USD ${hoveredStall.priceUSD.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          03: THEATER CART & BOOKING CHECKOUT BAR (STICKY BOTTOM CLOSER)
         ========================================================================= */}
      <div className="p-6 rounded-2xl bg-[#061A2A] text-white border border-white/10 shadow-2xl font-mono flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        {/* Left: Selected Stalls List */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#19BFE8]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              YOUR SELECTED STALLS ({selectedStalls.length}):
            </span>
          </div>

          {selectedStalls.length === 0 ? (
            <div className="text-xs text-slate-400 italic">
              Click any colored stall directly on the official blueprint image above to select and reserve it (theater-style seat selection).
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {selectedStallObjects.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 border border-[#19BFE8]/40 text-xs font-bold text-white shadow-sm"
                >
                  <span className="text-[#19BFE8]">{s.number}</span>
                  <span className="text-slate-300 text-[10px]">
                    ({s.category} · {s.sizeSqM}m²)
                  </span>
                  <button
                    onClick={() => toggleStall(s)}
                    className="hover:text-red-400 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setSelectedStalls([])}
                className="text-[11px] text-slate-400 hover:text-red-400 underline ml-2"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Right: Price Aggregates & Instant Checkout CTA */}
        <div className="flex flex-wrap items-center gap-6 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
          <div className="space-y-0.5 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
              TOTAL ESTIMATED INVESTMENT
            </div>
            <div className="font-sans font-black text-2xl text-white">
              NPR {totalPriceNPR.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold text-[#43D69A]">
              USD ${totalPriceUSD.toLocaleString()} · {totalAreaSqM} m² ({totalAreaSqFt} sq.ft)
            </div>
          </div>

          <Link
            href={`/book-stall${
              selectedStalls.length > 0
                ? `?stalls=${selectedStalls.join(",")}`
                : ""
            }`}
            className={`px-6 py-3.5 rounded-full font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
              selectedStalls.length > 0
                ? "bg-[#19A974] hover:bg-[#158f62] text-white hover:scale-105"
                : "bg-[#087EA4] hover:bg-[#066584] text-white"
            }`}
          >
            <span>
              {selectedStalls.length > 0
                ? `PROCEED TO BOOK (${selectedStalls.length} STALL${
                    selectedStalls.length > 1 ? "S" : ""
                  })`
                : "OPEN STALL BOOKING WIZARD"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import savedFloorPlanFallback from "@/data/savedCustomFloorPlan.json";
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

export interface InteractiveFloorPlanProps {
  compact?: boolean;
  selectedStalls?: string[];
  onSelectStall?: (stall: any) => void;
  showCheckoutBar?: boolean;
  onProceedToBooking?: (selectedStallIds: string[]) => void;
}

export default function InteractiveFloorPlan({
  compact = false,
  selectedStalls: controlledSelectedStalls,
  onSelectStall,
  showCheckoutBar = true,
  onProceedToBooking,
}: InteractiveFloorPlanProps) {
  const [elements, setElements] = useState<any[]>(savedFloorPlanFallback.elements || []);
  const [bgImageSrc, setBgImageSrc] = useState<string>(
    (savedFloorPlanFallback as any).bgImageSrc || "/images/floor-plan-official.png"
  );
  const [blueprintOpacity, setBlueprintOpacity] = useState<number>(
    (savedFloorPlanFallback as any).blueprintOpacity ?? 0.65
  );

  const [internalSelectedStalls, setInternalSelectedStalls] = useState<string[]>(["C1"]);
  const isControlled = controlledSelectedStalls !== undefined;
  const selectedStalls = isControlled ? controlledSelectedStalls : internalSelectedStalls;

  const [hoveredStall, setHoveredStall] = useState<any | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch latest saved custom floor plan from API
  useEffect(() => {
    async function loadFloorPlan() {
      try {
        const res = await fetch("/api/floor-plan/save");
        const json = await res.json();
        if (json.success && json.data?.elements?.length) {
          setElements(json.data.elements);
          if (json.data.bgImageSrc) setBgImageSrc(json.data.bgImageSrc);
          if (json.data.blueprintOpacity !== undefined)
            setBlueprintOpacity(json.data.blueprintOpacity);
        }
      } catch (err) {
        console.warn("Using local fallback custom floor plan:", err);
      }
    }
    loadFloorPlan();
  }, []);

  // Filter stall elements only
  const stallElements = elements.filter(
    (el) => el.type === "stall" || el.type === "custom-shape" || !el.type
  );

  const toggleStall = (stall: any) => {
    if (stall.status === "Booked" || stall.category === "SEMINAR HALL") return;

    if (onSelectStall) {
      onSelectStall(stall);
    }
    if (!isControlled) {
      const stallNumber = stall.number || stall.id;
      setInternalSelectedStalls((prev) =>
        prev.includes(stallNumber)
          ? prev.filter((id) => id !== stallNumber)
          : [...prev, stallNumber]
      );
    }
  };

  const selectedStallObjects = stallElements.filter((s) => {
    const sId = s.number || s.id;
    return selectedStalls.includes(sId);
  });

  const totalAreaSqM = selectedStallObjects.reduce(
    (acc, curr) => acc + (curr.sizeSqM || 70),
    0
  );
  const totalAreaSqFt = selectedStallObjects.reduce(
    (acc, curr) => acc + (curr.sizeSqFt || 753),
    0
  );
  const totalPriceNPR = selectedStallObjects.reduce(
    (acc, curr) => acc + (curr.priceNPR || 875000),
    0
  );
  const totalPriceUSD = selectedStallObjects.reduce(
    (acc, curr) => acc + (curr.priceUSD || 6500),
    0
  );

  const canvasWidth = 1200;
  const canvasHeight = 850;

  return (
    <div className="w-full font-sans select-none space-y-6">
      {/* =========================================================================
          01: CONTROLS & SEARCH BAR
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm font-mono text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#218A59]" />
          <span className="font-bold text-slate-900 uppercase tracking-wider">
            EXHIBITION FLOOR PLAN ({stallElements.length} STALLS)
          </span>
        </div>

        {/* Zoom & Search Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/floor-plan/builder"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#218A59] text-emerald-400 hover:text-white font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>EDIT STALLS STUDIO ↗</span>
          </Link>

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Stall (e.g. C1, A12, B5)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#218A59]"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
              className="p-1.5 rounded hover:bg-white text-slate-700 font-bold cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.7))}
              className="p-1.5 rounded hover:bg-white text-slate-700 font-bold cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded hover:bg-white text-slate-700 font-bold cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02: CUSTOM BUILT FLOOR PLAN CANVAS WITH INTERACTIVE STALLS
         ========================================================================= */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-200 shadow-md">
        <div className="relative w-full overflow-auto bg-slate-950 p-2 sm:p-6 flex items-center justify-center min-h-[600px]">
          <div
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease-out",
            }}
            className="relative max-w-none bg-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden shrink-0"
          >
            {/* Background Blueprint Image */}
            {bgImageSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bgImageSrc}
                alt="Floor Plan Blueprint"
                style={{ opacity: blueprintOpacity }}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
            )}

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {/* Render All Custom Drawn Stalls */}
            {stallElements.map((el) => {
              const stallNumber = el.number || el.id;
              const isSelected = selectedStalls.includes(stallNumber);
              const isHovered = hoveredStall?.id === el.id;
              const isBooked = el.status === "Booked";
              const isReserved = el.status === "Reserved";

              const q = searchQuery.toLowerCase().trim();
              const isMatchSearch =
                q !== "" &&
                (stallNumber.toLowerCase().includes(q) ||
                  (el.category && el.category.toLowerCase().includes(q)));

              return (
                <div
                  key={el.id}
                  onClick={() => toggleStall(el)}
                  onMouseEnter={() => setHoveredStall(el)}
                  onMouseLeave={() => setHoveredStall(null)}
                  style={{
                    position: "absolute",
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                    transformOrigin: "center center",
                    backgroundColor: isSelected
                      ? "#10B981"
                      : isBooked
                      ? "#475569"
                      : isReserved
                      ? "#F59E0B"
                      : el.color || "#0284C7",
                    opacity: isBooked ? 0.6 : el.fillOpacity ?? 0.85,
                    borderColor: isSelected
                      ? "#34D399"
                      : isHovered
                      ? "#FFFFFF"
                      : el.borderColor || "#38BDF8",
                    borderWidth: isSelected ? "3px" : isHovered ? "2px" : `${el.strokeWidth || 2}px`,
                    borderStyle: "solid",
                    borderRadius: `${el.borderRadius || 4}px`,
                    boxShadow: isSelected
                      ? "0 0 20px rgba(16, 185, 129, 0.8)"
                      : isHovered
                      ? "0 0 15px rgba(255, 255, 255, 0.5)"
                      : "none",
                  }}
                  className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-150 z-10 ${
                    isBooked ? "cursor-not-allowed" : "hover:scale-105"
                  } ${isMatchSearch ? "ring-4 ring-amber-400" : ""}`}
                >
                  <span
                    style={{ color: el.textColor || "#FFFFFF" }}
                    className="font-mono font-black text-xs sm:text-sm drop-shadow-md select-none pointer-events-none"
                  >
                    {isSelected ? `✓ ${stallNumber}` : stallNumber}
                  </span>
                  {el.dimensions && el.width >= 50 && el.height >= 40 && (
                    <span className="text-[9px] font-mono text-white/80 select-none pointer-events-none">
                      {el.dimensions}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Hover Tooltip Floating Card */}
        {hoveredStall && (
          <div className="absolute top-4 left-4 z-40 pointer-events-none p-4 rounded-xl bg-slate-900/95 text-white backdrop-blur-md border border-white/20 shadow-2xl font-mono text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-base text-white">
                STALL {hoveredStall.number || hoveredStall.id}
              </span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                  hoveredStall.status === "Available" || !hoveredStall.status
                    ? "bg-[#10B981] text-white"
                    : hoveredStall.status === "Reserved"
                    ? "bg-[#F59E0B] text-white"
                    : "bg-slate-600 text-white"
                }`}
              >
                {hoveredStall.status || "Available"}
              </span>
            </div>
            <div className="text-emerald-400 font-bold text-[11px]">
              {hoveredStall.category || "Exhibition Booth"} · {hoveredStall.dimensions || "10m × 7m"}
            </div>
            <div className="text-slate-300 text-[10px]">
              Area: {hoveredStall.sizeSqM || 70} m² ({hoveredStall.sizeSqFt || 753} sq.ft)
            </div>
            <div className="text-[#34D399] font-bold text-xs pt-0.5">
              NPR {(hoveredStall.priceNPR || 875000).toLocaleString()} / USD ${(hoveredStall.priceUSD || 6500).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          03: THEATER CART & BOOKING CHECKOUT BAR
         ========================================================================= */}
      {showCheckoutBar && (
        <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl font-mono flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* Left: Selected Stalls List */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                SELECTED STALLS ({selectedStalls.length}):
              </span>
            </div>

            {selectedStalls.length === 0 ? (
              <div className="text-xs text-slate-400 italic">
                Click any colored stall on the floor plan above to select it.
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {selectedStallObjects.map((s) => {
                  const sId = s.number || s.id;
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-xs font-bold text-white shadow-sm"
                    >
                      <span className="text-emerald-400 font-black">{sId}</span>
                      <span className="text-slate-300 text-[10px]">
                        ({s.dimensions || "10m × 7m"})
                      </span>
                      <button
                        onClick={() => toggleStall(s)}
                        className="hover:text-red-400 ml-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
                {!isControlled && (
                  <button
                    onClick={() => setInternalSelectedStalls([])}
                    className="text-[11px] text-slate-400 hover:text-red-400 underline ml-2 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Price Aggregates & Instant Checkout CTA */}
          <div className="flex flex-wrap items-center gap-6 border-t lg:border-t-0 lg:border-l border-slate-700 pt-4 lg:pt-0 lg:pl-6">
            <div className="space-y-0.5 text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                ESTIMATED INVESTMENT
              </div>
              <div className="font-sans font-black text-2xl text-white">
                NPR {totalPriceNPR.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-emerald-400">
                USD ${totalPriceUSD.toLocaleString()} · {totalAreaSqM} m² ({totalAreaSqFt} sq.ft)
              </div>
            </div>

            {onProceedToBooking ? (
              <button
                type="button"
                onClick={() => onProceedToBooking(selectedStalls)}
                className={`px-6 py-3.5 rounded-full font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
                  selectedStalls.length > 0
                    ? "bg-[#218A59] hover:bg-[#1a6e46] text-white hover:scale-105"
                    : "bg-slate-700 hover:bg-slate-600 text-white"
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
              </button>
            ) : (
              <Link
                href={`/book-stall${
                  selectedStalls.length > 0
                    ? `?stalls=${selectedStalls.join(",")}`
                    : ""
                }`}
                className={`px-6 py-3.5 rounded-full font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
                  selectedStalls.length > 0
                    ? "bg-[#218A59] hover:bg-[#1a6e46] text-white hover:scale-105"
                    : "bg-slate-700 hover:bg-slate-600 text-white"
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

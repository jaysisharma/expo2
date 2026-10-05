"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Maximize2,
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
  showSearch?: boolean;
  showBuilderLink?: boolean;
  initialZoom?: number;
}

export default function InteractiveFloorPlan({
  compact = false,
  selectedStalls: controlledSelectedStalls,
  onSelectStall,
  showCheckoutBar = true,
  onProceedToBooking,
  showSearch = true,
  showBuilderLink = false,
  initialZoom = 0.85,
}: InteractiveFloorPlanProps) {
  const [elements, setElements] = useState<any[]>(savedFloorPlanFallback.elements || []);
  const [bgImageSrc, setBgImageSrc] = useState<string>(
    (savedFloorPlanFallback as any).bgImageSrc || "/images/floor-plan-official.webp"
  );
  const [blueprintOpacity, setBlueprintOpacity] = useState<number>(
    (savedFloorPlanFallback as any).blueprintOpacity ?? 0.65
  );
  const [canvasBgMode, setCanvasBgMode] = useState<string>(
    (savedFloorPlanFallback as any).canvasBgMode || "cad-dark"
  );
  const [showBgImage, setShowBgImage] = useState<boolean>(
    (savedFloorPlanFallback as any).showBgImage !== undefined
      ? (savedFloorPlanFallback as any).showBgImage
      : true
  );

  const [canvasWidth, setCanvasWidth] = useState<number>(
    (savedFloorPlanFallback as any).canvasWidth || 1200
  );
  const [canvasHeight, setCanvasHeight] = useState<number>(
    (savedFloorPlanFallback as any).canvasHeight || 850
  );

  const [internalSelectedStalls, setInternalSelectedStalls] = useState<string[]>([]);
  const isControlled = controlledSelectedStalls !== undefined;
  const selectedStalls = isControlled ? controlledSelectedStalls : internalSelectedStalls;

  const [hoveredStall, setHoveredStall] = useState<any | null>(null);
  const [activeMobileStall, setActiveMobileStall] = useState<any | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(initialZoom);
  const [fitZoom, setFitZoom] = useState<number>(0.35);
  const [hasInitializedMobileZoom, setHasInitializedMobileZoom] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const touchStartRef = useRef<{ dist: number; zoom: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [boothOverrides, setBoothOverrides] = useState<Record<string, any>>({});
  const [primeSurchargePercent, setPrimeSurchargePercent] = useState<number>(25);

  // Dynamic Auto-Fit calculation based on container clientWidth
  const updateFitZoom = useCallback(() => {
    if (!containerRef.current) return 0.35;
    const containerW = containerRef.current.clientWidth;
    if (!containerW) return 0.35;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const padding = isMobile ? 16 : 32;
    const availableW = Math.max(containerW - padding, 220);
    const calculated = Number((availableW / canvasWidth).toFixed(2));
    const clamped = Math.max(0.18, Math.min(calculated, 1.2));
    setFitZoom(clamped);
    return clamped;
  }, [canvasWidth]);

  useEffect(() => {
    const calculated = updateFitZoom();
    if (!hasInitializedMobileZoom && typeof window !== "undefined") {
      if (window.innerWidth < 768) {
        setZoomLevel(calculated);
      }
      setHasInitializedMobileZoom(true);
    }

    const handleResize = () => {
      updateFitZoom();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateFitZoom, hasInitializedMobileZoom]);

  const minZoom = Math.min(0.2, Number((fitZoom * 0.8).toFixed(2)));
  const maxZoom = 2.5;

  const handleZoomIn = () => {
    setZoomLevel((z) => Math.min(Number((z + 0.15).toFixed(2)), maxZoom));
  };

  const handleZoomOut = () => {
    setZoomLevel((z) => Math.max(Number((z - 0.15).toFixed(2)), minZoom));
  };

  const handleFitToScreen = () => {
    const fz = updateFitZoom();
    setZoomLevel(fz);
  };

  const handleResetZoom = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      handleFitToScreen();
    } else {
      setZoomLevel(initialZoom);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = { dist, zoom: zoomLevel };
      setIsPinching(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartRef.current.dist;
      const nextZoom = Math.min(Math.max(touchStartRef.current.zoom * factor, minZoom), maxZoom);
      setZoomLevel(Number(nextZoom.toFixed(2)));
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    setIsPinching(false);
  };

  // Fetch latest saved custom floor plan and overrides from API
  useEffect(() => {
    async function loadFloorPlan() {
      try {
        const [res, adminRes] = await Promise.all([
          fetch(`/api/floor-plan/save?t=${Date.now()}`, { cache: "no-store" }),
          fetch(`/api/admin/data?t=${Date.now()}`, { cache: "no-store" }).catch(() => null),
        ]);
        const json = await res.json();
        let loadedElements = elements;
        if (json.success && json.data) {
          if (Array.isArray(json.data.elements) && json.data.elements.length > 0) {
            loadedElements = json.data.elements;
            setElements(json.data.elements);
          }
          if (json.data.bgImageSrc) setBgImageSrc(json.data.bgImageSrc);
          if (json.data.blueprintOpacity !== undefined)
            setBlueprintOpacity(json.data.blueprintOpacity);
          if (json.data.canvasBgMode) setCanvasBgMode(json.data.canvasBgMode);
          if (json.data.showBgImage !== undefined) setShowBgImage(json.data.showBgImage);
          if (json.data.canvasWidth) setCanvasWidth(Number(json.data.canvasWidth) || 1200);
          if (json.data.canvasHeight) setCanvasHeight(Number(json.data.canvasHeight) || 850);
        }
        if (adminRes && adminRes.ok) {
          const adminJson = await adminRes.json();
          if (adminJson?.data?.settings?.primeStallSurchargePercent !== undefined) {
            setPrimeSurchargePercent(Number(adminJson.data.settings.primeStallSurchargePercent) || 25);
          }
          if (adminJson?.data?.boothOverrides) {
            setBoothOverrides(adminJson.data.boothOverrides);
            const overrides = adminJson.data.boothOverrides;
            setElements((prev) =>
              prev.map((el) => {
                const sNum = el.number || el.id;
                const ov = overrides[sNum] || (el.id && overrides[el.id]);
                if (!ov) return el;
                return {
                  ...el,
                  priceNPR: ov.priceNPR !== undefined && ov.priceNPR !== null ? Number(ov.priceNPR) : el.priceNPR,
                  priceUSD: ov.priceUSD !== undefined && ov.priceUSD !== null ? Number(ov.priceUSD) : el.priceUSD,
                  status: ov.status || el.status,
                  isPrime: ov.isPrime !== undefined ? Boolean(ov.isPrime) : el.isPrime,
                };
              })
            );
          }
        }
      } catch (err) {
        console.warn("Using local fallback custom floor plan:", err);
      }
    }
    loadFloorPlan();
  }, []);

  // Filter stall elements (ONLY rectangular stalls, never polygons and never boundary outlines)
  const stallElements = elements.filter(
    (el) =>
      el.type !== "polygon" &&
      (!el.points || el.points.length < 3) &&
      el.category !== "Hollow Wall / Boundary" &&
      el.category !== "Zone / Functional Area" &&
      el.color !== "transparent" &&
      el.fillOpacity !== 0 &&
      (el.type === "stall" || el.type === "custom-shape" || !el.type)
  );

  // Drawing elements (lines, arcs, pencil strokes, text labels, circles, walls, boundary polygons, zone boxes, and outlines)
  const drawingElements = elements.filter(
    (el) =>
      el.type === "line" ||
      el.type === "pencil" ||
      el.type === "arc" ||
      el.type === "text" ||
      el.type === "circle" ||
      el.type === "wall" ||
      el.type === "polygon" ||
      el.type === "zone" ||
      el.category === "Hollow Wall / Boundary" ||
      el.category === "Zone / Functional Area" ||
      el.color === "transparent" ||
      el.fillOpacity === 0 ||
      Boolean(el.points && el.points.length >= 3)
  );

  const getPencilPathData = (points: { x: number; y: number }[]): string => {
    if (!points || points.length === 0) return "";
    return points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");
  };

  const toggleStall = (stall: any) => {
    const stallNumber = stall.number || stall.id;
    const override = boothOverrides[stallNumber] || (stall.id && boothOverrides[stall.id]);
    const effectiveStatus = override?.status || stall.status;

    // Show mobile detail card when tapped on mobile screens (< 768px)
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setActiveMobileStall(stall);
    }

    if (effectiveStatus === "Booked" || stall.category === "SEMINAR HALL") return;

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

  const isActualStall = (el: any) => {
    if (el.category === "Hollow Wall / Boundary" || el.category === "Zone / Functional Area" || el.type === "zone") return false;
    if (el.color === "transparent" || el.color === "none" || el.fillOpacity === 0) return false;
    if (el.type === "line" || el.type === "pencil" || el.type === "arc" || el.type === "text") return false;
    if (el.number === "WALL" || el.number === "CURVE" || el.number === "OUTLINE") return false;
    return Boolean(el.number || el.priceNPR || el.priceUSD);
  };

  const selectedStallObjects = elements.filter((s) => {
    if (!isActualStall(s)) return false;
    const sId = s.number || s.id;
    return selectedStalls.includes(sId) || (s.number && selectedStalls.includes(s.number)) || (s.id && selectedStalls.includes(s.id));
  });

  const totalAreaSqM = selectedStallObjects.reduce(
    (acc, curr) => acc + (curr.sizeSqM !== undefined && curr.sizeSqM !== null ? Number(curr.sizeSqM) : 9),
    0
  );
  const totalAreaSqFt = selectedStallObjects.reduce(
    (acc, curr) => acc + (curr.sizeSqFt !== undefined && curr.sizeSqFt !== null ? Number(curr.sizeSqFt) : Math.round((Number(curr.sizeSqM) || 9) * 10.76)),
    0
  );
  const primeSurchargeRate = (primeSurchargePercent || 25) / 100;

  const totalPriceNPR = selectedStallObjects.reduce((acc, curr) => {
    const sNum = curr.number || curr.id;
    const ov = boothOverrides[sNum] || (curr.id && boothOverrides[curr.id]);
    const basePrice =
      ov?.priceNPR !== undefined && ov?.priceNPR !== null
        ? Number(ov.priceNPR)
        : curr.priceNPR !== undefined && curr.priceNPR !== null
        ? Number(curr.priceNPR)
        : 180000;
    const isPrime = ov?.isPrime !== undefined ? Boolean(ov.isPrime) : Boolean(curr.isPrime);
    const surcharge = isPrime ? Math.round(basePrice * primeSurchargeRate) : 0;
    return acc + basePrice + surcharge;
  }, 0);

  const totalPriceUSD = selectedStallObjects.reduce((acc, curr) => {
    const sNum = curr.number || curr.id;
    const ov = boothOverrides[sNum] || (curr.id && boothOverrides[curr.id]);
    const basePrice =
      ov?.priceUSD !== undefined && ov?.priceUSD !== null
        ? Number(ov.priceUSD)
        : curr.priceUSD !== undefined && curr.priceUSD !== null
        ? Number(curr.priceUSD)
        : 1350;
    const isPrime = ov?.isPrime !== undefined ? Boolean(ov.isPrime) : Boolean(curr.isPrime);
    const surcharge = isPrime ? Math.round(basePrice * primeSurchargeRate) : 0;
    return acc + basePrice + surcharge;
  }, 0);

  const hasSelectedPrime = selectedStallObjects.some((curr) => {
    const sNum = curr.number || curr.id;
    const ov = boothOverrides[sNum] || (curr.id && boothOverrides[curr.id]);
    return ov?.isPrime !== undefined ? Boolean(ov.isPrime) : Boolean(curr.isPrime);
  });

  // 13% Government VAT
  const vatRate = 0.13;
  const vatNPR = Math.round(totalPriceNPR * vatRate);
  const vatUSD = Math.round(totalPriceUSD * vatRate);
  const totalWithVatNPR = totalPriceNPR + vatNPR;
  const totalWithVatUSD = totalPriceUSD + vatUSD;

  return (
    <div className="w-full font-sans select-none space-y-6">
      {/* =========================================================================
          01: CONTROLS & SEARCH BAR
         ========================================================================= */}
      <div className="flex flex-col gap-3 p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm font-mono text-xs">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles className="w-4 h-4 text-[#218A59]" />
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] sm:text-xs">
              EXHIBITION FLOOR PLAN ({stallElements.length} STALLS)
            </span>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              + 13% VAT
            </span>
          </div>

          {/* Builder Link if enabled */}
          {showBuilderLink && (
            <Link
              href="/floor-plan/builder"
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#218A59] text-emerald-400 hover:text-white font-bold flex items-center gap-1.5 transition-all shadow-sm text-[11px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>EDIT STALLS STUDIO ↗</span>
            </Link>
          )}
        </div>

        {/* Bottom Controls Row: Search + Zoom Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {showSearch && (
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Stall (e.g. C1, A12, B5)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 sm:py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#218A59]"
              />
            </div>
          )}

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 rounded hover:bg-white text-slate-700 font-bold cursor-pointer active:scale-95 transition-transform"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 rounded hover:bg-white text-slate-700 font-bold cursor-pointer active:scale-95 transition-transform"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleFitToScreen}
                className="px-2.5 py-1.5 sm:py-1 rounded bg-white sm:bg-transparent hover:bg-white text-slate-800 text-[11px] font-bold cursor-pointer flex items-center gap-1 shadow-xs border sm:border-0 border-slate-200 active:scale-95 transition-transform"
                title="Fit to Screen"
              >
                <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fit Screen</span>
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 rounded hover:bg-white text-slate-700 font-bold cursor-pointer active:scale-95 transition-transform"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-slate-500 font-mono px-1.5 font-bold border-l border-slate-300">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Gesture Hint Bar */}
        <div className="sm:hidden flex items-center gap-1.5 text-[10px] text-slate-500 font-sans bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <span className="text-emerald-600 font-bold">💡 Touch tip:</span>
          <span>Pinch with 2 fingers to zoom · Drag to pan the floor plan</span>
        </div>
      </div>

      {/* =========================================================================
          02: CUSTOM BUILT FLOOR PLAN CANVAS WITH INTERACTIVE STALLS & DRAWN LINES
         ========================================================================= */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-200 shadow-md">
        <div
          ref={containerRef}
          className="relative w-full overflow-auto touch-pan-x touch-pan-y overscroll-contain bg-slate-950 p-2 sm:p-6 min-h-[380px] sm:min-h-[600px] flex items-start justify-start select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Sizing wrapper for exact bounding box and natural scrolling without phantom margins */}
          <div
            style={{
              width: `${Math.round(canvasWidth * zoomLevel)}px`,
              height: `${Math.round(canvasHeight * zoomLevel)}px`,
              margin: "auto",
            }}
            className="relative shrink-0 transition-[width,height] duration-150 ease-out"
          >
            <div
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top left",
                transition: isPinching ? "none" : "transform 0.15s ease-out",
                backgroundColor:
                  canvasBgMode === "clean-white"
                    ? "#FFFFFF"
                    : canvasBgMode === "cad-navy"
                    ? "#0F172A"
                    : "#0C121C",
              }}
              className="relative max-w-none rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700 overflow-hidden"
            >
            {/* Background Blueprint Image */}
            {showBgImage && bgImageSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bgImageSrc}
                alt="Floor Plan Blueprint"
                style={{ opacity: blueprintOpacity }}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
            )}

            {/* Grid Pattern Overlay */}
            <div
              className={`absolute inset-0 pointer-events-none ${
                canvasBgMode === "clean-white"
                  ? "bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)]"
                  : "bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]"
              } bg-[size:20px_20px]`}
            />

            {/* SVG Drawing Layer for Lines, Arcs, Freehand Pencil, Text Labels & Shapes */}
            <svg
              viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            >
              {drawingElements.map((el) => {
                // 1. Straight Line / Wall
                if (el.type === "line" && el.points && el.points.length >= 2) {
                  return (
                    <line
                      key={el.id}
                      x1={el.points[0].x}
                      y1={el.points[0].y}
                      x2={el.points[1].x}
                      y2={el.points[1].y}
                      stroke={el.borderColor || "#38BDF8"}
                      strokeWidth={el.strokeWidth || 2}
                      strokeLinecap="round"
                    />
                  );
                }

                // 2. Freehand Pencil Path
                if (el.type === "pencil" && el.points && el.points.length > 0) {
                  return (
                    <path
                      key={el.id}
                      d={getPencilPathData(el.points)}
                      fill="none"
                      stroke={el.borderColor || "#38BDF8"}
                      strokeWidth={el.strokeWidth || 2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                }

                // 3. Arc / Curve
                if (el.type === "arc" && el.points && el.points.length >= 2 && el.arcControl) {
                  return (
                    <path
                      key={el.id}
                      d={`M ${el.points[0].x} ${el.points[0].y} Q ${el.arcControl.x} ${el.arcControl.y} ${el.points[1].x} ${el.points[1].y}`}
                      fill="none"
                      stroke={el.borderColor || "#38BDF8"}
                      strokeWidth={el.strokeWidth || 2}
                      strokeLinecap="round"
                    />
                  );
                }

                // 4. Text Label
                if (el.type === "text") {
                  const fontSize = el.fontSize || 16;
                  const fontWeight = el.fontWeight || "bold";
                  const textContent = el.number || el.category || "";
                  const approxCharWidth = fontSize * 0.65;
                  const textW = Math.max(el.width || 0, Math.ceil(textContent.length * approxCharWidth) + 20);
                  const textH = Math.max(el.height || 0, Math.ceil(fontSize * 1.35));
                  const baselineOffset = fontSize * 0.85;
                  const topY = el.y - baselineOffset;
                  const centerX = el.x + textW / 2;
                  const centerY = topY + textH / 2;

                  return (
                    <g
                      key={el.id}
                      transform={
                        el.rotation
                          ? `rotate(${el.rotation}, ${centerX}, ${centerY})`
                          : undefined
                      }
                    >
                      <text
                        x={el.x}
                        y={el.y}
                        fill={el.textColor || (canvasBgMode === "clean-white" ? "#0F172A" : "#FFFFFF")}
                        fontSize={fontSize}
                        fontWeight={fontWeight}
                        fontFamily="sans-serif"
                      >
                        {textContent}
                      </text>
                    </g>
                  );
                }

                // 5. Circle / Zone
                if (el.type === "circle") {
                  return (
                    <circle
                      key={el.id}
                      cx={el.x + el.width / 2}
                      cy={el.y + el.height / 2}
                      r={Math.min(el.width, el.height) / 2}
                      fill={el.color || "transparent"}
                      fillOpacity={el.fillOpacity ?? 0.5}
                      stroke={el.borderColor || "#38BDF8"}
                      strokeWidth={el.strokeWidth || 2}
                    />
                  );
                }

                // 6. Polygon (Boundary Outline, Functional Zone, or Bookable Polygon Stall)
                if ((el.type === "polygon" || (el.points && el.points.length >= 3)) && el.points) {
                  const pointsStr = el.points.map((p: any) => `${p.x},${p.y}`).join(" ");
                  const isOutline =
                    el.category === "Hollow Wall / Boundary" ||
                    el.color === "transparent" ||
                    el.color === "none" ||
                    el.fillOpacity === 0;
                  const isZone = el.category === "Zone / Functional Area" || el.type === "zone";
                  const isBookable =
                    !isOutline &&
                    !isZone &&
                    ((el.priceNPR && el.priceNPR > 0) ||
                      (el.priceUSD && el.priceUSD > 0) ||
                      (el.number && !el.number.startsWith("WALL") && !el.number.startsWith("OUTLINE")));

                  const stallNumber = el.number || el.id;
                  const isSelected = isBookable && selectedStalls.some((s) => s.toLowerCase() === stallNumber.toLowerCase() || (el.id && s.toLowerCase() === el.id.toLowerCase()));
                  const isHovered = isBookable && hoveredStall?.id === el.id;

                  return (
                    <g
                      key={el.id}
                      className={isBookable ? "cursor-pointer pointer-events-auto" : ""}
                      onClick={() => isBookable && toggleStall(el)}
                      onMouseEnter={() => {
                        if (typeof window !== "undefined" && window.innerWidth >= 768) {
                          isBookable && setHoveredStall(el);
                        }
                      }}
                      onMouseLeave={() => {
                        if (typeof window !== "undefined" && window.innerWidth >= 768) {
                          isBookable && setHoveredStall(null);
                        }
                      }}
                    >
                      <polygon
                        points={pointsStr}
                        fill={
                          isOutline
                            ? "none"
                            : isSelected
                            ? "#10B981"
                            : isHovered
                            ? "#38BDF8"
                            : el.color === "transparent" || el.color === "none"
                            ? "none"
                            : el.color || "#0284C7"
                        }
                        fillOpacity={
                          isOutline
                            ? 0
                            : isSelected
                            ? 0.9
                            : isHovered
                            ? 0.85
                            : el.fillOpacity ?? (isZone ? 0.45 : 0.85)
                        }
                        stroke={
                          isOutline
                            ? el.borderColor || "#38BDF8"
                            : isSelected
                            ? "#34D399"
                            : isHovered
                            ? "#FFFFFF"
                            : el.borderColor || "#38BDF8"
                        }
                        strokeWidth={isOutline ? el.strokeWidth || 2 : isSelected ? 3 : isHovered ? 2.5 : el.strokeWidth || 2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        pointerEvents={isOutline ? "none" : undefined}
                      />
                      {el.number && !isOutline && (
                        <text
                          x={el.x + el.width / 2 + (el.textOffsetX || 0)}
                          y={el.y + el.height / 2 + (el.textOffsetY || 0)}
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={
                            el.textRotation
                              ? `rotate(${el.textRotation}, ${el.x + el.width / 2 + (el.textOffsetX || 0)}, ${el.y + el.height / 2 + (el.textOffsetY || 0)})`
                              : undefined
                          }
                          fill={el.textColor || "#FFFFFF"}
                          fontSize={el.fontSize || (el.width > 60 ? 11 : el.width > 30 ? 9 : 7.5)}
                          fontWeight={el.fontWeight || "bold"}
                          fontFamily={isZone ? "sans-serif" : "monospace"}
                          className="select-none pointer-events-none drop-shadow-md"
                        >
                          {isSelected ? `✓ ${stallNumber}` : stallNumber}
                        </text>
                      )}
                    </g>
                  );
                }

                // 7. Rectangular Outline or Zone (Hollow Wall / Boundary Box)
                if (
                  (el.category === "Hollow Wall / Boundary" ||
                    el.type === "zone" ||
                    el.category === "Zone / Functional Area" ||
                    el.color === "transparent" ||
                    el.color === "none" ||
                    el.fillOpacity === 0) &&
                  (!el.points || el.points.length < 3)
                ) {
                  const isOutline =
                    el.category === "Hollow Wall / Boundary" ||
                    el.color === "transparent" ||
                    el.color === "none" ||
                    el.fillOpacity === 0;
                  return (
                    <g
                      key={el.id}
                      transform={
                        el.rotation
                          ? `rotate(${el.rotation}, ${el.x + el.width / 2}, ${el.y + el.height / 2})`
                          : undefined
                      }
                      className={isOutline ? "pointer-events-none" : undefined}
                    >
                      <rect
                        x={el.x}
                        y={el.y}
                        width={el.width}
                        height={el.height}
                        rx={el.borderRadius || 4}
                        fill={isOutline || el.color === "transparent" || el.color === "none" ? "none" : el.color || "#0284C7"}
                        fillOpacity={isOutline ? 0 : el.fillOpacity ?? 0.45}
                        stroke={el.borderColor || "#38BDF8"}
                        strokeWidth={el.strokeWidth || 2}
                        pointerEvents={isOutline ? "none" : undefined}
                      />
                      {el.number && !isOutline && (
                        <text
                          x={el.x + el.width / 2 + (el.textOffsetX || 0)}
                          y={el.y + el.height / 2 + (el.textOffsetY || 0)}
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={
                            el.textRotation
                              ? `rotate(${el.textRotation}, ${el.x + el.width / 2 + (el.textOffsetX || 0)}, ${el.y + el.height / 2 + (el.textOffsetY || 0)})`
                              : undefined
                          }
                          fill={el.textColor || "#FFFFFF"}
                          fontSize={el.fontSize || (el.width > 60 ? 11 : el.width > 30 ? 9 : 7.5)}
                          fontWeight={el.fontWeight || "bold"}
                          fontFamily="sans-serif"
                        >
                          {el.number}
                        </text>
                      )}
                    </g>
                  );
                }

                return null;
              })}
            </svg>

            {/* Render All Custom Drawn Stalls */}
            {stallElements.map((el) => {
              const stallNumber = el.number || el.id;
              const override = boothOverrides[stallNumber] || (el.id && boothOverrides[el.id]);
              const effectiveStatus = override?.status || el.status;
              const isPrime = Boolean(override?.isPrime ?? el.isPrime);
              const isSelected = selectedStalls.some((s) => s.toLowerCase() === stallNumber.toLowerCase() || (el.id && s.toLowerCase() === el.id.toLowerCase()));
              const isHovered = hoveredStall?.id === el.id;
              const isBooked = effectiveStatus === "Booked";
              const isReserved = effectiveStatus === "Reserved";

              const q = searchQuery.toLowerCase().trim();
              const isMatchSearch =
                q !== "" &&
                (stallNumber.toLowerCase().includes(q) ||
                  (el.category && el.category.toLowerCase().includes(q)));

              const computedFontSize = el.fontSize || (el.width > 60 ? 11 : el.width > 30 ? 9 : 7.5);
              const computedFontWeight = el.fontWeight || "bold";
              const textTranslate = (el.textOffsetX || el.textOffsetY)
                ? `translate(${el.textOffsetX || 0}px, ${el.textOffsetY || 0}px)`
                : "";
              const textRotate = el.textRotation ? `rotate(${el.textRotation}deg)` : "";
              const combinedTextTransform = [textTranslate, textRotate].filter(Boolean).join(" ") || undefined;

              return (
                <div
                  key={el.id}
                  onClick={() => toggleStall(el)}
                  onMouseEnter={() => {
                    if (typeof window !== "undefined" && window.innerWidth >= 768) {
                      setHoveredStall(el);
                    }
                  }}
                  onMouseLeave={() => {
                    if (typeof window !== "undefined" && window.innerWidth >= 768) {
                      setHoveredStall(null);
                    }
                  }}
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
                      : isPrime && !isBooked
                      ? "#F59E0B"
                      : el.borderColor || "#38BDF8",
                    borderWidth: isSelected ? "3px" : isHovered ? "2px" : isPrime ? "2.5px" : `${el.strokeWidth || 2}px`,
                    borderStyle: "solid",
                    borderRadius: `${el.borderRadius || 4}px`,
                    boxShadow: isSelected
                      ? "0 0 20px rgba(16, 185, 129, 0.8)"
                      : isHovered
                      ? "0 0 15px rgba(255, 255, 255, 0.5)"
                      : isPrime && !isBooked
                      ? "0 0 8px rgba(245, 158, 11, 0.45)"
                      : "none",
                  }}
                  className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-150 z-10 ${
                    isBooked ? "cursor-not-allowed" : "hover:scale-105"
                  } ${isMatchSearch ? "ring-4 ring-amber-400" : ""}`}
                >
                  <span
                    style={{
                      color: el.textColor || "#FFFFFF",
                      fontSize: `${computedFontSize}px`,
                      fontWeight: computedFontWeight,
                      lineHeight: 1.1,
                      transform: combinedTextTransform,
                    }}
                    className="font-mono drop-shadow-md select-none pointer-events-none inline-block transition-transform text-center"
                  >
                    {isSelected ? `✓ ${stallNumber}` : isPrime ? `★ ${stallNumber}` : stallNumber}
                  </span>
                  {el.dimensions && el.width >= 50 && el.height >= 40 && (
                    <span
                      style={{
                        transform: combinedTextTransform,
                        fontSize: `${Math.max(7, Math.round(computedFontSize * 0.75))}px`,
                      }}
                      className="font-mono text-white/80 select-none pointer-events-none inline-block transition-transform"
                    >
                      {el.dimensions}
                    </span>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        </div>

        {/* Live Hover Tooltip Floating Card (Desktop only) */}
        {hoveredStall && (() => {
          const stallNum = hoveredStall.number || hoveredStall.id;
          const upper = (stallNum || "").trim().toUpperCase();
          const bMatch = upper.match(/^B(\d+)$/);
          const isB = bMatch && parseInt(bMatch[1], 10) >= 1 && parseInt(bMatch[1], 10) <= 22;
          const hMatch = upper.match(/^H(\d+)$/);
          const isH = hMatch && parseInt(hMatch[1], 10) >= 1 && parseInt(hMatch[1], 10) <= 8;
          const isBareSpace = !isB && !isH;

          return (
            <div className="hidden sm:block absolute top-4 left-4 z-40 pointer-events-none p-4 rounded-xl bg-slate-900/95 text-white backdrop-blur-md border border-white/20 shadow-2xl font-mono text-xs space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-sans font-bold text-base text-white">
                  STALL {stallNum} {isBareSpace ? "(Bare Space)" : ""}
                </span>
                {(() => {
                  const ov = boothOverrides[stallNum] || (hoveredStall.id && boothOverrides[hoveredStall.id]);
                  const isStallPrime = Boolean(ov?.isPrime ?? hoveredStall.isPrime);
                  if (isStallPrime) {
                    return (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-amber-400 text-slate-950 flex items-center gap-0.5 shadow-xs">
                        ★ PRIME (+{primeSurchargePercent}%)
                      </span>
                    );
                  }
                  return null;
                })()}
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
                {hoveredStall.dimensions || (hoveredStall.sizeSqM ? `${Math.round(Math.sqrt(hoveredStall.sizeSqM))}m × ${Math.round(Math.sqrt(hoveredStall.sizeSqM))}m` : "3m × 3m")} {isBareSpace ? "· Bare Space" : ""}
              </div>
              <div className="text-slate-300 text-[10px]">
                Area: {hoveredStall.sizeSqM ?? 9} m² ({hoveredStall.sizeSqFt ?? Math.round((hoveredStall.sizeSqM ?? 9) * 10.76)} sq.ft)
              </div>
              <div className="text-[#34D399] font-bold text-xs pt-0.5">
                NPR {(() => {
                  const ov = boothOverrides[stallNum] || (hoveredStall.id && boothOverrides[hoveredStall.id]);
                  const isStallPrime = Boolean(ov?.isPrime ?? hoveredStall.isPrime);
                  const npr =
                    ov?.priceNPR !== undefined && ov?.priceNPR !== null
                      ? Number(ov.priceNPR)
                      : hoveredStall.priceNPR !== undefined && hoveredStall.priceNPR !== null
                      ? Number(hoveredStall.priceNPR)
                      : 180000;
                  const usd =
                    ov?.priceUSD !== undefined && ov?.priceUSD !== null
                      ? Number(ov.priceUSD)
                      : hoveredStall.priceUSD !== undefined && hoveredStall.priceUSD !== null
                      ? Number(hoveredStall.priceUSD)
                      : 1350;
                  const nprEffective = isStallPrime ? Math.round(npr * (1 + primeSurchargeRate)) : npr;
                  const usdEffective = isStallPrime ? Math.round(usd * (1 + primeSurchargeRate)) : usd;
                  return `${nprEffective.toLocaleString()} / USD $${usdEffective.toLocaleString()}`;
                })()}
                <span className="text-[10px] text-slate-300 font-normal ml-1 font-sans">(+ 13% VAT)</span>
              </div>
              {(() => {
                const ov = boothOverrides[stallNum] || (hoveredStall.id && boothOverrides[hoveredStall.id]);
                const isStallPrime = Boolean(ov?.isPrime ?? hoveredStall.isPrime);
                if (!isStallPrime) return null;
                const npr =
                  ov?.priceNPR !== undefined && ov?.priceNPR !== null
                    ? Number(ov.priceNPR)
                    : hoveredStall.priceNPR !== undefined && hoveredStall.priceNPR !== null
                    ? Number(hoveredStall.priceNPR)
                    : 180000;
                return (
                  <div className="text-[10px] text-amber-300 font-mono">
                    Includes {primeSurchargePercent}% Prime Surcharge (+NPR {Math.round(npr * primeSurchargeRate).toLocaleString()})
                  </div>
                );
              })()}
            </div>
          );
        })()}

        {/* Mobile Stall Detail Bottom Floating Card (Phones & small screens) */}
        {activeMobileStall && (() => {
          const stallNum = activeMobileStall.number || activeMobileStall.id;
          const upper = (stallNum || "").trim().toUpperCase();
          const bMatch = upper.match(/^B(\d+)$/);
          const isB = bMatch && parseInt(bMatch[1], 10) >= 1 && parseInt(bMatch[1], 10) <= 22;
          const hMatch = upper.match(/^H(\d+)$/);
          const isH = hMatch && parseInt(hMatch[1], 10) >= 1 && parseInt(hMatch[1], 10) <= 8;
          const isBareSpace = !isB && !isH;

          const ov = boothOverrides[stallNum] || (activeMobileStall.id && boothOverrides[activeMobileStall.id]);
          const effectiveStatus = ov?.status || activeMobileStall.status || "Available";
          const isStallPrime = Boolean(ov?.isPrime ?? activeMobileStall.isPrime);
          const isBooked = effectiveStatus === "Booked";
          const isSelected = selectedStalls.some((s) => s.toLowerCase() === stallNum.toLowerCase() || (activeMobileStall.id && s.toLowerCase() === activeMobileStall.id.toLowerCase()));

          const baseNPR =
            ov?.priceNPR !== undefined && ov?.priceNPR !== null
              ? Number(ov.priceNPR)
              : activeMobileStall.priceNPR !== undefined && activeMobileStall.priceNPR !== null
              ? Number(activeMobileStall.priceNPR)
              : 180000;
          const baseUSD =
            ov?.priceUSD !== undefined && ov?.priceUSD !== null
              ? Number(ov.priceUSD)
              : activeMobileStall.priceUSD !== undefined && activeMobileStall.priceUSD !== null
              ? Number(activeMobileStall.priceUSD)
              : 1350;

          const effectiveNPR = isStallPrime ? Math.round(baseNPR * (1 + primeSurchargeRate)) : baseNPR;
          const effectiveUSD = isStallPrime ? Math.round(baseUSD * (1 + primeSurchargeRate)) : baseUSD;

          return (
            <div className="sm:hidden absolute bottom-3 left-3 right-3 z-40 p-3.5 rounded-2xl bg-slate-900/95 text-white backdrop-blur-xl border border-white/20 shadow-2xl font-mono text-xs animate-in fade-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-700/60">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-sans font-bold text-base text-white">
                      STALL {stallNum}
                    </span>
                    {isStallPrime && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-amber-400 text-slate-950">
                        ★ PRIME (+{primeSurchargePercent}%)
                      </span>
                    )}
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        effectiveStatus === "Available"
                          ? "bg-[#10B981] text-white"
                          : effectiveStatus === "Reserved"
                          ? "bg-[#F59E0B] text-white"
                          : "bg-slate-600 text-white"
                      }`}
                    >
                      {effectiveStatus}
                    </span>
                  </div>
                  <div className="text-emerald-400 font-bold text-[11px] mt-0.5">
                    {activeMobileStall.dimensions || "3m × 3m"} · {isBareSpace ? "Bare Space" : "Shell Scheme"} · {activeMobileStall.sizeSqM ?? 9} m² ({activeMobileStall.sizeSqFt ?? Math.round((activeMobileStall.sizeSqM ?? 9) * 10.76)} sq.ft)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMobileStall(null)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-slate-400">Total (+13% VAT):</div>
                  <div className="text-[#34D399] font-bold text-xs">
                    NPR {effectiveNPR.toLocaleString()} / USD ${effectiveUSD.toLocaleString()}
                  </div>
                </div>
                {!isBooked && activeMobileStall.category !== "SEMINAR HALL" && (
                  <button
                    type="button"
                    onClick={() => {
                      toggleStall(activeMobileStall);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-red-500/20 text-red-300 border border-red-500/40"
                        : "bg-[#218A59] text-white shadow-md"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Deselect</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Select Stall</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* =========================================================================
          03: THEATER CART & BOOKING CHECKOUT BAR
         ========================================================================= */}
      {showCheckoutBar && (
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl font-mono flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6">
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
                      <span className="text-emerald-400 font-bold">{sId}</span>
                      <span className="text-slate-300 text-[10px]">
                        ({s.dimensions || "3m × 3m"})
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-4 sm:gap-6 border-t lg:border-t-0 lg:border-l border-slate-700 pt-4 lg:pt-0 lg:pl-6">
            <div className="space-y-0.5 text-left sm:text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center sm:justify-end gap-1.5 flex-wrap">
                {hasSelectedPrime && (
                  <span className="bg-amber-400 text-slate-950 text-[9px] px-1.5 py-0.5 rounded font-bold font-mono">
                    ★ PRIME (+{primeSurchargePercent}%)
                  </span>
                )}
                <span>ESTIMATED TOTAL</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-bold font-mono">
                  +13% VAT
                </span>
              </div>
              <div className="font-sans font-bold text-xl sm:text-2xl text-white">
                NPR {totalWithVatNPR.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-emerald-400">
                USD ${totalWithVatUSD.toLocaleString()} · {totalAreaSqM} m² ({totalAreaSqFt} sq.ft)
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Base: NPR {totalPriceNPR.toLocaleString()} + 13% VAT: NPR {vatNPR.toLocaleString()}
              </div>
            </div>

            {onProceedToBooking ? (
              <button
                type="button"
                onClick={() => onProceedToBooking(selectedStalls)}
                className={`w-full sm:w-auto px-6 py-3.5 rounded-full font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
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
                className={`w-full sm:w-auto px-6 py-3.5 rounded-full font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
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

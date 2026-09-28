import React, { useState } from "react";
import { DollarSign, Maximize2 } from "lucide-react";
import { CanvasElement } from "../../../types";

interface InspectorPriceAndSizeProps {
  primarySelected: CanvasElement;
  selectedElementsCount: number;
  updateSelectedBatch: (updates: Partial<CanvasElement> | ((el: CanvasElement) => Partial<CanvasElement>)) => void;
}

export function InspectorPriceAndSize({
  primarySelected,
  selectedElementsCount,
  updateSelectedBatch,
}: InspectorPriceAndSizeProps) {
  const [resizeCanvasBox, setResizeCanvasBox] = useState(false);

  return (
    <>
      {/* 1. PRICE CONFIGURATION (NPR & USD) */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>Price & Commercials</span>
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
            {selectedElementsCount > 1 ? "Batch Updates All" : "Per Stall"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Price (NPR)</label>
            <input
              type="number"
              step="5000"
              value={primarySelected.priceNPR || 0}
              onChange={(e) => updateSelectedBatch({ priceNPR: Number(e.target.value) })}
              className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Price (USD $)</label>
            <input
              type="number"
              step="50"
              value={primarySelected.priceUSD || 0}
              onChange={(e) => updateSelectedBatch({ priceUSD: Number(e.target.value) })}
              className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-sky-600 dark:text-sky-400 font-mono font-bold text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Quick Price Chips */}
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Quick Price Tiers:</span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "NPR 180k (Shell 3×3)", npr: 180000, usd: 1350 },
              { label: "NPR 450k (5×6 Space)", npr: 450000, usd: 3400 },
              { label: "NPR 600k (Prime 6×6)", npr: 600000, usd: 4500 },
              { label: "NPR 875k (10×7 Bare)", npr: 875000, usd: 6500 },
              { label: "NPR 1.2M (Pavilion)", npr: 1200000, usd: 9000 },
              { label: "NPR 0 (Free / Wall)", npr: 0, usd: 0 },
            ].map((tier) => (
              <button
                key={tier.label}
                type="button"
                onClick={() => updateSelectedBatch({ priceNPR: tier.npr, priceUSD: tier.usd })}
                className="p-1.5 rounded bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] text-left truncate font-mono border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. SIZE & DIMENSIONS CONFIGURATION */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>Dimensions & Size</span>
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            {primarySelected.sizeSqM} sq.m ({primarySelected.sizeSqFt} sq.ft)
          </span>
        </div>

        {/* Width & Height Pixel Sliders + Direct Number Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between items-center text-[10px] text-slate-600 dark:text-slate-400 mb-1">
              <span>Width</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="5"
                  max="600"
                  value={primarySelected.width}
                  onChange={(e) => updateSelectedBatch({ width: Math.max(5, Number(e.target.value)) })}
                  className="w-12 px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-right text-[10px]"
                />
                <span className="font-mono text-slate-400">px</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="300"
              value={primarySelected.width}
              onChange={(e) => updateSelectedBatch({ width: Number(e.target.value) })}
              className="w-full accent-sky-400 h-1 bg-slate-200 dark:bg-slate-800 rounded cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between items-center text-[10px] text-slate-600 dark:text-slate-400 mb-1">
              <span>Height</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="5"
                  max="600"
                  value={primarySelected.height}
                  onChange={(e) => updateSelectedBatch({ height: Math.max(5, Number(e.target.value)) })}
                  className="w-12 px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-right text-[10px]"
                />
                <span className="font-mono text-slate-400">px</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="300"
              value={primarySelected.height}
              onChange={(e) => updateSelectedBatch({ height: Number(e.target.value) })}
              className="w-full accent-sky-400 h-1 bg-slate-200 dark:bg-slate-800 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Standard Meter Size Presets */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Standard Physical Sizes:</span>
            <label className="flex items-center gap-1.5 text-[9.5px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={resizeCanvasBox}
                onChange={(e) => setResizeCanvasBox(e.target.checked)}
                className="rounded text-sky-500 w-3 h-3 cursor-pointer"
              />
              <span>Also resize canvas box</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "3m × 3m (9 sq.m)", w: 45, h: 45, sqm: 9, dim: "3m × 3m" },
              { label: "6m × 6m (36 sq.m)", w: 90, h: 90, sqm: 36, dim: "6m × 6m" },
              { label: "10m × 7m (70 sq.m)", w: 140, h: 98, sqm: 70, dim: "10m × 7m" },
              { label: "5m × 6m (30 sq.m)", w: 75, h: 90, sqm: 30, dim: "5m × 6m" },
              { label: "8m × 8m (64 sq.m)", w: 120, h: 120, sqm: 64, dim: "8m × 8m" },
              { label: "20ft × 60ft Bare", w: 180, h: 60, sqm: 111, dim: "20ft × 60ft" },
            ].map((dim) => {
              const isCurrent = primarySelected.dimensions === dim.dim;
              return (
                <button
                  key={dim.label}
                  type="button"
                  onClick={() =>
                    updateSelectedBatch({
                      sizeSqM: dim.sqm,
                      sizeSqFt: Math.round(dim.sqm * 10.764),
                      dimensions: dim.dim,
                      ...(resizeCanvasBox ? { width: dim.w, height: dim.h } : {}),
                    })
                  }
                  className={`p-1.5 rounded text-left truncate font-mono border transition-colors cursor-pointer text-[10px] ${
                    isCurrent
                      ? "bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-600 dark:text-sky-300 font-bold shadow-xs"
                      : "bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {dim.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

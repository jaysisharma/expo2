import React from "react";
import { X, Layers } from "lucide-react";
import { CanvasElement, PRESET_CATEGORIES } from "../../../types";

interface InspectorHeaderProps {
  selectedElements: CanvasElement[];
  primarySelected: CanvasElement;
  onDeselect: () => void;
  updateSelectedBatch: (updates: Partial<CanvasElement> | ((el: CanvasElement) => Partial<CanvasElement>)) => void;
  selectedCategory: (typeof PRESET_CATEGORIES)[0];
}

export function InspectorHeader({
  selectedElements,
  primarySelected,
  onDeselect,
  updateSelectedBatch,
  selectedCategory,
}: InspectorHeaderProps) {
  return (
    <>
      {/* Selection Header */}
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {selectedElements.length === 1 ? "Single Selection" : "Multi-Stall Batch"}
          </span>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
            {selectedElements.length === 1
              ? `${primarySelected.number || "UNNAMED"} · ${primarySelected.category || "Shape"}`
              : `${selectedElements.length} Elements Selected`}
          </h3>
        </div>
        <button
          onClick={onDeselect}
          className="p-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          title="Deselect All"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 0. SHAPE ROLE / PURPOSE SWITCHER (STALL vs ZONE vs OUTLINE) */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>Shape Purpose / Role</span>
          </span>
          <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono font-bold">
            {primarySelected.color === "transparent" || primarySelected.fillOpacity === 0 || primarySelected.category === "Hollow Wall / Boundary"
              ? "🔲 Boundary Outline"
              : primarySelected.category === "Zone / Functional Area" || primarySelected.type === "zone"
              ? "🏷️ Functional Zone"
              : "🏢 Bookable Stall"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {/* 1. Bookable Stall */}
          <button
            type="button"
            onClick={() =>
              updateSelectedBatch({
                type: primarySelected.type === "polygon" ? "polygon" : "stall",
                category:
                  primarySelected.category === "Hollow Wall / Boundary" ||
                  primarySelected.category === "Zone / Functional Area"
                    ? selectedCategory.name
                    : primarySelected.category,
                fillOpacity: 0.85,
                color:
                  primarySelected.color === "transparent" || primarySelected.color === "none"
                    ? selectedCategory.color
                    : primarySelected.color,
                priceNPR: primarySelected.priceNPR || selectedCategory.npr,
                priceUSD: primarySelected.priceUSD || selectedCategory.usd,
              })
            }
            className={`py-2 px-1 rounded-lg text-center text-[10px] font-bold border transition-all cursor-pointer ${
              primarySelected.color !== "transparent" &&
              primarySelected.fillOpacity !== 0 &&
              primarySelected.category !== "Zone / Functional Area" &&
              primarySelected.category !== "Hollow Wall / Boundary"
                ? "bg-sky-600 text-white border-sky-500 shadow-sm"
                : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
            }`}
          >
            🏢 Stall (Booth)
          </button>

          {/* 2. Functional Zone */}
          <button
            type="button"
            onClick={() =>
              updateSelectedBatch({
                type: primarySelected.type === "polygon" ? "polygon" : "zone",
                category: "Zone / Functional Area",
                fillOpacity: 0.45,
                color:
                  primarySelected.color === "transparent" || primarySelected.color === "none"
                    ? "#0284C7"
                    : primarySelected.color,
                priceNPR: 0,
                priceUSD: 0,
              })
            }
            className={`py-2 px-1 rounded-lg text-center text-[10px] font-bold border transition-all cursor-pointer ${
              primarySelected.category === "Zone / Functional Area" || primarySelected.type === "zone"
                ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
            }`}
          >
            🏷️ Zone / Area
          </button>

          {/* 3. Architectural Outline */}
          <button
            type="button"
            onClick={() =>
              updateSelectedBatch({
                category: "Hollow Wall / Boundary",
                color: "transparent",
                fillOpacity: 0,
                textColor: primarySelected.borderColor || "#38BDF8",
                priceNPR: 0,
                priceUSD: 0,
              })
            }
            className={`py-2 px-1 rounded-lg text-center text-[10px] font-bold border transition-all cursor-pointer ${
              primarySelected.color === "transparent" ||
              primarySelected.fillOpacity === 0 ||
              primarySelected.category === "Hollow Wall / Boundary"
                ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
            }`}
          >
            🔲 Outline / Wall
          </button>
        </div>
      </div>
    </>
  );
}

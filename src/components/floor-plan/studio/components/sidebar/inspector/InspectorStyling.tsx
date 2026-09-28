import React from "react";
import { Palette } from "lucide-react";
import { CanvasElement, PRESET_CATEGORIES } from "../../../types";

interface InspectorStylingProps {
  primarySelected: CanvasElement;
  selectedElementsCount: number;
  updateSelectedBatch: (updates: Partial<CanvasElement> | ((el: CanvasElement) => Partial<CanvasElement>)) => void;
  applyCategoryPreset: (cat: (typeof PRESET_CATEGORIES)[0]) => void;
}

export function InspectorStyling({
  primarySelected,
  selectedElementsCount,
  updateSelectedBatch,
  applyCategoryPreset,
}: InspectorStylingProps) {
  return (
    <>
      {/* 3. CATEGORY & THEME PRESETS */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">Apply Category Preset</span>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {PRESET_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => applyCategoryPreset(cat)}
              className="w-full p-2 rounded-lg bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.border }} />
                <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">{cat.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{cat.defaultDim}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3.5 CONTAINER & BORDER COLOR SELECTION */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
            <span>Container & Border Colors</span>
          </span>
          <span className="text-[10px] text-pink-600 dark:text-pink-400 font-mono">
            {selectedElementsCount > 1 ? "Batch Colors" : "Custom Color"}
          </span>
        </div>

        {/* Container Fill Color */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Container Fill Color:</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={
                  primarySelected.color === "transparent" || primarySelected.color === "none"
                    ? "#0284C7"
                    : primarySelected.color || "#0284C7"
                }
                onChange={(e) =>
                  updateSelectedBatch({
                    color: e.target.value,
                    fillOpacity: 0.85,
                  })
                }
                className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <button
                type="button"
                onClick={() =>
                  updateSelectedBatch({
                    color: "transparent",
                    fillOpacity: 0,
                    textColor: primarySelected.borderColor || "#38BDF8",
                  })
                }
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                  primarySelected.color === "transparent" || primarySelected.color === "none"
                    ? "bg-sky-500/20 border-sky-400 text-sky-300 font-bold"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                Hollow / None
              </button>
            </div>
          </div>

          {/* Quick Swatches for Fill */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { name: "Sky Blue", hex: "#0284C7" },
              { name: "Amber", hex: "#D97706" },
              { name: "Emerald", hex: "#16A34A" },
              { name: "Red", hex: "#DC2626" },
              { name: "Purple", hex: "#9333EA" },
              { name: "Dark Slate", hex: "#0F172A" },
              { name: "Cool Gray", hex: "#475569" },
              { name: "Gold Brown", hex: "#854D0E" },
              { name: "Navy Blue", hex: "#061A2A" },
              { name: "Ice Blue", hex: "#38BDF8" },
            ].map((sw) => (
              <button
                key={sw.name}
                type="button"
                title={sw.name}
                onClick={() =>
                  updateSelectedBatch({
                    color: sw.hex,
                    fillOpacity: 0.85,
                    textColor: "#FFFFFF",
                  })
                }
                style={{ backgroundColor: sw.hex }}
                className={`w-5 h-5 rounded-md border border-slate-700 hover:scale-110 transition-transform cursor-pointer ${
                  primarySelected.color === sw.hex ? "ring-2 ring-white scale-110" : ""
                }`}
              />
            ))}
          </div>
        </div>

        {/* Fill Opacity Slider */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Fill Opacity</span>
            <span className="font-mono text-slate-200">
              {Math.round((primarySelected.fillOpacity ?? 0.85) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round((primarySelected.fillOpacity ?? 0.85) * 100)}
            onChange={(e) =>
              updateSelectedBatch({
                fillOpacity: Number(e.target.value) / 100,
              })
            }
            className="w-full accent-pink-400 h-1 bg-slate-800 rounded cursor-pointer"
          />
        </div>

        {/* Border / Stroke Color */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Border / Outline Color:</span>
            <input
              type="color"
              value={primarySelected.borderColor || "#38BDF8"}
              onChange={(e) =>
                updateSelectedBatch({
                  borderColor: e.target.value,
                })
              }
              className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["#38BDF8", "#FBBF24", "#4ADE80", "#F87171", "#C084FC", "#FFFFFF", "#94A3B8", "#061A2A"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() =>
                  updateSelectedBatch({
                    borderColor: c,
                  })
                }
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded-full border border-slate-700 hover:scale-110 transition-transform cursor-pointer ${
                  primarySelected.borderColor === c ? "ring-2 ring-white scale-110" : ""
                }`}
              />
            ))}
          </div>
        </div>

        {/* Text / Label Color */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Text Label Color:</span>
            <input
              type="color"
              value={primarySelected.textColor || "#FFFFFF"}
              onChange={(e) =>
                updateSelectedBatch({
                  textColor: e.target.value,
                })
              }
              className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["#FFFFFF", "#061A2A", "#38BDF8", "#4ADE80", "#FBBF24", "#F87171"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() =>
                  updateSelectedBatch({
                    textColor: c,
                  })
                }
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded-full border border-slate-700 hover:scale-110 transition-transform cursor-pointer ${
                  primarySelected.textColor === c ? "ring-2 ring-white scale-110" : ""
                }`}
              />
            ))}
          </div>
        </div>

        {/* Border Radius & Stroke Width */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Corner Radius</span>
              <span className="font-mono text-slate-200">{primarySelected.borderRadius ?? 4}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              value={primarySelected.borderRadius ?? 4}
              onChange={(e) =>
                updateSelectedBatch({
                  borderRadius: Number(e.target.value),
                })
              }
              className="w-full accent-pink-400 h-1 bg-slate-800 rounded cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Border Width</span>
              <span className="font-mono text-slate-200">{primarySelected.strokeWidth ?? 2}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              value={primarySelected.strokeWidth ?? 2}
              onChange={(e) =>
                updateSelectedBatch({
                  strokeWidth: Number(e.target.value),
                })
              }
              className="w-full accent-pink-400 h-1 bg-slate-800 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </>
  );
}

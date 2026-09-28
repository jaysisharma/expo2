import React from "react";
import {
  Layers,
  CheckCircle2,
  Shapes,
  Pentagon,
  Hexagon,
} from "lucide-react";
import { DrawingShapeRole, ToolType, PRESET_CATEGORIES } from "../../types";

interface ToolsPaletteProps {
  drawingShapeRole: DrawingShapeRole;
  setDrawingShapeRole: (role: DrawingShapeRole) => void;
  selectedCategory: (typeof PRESET_CATEGORIES)[0];
  setSelectedCategory: (cat: (typeof PRESET_CATEGORIES)[0]) => void;
  setCounterPrefix: (prefix: string) => void;
  setActiveFillColor: (color: string) => void;
  setActiveStrokeColor: (color: string) => void;
  activeStrokeWidth: number;
  setActiveStrokeWidth: (w: number) => void;
  zoneLabel: string;
  setZoneLabel: (label: string) => void;
  counterPrefix: string;
  counterNum: number;
  setCounterNum: React.Dispatch<React.SetStateAction<number>>;
  setActiveTool: (tool: ToolType) => void;
  stampRegularPolygon: (sides: number, radius?: number, shapeName?: string) => void;
  notify: (msg: string) => void;
}

export function ToolsPalette({
  drawingShapeRole,
  setDrawingShapeRole,
  selectedCategory,
  setSelectedCategory,
  setCounterPrefix,
  setActiveFillColor,
  setActiveStrokeColor,
  activeStrokeWidth,
  setActiveStrokeWidth,
  zoneLabel,
  setZoneLabel,
  counterPrefix,
  counterNum,
  setCounterNum,
  setActiveTool,
  stampRegularPolygon,
  notify,
}: ToolsPaletteProps) {
  return (
    <div className="space-y-4">
      {/* 0. SHAPE CREATION PURPOSE SELECTOR */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>Shape Creation Mode</span>
          </span>
          <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono font-bold">
            {drawingShapeRole === "stall" ? "🏢 Stall" : drawingShapeRole === "zone" ? "🏷️ Zone" : "🔲 Outline"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setDrawingShapeRole("stall");
              setActiveFillColor(selectedCategory.color === "transparent" ? "#0284C7" : selectedCategory.color);
              notify("Drawing Mode: Bookable Stall");
            }}
            className={`py-2 px-1 rounded-lg text-center text-[10px] font-bold border transition-all cursor-pointer ${
              drawingShapeRole === "stall"
                ? "bg-sky-600 text-white border-sky-500 shadow-sm"
                : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
            }`}
          >
            🏢 Stall (Booth)
          </button>

          <button
            type="button"
            onClick={() => {
              setDrawingShapeRole("zone");
              setActiveFillColor("#0284C7");
              notify("Drawing Mode: Functional Zone / Area");
            }}
            className={`py-2 px-1 rounded-lg text-center text-[10px] font-bold border transition-all cursor-pointer ${
              drawingShapeRole === "zone"
                ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
            }`}
          >
            🏷️ Zone / Area
          </button>

          <button
            type="button"
            onClick={() => {
              setDrawingShapeRole("outline");
              setActiveFillColor("transparent");
              notify("Drawing Mode: Architectural Boundary Outline");
            }}
            className={`py-2 px-1 rounded-lg text-center text-[10px] font-bold border transition-all cursor-pointer ${
              drawingShapeRole === "outline"
                ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
            }`}
          >
            🔲 Outline / Wall
          </button>
        </div>
      </div>

      {/* Stroke Width */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
          <span>Border / Stroke Width</span>
          <span className="text-slate-900 dark:text-slate-200 font-mono font-semibold">{activeStrokeWidth}px</span>
        </div>
        <input
          type="range"
          min="1"
          max="24"
          value={activeStrokeWidth}
          onChange={(e) => setActiveStrokeWidth(Number(e.target.value))}
          className="w-full accent-sky-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
        />
      </div>

      {/* Contextual Settings for Stall vs Zone vs Outline */}
      {drawingShapeRole === "zone" ? (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-300">Zone Name / Title</span>
          <input
            type="text"
            value={zoneLabel}
            onChange={(e) => setZoneLabel(e.target.value)}
            placeholder="e.g. VIP LOUNGE, MAIN STAGE, FOOD COURT"
            className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-[#090D14] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs focus:border-amber-500 focus:outline-none uppercase font-mono"
          />
        </div>
      ) : drawingShapeRole === "stall" ? (
        <>
          {/* Preset Categories */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Stall Presets
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {PRESET_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory.name === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCounterPrefix(cat.prefix);
                      setActiveFillColor(cat.color === "transparent" ? "transparent" : cat.color);
                      setActiveStrokeColor(cat.border);
                    }}
                    className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-sky-50 dark:bg-slate-800 border-sky-300 dark:border-slate-600 text-sky-950 dark:text-white font-medium shadow-xs"
                        : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-transparent text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.border }} />
                      <span className="truncate text-[11px]">{cat.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono shrink-0">{cat.defaultDim}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next Stall Number */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-300">Next Stall Label</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Prefix</label>
                <input
                  type="text"
                  value={counterPrefix}
                  onChange={(e) => setCounterPrefix(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-white dark:bg-[#090D14] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-center font-mono focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Number</label>
                <input
                  type="number"
                  value={counterNum}
                  onChange={(e) => setCounterNum(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded bg-white dark:bg-[#090D14] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-center font-mono focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Boundary Outline Mode</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            Shapes drawn will have hollow transparent fill with clean perimeter stroke lines for walls and halls.
          </p>
        </div>
      )}

      {/* Polygon Tools & Quick Shape Presets */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shapes className="w-3.5 h-3.5 text-sky-500" />
            <span>Polygon Presets</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setActiveTool("polygon");
              notify("Polygon tool active: Click canvas to add vertices, double-click or click start point to finish.");
            }}
            className="text-[10px] text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
          >
            + Draw Custom
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => stampRegularPolygon(3, 50, "Triangle")}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 hover:border-sky-400 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Stamp 3-Sided Triangle Stall"
          >
            <span className="text-xs">▲</span>
            <span>Triangle (3)</span>
          </button>
          <button
            type="button"
            onClick={() => stampRegularPolygon(5, 55, "Pentagon")}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 hover:border-sky-400 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Stamp 5-Sided Pentagon Stall"
          >
            <Pentagon className="w-3 h-3 text-sky-500" />
            <span>Pentagon (5)</span>
          </button>
          <button
            type="button"
            onClick={() => stampRegularPolygon(6, 60, "Hexagon")}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 hover:border-sky-400 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Stamp 6-Sided Hexagon Stall"
          >
            <Hexagon className="w-3 h-3 text-amber-500" />
            <span>Hexagon (6)</span>
          </button>
          <button
            type="button"
            onClick={() => stampRegularPolygon(8, 65, "Octagon")}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 hover:border-sky-400 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Stamp 8-Sided Octagon Stall"
          >
            <span className="text-xs font-bold">⯃</span>
            <span>Octagon (8)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

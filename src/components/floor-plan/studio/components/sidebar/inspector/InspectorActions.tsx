import React from "react";
import {
  Hash,
  RotateCw,
  Layers,
  ArrowUpToLine,
  ArrowDownToLine,
  ChevronUp,
  ChevronDown,
  Zap,
  Sparkles,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Trash2,
  Type,
} from "lucide-react";
import { CanvasElement } from "../../../types";

interface InspectorActionsProps {
  primarySelected: CanvasElement;
  selectedElements: CanvasElement[];
  updateSelectedBatch: (updates: Partial<CanvasElement> | ((el: CanvasElement) => Partial<CanvasElement>)) => void;
  batchPrefix: string;
  setBatchPrefix: (prefix: string) => void;
  batchStartNum: number;
  setBatchStartNum: (num: number) => void;
  handleBatchRenumber: () => void;
  alignSelected: (mode: "left" | "top" | "center-x" | "center-y" | "distribute-h" | "distribute-v") => void;
  bringToFront: () => void;
  sendToBack: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  duplicateSelected: (direction?: "right" | "left" | "down" | "up" | "auto") => void;
  deleteSelected: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
}

export function InspectorActions({
  primarySelected,
  selectedElements,
  updateSelectedBatch,
  batchPrefix,
  setBatchPrefix,
  batchStartNum,
  setBatchStartNum,
  handleBatchRenumber,
  alignSelected,
  bringToFront,
  sendToBack,
  bringForward,
  sendBackward,
  duplicateSelected,
  deleteSelected,
  groupSelected,
  ungroupSelected,
}: InspectorActionsProps) {
  const hasGroup = !!primarySelected.groupId;
  return (
    <>
      {/* 4. SEQUENTIAL RENUMBERING / STALL LABEL */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Stall Labeling</span>
          </span>
        </div>

        {selectedElements.length === 1 ? (
          <div>
            <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Stall Number</label>
            <input
              type="text"
              value={primarySelected.number}
              onChange={(e) => updateSelectedBatch({ number: e.target.value })}
              className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs focus:border-sky-500 focus:outline-none"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Prefix</label>
                <input
                  type="text"
                  value={batchPrefix}
                  onChange={(e) => setBatchPrefix(e.target.value)}
                  className="w-full p-1.5 rounded bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-center text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Start No.</label>
                <input
                  type="number"
                  value={batchStartNum}
                  onChange={(e) => setBatchStartNum(Number(e.target.value))}
                  className="w-full p-1.5 rounded bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-center text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleBatchRenumber}
              className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 dark:bg-amber-600 dark:hover:bg-amber-500 text-slate-950 dark:text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              🔢 Renumber {selectedElements.length} Stalls ({batchPrefix}{batchStartNum}...)
            </button>
          </div>
        )}
      </div>

      {/* 5. STATUS CONFIGURATION */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">Booking Status</span>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: "Available", bg: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40" },
            { id: "Reserved", bg: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40" },
            { id: "Booked", bg: "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => updateSelectedBatch({ status: st.id as any })}
              className={`py-1.5 rounded-lg border text-center text-[11px] font-bold transition-all cursor-pointer ${
                primarySelected.status === st.id
                  ? st.bg
                  : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              {st.id}
            </button>
          ))}
        </div>
      </div>

      {/* 6. BATCH ROTATION */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>Rotation</span>
          </span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{primarySelected.rotation || 0}°</span>
        </div>
        <input
          type="range"
          min="-180"
          max="180"
          value={primarySelected.rotation || 0}
          onChange={(e) => updateSelectedBatch({ rotation: Number(e.target.value) })}
          className="w-full accent-emerald-500 h-1 bg-slate-200 dark:bg-slate-800 rounded cursor-pointer"
        />
        <div className="flex gap-1">
          {[0, 45, 90, 180, -45, -90].map((deg) => (
            <button
              key={deg}
              type="button"
              onClick={() => updateSelectedBatch({ rotation: deg })}
              className="flex-1 py-1 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-mono cursor-pointer"
            >
              {deg}°
            </button>
          ))}
        </div>
      </div>

      {/* 6.5 TEXT LABEL ROTATION */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>Text / Label Rotation</span>
          </span>
          <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">
            {primarySelected.textRotation || 0}°
          </span>
        </div>

        {/* Quick Orientation Presets */}
        <div className="grid grid-cols-4 gap-1">
          {[
            { label: "0° (H)", deg: 0 },
            { label: "90° (V)", deg: 90 },
            { label: "180°", deg: 180 },
            { label: "270°", deg: 270 },
          ].map((item) => (
            <button
              key={item.deg}
              type="button"
              onClick={() => updateSelectedBatch({ textRotation: item.deg })}
              className={`py-1.5 px-1 rounded text-center text-[10px] font-mono font-medium border transition-colors cursor-pointer ${
                (primarySelected.textRotation || 0) === item.deg
                  ? "bg-sky-500/20 border-sky-400 text-sky-600 dark:text-sky-300 font-bold"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Slider for fine adjustment */}
        <div>
          <input
            type="range"
            min="-180"
            max="180"
            step="15"
            value={primarySelected.textRotation || 0}
            onChange={(e) => updateSelectedBatch({ textRotation: Number(e.target.value) })}
            className="w-full accent-sky-500 h-1 bg-slate-200 dark:bg-slate-800 rounded cursor-pointer"
          />
        </div>

        {/* Quick +90° Rotate Button */}
        <button
          type="button"
          onClick={() =>
            updateSelectedBatch((el) => ({
              textRotation: ((el.textRotation || 0) + 90) % 360,
            }))
          }
          className="w-full py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Rotate Text +90°</span>
        </button>

        {/* Text Font Size & Weight */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Font Size & Weight
            </span>
            <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold">
              {primarySelected.fontSize || (primarySelected.width > 60 ? 11 : primarySelected.width > 30 ? 9 : 7.5)}px · {primarySelected.fontWeight || "Bold"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => updateSelectedBatch((el) => ({ fontSize: Math.max(6, (el.fontSize || (el.width > 60 ? 11 : 9)) - 2) }))}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              title="Decrease Font Size"
            >
              -
            </button>
            <input
              type="range"
              min="6"
              max="40"
              value={primarySelected.fontSize || (primarySelected.width > 60 ? 11 : 9)}
              onChange={(e) => updateSelectedBatch({ fontSize: Number(e.target.value) })}
              className="w-full accent-sky-500 h-1 bg-slate-200 dark:bg-slate-800 rounded cursor-pointer"
            />
            <button
              type="button"
              onClick={() => updateSelectedBatch((el) => ({ fontSize: Math.min(60, (el.fontSize || (el.width > 60 ? 11 : 9)) + 2) }))}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              title="Increase Font Size"
            >
              +
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[
              { label: "Normal", val: "400" },
              { label: "Medium", val: "500" },
              { label: "Bold", val: "700" },
              { label: "Black", val: "900" },
            ].map((fw) => (
              <button
                key={fw.label}
                type="button"
                onClick={() => updateSelectedBatch({ fontWeight: fw.val })}
                className={`py-0.5 rounded text-[9.5px] border cursor-pointer transition-colors ${
                  primarySelected.fontWeight === fw.val || (fw.val === "700" && !primarySelected.fontWeight)
                    ? "bg-sky-600 text-white border-sky-500 shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                {fw.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Position & Offset within Shape */}
        {(primarySelected.type === "stall" || primarySelected.type === "zone") && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Text Position & Offset
              </span>
              {(primarySelected.textOffsetX !== undefined || primarySelected.textOffsetY !== undefined) && (
                <button
                  type="button"
                  onClick={() => updateSelectedBatch({ textOffsetX: 0, textOffsetY: 0 })}
                  className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Reset to Center
                </button>
              )}
            </div>

            {/* Quick Position Presets */}
            <div className="grid grid-cols-5 gap-1">
              {[
                { label: "Center", x: 0, y: 0 },
                { label: "Top", x: 0, y: -Math.round(primarySelected.height / 3) },
                { label: "Bottom", x: 0, y: Math.round(primarySelected.height / 3) },
                { label: "Left", x: -Math.round(primarySelected.width / 3), y: 0 },
                { label: "Right", x: Math.round(primarySelected.width / 3), y: 0 },
              ].map((pos) => (
                <button
                  key={pos.label}
                  type="button"
                  onClick={() => updateSelectedBatch({ textOffsetX: pos.x, textOffsetY: pos.y })}
                  className="py-1 px-1 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[9.5px] font-medium text-center truncate cursor-pointer"
                >
                  {pos.label}
                </button>
              ))}
            </div>

            {/* Micro Position Adjustments (Sliders) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                  <span>Horiz X</span>
                  <span className="font-mono">{primarySelected.textOffsetX || 0}px</span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  value={primarySelected.textOffsetX || 0}
                  onChange={(e) => updateSelectedBatch({ textOffsetX: Number(e.target.value) })}
                  className="w-full accent-sky-500 h-1 bg-slate-200 dark:bg-slate-800 rounded cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                  <span>Vert Y</span>
                  <span className="font-mono">{primarySelected.textOffsetY || 0}px</span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  value={primarySelected.textOffsetY || 0}
                  onChange={(e) => updateSelectedBatch({ textOffsetY: Number(e.target.value) })}
                  className="w-full accent-sky-500 h-1 bg-slate-200 dark:bg-slate-800 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. BATCH ALIGNMENT */}
      {selectedElements.length >= 2 && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">Batch Alignment</span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => alignSelected("left")}
              className="py-1.5 px-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-medium cursor-pointer"
            >
              Align Left
            </button>
            <button
              onClick={() => alignSelected("top")}
              className="py-1.5 px-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-medium cursor-pointer"
            >
              Align Top
            </button>
            <button
              onClick={() => alignSelected("distribute-h")}
              className="py-1.5 px-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-medium cursor-pointer"
            >
              Distribute
            </button>
          </div>
        </div>
      )}

      {/* 8. LAYER ORDERING (Z-INDEX) */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-500" />
            <span>Layer Order (Z-Index)</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">[ / ]</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={bringToFront}
            className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            title="Bring to Very Top (Shift + ])"
          >
            <ArrowUpToLine className="w-3 h-3 text-sky-500" />
            <span>To Front</span>
          </button>
          <button
            type="button"
            onClick={sendToBack}
            className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            title="Send to Very Bottom (Shift + [)"
          >
            <ArrowDownToLine className="w-3 h-3 text-amber-500" />
            <span>To Back</span>
          </button>
          <button
            type="button"
            onClick={bringForward}
            className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            title="Bring Forward 1 Level (])"
          >
            <ChevronUp className="w-3 h-3 text-sky-400" />
            <span>Forward</span>
          </button>
          <button
            type="button"
            onClick={sendBackward}
            className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            title="Send Backward 1 Level ([)"
          >
            <ChevronDown className="w-3 h-3 text-amber-400" />
            <span>Backward</span>
          </button>
        </div>
      </div>

      {/* 9. SMART FLUSH DUPLICATE & DELETE */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Smart Flush Duplicate</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono font-semibold">
              Ctrl+D
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Duplicates beside the stall along the exact angle line with auto-incremented numbering (e.g. C1 ➔ C2).
          </p>

          <button
            type="button"
            onClick={() => duplicateSelected("auto")}
            className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Duplicate ({selectedElements.length})</span>
          </button>

          {/* Directional Pad */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => duplicateSelected("right")}
              className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-semibold flex items-center justify-between cursor-pointer"
              title="Duplicate Flush Right along element angle (Alt+Right)"
            >
              <span className="flex items-center gap-1">
                <ArrowRight className="w-3 h-3 text-emerald-500" />
                <span>Right</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Alt+→</span>
            </button>
            <button
              type="button"
              onClick={() => duplicateSelected("down")}
              className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-semibold flex items-center justify-between cursor-pointer"
              title="Duplicate Flush Down along element angle (Alt+Down)"
            >
              <span className="flex items-center gap-1">
                <ArrowDown className="w-3 h-3 text-sky-500" />
                <span>Down</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Alt+↓</span>
            </button>
            <button
              type="button"
              onClick={() => duplicateSelected("left")}
              className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-semibold flex items-center justify-between cursor-pointer"
              title="Duplicate Flush Left along element angle (Alt+Left)"
            >
              <span className="flex items-center gap-1">
                <ArrowLeft className="w-3 h-3 text-amber-500" />
                <span>Left</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Alt+←</span>
            </button>
            <button
              type="button"
              onClick={() => duplicateSelected("up")}
              className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-semibold flex items-center justify-between cursor-pointer"
              title="Duplicate Flush Up along element angle (Alt+Up)"
            >
              <span className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3 text-violet-500" />
                <span>Up</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Alt+↑</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={deleteSelected}
          className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 border border-rose-500/30 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Selected ({selectedElements.length})</span>
        </button>
      </div>

      {/* GROUP / UNGROUP */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Grouping</span>
          </span>
          {hasGroup && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold border border-amber-400/30">
              📦 Grouped
            </span>
          )}
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          {selectedElements.length >= 2
            ? `${selectedElements.length} elements selected. Group them to move as one.`
            : hasGroup
            ? "This element is part of a group. Click to ungroup."
            : "Select 2+ elements to group them together."}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={groupSelected}
            disabled={selectedElements.length < 2}
            className="py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Group selected elements (Ctrl+G)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Group</span>
            <span className="text-[9px] font-mono opacity-70 ml-auto">⌘G</span>
          </button>
          <button
            type="button"
            onClick={ungroupSelected}
            disabled={!hasGroup && !selectedElements.some((el) => el.groupId)}
            className="py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Ungroup (Ctrl+Shift+G)"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Ungroup</span>
            <span className="text-[9px] font-mono opacity-70 ml-auto">⇧⌘G</span>
          </button>
        </div>
      </div>
    </>
  );
}

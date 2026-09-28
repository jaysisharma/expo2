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
}: InspectorActionsProps) {
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
    </>
  );
}

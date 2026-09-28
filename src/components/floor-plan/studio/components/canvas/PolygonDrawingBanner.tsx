import React from "react";
import { CheckCircle2 } from "lucide-react";
import { ToolType } from "../../types";

interface PolygonDrawingBannerProps {
  activeTool: ToolType;
  currentPolygonPointsCount: number;
  finishPolygon: () => void;
  undoPoint: () => void;
  cancelPolygon: () => void;
}

export function PolygonDrawingBanner({
  activeTool,
  currentPolygonPointsCount,
  finishPolygon,
  undoPoint,
  cancelPolygon,
}: PolygonDrawingBannerProps) {
  if (activeTool !== "polygon" || currentPolygonPointsCount === 0) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white border border-sky-500/40 shadow-2xl backdrop-blur font-sans text-xs">
      <div className="flex items-center gap-1.5 font-mono text-sky-400 font-bold">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Polygon: {currentPolygonPointsCount} vertices</span>
      </div>
      <div className="h-4 w-px bg-slate-700" />
      <button
        type="button"
        disabled={currentPolygonPointsCount < 3}
        onClick={finishPolygon}
        className="px-3 py-1.5 text-white rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="text-white">Finish Polygon (Enter)</span>
      </button>
      <button
        type="button"
        onClick={undoPoint}
        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all cursor-pointer"
      >
        Undo Point (Del)
      </button>
      <button
        type="button"
        onClick={cancelPolygon}
        className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-medium transition-all cursor-pointer"
      >
        Cancel (Esc)
      </button>
    </div>
  );
}

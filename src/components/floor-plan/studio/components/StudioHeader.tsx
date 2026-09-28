import React from "react";
import Link from "next/link";
import { CheckSquare, Undo, Redo, Save } from "lucide-react";

interface StudioHeaderProps {
  selectedCount: number;
  selectAllStalls: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveToStorage: () => void;
  isSaving: boolean;
}

export function StudioHeader({
  selectedCount,
  selectAllStalls,
  handleUndo,
  handleRedo,
  canUndo,
  canRedo,
  saveToStorage,
  isSaving,
}: StudioHeaderProps) {
  return (
    <header className="h-14 bg-white dark:bg-[#0C121C] border-b border-slate-200 dark:border-slate-800/80 px-4 flex items-center justify-between shrink-0 z-30">
      <div className="flex items-center gap-3">
        <Link
          href="/floor-plan"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
        >
          <span>← Live Floor Plan</span>
        </Link>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
        <h1 className="font-bold text-sm tracking-wide text-slate-900 dark:text-white flex items-center gap-2">
          <span>Floor Plan CAD Studio</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
            MULTI-SELECT READY
          </span>
        </h1>
      </div>

      {/* Quick Selection Status & Global Actions */}
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <span className="px-3 py-1 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-700 dark:text-sky-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{selectedCount} Selected</span>
          </span>
        )}

        <button
          onClick={selectAllStalls}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          title="Select all stalls on canvas"
        >
          Select All Stalls
        </button>

        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        <button
          type="button"
          onClick={saveToStorage}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <Save className={`w-4 h-4 text-white ${isSaving ? "animate-spin" : ""}`} />
          <span className="text-white font-bold">
            {isSaving ? "Saving..." : "Save Canvas"}
          </span>
        </button>
      </div>
    </header>
  );
}

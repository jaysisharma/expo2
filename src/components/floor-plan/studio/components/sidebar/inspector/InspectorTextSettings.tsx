import React from "react";
import {
  Type,
  X,
  RotateCw,
  Plus,
  Minus,
  Layers,
  ArrowUpToLine,
  ArrowDownToLine,
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Sparkles,
} from "lucide-react";
import { CanvasElement } from "../../../types";

interface InspectorTextSettingsProps {
  primarySelected: CanvasElement;
  selectedElements: CanvasElement[];
  onDeselect: () => void;
  updateSelectedBatch: (updates: Partial<CanvasElement> | ((el: CanvasElement) => Partial<CanvasElement>)) => void;
  alignSelected?: (mode: "left" | "top" | "center-x" | "center-y" | "distribute-h" | "distribute-v") => void;
  bringToFront: () => void;
  sendToBack: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  duplicateSelected: (direction?: "right" | "left" | "down" | "up" | "auto") => void;
  deleteSelected: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
}

const FONT_SIZE_PRESETS = [
  { label: "12", val: 12, name: "Small" },
  { label: "14", val: 14, name: "Body" },
  { label: "18", val: 18, name: "Medium" },
  { label: "24", val: 24, name: "Large" },
  { label: "32", val: 32, name: "Title" },
  { label: "44", val: 44, name: "Header" },
  { label: "60", val: 60, name: "Banner" },
];

const FONT_WEIGHT_PRESETS = [
  { label: "Normal", value: "400", cssWeight: "normal" },
  { label: "Medium", value: "500", cssWeight: "500" },
  { label: "SemiBold", value: "600", cssWeight: "600" },
  { label: "Bold", value: "700", cssWeight: "bold" },
  { label: "Black", value: "900", cssWeight: "900" },
];

const COLOR_SWATCHES = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy Dark", hex: "#061A2A" },
  { name: "Slate Dark", hex: "#0F172A" },
  { name: "Sky Blue", hex: "#38BDF8" },
  { name: "Emerald", hex: "#10B981" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Red", hex: "#EF4444" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Cool Gray", hex: "#94A3B8" },
];

const QUICK_TEXT_TEMPLATES = [
  'BLOCK "A"',
  'BLOCK "B"',
  'BLOCK "C"',
  'MAIN ENTRANCE',
  'EMERGENCY EXIT',
  'REGISTRATION',
  'FOOD COURT',
  'VIP LOUNGE',
];

export function InspectorTextSettings({
  primarySelected,
  selectedElements,
  onDeselect,
  updateSelectedBatch,
  bringToFront,
  sendToBack,
  bringForward,
  sendBackward,
  duplicateSelected,
  deleteSelected,
  groupSelected,
  ungroupSelected,
}: InspectorTextSettingsProps) {
  const currentFontSize = primarySelected.fontSize || 16;
  const currentFontWeight = primarySelected.fontWeight || "700";
  const currentRotation = primarySelected.rotation || 0;
  const isMulti = selectedElements.length > 1;
  const hasGroup = !!primarySelected.groupId;

  const changeFontSize = (delta: number) => {
    const nextSize = Math.max(8, Math.min(160, currentFontSize + delta));
    updateSelectedBatch({ fontSize: nextSize });
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Header */}
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 uppercase tracking-wider block font-bold">
            {isMulti ? `${selectedElements.length} Text Elements` : "Text Element"}
          </span>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[200px]">
            {primarySelected.number || "Text Label"}
          </h3>
        </div>
        <button
          onClick={onDeselect}
          className="p-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          title="Deselect"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Text Content */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
        <label className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-sky-500" />
          <span>Text Content</span>
        </label>
        <textarea
          rows={2}
          value={primarySelected.number}
          onChange={(e) => updateSelectedBatch({ number: e.target.value })}
          placeholder="Type label text here..."
          className="w-full p-2.5 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-xs focus:border-sky-500 focus:outline-none resize-none leading-relaxed"
        />
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Quick Text Suggestions:</span>
          <div className="flex flex-wrap gap-1">
            {QUICK_TEXT_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl}
                type="button"
                onClick={() => updateSelectedBatch({ number: tmpl })}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-mono cursor-pointer transition-colors"
              >
                {tmpl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Typography (Font Size & Weight) */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Typography</span>
          </span>
          <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold">
            {currentFontSize}px · {currentFontWeight}
          </span>
        </div>

        {/* Font Size Stepper & Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 text-[11px] font-medium">Font Size</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeFontSize(-2)}
                className="w-6 h-6 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-transform cursor-pointer"
                title="Decrease font size"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                min="8"
                max="160"
                value={currentFontSize}
                onChange={(e) => updateSelectedBatch({ fontSize: Math.max(8, Number(e.target.value) || 12) })}
                className="w-14 text-center py-0.5 rounded bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
              <span className="text-[10px] font-mono text-slate-400">px</span>
              <button
                type="button"
                onClick={() => changeFontSize(2)}
                className="w-6 h-6 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-transform cursor-pointer"
                title="Increase font size"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <input
            type="range"
            min="10"
            max="96"
            step="1"
            value={currentFontSize}
            onChange={(e) => updateSelectedBatch({ fontSize: Number(e.target.value) })}
            className="w-full accent-sky-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />

          {/* Preset Font Sizes */}
          <div className="grid grid-cols-7 gap-1">
            {FONT_SIZE_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => updateSelectedBatch({ fontSize: p.val })}
                className={`py-1 rounded text-center text-[10px] font-mono font-semibold border transition-all cursor-pointer ${
                  currentFontSize === p.val
                    ? "bg-sky-600 text-white border-sky-500 shadow-sm"
                    : "bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
                title={p.name}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Weight */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="text-slate-600 dark:text-slate-400 text-[11px] font-medium block">Font Weight</span>
          <div className="grid grid-cols-5 gap-1">
            {FONT_WEIGHT_PRESETS.map((fw) => {
              const isSelected =
                currentFontWeight === fw.value ||
                currentFontWeight === fw.cssWeight ||
                (fw.value === "700" && currentFontWeight === "bold") ||
                (fw.value === "400" && currentFontWeight === "normal");

              return (
                <button
                  key={fw.label}
                  type="button"
                  onClick={() => updateSelectedBatch({ fontWeight: fw.value })}
                  style={{ fontWeight: fw.cssWeight }}
                  className={`py-1.5 rounded text-center text-[10px] border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-sky-600 text-white border-sky-500 shadow-sm"
                      : "bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {fw.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Text Color */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Text Color</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={primarySelected.textColor || "#061A2A"}
              onChange={(e) => updateSelectedBatch({ textColor: e.target.value })}
              className="w-6 h-6 rounded border border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {primarySelected.textColor || "#061A2A"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {COLOR_SWATCHES.map((sw) => (
            <button
              key={sw.name}
              type="button"
              title={sw.name}
              onClick={() => updateSelectedBatch({ textColor: sw.hex })}
              style={{ backgroundColor: sw.hex }}
              className={`w-6 h-6 rounded-md border border-slate-300 dark:border-slate-700 hover:scale-110 transition-transform cursor-pointer ${
                primarySelected.textColor === sw.hex ? "ring-2 ring-sky-500 scale-110" : ""
              }`}
            />
          ))}
        </div>
      </div>

      {/* 5. Rotation */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5 text-emerald-500" />
            <span>Text Rotation</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {currentRotation}°
            </span>
            <button
              type="button"
              onClick={() => updateSelectedBatch({ rotation: (currentRotation + 90) % 360 })}
              className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold cursor-pointer transition-colors"
            >
              +90°
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[0, 90, 180, 270].map((angle) => (
            <button
              key={angle}
              type="button"
              onClick={() => updateSelectedBatch({ rotation: angle })}
              className={`py-1 rounded text-center text-xs font-mono font-semibold border transition-all cursor-pointer ${
                currentRotation === angle
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                  : "bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              {angle}°
            </button>
          ))}
        </div>

        <input
          type="range"
          min="-180"
          max="180"
          step="1"
          value={currentRotation > 180 ? currentRotation - 360 : currentRotation}
          onChange={(e) => {
            const raw = Number(e.target.value);
            const normalized = raw < 0 ? raw + 360 : raw;
            updateSelectedBatch({ rotation: normalized });
          }}
          className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
        />
      </div>

      {/* 6. Layer Ordering & Duplication/Deletion */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-500" />
          <span>Layer & Actions</span>
        </span>

        {/* Layer order buttons */}
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={bringToFront}
            className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-[10px] flex flex-col items-center gap-0.5 cursor-pointer"
            title="Bring to Front"
          >
            <ArrowUpToLine className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[9px]">Top</span>
          </button>
          <button
            type="button"
            onClick={bringForward}
            className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-[10px] flex flex-col items-center gap-0.5 cursor-pointer"
            title="Bring Forward"
          >
            <ChevronUp className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[9px]">Up</span>
          </button>
          <button
            type="button"
            onClick={sendBackward}
            className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-[10px] flex flex-col items-center gap-0.5 cursor-pointer"
            title="Send Backward"
          >
            <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[9px]">Down</span>
          </button>
          <button
            type="button"
            onClick={sendToBack}
            className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-[10px] flex flex-col items-center gap-0.5 cursor-pointer"
            title="Send to Back"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[9px]">Bottom</span>
          </button>
        </div>

        {/* Duplicate and Delete */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => duplicateSelected("auto")}
            className="py-2 px-3 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>

          <button
            type="button"
            onClick={deleteSelected}
            className="py-2 px-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* 7. Group / Ungroup */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
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
            ? `${selectedElements.length} items selected — group to move as one.`
            : hasGroup
            ? "This text is part of a group. Ungroup to move independently."
            : "Select 2+ elements then group them to move together."}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={groupSelected}
            disabled={selectedElements.length < 2}
            className="py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Group (Ctrl+G)"
          >
            <span>📦 Group</span>
            <span className="text-[9px] font-mono opacity-70 ml-auto">⌘G</span>
          </button>
          <button
            type="button"
            onClick={ungroupSelected}
            disabled={!hasGroup && !selectedElements.some((el) => el.groupId)}
            className="py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Ungroup (Ctrl+Shift+G)"
          >
            <span>🔓 Ungroup</span>
            <span className="text-[9px] font-mono opacity-70 ml-auto">⇧⌘G</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { RefObject } from "react";
import {
  Settings,
  X,
  Maximize2,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  FileUp,
  Save,
} from "lucide-react";
import { CanvasBgMode } from "../types";

interface CanvasSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasWidth: number;
  setCanvasWidth: (w: number) => void;
  canvasHeight: number;
  setCanvasHeight: (h: number) => void;
  showBgImage: boolean;
  setShowBgImage: (show: boolean) => void;
  canvasBgMode: CanvasBgMode;
  setCanvasBgMode: (mode: CanvasBgMode) => void;
  bgImageSrc: string;
  setBgImageSrc: (src: string) => void;
  blueprintOpacity: number;
  setBlueprintOpacity: (op: number) => void;
  bgFileInputRef: RefObject<HTMLInputElement | null>;
  saveToStorage: () => Promise<void>;
  isSaving: boolean;
  lastSavedTime: string | null;
  notify: (msg: string) => void;
}

export function CanvasSettingsModal({
  isOpen,
  onClose,
  canvasWidth,
  setCanvasWidth,
  canvasHeight,
  setCanvasHeight,
  showBgImage,
  setShowBgImage,
  canvasBgMode,
  setCanvasBgMode,
  bgImageSrc,
  setBgImageSrc,
  blueprintOpacity,
  setBlueprintOpacity,
  bgFileInputRef,
  saveToStorage,
  isSaving,
  lastSavedTime,
  notify,
}: CanvasSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-[#0C121C] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Canvas Dimensions & Background Architecture
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Configure custom width, height, and background themes saved directly to the database.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* 1. Canvas Custom Dimensions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                <Maximize2 className="w-4 h-4 text-sky-500" />
                <span>Canvas Custom Dimensions</span>
              </span>
              <span className="font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-md">
                {canvasWidth} × {canvasHeight} px
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Width (pixels)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="400"
                    max="8000"
                    step="50"
                    value={canvasWidth}
                    onChange={(e) => setCanvasWidth(Math.max(400, parseInt(e.target.value) || 1200))}
                    className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-sm focus:border-sky-500 focus:outline-none"
                  />
                  <span className="text-[11px] font-mono text-slate-400">px</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Height (pixels)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="400"
                    max="8000"
                    step="50"
                    value={canvasHeight}
                    onChange={(e) => setCanvasHeight(Math.max(400, parseInt(e.target.value) || 850))}
                    className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-sm focus:border-sky-500 focus:outline-none"
                  />
                  <span className="text-[11px] font-mono text-slate-400">px</span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                Quick Size Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: "Standard Default", w: 1200, h: 850 },
                  { name: "Wide HD", w: 1600, h: 1000 },
                  { name: "Full HD 1080p", w: 1920, h: 1080 },
                  { name: "Mega Expo Hall", w: 2400, h: 1600 },
                  { name: "Ultra High-Res", w: 3000, h: 2000 },
                ].map((ps) => {
                  const isActive = canvasWidth === ps.w && canvasHeight === ps.h;
                  return (
                    <button
                      key={ps.name}
                      type="button"
                      onClick={() => {
                        setCanvasWidth(ps.w);
                        setCanvasHeight(ps.h);
                        notify(`Set canvas to ${ps.w} × ${ps.h} px`);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-sky-600 text-white font-bold shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {ps.name} ({ps.w}×{ps.h})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Background Style & Mode */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
              <Palette className="w-4 h-4 text-amber-500" />
              <span>Background Theme & Architecture</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Blueprint Image */}
              <button
                type="button"
                onClick={() => {
                  setShowBgImage(true);
                  notify("Background: Blueprint Image Mode");
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  showBgImage
                    ? "bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/20"
                    : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <ImageIcon className="w-4 h-4 text-sky-500" />
                  {showBgImage && <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />}
                </div>
                <div>
                  <p className="font-bold text-xs">Blueprint Image</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Custom / Official</p>
                </div>
              </button>

              {/* Solid Black CAD */}
              <button
                type="button"
                onClick={() => {
                  setShowBgImage(false);
                  setCanvasBgMode("cad-dark");
                  notify("Background: Solid CAD Black");
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  !showBgImage && canvasBgMode === "cad-dark"
                    ? "bg-slate-900 border-slate-500 text-white ring-2 ring-slate-500/20"
                    : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-4 h-4 rounded-full bg-slate-950 border border-slate-600 inline-block" />
                  {!showBgImage && canvasBgMode === "cad-dark" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div>
                  <p className="font-bold text-xs">Solid Black</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">CAD Dark (#0C121C)</p>
                </div>
              </button>

              {/* Clean White */}
              <button
                type="button"
                onClick={() => {
                  setShowBgImage(false);
                  setCanvasBgMode("clean-white");
                  notify("Background: Clean White");
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  !showBgImage && canvasBgMode === "clean-white"
                    ? "bg-white border-slate-400 text-slate-900 ring-2 ring-slate-400/20"
                    : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-4 h-4 rounded-full bg-white border border-slate-300 inline-block" />
                  {!showBgImage && canvasBgMode === "clean-white" && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                </div>
                <div>
                  <p className="font-bold text-xs">Clean White</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Crisp (#FFFFFF)</p>
                </div>
              </button>

              {/* CAD Navy */}
              <button
                type="button"
                onClick={() => {
                  setShowBgImage(false);
                  setCanvasBgMode("cad-navy");
                  notify("Background: CAD Navy");
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  !showBgImage && canvasBgMode === "cad-navy"
                    ? "bg-slate-900 border-sky-600 text-sky-200 ring-2 ring-sky-500/20"
                    : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-4 h-4 rounded-full bg-slate-900 border border-sky-400 inline-block" />
                  {!showBgImage && canvasBgMode === "cad-navy" && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                </div>
                <div>
                  <p className="font-bold text-xs">CAD Navy</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Slate (#0F172A)</p>
                </div>
              </button>
            </div>

            {/* Image Details (When in Image mode) */}
            {showBgImage && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    Blueprint Reference Image
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setBgImageSrc("/images/floor-plan-official.png");
                      notify("Reset to official blueprint image");
                    }}
                    className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Reset Default</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => bgFileInputRef.current?.click()}
                    className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Upload Custom Image</span>
                  </button>
                  <input
                    type="text"
                    value={bgImageSrc}
                    onChange={(e) => setBgImageSrc(e.target.value)}
                    placeholder="Image URL or path..."
                    className="flex-1 p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:border-sky-500 focus:outline-none truncate"
                  />
                </div>

                {/* Opacity Slider */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      Blueprint Visibility / Opacity:
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {Math.round(blueprintOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={blueprintOpacity}
                    onChange={(e) => setBlueprintOpacity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            {lastSavedTime ? `Last saved: ${lastSavedTime}` : "Unsaved changes auto-cached"}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={async () => {
                await saveToStorage();
                onClose();
              }}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving to Database..." : "Save to Database"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { RefObject } from "react";
import {
  MousePointer,
  Square,
  Pentagon,
  Minus,
  Spline,
  Pencil,
  Type,
  Eraser,
  Grid3X3,
  Image as ImageIcon,
  FileUp,
  Eye,
  Settings,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { ToolType, DrawingShapeRole, CanvasBgMode, PRESET_CATEGORIES } from "../types";

interface FloatingCanvasToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  setLeftSidebarTab: (tab: "tools" | "inspector") => void;
  drawingShapeRole: DrawingShapeRole;
  setDrawingShapeRole: (role: DrawingShapeRole) => void;
  selectedCategory: (typeof PRESET_CATEGORIES)[0];
  setActiveFillColor: (color: string) => void;
  snapToGrid: boolean;
  setSnapToGrid: React.Dispatch<React.SetStateAction<boolean>>;
  bgFileInputRef: RefObject<HTMLInputElement | null>;
  handleBgImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showBgImage: boolean;
  setShowBgImage: (show: boolean) => void;
  canvasBgMode: CanvasBgMode;
  setCanvasBgMode: (mode: CanvasBgMode) => void;
  blueprintOpacity: number;
  setBlueprintOpacity: (op: number) => void;
  setShowCanvasSettingsModal: (show: boolean) => void;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  notify: (msg: string) => void;
}

export function FloatingCanvasToolbar({
  activeTool,
  setActiveTool,
  setLeftSidebarTab,
  drawingShapeRole,
  setDrawingShapeRole,
  selectedCategory,
  setActiveFillColor,
  snapToGrid,
  setSnapToGrid,
  bgFileInputRef,
  handleBgImageUpload,
  showBgImage,
  setShowBgImage,
  canvasBgMode,
  setCanvasBgMode,
  blueprintOpacity,
  setBlueprintOpacity,
  setShowCanvasSettingsModal,
  canvasWidth,
  canvasHeight,
  zoom,
  setZoom,
  notify,
}: FloatingCanvasToolbarProps) {
  const tools = [
    { id: "select", icon: MousePointer, label: "Select / Marquee Box (V)" },
    { id: "rectangle", icon: Square, label: "Draw Rectangle Stall (R)" },
    { id: "polygon", icon: Pentagon, label: "Draw Polygon / Multi-Point (P)" },
    { id: "line", icon: Minus, label: "Draw Straight Wall (L)" },
    { id: "arc", icon: Spline, label: "Draw Curved Wall (A)" },
    { id: "pencil", icon: Pencil, label: "Freehand Pencil (B)" },
    { id: "text", icon: Type, label: "Text Label (T)" },
    { id: "eraser", icon: Eraser, label: "Eraser Tool (E)" },
  ] as const;

  return (
    <div className="absolute top-4 left-6 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 dark:bg-[#0C121C]/90 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => {
              setActiveTool(tool.id as ToolType);
              if (tool.id !== "select") {
                setLeftSidebarTab("tools");
              }
            }}
            className={`p-2.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isActive
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/25 ring-2 ring-sky-500/30 scale-105"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
            }`}
            title={tool.label}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}

      {/* Quick Shape Role Switcher when drawing Rectangles or Polygons */}
      {(activeTool === "rectangle" || activeTool === "polygon") && (
        <>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
          <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 px-1.5">
              Type:
            </span>
            <button
              type="button"
              onClick={() => {
                setDrawingShapeRole("stall");
                setActiveFillColor(selectedCategory.color === "transparent" ? "#0284C7" : selectedCategory.color);
                notify("Drawing Mode: Bookable Stall");
              }}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                drawingShapeRole === "stall"
                  ? "bg-sky-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Draw as Bookable Stall Booth"
            >
              <span>🏢 Stall</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDrawingShapeRole("zone");
                setActiveFillColor("#0284C7");
                notify("Drawing Mode: Functional Zone / Area");
              }}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                drawingShapeRole === "zone"
                  ? "bg-amber-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Draw as Functional Area / Hall Zone"
            >
              <span>🏷️ Zone</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDrawingShapeRole("outline");
                setActiveFillColor("transparent");
                notify("Drawing Mode: Architectural Boundary Outline");
              }}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                drawingShapeRole === "outline"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Draw as Hollow Architectural Outline / Wall"
            >
              <span>🔲 Outline</span>
            </button>
          </div>
        </>
      )}

      <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Snap to Grid Toggle */}
      <button
        onClick={() => setSnapToGrid((prev) => !prev)}
        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
          snapToGrid
            ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 font-bold"
            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
        title="Snap to 10px Grid"
      >
        <Grid3X3 className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Hidden Background Image File Input */}
      <input
        type="file"
        ref={bgFileInputRef}
        onChange={handleBgImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Background Mode Selector */}
      <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 px-1.5">
          BG:
        </span>

        <button
          onClick={() => {
            setShowBgImage(true);
            notify("Canvas: Blueprint Image Background");
          }}
          className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
            showBgImage
              ? "bg-sky-600 text-white shadow-xs font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          title="Show Blueprint / Custom Background Image"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Image</span>
        </button>

        <button
          onClick={() => bgFileInputRef.current?.click()}
          className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title="Upload Custom Blueprint / Floor Plan Image from computer"
        >
          <FileUp className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            setShowBgImage(false);
            setCanvasBgMode("cad-dark");
            notify("Canvas: Solid CAD Black Background");
          }}
          className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
            !showBgImage && canvasBgMode === "cad-dark"
              ? "bg-slate-900 text-white border border-slate-600 shadow-xs font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          title="Solid CAD Dark / Black Background"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-500 shrink-0" />
          <span>Black</span>
        </button>

        <button
          onClick={() => {
            setShowBgImage(false);
            setCanvasBgMode("clean-white");
            notify("Canvas: Clean White Background");
          }}
          className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
            !showBgImage && canvasBgMode === "clean-white"
              ? "bg-white text-slate-900 border border-slate-300 shadow-xs font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          title="Clean White Canvas Background"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400 shrink-0" />
          <span>White</span>
        </button>

        <button
          onClick={() => {
            setShowBgImage(false);
            setCanvasBgMode("cad-navy");
            notify("Canvas: CAD Navy Blueprint Background");
          }}
          className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
            !showBgImage && canvasBgMode === "cad-navy"
              ? "bg-sky-950 text-sky-200 border border-sky-700 shadow-xs font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          title="CAD Navy Blueprint Background"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-sky-900 border border-sky-500 shrink-0" />
          <span>Navy</span>
        </button>
      </div>

      {showBgImage && (
        <button
          onClick={() => {
            const nextOpacity = blueprintOpacity >= 0.9 ? 0.35 : blueprintOpacity >= 0.6 ? 0.95 : 0.65;
            setBlueprintOpacity(nextOpacity);
            notify(`Blueprint opacity: ${Math.round(nextOpacity * 100)}%`);
          }}
          className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
          title="Cycle Blueprint Opacity (35% / 65% / 95%)"
        >
          <Eye className="w-3 h-3 text-sky-500" />
          <span>{Math.round(blueprintOpacity * 100)}%</span>
        </button>
      )}

      <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Canvas Custom Dimensions Button */}
      <button
        onClick={() => setShowCanvasSettingsModal(true)}
        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
        title="Configure Canvas Width, Height & Background Architecture"
      >
        <Settings className="w-3.5 h-3.5 text-sky-500" />
        <span>{canvasWidth} × {canvasHeight} px</span>
      </button>

      <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.1, 2.0))}
          className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
          className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
          title="Reset 100% Zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
      </div>
    </div>
  );
}

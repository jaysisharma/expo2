import React, { RefObject } from "react";
import { CanvasElement, ToolType, CanvasBgMode } from "../../types";
import { CanvasElementRenderer } from "./CanvasElementRenderer";
import { CanvasDrawingPreview } from "./CanvasDrawingPreview";
import { PolygonDrawingBanner } from "./PolygonDrawingBanner";

interface CanvasViewportProps {
  svgRef: RefObject<SVGSVGElement | null>;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  canvasBgMode: CanvasBgMode;
  showBgImage: boolean;
  bgImageSrc: string;
  blueprintOpacity: number;
  gridSize: number;
  activeTool: ToolType;
  elements: CanvasElement[];
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  drawingRect: { x: number; y: number; width: number; height: number } | null;
  activeFillColor: string;
  activeStrokeColor: string;
  activeStrokeWidth: number;
  activeBorderRadius: number;
  currentPolygonPoints: { x: number; y: number }[];
  polygonHoverPos: { x: number; y: number } | null;
  selectionMarquee: { x1: number; y1: number; x2: number; y2: number } | null;
  onCanvasMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void;
  onCanvasMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  onCanvasMouseUp: (e: React.MouseEvent<SVGSVGElement>) => void;
  setPolygonHoverPos: (pos: { x: number; y: number } | null) => void;
  getCoordinates: (e: React.MouseEvent<any>) => { x: number; y: number };
  setIsDragging: (dragging: boolean) => void;
  setIsResizing: (handle: string | null) => void;
  setIsRotating: (rotating: boolean) => void;
  setInitialAngleOffset: (offset: number) => void;
  setDragStartPos: (pos: { x: number; y: number }) => void;
  setInitialElementState: (el: CanvasElement | null) => void;
  setInitialMultiPosMap: (map: {
    [id: string]: { x: number; y: number; points?: { x: number; y: number }[]; arcControl?: { x: number; y: number } };
  }) => void;
  recordHistory: (elements: CanvasElement[]) => void;
  notify: (msg: string) => void;
  finishPolygon: () => void;
  undoPolygonPoint: () => void;
  cancelPolygon: () => void;
}

export function CanvasViewport({
  svgRef,
  canvasWidth,
  canvasHeight,
  zoom,
  canvasBgMode,
  showBgImage,
  bgImageSrc,
  blueprintOpacity,
  gridSize,
  activeTool,
  elements,
  selectedIds,
  setSelectedIds,
  drawingRect,
  activeFillColor,
  activeStrokeColor,
  activeStrokeWidth,
  activeBorderRadius,
  currentPolygonPoints,
  polygonHoverPos,
  selectionMarquee,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  setPolygonHoverPos,
  getCoordinates,
  setIsDragging,
  setIsResizing,
  setIsRotating,
  setInitialAngleOffset,
  setDragStartPos,
  setInitialElementState,
  setInitialMultiPosMap,
  recordHistory,
  notify,
  finishPolygon,
  undoPolygonPoint,
  cancelPolygon,
}: CanvasViewportProps) {
  return (
    <div className="flex-1 overflow-auto flex items-center justify-center p-8">
      <div
        style={{
          width: canvasWidth * zoom,
          height: canvasHeight * zoom,
          backgroundColor:
            canvasBgMode === "clean-white"
              ? "#FFFFFF"
              : canvasBgMode === "cad-navy"
              ? "#0F172A"
              : "#0C121C",
        }}
        className="relative shadow-2xl rounded-xl border border-slate-300 dark:border-slate-800 overflow-hidden select-none transition-all"
      >
        {/* Background Reference Image (Optional) */}
        {showBgImage && bgImageSrc && (
          <img
            src={bgImageSrc}
            alt="Floor plan background"
            style={{ opacity: blueprintOpacity }}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
          />
        )}

        {/* Main SVG Interactive Surface */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className={`w-full h-full absolute inset-0 z-10 ${
            activeTool === "select"
              ? "cursor-default"
              : activeTool === "eraser"
              ? "cursor-not-allowed"
              : "cursor-crosshair"
          }`}
          onMouseDown={onCanvasMouseDown}
          onMouseMove={onCanvasMouseMove}
          onMouseUp={onCanvasMouseUp}
          onMouseLeave={() => setPolygonHoverPos(null)}
        >
          {/* SVG Grid */}
          <defs>
            <pattern id="studioGrid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
              <path
                d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                fill="none"
                stroke={canvasBgMode === "clean-white" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)"}
                strokeWidth="0.75"
              />
            </pattern>
          </defs>

          <rect width={canvasWidth} height={canvasHeight} fill="url(#studioGrid)" />

          {/* Render Elements */}
          <CanvasElementRenderer
            elements={elements}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            activeTool={activeTool}
            svgRef={svgRef}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            getCoordinates={getCoordinates}
            setIsDragging={setIsDragging}
            setIsResizing={setIsResizing}
            setIsRotating={setIsRotating}
            setInitialAngleOffset={setInitialAngleOffset}
            setDragStartPos={setDragStartPos}
            setInitialElementState={setInitialElementState}
            setInitialMultiPosMap={setInitialMultiPosMap}
            recordHistory={recordHistory}
            notify={notify}
          />

          {/* Drawing & Selection Preview */}
          <CanvasDrawingPreview
            activeTool={activeTool}
            drawingRect={drawingRect}
            activeFillColor={activeFillColor}
            activeStrokeColor={activeStrokeColor}
            activeStrokeWidth={activeStrokeWidth}
            activeBorderRadius={activeBorderRadius}
            currentPolygonPoints={currentPolygonPoints}
            polygonHoverPos={polygonHoverPos}
            selectionMarquee={selectionMarquee}
          />
        </svg>
      </div>

      {/* Floating In-Progress Polygon Banner Controls */}
      <PolygonDrawingBanner
        activeTool={activeTool}
        currentPolygonPointsCount={currentPolygonPoints.length}
        finishPolygon={finishPolygon}
        undoPoint={undoPolygonPoint}
        cancelPolygon={cancelPolygon}
      />
    </div>
  );
}

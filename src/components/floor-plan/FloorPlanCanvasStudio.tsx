"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { CanvasElement, ToolType, DrawingShapeRole, PRESET_CATEGORIES } from "./studio/types";
import { useCanvasHistory } from "./studio/hooks/useCanvasHistory";
import { useCanvasPersistence } from "./studio/hooks/useCanvasPersistence";
import { useCanvasBatchOps } from "./studio/hooks/useCanvasBatchOps";
import { useCanvasInteraction } from "./studio/hooks/useCanvasInteraction";
import { useKeyboardShortcuts } from "./studio/hooks/useKeyboardShortcuts";
import { StudioHeader } from "./studio/components/StudioHeader";
import { FloatingCanvasToolbar } from "./studio/components/FloatingCanvasToolbar";
import { CanvasSettingsModal } from "./studio/components/CanvasSettingsModal";
import { SidebarTabSwitcher } from "./studio/components/sidebar/SidebarTabSwitcher";
import { ToolsPalette } from "./studio/components/sidebar/ToolsPalette";
import { InspectorPanel } from "./studio/components/sidebar/InspectorPanel";
import { CanvasViewport } from "./studio/components/canvas/CanvasViewport";

export type { CanvasElement } from "./studio/types";

export default function FloorPlanCanvasStudio() {
  // Elements & Multi-Selection
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Active Tool: select | rectangle | polygon | arc | line | pencil | text | eraser
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [leftSidebarTab, setLeftSidebarTab] = useState<"tools" | "inspector">("tools");

  // Global Style Properties for new elements
  const [activeStrokeColor, setActiveStrokeColor] = useState<string>("#38BDF8");
  const [activeFillColor, setActiveFillColor] = useState<string>("#0284C7");
  const [activeStrokeWidth, setActiveStrokeWidth] = useState<number>(2);
  const [activeBorderRadius, setActiveBorderRadius] = useState<number>(4);
  const [arcCurvature, setArcCurvature] = useState<number>(40);

  // Categories & Stalls Counter
  const [selectedCategory, setSelectedCategory] = useState(PRESET_CATEGORIES[2]);
  const [counterPrefix, setCounterPrefix] = useState<string>("C");
  const [counterNum, setCounterNum] = useState<number>(1);

  // Drawing Shape Role
  const [drawingShapeRole, setDrawingShapeRole] = useState<DrawingShapeRole>("stall");
  const [zoneLabel, setZoneLabel] = useState<string>("VIP LOUNGE");

  // Batch Renumbering Input
  const [batchPrefix, setBatchPrefix] = useState<string>("C");
  const [batchStartNum, setBatchStartNum] = useState<number>(1);

  // Viewport Settings
  const [zoom, setZoom] = useState<number>(1);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(10);
  const [showCanvasSettingsModal, setShowCanvasSettingsModal] = useState<boolean>(false);

  // DOM Refs
  const svgRef = useRef<SVGSVGElement | null>(null);
  const bgFileInputRef = useRef<HTMLInputElement | null>(null);
  const elementsRef = useRef<CanvasElement[]>(elements);
  elementsRef.current = elements;
  const selectedIdsRef = useRef<string[]>(selectedIds);
  selectedIdsRef.current = selectedIds;

  // 1. History Hook
  const { history, historyIdx, recordHistory, handleUndo, handleRedo, setHistory, setHistoryIdx } =
    useCanvasHistory(elements, setElements);

  // 2. Persistence Hook
  const {
    canvasBgMode,
    setCanvasBgMode,
    showBgImage,
    setShowBgImage,
    bgImageSrc,
    setBgImageSrc,
    blueprintOpacity,
    setBlueprintOpacity,
    canvasWidth,
    setCanvasWidth,
    canvasHeight,
    setCanvasHeight,
    toastMsg,
    notify,
    isSaving,
    lastSavedTime,
    saveToStorage,
    handleBgImageUpload,
  } = useCanvasPersistence({
    elements,
    setElements,
    setHistory,
    setHistoryIdx,
  });

  // Selected items helpers
  const selectedElements = elements.filter((i) => selectedIds.includes(i.id));
  const primarySelected = selectedElements[0] || null;

  // Auto-switch left sidebar tab to inspector when an element is selected
  useEffect(() => {
    if (selectedIds.length > 0) {
      setLeftSidebarTab("inspector");
    }
  }, [selectedIds]);

  // 3. Batch Operations Hook
  const {
    updateSelectedBatch,
    handleBatchRenumber,
    applyCategoryPreset,
    alignSelected,
    duplicateSelected,
    deleteSelected,
    selectAllStalls,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    moveSelectedBy,
    clearCanvas,
    groupSelected,
    ungroupSelected,
  } = useCanvasBatchOps({
    elements,
    setElements,
    selectedIds,
    setSelectedIds,
    selectedElements,
    batchPrefix,
    batchStartNum,
    recordHistory,
    notify,
    selectedIdsRef,
  });

  // 4. Canvas Mouse Interactions Hook
  const {
    isDragging,
    setIsDragging,
    isResizing,
    setIsResizing,
    isRotating,
    setIsRotating,
    initialAngleOffset,
    setInitialAngleOffset,
    dragStartPos,
    setDragStartPos,
    initialElementState,
    setInitialElementState,
    initialMultiPosMap,
    setInitialMultiPosMap,
    isDrawing,
    setIsDrawing,
    startPoint,
    currentPencilPoints,
    setCurrentPencilPoints,
    currentPolygonPoints,
    setCurrentPolygonPoints,
    polygonHoverPos,
    setPolygonHoverPos,
    drawingRect,
    drawingArc,
    selectionMarquee,
    finishPolygon,
    stampRegularPolygon,
    onCanvasMouseDown,
    onCanvasMouseMove,
    onCanvasMouseUp,
    getCoordinates,
  } = useCanvasInteraction({
    svgRef,
    canvasWidth,
    canvasHeight,
    elements,
    setElements,
    selectedIds,
    setSelectedIds,
    activeTool,
    setActiveTool,
    drawingShapeRole,
    selectedCategory,
    counterPrefix,
    counterNum,
    setCounterNum,
    zoneLabel,
    activeStrokeColor,
    activeFillColor,
    activeStrokeWidth,
    activeBorderRadius,
    arcCurvature,
    snapToGrid,
    gridSize,
    recordHistory,
    notify,
  });

  // 5. Global Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    elementsRef,
    selectedIdsRef,
    moveSelectedBy,
    currentPolygonPoints,
    finishPolygon,
    setCurrentPolygonPoints,
    setPolygonHoverPos,
    deleteSelected,
    duplicateSelected,
    saveToStorage,
    setSelectedIds,
    handleUndo,
    handleRedo,
    setActiveTool,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    groupSelected,
    ungroupSelected,
    recordHistory,
    notify,
  });

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-[#070B12] text-slate-800 dark:text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Main Navigation Bar */}
      <StudioHeader
        selectedCount={selectedIds.length}
        selectAllStalls={selectAllStalls}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        canUndo={historyIdx > 0}
        canRedo={historyIdx < history.length - 1}
        saveToStorage={saveToStorage}
        isSaving={isSaving}
      />

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-16 right-5 z-50 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 text-xs font-medium shadow-xl flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* LEFT TOOLBAR & INSPECTOR DOCK */}
        <aside className="w-80 bg-white dark:bg-[#0C121C] border-r border-slate-200 dark:border-slate-800/80 flex flex-col z-20 shrink-0">
          <SidebarTabSwitcher
            currentTab={leftSidebarTab}
            onTabChange={setLeftSidebarTab}
            selectedCount={selectedIds.length}
          />

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {leftSidebarTab === "inspector" ? (
              <InspectorPanel
                selectedElements={selectedElements}
                primarySelected={primarySelected}
                onDeselect={() => setSelectedIds([])}
                updateSelectedBatch={updateSelectedBatch}
                selectedCategory={selectedCategory}
                applyCategoryPreset={applyCategoryPreset}
                batchPrefix={batchPrefix}
                setBatchPrefix={setBatchPrefix}
                batchStartNum={batchStartNum}
                setBatchStartNum={setBatchStartNum}
                handleBatchRenumber={handleBatchRenumber}
                alignSelected={alignSelected}
                bringToFront={bringToFront}
                sendToBack={sendToBack}
                bringForward={bringForward}
                sendBackward={sendBackward}
                duplicateSelected={duplicateSelected}
                deleteSelected={deleteSelected}
                selectAllStalls={selectAllStalls}
                groupSelected={groupSelected}
                ungroupSelected={ungroupSelected}
                saveToStorage={saveToStorage}
                isSaving={isSaving}
              />
            ) : (
              <ToolsPalette
                drawingShapeRole={drawingShapeRole}
                setDrawingShapeRole={setDrawingShapeRole}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                setCounterPrefix={setCounterPrefix}
                setActiveFillColor={setActiveFillColor}
                setActiveStrokeColor={setActiveStrokeColor}
                activeStrokeWidth={activeStrokeWidth}
                setActiveStrokeWidth={setActiveStrokeWidth}
                zoneLabel={zoneLabel}
                setZoneLabel={setZoneLabel}
                counterPrefix={counterPrefix}
                counterNum={counterNum}
                setCounterNum={setCounterNum}
                setActiveTool={setActiveTool}
                stampRegularPolygon={stampRegularPolygon}
                notify={notify}
              />
            )}
          </div>
        </aside>

        {/* CENTER INTERACTIVE SVG CANVAS */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-200/70 dark:bg-[#05080E]">
          <FloatingCanvasToolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            setLeftSidebarTab={setLeftSidebarTab}
            drawingShapeRole={drawingShapeRole}
            setDrawingShapeRole={setDrawingShapeRole}
            selectedCategory={selectedCategory}
            setActiveFillColor={setActiveFillColor}
            snapToGrid={snapToGrid}
            setSnapToGrid={setSnapToGrid}
            bgFileInputRef={bgFileInputRef}
            handleBgImageUpload={handleBgImageUpload}
            showBgImage={showBgImage}
            setShowBgImage={setShowBgImage}
            canvasBgMode={canvasBgMode}
            setCanvasBgMode={setCanvasBgMode}
            blueprintOpacity={blueprintOpacity}
            setBlueprintOpacity={setBlueprintOpacity}
            setShowCanvasSettingsModal={setShowCanvasSettingsModal}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            zoom={zoom}
            setZoom={setZoom}
            notify={notify}
          />

          <CanvasViewport
            svgRef={svgRef}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            zoom={zoom}
            canvasBgMode={canvasBgMode}
            showBgImage={showBgImage}
            bgImageSrc={bgImageSrc}
            blueprintOpacity={blueprintOpacity}
            gridSize={gridSize}
            activeTool={activeTool}
            elements={elements}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            drawingRect={drawingRect}
            activeFillColor={activeFillColor}
            activeStrokeColor={activeStrokeColor}
            activeStrokeWidth={activeStrokeWidth}
            activeBorderRadius={activeBorderRadius}
            currentPolygonPoints={currentPolygonPoints}
            polygonHoverPos={polygonHoverPos}
            selectionMarquee={selectionMarquee}
            onCanvasMouseDown={onCanvasMouseDown}
            onCanvasMouseMove={onCanvasMouseMove}
            onCanvasMouseUp={onCanvasMouseUp}
            setPolygonHoverPos={setPolygonHoverPos}
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
            finishPolygon={finishPolygon}
            undoPolygonPoint={() => setCurrentPolygonPoints((prev) => prev.slice(0, -1))}
            cancelPolygon={() => {
              setCurrentPolygonPoints([]);
              setPolygonHoverPos(null);
              setActiveTool("select");
            }}
          />
        </main>
      </div>

      {/* CANVAS DIMENSIONS & BACKGROUND SETTINGS MODAL */}
      <CanvasSettingsModal
        isOpen={showCanvasSettingsModal}
        onClose={() => setShowCanvasSettingsModal(false)}
        canvasWidth={canvasWidth}
        setCanvasWidth={setCanvasWidth}
        canvasHeight={canvasHeight}
        setCanvasHeight={setCanvasHeight}
        showBgImage={showBgImage}
        setShowBgImage={setShowBgImage}
        canvasBgMode={canvasBgMode}
        setCanvasBgMode={setCanvasBgMode}
        bgImageSrc={bgImageSrc}
        setBgImageSrc={setBgImageSrc}
        blueprintOpacity={blueprintOpacity}
        setBlueprintOpacity={setBlueprintOpacity}
        bgFileInputRef={bgFileInputRef}
        saveToStorage={saveToStorage}
        isSaving={isSaving}
        lastSavedTime={lastSavedTime}
        notify={notify}
      />
    </div>
  );
}

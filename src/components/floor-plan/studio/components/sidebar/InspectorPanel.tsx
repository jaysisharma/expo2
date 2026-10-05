import React from "react";
import { MousePointer } from "lucide-react";
import { CanvasElement, PRESET_CATEGORIES } from "../../types";
import { InspectorHeader } from "./inspector/InspectorHeader";
import { InspectorPriceAndSize } from "./inspector/InspectorPriceAndSize";
import { InspectorStyling } from "./inspector/InspectorStyling";
import { InspectorExhibitorInfo } from "./inspector/InspectorExhibitorInfo";
import { InspectorActions } from "./inspector/InspectorActions";
import { InspectorTextSettings } from "./inspector/InspectorTextSettings";

interface InspectorPanelProps {
  selectedElements: CanvasElement[];
  primarySelected: CanvasElement | null;
  onDeselect: () => void;
  updateSelectedBatch: (updates: Partial<CanvasElement> | ((el: CanvasElement) => Partial<CanvasElement>)) => void;
  selectedCategory: (typeof PRESET_CATEGORIES)[0];
  applyCategoryPreset: (cat: (typeof PRESET_CATEGORIES)[0]) => void;
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
  selectAllStalls: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  saveToStorage?: () => void;
  isSaving?: boolean;
}

export function InspectorPanel({
  selectedElements,
  primarySelected,
  onDeselect,
  updateSelectedBatch,
  selectedCategory,
  applyCategoryPreset,
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
  selectAllStalls,
  groupSelected,
  ungroupSelected,
  saveToStorage,
  isSaving,
}: InspectorPanelProps) {
  if (selectedElements.length === 0 || !primarySelected) {
    return (
      <div className="text-center py-12 text-slate-500 space-y-2">
        <MousePointer className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600 animate-bounce" />
        <p className="font-semibold text-xs text-slate-700 dark:text-slate-400">No Elements Selected</p>
        <p className="text-[11px] max-w-[200px] mx-auto text-slate-500 dark:text-slate-400">
          Click any stall or drag a selection box on the canvas to configure prices, sizes, and categories.
        </p>
        <button
          onClick={selectAllStalls}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-transparent text-xs font-semibold mt-2 transition-colors cursor-pointer"
        >
          Select All Stalls
        </button>
      </div>
    );
  }

  if (primarySelected.type === "text" || primarySelected.category === "Label") {
    return (
      <InspectorTextSettings
        primarySelected={primarySelected}
        selectedElements={selectedElements}
        onDeselect={onDeselect}
        updateSelectedBatch={updateSelectedBatch}
        alignSelected={alignSelected}
        bringToFront={bringToFront}
        sendToBack={sendToBack}
        bringForward={bringForward}
        sendBackward={sendBackward}
        duplicateSelected={duplicateSelected}
        deleteSelected={deleteSelected}
        groupSelected={groupSelected}
        ungroupSelected={ungroupSelected}
      />
    );
  }

  return (
    <div className="space-y-4">
      <InspectorHeader
        selectedElements={selectedElements}
        primarySelected={primarySelected}
        onDeselect={onDeselect}
        updateSelectedBatch={updateSelectedBatch}
        selectedCategory={selectedCategory}
      />
      <InspectorPriceAndSize
        primarySelected={primarySelected}
        selectedElementsCount={selectedElements.length}
        updateSelectedBatch={updateSelectedBatch}
        saveToStorage={saveToStorage}
        isSaving={isSaving}
      />
      <InspectorStyling
        primarySelected={primarySelected}
        selectedElementsCount={selectedElements.length}
        updateSelectedBatch={updateSelectedBatch}
        applyCategoryPreset={applyCategoryPreset}
      />
      <InspectorExhibitorInfo
        primarySelected={primarySelected}
        updateSelectedBatch={updateSelectedBatch}
      />
      <InspectorActions
        primarySelected={primarySelected}
        selectedElements={selectedElements}
        updateSelectedBatch={updateSelectedBatch}
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
        groupSelected={groupSelected}
        ungroupSelected={ungroupSelected}
      />
    </div>
  );
}

import { RefObject } from "react";
import { CanvasElement, ToolType, DrawingShapeRole, PRESET_CATEGORIES } from "../types";
import { useCanvasTransform } from "./useCanvasTransform";
import { useCanvasDrawing } from "./useCanvasDrawing";

interface UseCanvasInteractionParams {
  svgRef: RefObject<SVGSVGElement | null>;
  canvasWidth: number;
  canvasHeight: number;
  elements: CanvasElement[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  drawingShapeRole: DrawingShapeRole;
  selectedCategory: (typeof PRESET_CATEGORIES)[0];
  counterPrefix: string;
  counterNum: number;
  setCounterNum: React.Dispatch<React.SetStateAction<number>>;
  zoneLabel: string;
  activeStrokeColor: string;
  activeFillColor: string;
  activeStrokeWidth: number;
  activeBorderRadius: number;
  arcCurvature: number;
  snapToGrid: boolean;
  gridSize: number;
  recordHistory: (newElements: CanvasElement[]) => void;
  notify: (msg: string) => void;
}

export function useCanvasInteraction(params: UseCanvasInteractionParams) {
  const transform = useCanvasTransform({
    svgRef: params.svgRef,
    canvasWidth: params.canvasWidth,
    canvasHeight: params.canvasHeight,
    elements: params.elements,
    setElements: params.setElements,
    selectedIds: params.selectedIds,
    snapToGrid: params.snapToGrid,
    gridSize: params.gridSize,
    recordHistory: params.recordHistory,
  });

  const drawing = useCanvasDrawing({
    svgRef: params.svgRef,
    canvasWidth: params.canvasWidth,
    canvasHeight: params.canvasHeight,
    elements: params.elements,
    selectedIds: params.selectedIds,
    setSelectedIds: params.setSelectedIds,
    activeTool: params.activeTool,
    drawingShapeRole: params.drawingShapeRole,
    selectedCategory: params.selectedCategory,
    counterPrefix: params.counterPrefix,
    counterNum: params.counterNum,
    setCounterNum: params.setCounterNum,
    zoneLabel: params.zoneLabel,
    activeStrokeColor: params.activeStrokeColor,
    activeFillColor: params.activeFillColor,
    activeStrokeWidth: params.activeStrokeWidth,
    activeBorderRadius: params.activeBorderRadius,
    arcCurvature: params.arcCurvature,
    snapToGrid: params.snapToGrid,
    gridSize: params.gridSize,
    recordHistory: params.recordHistory,
    notify: params.notify,
  });

  return {
    ...transform,
    ...drawing,
    // getCoordinates from drawing respects pencil non-snapping
    getCoordinates: drawing.getCoordinates,
  };
}

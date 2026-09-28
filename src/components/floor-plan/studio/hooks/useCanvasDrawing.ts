import { useState, useCallback, RefObject } from "react";
import { CanvasElement, ToolType, DrawingShapeRole, PRESET_CATEGORIES } from "../types";
import { getSvgCoordinates } from "../utils";
import {
  createPolygonElement,
  createRegularPolygonElement,
  createRectangleElement,
} from "../shapeGenerators";

interface UseCanvasDrawingParams {
  svgRef: RefObject<SVGSVGElement | null>;
  canvasWidth: number;
  canvasHeight: number;
  elements: CanvasElement[];
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  activeTool: ToolType;
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

export function useCanvasDrawing({
  svgRef,
  canvasWidth,
  canvasHeight,
  elements,
  selectedIds,
  setSelectedIds,
  activeTool,
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
}: UseCanvasDrawingParams) {
  // Drawing & Marquee Selection States
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPencilPoints, setCurrentPencilPoints] = useState<{ x: number; y: number }[]>([]);
  const [currentPolygonPoints, setCurrentPolygonPoints] = useState<{ x: number; y: number }[]>([]);
  const [polygonHoverPos, setPolygonHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [drawingRect, setDrawingRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [drawingArc, setDrawingArc] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [selectionMarquee, setSelectionMarquee] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  const shapeContext = {
    drawingShapeRole,
    selectedCategory,
    counterPrefix,
    counterNum,
    zoneLabel,
    activeFillColor,
    activeStrokeColor,
    activeStrokeWidth,
    activeBorderRadius,
  };

  const getCoordinates = useCallback(
    (e: MouseEvent | React.MouseEvent<any>) => {
      const snap = activeTool !== "pencil" && snapToGrid;
      return getSvgCoordinates(e, svgRef.current, canvasWidth, canvasHeight, snap, gridSize);
    },
    [activeTool, snapToGrid, gridSize, canvasWidth, canvasHeight, svgRef]
  );

  const finishPolygon = (pointsToFinish?: { x: number; y: number }[]) => {
    const pts = pointsToFinish || currentPolygonPoints;
    if (pts.length < 3) {
      notify("Polygon requires at least 3 points");
      return;
    }

    const newPolyEl = createPolygonElement(pts, shapeContext);
    recordHistory([...elements, newPolyEl]);
    setSelectedIds([newPolyEl.id]);
    if (drawingShapeRole === "stall") setCounterNum((prev) => prev + 1);
    setCurrentPolygonPoints([]);
    setPolygonHoverPos(null);
    setIsDrawing(false);
    notify(
      drawingShapeRole === "stall"
        ? `Created Polygon Stall ${newPolyEl.number}`
        : drawingShapeRole === "zone"
        ? `Created Zone: ${newPolyEl.number}`
        : "Created Boundary Outline"
    );
  };

  const stampRegularPolygon = (sides: number, radius: number = 60, shapeName: string = "Polygon") => {
    const newPoly = createRegularPolygonElement(
      sides,
      radius,
      shapeName,
      canvasWidth,
      canvasHeight,
      snapToGrid,
      gridSize,
      shapeContext
    );

    recordHistory([...elements, newPoly]);
    setSelectedIds([newPoly.id]);
    if (drawingShapeRole === "stall") setCounterNum((prev) => prev + 1);
    notify(
      drawingShapeRole === "stall"
        ? `Stamped ${shapeName} (${sides}-sided) Stall ${newPoly.number}`
        : drawingShapeRole === "zone"
        ? `Stamped ${shapeName} Zone`
        : `Stamped ${shapeName} Outline`
    );
  };

  const onCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getCoordinates(e);

    if (activeTool === "select") {
      setIsDrawing(true);
      setStartPoint(coords);
      setSelectionMarquee({ x1: coords.x, y1: coords.y, x2: coords.x, y2: coords.y });
      if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
        setSelectedIds([]);
      }
    } else if (activeTool === "rectangle") {
      setIsDrawing(true);
      setStartPoint(coords);
      setDrawingRect({ x: coords.x, y: coords.y, width: 0, height: 0 });
    } else if (activeTool === "polygon") {
      if (currentPolygonPoints.length === 0) {
        setIsDrawing(true);
        setCurrentPolygonPoints([coords]);
        setPolygonHoverPos(coords);
      } else {
        const firstPt = currentPolygonPoints[0];
        const distToStart = Math.hypot(coords.x - firstPt.x, coords.y - firstPt.y);
        if (distToStart <= 16 && currentPolygonPoints.length >= 3) {
          finishPolygon(currentPolygonPoints);
        } else {
          setCurrentPolygonPoints((prev) => [...prev, coords]);
          setPolygonHoverPos(coords);
        }
      }
    } else if (activeTool === "pencil") {
      setIsDrawing(true);
      setCurrentPencilPoints([coords]);
    } else if (activeTool === "arc" || activeTool === "line") {
      setIsDrawing(true);
      setStartPoint(coords);
      setDrawingArc({ x1: coords.x, y1: coords.y, x2: coords.x, y2: coords.y });
    } else if (activeTool === "text") {
      const newText: CanvasElement = {
        id: `TXT_${Date.now()}`,
        type: "text",
        number: "HALL ENTRANCE",
        category: "Label",
        dimensions: "",
        sizeSqM: 0,
        sizeSqFt: 0,
        priceNPR: 0,
        priceUSD: 0,
        status: "Available",
        color: "transparent",
        borderColor: "transparent",
        textColor: activeStrokeColor || "#FFFFFF",
        strokeWidth: 1,
        x: coords.x,
        y: coords.y,
        width: 140,
        height: 30,
        rotation: 0,
        fontSize: 18,
        fontWeight: "700",
      };
      recordHistory([...elements, newText]);
      setSelectedIds([newText.id]);
      notify("Placed text label");
    }
  };

  const onCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getCoordinates(e);

    if (activeTool === "polygon") {
      setPolygonHoverPos(coords);
    }

    if (isDrawing && startPoint) {
      if (activeTool === "select") {
        setSelectionMarquee({ x1: startPoint.x, y1: startPoint.y, x2: coords.x, y2: coords.y });
      } else if (activeTool === "rectangle") {
        const x = Math.min(startPoint.x, coords.x);
        const y = Math.min(startPoint.y, coords.y);
        const width = Math.abs(coords.x - startPoint.x);
        const height = Math.abs(coords.y - startPoint.y);
        setDrawingRect({ x, y, width, height });
      } else if (activeTool === "pencil") {
        setCurrentPencilPoints((prev) => [...prev, coords]);
      } else if (activeTool === "arc" || activeTool === "line") {
        setDrawingArc({ x1: startPoint.x, y1: startPoint.y, x2: coords.x, y2: coords.y });
      }
    }
  };

  const onCanvasMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDrawing) {
      if (activeTool === "select" && selectionMarquee) {
        const minX = Math.min(selectionMarquee.x1, selectionMarquee.x2);
        const maxX = Math.max(selectionMarquee.x1, selectionMarquee.x2);
        const minY = Math.min(selectionMarquee.y1, selectionMarquee.y2);
        const maxY = Math.max(selectionMarquee.y1, selectionMarquee.y2);

        const matched = elements.filter((el) => {
          const elRight = el.x + el.width;
          const elBottom = el.y + el.height;
          return el.x < maxX && elRight > minX && el.y < maxY && elBottom > minY;
        });

        if (matched.length > 0) {
          const newIds = matched.map((m) => m.id);
          if (e.shiftKey || e.metaKey || e.ctrlKey) {
            setSelectedIds((prev) => Array.from(new Set([...prev, ...newIds])));
          } else {
            setSelectedIds(newIds);
          }
          notify(`Selected ${matched.length} element(s)`);
        }
        setSelectionMarquee(null);
      } else if (activeTool === "rectangle" && drawingRect) {
        if (drawingRect.width >= 10 && drawingRect.height >= 10) {
          const newEl = createRectangleElement(drawingRect, shapeContext);
          recordHistory([...elements, newEl]);
          setSelectedIds([newEl.id]);
          if (drawingShapeRole === "stall") setCounterNum((prev) => prev + 1);
          notify(
            drawingShapeRole === "stall"
              ? `Created Stall ${newEl.number}`
              : drawingShapeRole === "zone"
              ? `Created Zone: ${newEl.number}`
              : "Created Outline Box"
          );
        }
        setDrawingRect(null);
      } else if (activeTool === "pencil" && currentPencilPoints.length > 1) {
        const minX = Math.min(...currentPencilPoints.map((p) => p.x));
        const minY = Math.min(...currentPencilPoints.map((p) => p.y));
        const maxX = Math.max(...currentPencilPoints.map((p) => p.x));
        const maxY = Math.max(...currentPencilPoints.map((p) => p.y));

        const newPencilEl: CanvasElement = {
          id: `PATH_${Date.now()}`,
          type: "pencil",
          number: "PATH",
          category: "Freehand Path",
          dimensions: "",
          sizeSqM: 0,
          sizeSqFt: 0,
          priceNPR: 0,
          priceUSD: 0,
          status: "Available",
          color: "transparent",
          borderColor: activeStrokeColor || "#38BDF8",
          textColor: "#FFFFFF",
          strokeWidth: Math.max(2, activeStrokeWidth),
          x: minX,
          y: minY,
          width: Math.max(20, maxX - minX),
          height: Math.max(20, maxY - minY),
          rotation: 0,
          points: currentPencilPoints,
        };
        recordHistory([...elements, newPencilEl]);
        setSelectedIds([newPencilEl.id]);
        setCurrentPencilPoints([]);
        notify("Drew freehand path");
      } else if (activeTool === "line" && drawingArc) {
        const dist = Math.hypot(drawingArc.x2 - drawingArc.x1, drawingArc.y2 - drawingArc.y1);
        if (dist > 10) {
          const newLineEl: CanvasElement = {
            id: `LINE_${Date.now()}`,
            type: "line",
            number: "WALL",
            category: "Wall / Partition",
            dimensions: `${Math.round(dist / 10)}m`,
            sizeSqM: 0,
            sizeSqFt: 0,
            priceNPR: 0,
            priceUSD: 0,
            status: "Available",
            color: "transparent",
            borderColor: activeStrokeColor || "#38BDF8",
            textColor: "#FFFFFF",
            strokeWidth: Math.max(2, activeStrokeWidth),
            x: Math.min(drawingArc.x1, drawingArc.x2),
            y: Math.min(drawingArc.y1, drawingArc.y2),
            width: Math.abs(drawingArc.x2 - drawingArc.x1),
            height: Math.abs(drawingArc.y2 - drawingArc.y1),
            rotation: 0,
            points: [
              { x: drawingArc.x1, y: drawingArc.y1 },
              { x: drawingArc.x2, y: drawingArc.y2 },
            ],
          };
          recordHistory([...elements, newLineEl]);
          setSelectedIds([newLineEl.id]);
          notify("Created wall line");
        }
        setDrawingArc(null);
      } else if (activeTool === "arc" && drawingArc) {
        const dist = Math.hypot(drawingArc.x2 - drawingArc.x1, drawingArc.y2 - drawingArc.y1);
        if (dist > 20) {
          const midX = (drawingArc.x1 + drawingArc.x2) / 2;
          const midY = (drawingArc.y1 + drawingArc.y2) / 2 - arcCurvature;

          const newArcEl: CanvasElement = {
            id: `ARC_${Date.now()}`,
            type: "arc",
            number: "CURVE",
            category: "Curved Wall",
            dimensions: `${Math.round(dist / 10)}m Curve`,
            sizeSqM: 0,
            sizeSqFt: 0,
            priceNPR: 0,
            priceUSD: 0,
            status: "Available",
            color: "transparent",
            borderColor: activeStrokeColor || "#38BDF8",
            textColor: "#FFFFFF",
            strokeWidth: Math.max(2, activeStrokeWidth),
            x: Math.min(drawingArc.x1, drawingArc.x2, midX),
            y: Math.min(drawingArc.y1, drawingArc.y2, midY),
            width: Math.max(drawingArc.x1, drawingArc.x2, midX) - Math.min(drawingArc.x1, drawingArc.x2, midX),
            height: Math.max(drawingArc.y1, drawingArc.y2, midY) - Math.min(drawingArc.y1, drawingArc.y2, midY),
            rotation: 0,
            points: [
              { x: drawingArc.x1, y: drawingArc.y1 },
              { x: drawingArc.x2, y: drawingArc.y2 },
            ],
            arcControl: { x: midX, y: midY },
          };
          recordHistory([...elements, newArcEl]);
          setSelectedIds([newArcEl.id]);
          notify("Created curved wall");
        }
        setDrawingArc(null);
      }
      setIsDrawing(false);
      setStartPoint(null);
    }
  };

  return {
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
  };
}

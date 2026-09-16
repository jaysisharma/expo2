"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MousePointer,
  Square,
  Type,
  Pencil,
  Spline,
  Minus,
  Trash2,
  Copy,
  Download,
  Upload,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  CheckCircle2,
  Eraser,
  Sliders,
  ChevronRight,
  Eye,
  EyeOff,
  Image as ImageIcon,
  RotateCw,
  X,
  Maximize2,
  CheckSquare,
  Layers,
  DollarSign,
  Move,
  AlignLeft,
  AlignCenter,
  Hash,
  Sparkles,
  Palette,
  Zap,
  Building,
  MapPin,
  Info,
  Tag,
} from "lucide-react";

export interface CanvasElement {
  id: string;
  type: "stall" | "text" | "zone" | "pencil" | "arc" | "line";
  number: string;
  category: string;
  dimensions: string;
  sizeSqM: number;
  sizeSqFt: number;
  priceNPR: number;
  priceUSD: number;
  status: "Available" | "Reserved" | "Booked";
  color: string;
  fillOpacity?: number;
  borderColor: string;
  textColor: string;
  strokeWidth: number;
  borderRadius?: number;
  opacity?: number;
  strokeDasharray?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  points?: { x: number; y: number }[];
  arcControl?: { x: number; y: number };
  
  // Exhibitor-facing deliverables & specifications
  powerIncluded?: string;
  inclusions?: string[];
  orientation?: string;
  passesIncluded?: string;
  suitableFor?: string;
  description?: string;
  bookedBy?: string;
  exhibitorCountry?: string;
  exhibitorWebsite?: string;
  cornerPremiumPct?: number;
}

const PRESET_CATEGORIES = [
  { name: "Hollow Wall / Boundary", color: "transparent", fillOpacity: 0, border: "#38BDF8", text: "#38BDF8", defaultDim: "Wall", sqm: 0, npr: 0, usd: 0, prefix: "WALL", defaultW: 40, defaultH: 40 },
  { name: "Walking Corridor / Aisle", color: "transparent", fillOpacity: 0, border: "#F59E0B", text: "#F59E0B", defaultDim: "Aisle", sqm: 0, npr: 0, usd: 0, prefix: "AISLE", defaultW: 60, defaultH: 40 },
  { name: "10m × 7m Bare Space", color: "#0284C7", fillOpacity: 0.85, border: "#38BDF8", text: "#FFFFFF", defaultDim: "10m × 7m", sqm: 70, npr: 875000, usd: 6500, prefix: "C", defaultW: 140, defaultH: 98 },
  { name: "6m × 6m Space", color: "#D97706", fillOpacity: 0.85, border: "#FBBF24", text: "#FFFFFF", defaultDim: "6m × 6m", sqm: 36, npr: 540000, usd: 4000, prefix: "A", defaultW: 90, defaultH: 90 },
  { name: "Prime Space", color: "#16A34A", fillOpacity: 0.85, border: "#4ADE80", text: "#FFFFFF", defaultDim: "6m × 6m", sqm: 36, npr: 600000, usd: 4500, prefix: "P", defaultW: 90, defaultH: 90 },
  { name: "3m × 3m Shell Scheme", color: "#DC2626", fillOpacity: 0.85, border: "#F87171", text: "#FFFFFF", defaultDim: "3m × 3m", sqm: 9, npr: 180000, usd: 1350, prefix: "B", defaultW: 45, defaultH: 45 },
  { name: "Central Pavilion", color: "#9333EA", fillOpacity: 0.85, border: "#C084FC", text: "#FFFFFF", defaultDim: "8m × 8m", sqm: 64, npr: 1200000, usd: 9000, prefix: "A47", defaultW: 120, defaultH: 120 },
  { name: "5m × 6m Prime Space", color: "#475569", fillOpacity: 0.85, border: "#94A3B8", text: "#FFFFFF", defaultDim: "5m × 6m", sqm: 30, npr: 450000, usd: 3400, prefix: "A", defaultW: 75, defaultH: 90 },
  { name: "20ft × 60ft Bare Space", color: "#854D0E", fillOpacity: 0.85, border: "#FACC15", text: "#FFFFFF", defaultDim: "20ft × 60ft", sqm: 111, npr: 1450000, usd: 11000, prefix: "BS", defaultW: 180, defaultH: 60 },
  { name: "Seminar & Stage Hall", color: "#1E293B", fillOpacity: 0.9, border: "#64748B", text: "#FFFFFF", defaultDim: "20m × 40m", sqm: 800, npr: 0, usd: 0, prefix: "STAGE", defaultW: 300, defaultH: 150 },
];

export default function FloorPlanCanvasStudio() {
  // Elements & Multi-Selection
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Active Tool: select | rectangle | arc | line | pencil | text | eraser
  const [activeTool, setActiveTool] = useState<"select" | "rectangle" | "arc" | "line" | "pencil" | "text" | "eraser">("select");
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

  // Dragging, Resizing & Rotating State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [initialAngleOffset, setInitialAngleOffset] = useState<number>(0);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialElementState, setInitialElementState] = useState<CanvasElement | null>(null);
  const [initialMultiPosMap, setInitialMultiPosMap] = useState<{ [id: string]: { x: number; y: number } }>({});

  // Drawing & Marquee Selection States
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPencilPoints, setCurrentPencilPoints] = useState<{ x: number; y: number }[]>([]);
  const [drawingRect, setDrawingRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [drawingArc, setDrawingArc] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [selectionMarquee, setSelectionMarquee] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  // Batch Renumbering Input
  const [batchPrefix, setBatchPrefix] = useState<string>("C");
  const [batchStartNum, setBatchStartNum] = useState<number>(1);

  // Viewport & Background Reference
  const [zoom, setZoom] = useState<number>(1);
  const [canvasBgMode, setCanvasBgMode] = useState<"cad-dark" | "cad-navy" | "clean-white">("cad-dark");
  const [showBgImage, setShowBgImage] = useState<boolean>(true);
  const [bgImageSrc, setBgImageSrc] = useState<string>("/images/floor-plan-official.png");
  const [blueprintOpacity, setBlueprintOpacity] = useState<number>(0.65);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(10);

  // History & Toast
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const canvasWidth = 1200;
  const canvasHeight = 850;
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Toast
  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Selected items helpers
  const selectedElements = elements.filter((i) => selectedIds.includes(i.id));
  const primarySelected = selectedElements[0] || null;

  // Auto-switch left sidebar tab to inspector when an element is selected
  useEffect(() => {
    if (selectedIds.length > 0) {
      setLeftSidebarTab("inspector");
    }
  }, [selectedIds]);

  // Load Saved Design from Server on Mount
  useEffect(() => {
    async function loadFloorPlan() {
      try {
        const res = await fetch("/api/floor-plan/save");
        const resData = await res.json();
        if (resData.success && resData.data) {
          if (Array.isArray(resData.data.elements) && resData.data.elements.length > 0) {
            setElements(resData.data.elements);
            setHistory([resData.data.elements]);
            setHistoryIdx(0);
          }
          if (resData.data.bgImageSrc) setBgImageSrc(resData.data.bgImageSrc);
          if (resData.data.blueprintOpacity !== undefined) setBlueprintOpacity(resData.data.blueprintOpacity);
          if (resData.data.updatedAt) {
            const d = new Date(resData.data.updatedAt);
            setLastSavedTime(d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          }
          return;
        }
      } catch (err) {
        console.warn("Server load error, checking local backup", err);
      }

      // Local fallback
      try {
        const local = localStorage.getItem("hhe_canvas_studio_elements");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setElements(parsed);
            setHistory([parsed]);
            setHistoryIdx(0);
          }
        }
      } catch (e) {}
    }

    loadFloorPlan();
  }, []);

  // History Helper
  const recordHistory = (newElements: CanvasElement[]) => {
    const updatedHistory = history.slice(0, historyIdx + 1);
    updatedHistory.push(newElements);
    setHistory(updatedHistory);
    setHistoryIdx(updatedHistory.length - 1);
    setElements(newElements);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setElements(history[historyIdx - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setElements(history[historyIdx + 1]);
    }
  };

  const applySnap = (val: number) => {
    if (!snapToGrid) return Math.round(val);
    return Math.round(val / gridSize) * gridSize;
  };

  // Get SVG mouse coordinates
  const getCoordinates = useCallback(
    (e: MouseEvent | React.MouseEvent<any>) => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = canvasWidth / rect.width;
      const scaleY = canvasHeight / rect.height;
      return {
        x: activeTool === "pencil" ? Math.round((e.clientX - rect.left) * scaleX) : applySnap((e.clientX - rect.left) * scaleX),
        y: activeTool === "pencil" ? Math.round((e.clientY - rect.top) * scaleY) : applySnap((e.clientY - rect.top) * scaleY),
      };
    },
    [activeTool, snapToGrid, gridSize, canvasWidth, canvasHeight]
  );

  // Global mouse tracking for Dragging, Resizing & Rotating
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const currentPos = getCoordinates(e);

      // 1. Dragging Multiple or Single Elements
      if (isDragging && selectedIds.length > 0 && initialElementState) {
        let dx = currentPos.x - dragStartPos.x;
        let dy = currentPos.y - dragStartPos.y;

        // Shift key locks drag into strict horizontal or vertical line
        if (e.shiftKey) {
          if (Math.abs(dx) > Math.abs(dy)) {
            dy = 0;
          } else {
            dx = 0;
          }
        }

        setElements((prev) =>
          prev.map((el) => {
            if (selectedIds.includes(el.id) && initialMultiPosMap[el.id]) {
              return {
                ...el,
                x: applySnap(initialMultiPosMap[el.id].x + dx),
                y: applySnap(initialMultiPosMap[el.id].y + dy),
              };
            }
            return el;
          })
        );
      }

      // 2. Resizing (Primary Selected)
      else if (isResizing && primarySelected && initialElementState) {
        const dx = currentPos.x - dragStartPos.x;
        const dy = currentPos.y - dragStartPos.y;

        setElements((prev) =>
          prev.map((el) => {
            if (selectedIds.includes(el.id)) {
              let newW = el.width;
              let newH = el.height;
              let newX = el.x;
              let newY = el.y;

              const base = initialElementState;

              if (isResizing.includes("e")) newW = Math.max(20, applySnap(base.width + dx));
              if (isResizing.includes("s")) newH = Math.max(20, applySnap(base.height + dy));
              if (isResizing.includes("w")) {
                const calculatedW = base.width - dx;
                if (calculatedW > 20) {
                  newW = applySnap(calculatedW);
                  newX = applySnap(base.x + dx);
                }
              }
              if (isResizing.includes("n")) {
                const calculatedH = base.height - dy;
                if (calculatedH > 20) {
                  newH = applySnap(calculatedH);
                  newY = applySnap(base.y + dy);
                }
              }

              return { ...el, x: newX, y: newY, width: newW, height: newH };
            }
            return el;
          })
        );
      }

      // 3. Rotating (Smooth 1° Precision with Zero Jumping Delta Offset)
      else if (isRotating && primarySelected && initialElementState && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const scaleX = canvasWidth / rect.width;
        const scaleY = canvasHeight / rect.height;
        const rawMouseX = (e.clientX - rect.left) * scaleX;
        const rawMouseY = (e.clientY - rect.top) * scaleY;

        const centerX = initialElementState.x + initialElementState.width / 2;
        const centerY = initialElementState.y + initialElementState.height / 2;
        const currentAngle = Math.atan2(rawMouseY - centerY, rawMouseX - centerX) * (180 / Math.PI);
        let deg = Math.round(currentAngle - initialAngleOffset);

        while (deg > 180) deg -= 360;
        while (deg <= -180) deg += 360;

        if (e.shiftKey) {
          deg = Math.round(deg / 15) * 15;
        }

        setElements((prev) =>
          prev.map((el) => {
            if (selectedIds.includes(el.id)) return { ...el, rotation: deg };
            return el;
          })
        );
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging || isResizing || isRotating) {
        setIsDragging(false);
        setIsResizing(null);
        setIsRotating(false);
        setInitialElementState(null);
        setInitialMultiPosMap({});
        recordHistory(elements);
      }
    };

    if (isDragging || isResizing || isRotating) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, isRotating, selectedIds, primarySelected, initialElementState, initialMultiPosMap, dragStartPos, getCoordinates, elements, snapToGrid]);

  // Canvas Mouse Down
  const onCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getCoordinates(e);

    if (activeTool === "select") {
      // Start marquee box selection on empty canvas
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
      };
      recordHistory([...elements, newText]);
      setSelectedIds([newText.id]);
      notify("Placed text label");
    }
  };

  // Canvas Mouse Move (during drawing / marquee selection)
  const onCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getCoordinates(e);

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

  // Canvas Mouse Up
  const onCanvasMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDrawing) {
      if (activeTool === "select" && selectionMarquee) {
        const minX = Math.min(selectionMarquee.x1, selectionMarquee.x2);
        const maxX = Math.max(selectionMarquee.x1, selectionMarquee.x2);
        const minY = Math.min(selectionMarquee.y1, selectionMarquee.y2);
        const maxY = Math.max(selectionMarquee.y1, selectionMarquee.y2);

        // Find all intersecting elements
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
          const stallLabel = `${counterPrefix}${counterNum}`;

          const newEl: CanvasElement = {
            id: `STALL_${Date.now()}`,
            type: "stall",
            number: stallLabel,
            category: selectedCategory.name,
            dimensions: selectedCategory.defaultDim,
            sizeSqM: selectedCategory.sqm,
            sizeSqFt: Math.round(selectedCategory.sqm * 10.764),
            priceNPR: selectedCategory.npr,
            priceUSD: selectedCategory.usd,
            status: "Available",
            color: activeFillColor === "transparent" ? "transparent" : (activeFillColor || selectedCategory.color),
            fillOpacity: activeFillColor === "transparent" ? 0 : (selectedCategory.fillOpacity ?? 0.85),
            borderColor: activeStrokeColor || selectedCategory.border,
            textColor: activeFillColor === "transparent" ? (activeStrokeColor || "#38BDF8") : "#FFFFFF",
            strokeWidth: activeStrokeWidth,
            borderRadius: activeBorderRadius,
            x: drawingRect.x,
            y: drawingRect.y,
            width: drawingRect.width,
            height: drawingRect.height,
            rotation: 0,
          };

          recordHistory([...elements, newEl]);
          setSelectedIds([newEl.id]);
          setCounterNum((prev) => prev + 1);
          notify(`Created ${stallLabel}`);
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

  // --------------------------------------------------------------------------
  // BATCH & INDIVIDUAL PROPERTY UPDATES
  // --------------------------------------------------------------------------
  const updateSelectedBatch = (
    updates: Partial<CanvasElement> | ((el: CanvasElement) => Partial<CanvasElement>)
  ) => {
    if (selectedIds.length === 0) return;
    const updated = elements.map((el) => {
      if (selectedIds.includes(el.id)) {
        const patch = typeof updates === "function" ? updates(el) : updates;
        return { ...el, ...patch };
      }
      return el;
    });
    recordHistory(updated);
  };

  // Auto-renumber sequential stalls
  const handleBatchRenumber = () => {
    if (selectedIds.length === 0) return;
    const prefix = batchPrefix.trim() || "C";
    let start = batchStartNum || 1;

    // Sort selected items top-to-bottom then left-to-right
    const sorted = [...selectedElements].sort((a, b) => {
      if (Math.abs(a.y - b.y) > 20) return a.y - b.y;
      return a.x - b.x;
    });

    const labelMap: { [id: string]: string } = {};
    sorted.forEach((el, idx) => {
      labelMap[el.id] = `${prefix}${start + idx}`;
    });

    const updated = elements.map((el) => {
      if (labelMap[el.id]) {
        return { ...el, number: labelMap[el.id] };
      }
      return el;
    });

    recordHistory(updated);
    notify(`Sequentially renumbered ${sorted.length} stalls (${prefix}${start} ... ${prefix}${start + sorted.length - 1})`);
  };

  // Apply Preset Category in Batch
  const applyCategoryPreset = (cat: (typeof PRESET_CATEGORIES)[0]) => {
    updateSelectedBatch({
      category: cat.name,
      dimensions: cat.defaultDim,
      sizeSqM: cat.sqm,
      sizeSqFt: Math.round(cat.sqm * 10.764),
      priceNPR: cat.npr,
      priceUSD: cat.usd,
      color: cat.color === "transparent" ? "transparent" : cat.color,
      fillOpacity: cat.color === "transparent" ? 0 : cat.fillOpacity,
      borderColor: cat.border,
      textColor: cat.color === "transparent" ? cat.border : "#FFFFFF",
      width: cat.defaultW,
      height: cat.defaultH,
    });
    notify(`Applied ${cat.name} to ${selectedIds.length} stall(s)`);
  };

  // Batch Align Elements
  const alignSelected = (mode: "left" | "top" | "center-x" | "center-y" | "distribute-h" | "distribute-v") => {
    if (selectedElements.length < 2) return;

    if (mode === "left") {
      const minX = Math.min(...selectedElements.map((e) => e.x));
      updateSelectedBatch({ x: minX });
      notify("Aligned Left");
    } else if (mode === "top") {
      const minY = Math.min(...selectedElements.map((e) => e.y));
      updateSelectedBatch({ y: minY });
      notify("Aligned Top");
    } else if (mode === "center-x") {
      const avgCenterX = Math.round(
        selectedElements.reduce((acc, e) => acc + e.x + e.width / 2, 0) / selectedElements.length
      );
      updateSelectedBatch((el) => ({ x: avgCenterX - el.width / 2 }));
      notify("Aligned Center X");
    } else if (mode === "center-y") {
      const avgCenterY = Math.round(
        selectedElements.reduce((acc, e) => acc + e.y + e.height / 2, 0) / selectedElements.length
      );
      updateSelectedBatch((el) => ({ y: avgCenterY - el.height / 2 }));
      notify("Aligned Center Y");
    } else if (mode === "distribute-h") {
      const sorted = [...selectedElements].sort((a, b) => a.x - b.x);
      const minX = sorted[0].x;
      const maxX = sorted[sorted.length - 1].x;
      const step = (maxX - minX) / (sorted.length - 1);
      const posMap: { [id: string]: number } = {};
      sorted.forEach((el, i) => {
        posMap[el.id] = Math.round(minX + i * step);
      });
      updateSelectedBatch((el) => ({ x: posMap[el.id] ?? el.x }));
      notify("Distributed Horizontally");
    }
  };

  // Batch Duplicate
  const duplicateSelected = () => {
    if (selectedIds.length === 0) return;
    const newItems: CanvasElement[] = [];
    const newSelectedIds: string[] = [];

    selectedElements.forEach((el, idx) => {
      const cloned: CanvasElement = {
        ...el,
        id: `STALL_${Date.now()}_${idx}`,
        number: `${el.number}_copy`,
        x: el.x + 20,
        y: el.y + 20,
      };
      newItems.push(cloned);
      newSelectedIds.push(cloned.id);
    });

    recordHistory([...elements, ...newItems]);
    setSelectedIds(newSelectedIds);
    notify(`Duplicated ${newItems.length} element(s)`);
  };

  // Batch Delete
  const deleteSelected = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    const updated = elements.filter((i) => !selectedIds.includes(i.id));
    recordHistory(updated);
    setSelectedIds([]);
    notify(`Deleted ${count} element(s)`);
  };

  // Quick Select Helpers
  const selectAllStalls = () => {
    const ids = elements.filter((e) => e.type === "stall" || e.type === "zone").map((e) => e.id);
    setSelectedIds(ids);
    notify(`Selected all ${ids.length} stalls`);
  };

  // --------------------------------------------------------------------------
  // GLOBAL KEYBOARD SHORTCUTS (Ctrl+Z, Ctrl+Y, Delete, Ctrl+A, Escape)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }

      const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // 1. DELETE / BACKSPACE
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length > 0) {
          e.preventDefault();
          deleteSelected();
        }
      }

      // 2. SELECT ALL (Ctrl+A / Cmd+A)
      else if (isCmdOrCtrl && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelectedIds(elements.map((e) => e.id));
        notify(`Selected all ${elements.length} elements`);
      }

      // 3. UNDO (Ctrl+Z)
      else if (isCmdOrCtrl && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // 4. REDO (Ctrl+Y or Ctrl+Shift+Z)
      else if (
        (isCmdOrCtrl && e.key.toLowerCase() === "y") ||
        (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        handleRedo();
      }

      // 5. ESCAPE (Deselect)
      else if (e.key === "Escape") {
        setSelectedIds([]);
        setActiveTool("select");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, elements, historyIdx, history]);

  // Clear Canvas
  const clearCanvas = () => {
    if (elements.length === 0) return;
    if (confirm("Clear all elements on the canvas?")) {
      recordHistory([]);
      setSelectedIds([]);
      notify("Canvas cleared");
    }
  };

  // Save to Database & LocalStorage
  const saveToStorage = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      localStorage.setItem("hhe_canvas_studio_elements", JSON.stringify(elements));

      const response = await fetch("/api/floor-plan/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elements,
          bgImageSrc,
          blueprintOpacity,
        }),
      });

      const resJson = await response.json();
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

      if (resJson.success) {
        notify("Design saved to server database");
      } else {
        notify("Saved to local browser backup");
      }
    } catch (error) {
      notify("Saved to local storage");
    } finally {
      setIsSaving(false);
    }
  };

  // SVG Pencil helper
  const getPencilPathData = (points: { x: number; y: number }[]): string => {
    if (!points || points.length === 0) return "";
    return points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-[#070B12] text-slate-800 dark:text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Main Navigation Bar */}
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
          {selectedIds.length > 0 && (
            <span className="px-3 py-1 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-700 dark:text-sky-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{selectedIds.length} Selected</span>
            </span>
          )}

          <button
            onClick={selectAllStalls}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            title="Select all stalls on canvas"
          >
            Select All Stalls
          </button>

          <button
            onClick={handleUndo}
            disabled={historyIdx === 0}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIdx >= history.length - 1}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

          <button
            onClick={saveToStorage}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
            <span>{isSaving ? "Saving..." : "Save Canvas"}</span>
          </button>
        </div>
      </header>

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
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#090D14] p-1 gap-1">
            <button
              onClick={() => setLeftSidebarTab("tools")}
              className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                leftSidebarTab === "tools"
                  ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs border border-slate-200/80 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <MousePointer className={`w-3.5 h-3.5 ${leftSidebarTab === "tools" ? "text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-400"}`} />
              <span>Drawing Tools</span>
            </button>
            <button
              onClick={() => setLeftSidebarTab("inspector")}
              className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                leftSidebarTab === "inspector"
                  ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs border border-slate-200/80 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Sliders className={`w-3.5 h-3.5 ${leftSidebarTab === "inspector" ? "text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-400"}`} />
              <span>
                Inspector {selectedIds.length > 0 && `(${selectedIds.length})`}
              </span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {leftSidebarTab === "inspector" ? (
              /* INSPECTOR PANEL: SINGLE & MULTI BATCH CONFIGURATION */
              selectedElements.length > 0 ? (
                <div className="space-y-4">
                  {/* Selection Header */}
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        {selectedElements.length === 1 ? "Single Selection" : "Multi-Stall Batch"}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {selectedElements.length === 1
                          ? `${primarySelected.number} · ${primarySelected.category}`
                          : `${selectedElements.length} Stalls Selected`}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="p-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      title="Deselect All"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 1. PRICE CONFIGURATION (NPR & USD) */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                        <span>Price & Commercials</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                        {selectedElements.length > 1 ? "Batch Updates All" : "Per Stall"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Price (NPR)</label>
                        <input
                          type="number"
                          step="5000"
                          value={primarySelected.priceNPR || 0}
                          onChange={(e) => updateSelectedBatch({ priceNPR: Number(e.target.value) })}
                          className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Price (USD $)</label>
                        <input
                          type="number"
                          step="50"
                          value={primarySelected.priceUSD || 0}
                          onChange={(e) => updateSelectedBatch({ priceUSD: Number(e.target.value) })}
                          className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-sky-600 dark:text-sky-400 font-mono font-bold text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    {/* Quick Price Chips */}
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Quick Price Tiers:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { label: "NPR 180k (Shell 3×3)", npr: 180000, usd: 1350 },
                          { label: "NPR 450k (5×6 Space)", npr: 450000, usd: 3400 },
                          { label: "NPR 600k (Prime 6×6)", npr: 600000, usd: 4500 },
                          { label: "NPR 875k (10×7 Bare)", npr: 875000, usd: 6500 },
                          { label: "NPR 1.2M (Pavilion)", npr: 1200000, usd: 9000 },
                          { label: "NPR 0 (Free / Wall)", npr: 0, usd: 0 },
                        ].map((tier) => (
                          <button
                            key={tier.label}
                            type="button"
                            onClick={() => updateSelectedBatch({ priceNPR: tier.npr, priceUSD: tier.usd })}
                            className="p-1.5 rounded bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] text-left truncate font-mono border border-slate-200 dark:border-slate-800 transition-colors"
                          >
                            {tier.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2. SIZE & DIMENSIONS CONFIGURATION */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                        <span>Dimensions & Size</span>
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {primarySelected.sizeSqM} sq.m ({primarySelected.sizeSqFt} sq.ft)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 mb-1">
                          <span>Width</span>
                          <span className="font-mono text-slate-800 dark:text-slate-200">{primarySelected.width}px</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="300"
                          value={primarySelected.width}
                          onChange={(e) => updateSelectedBatch({ width: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-200 dark:bg-slate-800 rounded"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 mb-1">
                          <span>Height</span>
                          <span className="font-mono text-slate-800 dark:text-slate-200">{primarySelected.height}px</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="300"
                          value={primarySelected.height}
                          onChange={(e) => updateSelectedBatch({ height: Number(e.target.value) })}
                          className="w-full accent-sky-400 h-1 bg-slate-200 dark:bg-slate-800 rounded"
                        />
                      </div>
                    </div>

                    {/* Standard Meter Size Presets */}
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Standard Physical Sizes:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { label: "3m × 3m (9 sq.m)", w: 45, h: 45, sqm: 9, dim: "3m × 3m" },
                          { label: "6m × 6m (36 sq.m)", w: 90, h: 90, sqm: 36, dim: "6m × 6m" },
                          { label: "10m × 7m (70 sq.m)", w: 140, h: 98, sqm: 70, dim: "10m × 7m" },
                          { label: "5m × 6m (30 sq.m)", w: 75, h: 90, sqm: 30, dim: "5m × 6m" },
                          { label: "8m × 8m (64 sq.m)", w: 120, h: 120, sqm: 64, dim: "8m × 8m" },
                          { label: "20ft × 60ft Bare", w: 180, h: 60, sqm: 111, dim: "20ft × 60ft" },
                        ].map((dim) => (
                          <button
                            key={dim.label}
                            type="button"
                            onClick={() =>
                              updateSelectedBatch({
                                width: dim.w,
                                height: dim.h,
                                sizeSqM: dim.sqm,
                                sizeSqFt: Math.round(dim.sqm * 10.764),
                                dimensions: dim.dim,
                              })
                            }
                            className="p-1.5 rounded bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] text-left truncate font-mono border border-slate-200 dark:border-slate-800 transition-colors"
                          >
                            {dim.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. CATEGORY & THEME PRESETS */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">Apply Category Preset</span>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                      {PRESET_CATEGORIES.map((cat) => (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => applyCategoryPreset(cat)}
                          className="w-full p-2 rounded-lg bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 text-left flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.border }} />
                            <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">{cat.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{cat.defaultDim}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3.5 CONTAINER & BORDER COLOR SELECTION */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
                        <span>Container & Border Colors</span>
                      </span>
                      <span className="text-[10px] text-pink-600 dark:text-pink-400 font-mono">
                        {selectedElements.length > 1 ? "Batch Colors" : "Custom Color"}
                      </span>
                    </div>

                    {/* Container Fill Color */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Container Fill Color:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={
                              primarySelected.color === "transparent" || primarySelected.color === "none"
                                ? "#0284C7"
                                : primarySelected.color || "#0284C7"
                            }
                            onChange={(e) =>
                              updateSelectedBatch({
                                color: e.target.value,
                                fillOpacity: 0.85,
                              })
                            }
                            className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateSelectedBatch({
                                color: "transparent",
                                fillOpacity: 0,
                                textColor: primarySelected.borderColor || "#38BDF8",
                              })
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                              primarySelected.color === "transparent" || primarySelected.color === "none"
                                ? "bg-sky-500/20 border-sky-400 text-sky-300 font-bold"
                                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            Hollow / None
                          </button>
                        </div>
                      </div>

                      {/* Quick Swatches for Fill */}
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: "Sky Blue", hex: "#0284C7" },
                          { name: "Amber", hex: "#D97706" },
                          { name: "Emerald", hex: "#16A34A" },
                          { name: "Red", hex: "#DC2626" },
                          { name: "Purple", hex: "#9333EA" },
                          { name: "Dark Slate", hex: "#0F172A" },
                          { name: "Cool Gray", hex: "#475569" },
                          { name: "Gold Brown", hex: "#854D0E" },
                          { name: "Navy Blue", hex: "#061A2A" },
                          { name: "Ice Blue", hex: "#38BDF8" },
                        ].map((sw) => (
                          <button
                            key={sw.name}
                            type="button"
                            title={sw.name}
                            onClick={() =>
                              updateSelectedBatch({
                                color: sw.hex,
                                fillOpacity: 0.85,
                                textColor: "#FFFFFF",
                              })
                            }
                            style={{ backgroundColor: sw.hex }}
                            className={`w-5 h-5 rounded-md border border-slate-700 hover:scale-110 transition-transform ${
                              primarySelected.color === sw.hex ? "ring-2 ring-white scale-110" : ""
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Fill Opacity Slider */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Fill Opacity</span>
                        <span className="font-mono text-slate-200">
                          {Math.round((primarySelected.fillOpacity ?? 0.85) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round((primarySelected.fillOpacity ?? 0.85) * 100)}
                        onChange={(e) =>
                          updateSelectedBatch({
                            fillOpacity: Number(e.target.value) / 100,
                          })
                        }
                        className="w-full accent-pink-400 h-1 bg-slate-800 rounded"
                      />
                    </div>

                    {/* Border / Stroke Color */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Border / Outline Color:</span>
                        <input
                          type="color"
                          value={primarySelected.borderColor || "#38BDF8"}
                          onChange={(e) =>
                            updateSelectedBatch({
                              borderColor: e.target.value,
                            })
                          }
                          className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {["#38BDF8", "#FBBF24", "#4ADE80", "#F87171", "#C084FC", "#FFFFFF", "#94A3B8", "#061A2A"].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() =>
                              updateSelectedBatch({
                                borderColor: c,
                              })
                            }
                            style={{ backgroundColor: c }}
                            className={`w-5 h-5 rounded-full border border-slate-700 hover:scale-110 transition-transform ${
                              primarySelected.borderColor === c ? "ring-2 ring-white scale-110" : ""
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Text / Label Color */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Text Label Color:</span>
                        <input
                          type="color"
                          value={primarySelected.textColor || "#FFFFFF"}
                          onChange={(e) =>
                            updateSelectedBatch({
                              textColor: e.target.value,
                            })
                          }
                          className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {["#FFFFFF", "#061A2A", "#38BDF8", "#4ADE80", "#FBBF24", "#F87171"].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() =>
                              updateSelectedBatch({
                                textColor: c,
                              })
                            }
                            style={{ backgroundColor: c }}
                            className={`w-5 h-5 rounded-full border border-slate-700 hover:scale-110 transition-transform ${
                              primarySelected.textColor === c ? "ring-2 ring-white scale-110" : ""
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Border Radius & Stroke Width */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Corner Radius</span>
                          <span className="font-mono text-slate-200">{primarySelected.borderRadius ?? 4}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          value={primarySelected.borderRadius ?? 4}
                          onChange={(e) =>
                            updateSelectedBatch({
                              borderRadius: Number(e.target.value),
                            })
                          }
                          className="w-full accent-pink-400 h-1 bg-slate-800 rounded"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Border Width</span>
                          <span className="font-mono text-slate-200">{primarySelected.strokeWidth ?? 2}px</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="16"
                          value={primarySelected.strokeWidth ?? 2}
                          onChange={(e) =>
                            updateSelectedBatch({
                              strokeWidth: Number(e.target.value),
                            })
                          }
                          className="w-full accent-pink-400 h-1 bg-slate-800 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3.8 EXHIBITOR-FACING SPECIFICATIONS & DELIVERABLES */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        <span>Exhibitor-Facing Information</span>
                      </span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                        Shown to Exhibitors
                      </span>
                    </div>

                    {/* Power Supply */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                        <span>Included Power Supply</span>
                      </label>
                      <input
                        type="text"
                        value={primarySelected.powerIncluded || "5 kW 3-Phase Power Included"}
                        onChange={(e) => updateSelectedBatch({ powerIncluded: e.target.value })}
                        placeholder="e.g. 5 kW 3-Phase Power"
                        className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                      <div className="flex flex-wrap gap-1">
                        {[
                          "5 kW 3-Phase Power",
                          "15A Single Phase",
                          "10 kW Heavy Load",
                          "1 kW Basic Lighting",
                          "Bare Space (Power Extra)",
                        ].map((pwr) => (
                          <button
                            key={pwr}
                            type="button"
                            onClick={() => updateSelectedBatch({ powerIncluded: pwr })}
                            className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-mono"
                          >
                            {pwr}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Stall Orientation / Layout Advantage */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <label className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-sky-500 dark:text-sky-400" />
                        <span>Orientation & Open Sides</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          "Corner Stall (2-Side Open)",
                          "3-Side Open Island",
                          "4-Side Open Pavilion",
                          "Standard Row (1-Side Open)",
                          "Main Plenary Facing",
                          "VIP Lounge Adjacent",
                        ].map((ori) => (
                          <button
                            key={ori}
                            type="button"
                            onClick={() => updateSelectedBatch({ orientation: ori })}
                            className={`p-1.5 rounded-lg border text-left text-[10px] font-medium transition-all ${
                              primarySelected.orientation === ori
                                ? "bg-amber-50 dark:bg-amber-500/20 border-amber-400 text-amber-800 dark:text-amber-300 font-bold"
                                : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                            }`}
                          >
                            {ori}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Included Amenities & Deliverables Checklist */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-pink-500 dark:text-pink-400" />
                          <span>Included Stall Amenities</span>
                        </label>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">Click to toggle</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "1 Reception Counter",
                          "2 Visitor Chairs",
                          "3 LED Spotlights",
                          "1 Power Socket (5A)",
                          "Needle Punch Carpet",
                          "Fascia Name Board",
                          "Octanorm Wall Panels",
                          "Daily Stall Cleaning",
                          "High-Speed Wi-Fi",
                          "2 Delegate Passes",
                          "4 Exhibitor Badges",
                          "Directory Listing",
                        ].map((amenity) => {
                          const currentInclusions = primarySelected.inclusions || [
                            "1 Reception Counter",
                            "2 Visitor Chairs",
                            "3 LED Spotlights",
                            "1 Power Socket (5A)",
                            "Needle Punch Carpet",
                            "Fascia Name Board",
                            "Octanorm Wall Panels",
                            "Daily Stall Cleaning",
                            "High-Speed Wi-Fi",
                          ];
                          const hasAmenity = currentInclusions.includes(amenity);
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => {
                                const next = hasAmenity
                                  ? currentInclusions.filter((a) => a !== amenity)
                                  : [...currentInclusions, amenity];
                                updateSelectedBatch({ inclusions: next });
                              }}
                              className={`px-2 py-1 rounded-md text-[10px] border transition-all ${
                                hasAmenity
                                  ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold"
                                  : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                              }`}
                            >
                              {hasAmenity ? `✓ ${amenity}` : `+ ${amenity}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Target / Recommended Industry */}
                    <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <label className="text-[10px] text-slate-600 dark:text-slate-400">Recommended Industry Focus</label>
                      <input
                        type="text"
                        value={primarySelected.suitableFor || "Hydro Turbines, Generators, Solar EPC, Green Hydrogen"}
                        onChange={(e) => updateSelectedBatch({ suitableFor: e.target.value })}
                        placeholder="e.g. Turbine Manufacturers, EPCs, Inverters"
                        className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Marketing Highlight / Description */}
                    <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <label className="text-[10px] text-slate-600 dark:text-slate-400">Marketing Highlights (Shown in Stall Popup)</label>
                      <textarea
                        rows={2}
                        value={primarySelected.description || ""}
                        onChange={(e) => updateSelectedBatch({ description: e.target.value })}
                        placeholder="e.g. Prime front-row stall directly facing the main plenary entrance with maximum dignitary footfall."
                        className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>

                    {/* Assigned Exhibitor (If Booked/Reserved) */}
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <label className="text-[10px] text-sky-600 dark:text-sky-400 flex items-center gap-1 font-bold">
                        <Building className="w-3 h-3" />
                        <span>Assigned Occupant / Exhibitor (If Booked)</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={primarySelected.bookedBy || ""}
                          onChange={(e) => updateSelectedBatch({ bookedBy: e.target.value })}
                          placeholder="Company Name (e.g. Voith Hydro)"
                          className="w-full p-1.5 rounded bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                        />
                        <input
                          type="text"
                          value={primarySelected.exhibitorCountry || ""}
                          onChange={(e) => updateSelectedBatch({ exhibitorCountry: e.target.value })}
                          placeholder="Country (e.g. Austria)"
                          className="w-full p-1.5 rounded bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                      <input
                        type="url"
                        value={primarySelected.exhibitorWebsite || ""}
                        onChange={(e) => updateSelectedBatch({ exhibitorWebsite: e.target.value })}
                        placeholder="Website (e.g. https://voith.com)"
                        className="w-full p-1.5 rounded bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-sky-600 dark:text-sky-400 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* 4. SEQUENTIAL RENUMBERING / STALL LABEL */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        <span>Stall Labeling</span>
                      </span>
                    </div>

                    {selectedElements.length === 1 ? (
                      <div>
                        <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Stall Number</label>
                        <input
                          type="text"
                          value={primarySelected.number}
                          onChange={(e) => updateSelectedBatch({ number: e.target.value })}
                          className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Prefix</label>
                            <input
                              type="text"
                              value={batchPrefix}
                              onChange={(e) => setBatchPrefix(e.target.value)}
                              className="w-full p-1.5 rounded bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-center text-xs focus:border-sky-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Start No.</label>
                            <input
                              type="number"
                              value={batchStartNum}
                              onChange={(e) => setBatchStartNum(Number(e.target.value))}
                              className="w-full p-1.5 rounded bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-center text-xs focus:border-sky-500 focus:outline-none"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleBatchRenumber}
                          className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 dark:bg-amber-600 dark:hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition-colors"
                        >
                          🔢 Renumber {selectedElements.length} Stalls ({batchPrefix}{batchStartNum}...)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 5. STATUS CONFIGURATION */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">Booking Status</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "Available", bg: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40" },
                        { id: "Reserved", bg: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40" },
                        { id: "Booked", bg: "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40" },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => updateSelectedBatch({ status: st.id as any })}
                          className={`py-1.5 rounded-lg border text-center text-[11px] font-bold transition-all ${
                            primarySelected.status === st.id ? st.bg : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {st.id}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 6. BATCH ROTATION */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                        <RotateCw className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                        <span>Rotation</span>
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{primarySelected.rotation || 0}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={primarySelected.rotation || 0}
                      onChange={(e) => updateSelectedBatch({ rotation: Number(e.target.value) })}
                      className="w-full accent-emerald-500 h-1 bg-slate-200 dark:bg-slate-800 rounded"
                    />
                    <div className="flex gap-1">
                      {[0, 45, 90, 180, -45, -90].map((deg) => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => updateSelectedBatch({ rotation: deg })}
                          className="flex-1 py-1 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-mono"
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 7. BATCH ALIGNMENT */}
                  {selectedElements.length >= 2 && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">Batch Alignment</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => alignSelected("left")}
                          className="py-1.5 px-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-medium"
                        >
                          Align Left
                        </button>
                        <button
                          onClick={() => alignSelected("top")}
                          className="py-1.5 px-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-medium"
                        >
                          Align Top
                        </button>
                        <button
                          onClick={() => alignSelected("distribute-h")}
                          className="py-1.5 px-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-medium"
                        >
                          Distribute
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 8. ACTIONS: DUPLICATE & DELETE */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <button
                      onClick={duplicateSelected}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center gap-2 border border-slate-200 dark:border-transparent transition-colors shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicate Selected ({selectedElements.length})</span>
                    </button>
                    <button
                      onClick={deleteSelected}
                      className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 border border-rose-500/30 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Selected ({selectedElements.length})</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <MousePointer className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600 animate-bounce" />
                  <p className="font-semibold text-xs text-slate-700 dark:text-slate-400">No Elements Selected</p>
                  <p className="text-[11px] max-w-[200px] mx-auto text-slate-500 dark:text-slate-400">
                    Click any stall or drag a selection box on the canvas to configure prices, sizes, and categories.
                  </p>
                  <button
                    onClick={selectAllStalls}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-transparent text-xs font-semibold mt-2 transition-colors"
                  >
                    Select All Stalls
                  </button>
                </div>
              )
            ) : (
              /* DRAWING TOOLS & PRESETS TAB */
              <div className="space-y-4">
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Drawing Properties
                </div>

                {/* Stroke Width */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                    <span>Stroke Width</span>
                    <span className="text-slate-900 dark:text-slate-200 font-mono font-semibold">{activeStrokeWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={activeStrokeWidth}
                    onChange={(e) => setActiveStrokeWidth(Number(e.target.value))}
                    className="w-full accent-sky-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Preset Categories */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Stall Presets
                  </div>
                  <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                    {PRESET_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory.name === cat.name;
                      return (
                        <button
                          key={cat.name}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setCounterPrefix(cat.prefix);
                            setActiveFillColor(cat.color === "transparent" ? "transparent" : cat.color);
                            setActiveStrokeColor(cat.border);
                          }}
                          className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                            isSelected
                              ? "bg-sky-50 dark:bg-slate-800 border-sky-300 dark:border-slate-600 text-sky-950 dark:text-white font-medium shadow-xs"
                              : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-transparent text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.border }} />
                            <span className="truncate text-[11px]">{cat.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono shrink-0">{cat.defaultDim}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Next Stall Number */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-300">Next Stall Label</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Prefix</label>
                      <input
                        type="text"
                        value={counterPrefix}
                        onChange={(e) => setCounterPrefix(e.target.value)}
                        className="w-full px-2 py-1 rounded bg-white dark:bg-[#090D14] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-center font-mono focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Number</label>
                      <input
                        type="number"
                        value={counterNum}
                        onChange={(e) => setCounterNum(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-white dark:bg-[#090D14] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-center font-mono focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER INTERACTIVE SVG CANVAS */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-200/70 dark:bg-[#05080E]">
          {/* Canvas Floating Top Toolbar */}
          <div className="absolute top-4 left-6 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 dark:bg-[#0C121C]/90 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl">
            {[
              { id: "select", icon: MousePointer, label: "Select / Marquee Box" },
              { id: "rectangle", icon: Square, label: "Draw Rectangle Stall" },
              { id: "line", icon: Minus, label: "Draw Straight Wall" },
              { id: "arc", icon: Spline, label: "Draw Curved Wall" },
              { id: "pencil", icon: Pencil, label: "Freehand Pencil" },
              { id: "text", icon: Type, label: "Text Label" },
              { id: "eraser", icon: Eraser, label: "Eraser Tool" },
            ].map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    setActiveTool(tool.id as any);
                    if (tool.id !== "select") {
                      setLeftSidebarTab("tools");
                    }
                  }}
                  className={`p-2.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all ${
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

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Snap to Grid Toggle */}
            <button
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                snapToGrid ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 font-bold" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Snap to 10px Grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>

          {/* Canvas Viewport */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-8">
            <div
              style={{
                width: canvasWidth * zoom,
                height: canvasHeight * zoom,
                backgroundColor: canvasBgMode === "clean-white" ? "#FFFFFF" : canvasBgMode === "cad-navy" ? "#0F172A" : "#0C121C",
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
                className="w-full h-full absolute inset-0 z-10"
                onMouseDown={onCanvasMouseDown}
                onMouseMove={onCanvasMouseMove}
                onMouseUp={onCanvasMouseUp}
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
                {elements.map((el) => {
                  const isSelected = selectedIds.includes(el.id);

                  // 1. Stall / Rectangle
                  if (el.type === "stall" || el.type === "zone") {
                    return (
                      <g
                        key={el.id}
                        transform={
                          el.rotation
                            ? `rotate(${el.rotation}, ${el.x + el.width / 2}, ${el.y + el.height / 2})`
                            : undefined
                        }
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (activeTool === "eraser") {
                            recordHistory(elements.filter((item) => item.id !== el.id));
                            notify(`Deleted ${el.number}`);
                            return;
                          }

                          // Multi-select toggle with Shift / Ctrl / Meta
                          if (e.shiftKey || e.metaKey || e.ctrlKey) {
                            if (isSelected) {
                              setSelectedIds((prev) => prev.filter((id) => id !== el.id));
                            } else {
                              setSelectedIds((prev) => [...prev, el.id]);
                            }
                            return;
                          }

                          // If not already selected in multi-selection, select only this element
                          if (!isSelected) {
                            setSelectedIds([el.id]);
                          }

                          // Setup multi-drag position map
                          const currentSelectedIds = isSelected ? selectedIds : [el.id];
                          const posMap: { [id: string]: { x: number; y: number } } = {};
                          elements.forEach((item) => {
                            if (currentSelectedIds.includes(item.id)) {
                              posMap[item.id] = { x: item.x, y: item.y };
                            }
                          });

                          setInitialMultiPosMap(posMap);
                          setIsDragging(true);
                          setInitialElementState(el);
                          setDragStartPos(getCoordinates(e));
                        }}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <rect
                          x={el.x}
                          y={el.y}
                          width={el.width}
                          height={el.height}
                          rx={el.borderRadius !== undefined ? el.borderRadius : 4}
                          ry={el.borderRadius !== undefined ? el.borderRadius : 4}
                          fill={el.color === "transparent" || el.color === "none" ? "none" : el.color}
                          fillOpacity={
                            el.color === "transparent" || el.color === "none"
                              ? 0
                              : el.fillOpacity !== undefined
                              ? el.fillOpacity
                              : isSelected
                              ? 0.95
                              : 0.85
                          }
                          stroke={isSelected ? "#38BDF8" : el.borderColor}
                          strokeWidth={isSelected ? Math.max(3, el.strokeWidth + 1.5) : el.strokeWidth || 2}
                        />

                        {/* Label */}
                        <text
                          x={el.x + el.width / 2}
                          y={el.y + el.height / 2 + 4}
                          fill={el.textColor || "#FFFFFF"}
                          fontWeight="700"
                          fontSize={el.width > 60 ? 11 : el.width > 30 ? 9 : 7.5}
                          fontFamily="sans-serif"
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {el.number}
                        </text>

                        {/* Interactive Resize & Rotation Handles (Active when single item selected) */}
                        {isSelected && selectedIds.length === 1 && (
                          <>
                            {/* 4 Corner Resize Handles */}
                            <circle
                              cx={el.x + el.width}
                              cy={el.y + el.height}
                              r="5.5"
                              fill="#38BDF8"
                              stroke="#0C121C"
                              strokeWidth="2"
                              className="cursor-se-resize"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing("se");
                                setInitialElementState(el);
                                setDragStartPos(getCoordinates(e));
                              }}
                            />
                            <circle
                              cx={el.x + el.width}
                              cy={el.y}
                              r="5.5"
                              fill="#38BDF8"
                              stroke="#0C121C"
                              strokeWidth="2"
                              className="cursor-ne-resize"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing("ne");
                                setInitialElementState(el);
                                setDragStartPos(getCoordinates(e));
                              }}
                            />
                            <circle
                              cx={el.x}
                              cy={el.y + el.height}
                              r="5.5"
                              fill="#38BDF8"
                              stroke="#0C121C"
                              strokeWidth="2"
                              className="cursor-sw-resize"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing("sw");
                                setInitialElementState(el);
                                setDragStartPos(getCoordinates(e));
                              }}
                            />
                            <circle
                              cx={el.x}
                              cy={el.y}
                              r="5.5"
                              fill="#38BDF8"
                              stroke="#0C121C"
                              strokeWidth="2"
                              className="cursor-nw-resize"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing("nw");
                                setInitialElementState(el);
                                setDragStartPos(getCoordinates(e));
                              }}
                            />

                            {/* Top Rotation Stem & Handle (Jump-Free 1° Precision) */}
                            <line
                              x1={el.x + el.width / 2}
                              y1={el.y}
                              x2={el.x + el.width / 2}
                              y2={el.y - 24}
                              stroke="#38BDF8"
                              strokeWidth="1.5"
                              strokeDasharray="2 2"
                              pointerEvents="none"
                            />
                            {el.rotation !== 0 && (
                              <text
                                x={el.x + el.width / 2}
                                y={el.y - 30}
                                fill="#38BDF8"
                                fontSize="10"
                                fontWeight="700"
                                fontFamily="sans-serif"
                                textAnchor="middle"
                                className="select-none pointer-events-none"
                              >
                                {el.rotation}°
                              </text>
                            )}
                            <circle
                              cx={el.x + el.width / 2}
                              cy={el.y - 24}
                              r="6"
                              fill="#10B981"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                              className="cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                if (!svgRef.current) return;
                                const rect = svgRef.current.getBoundingClientRect();
                                const scaleX = canvasWidth / rect.width;
                                const scaleY = canvasHeight / rect.height;
                                const rawMouseX = (e.clientX - rect.left) * scaleX;
                                const rawMouseY = (e.clientY - rect.top) * scaleY;

                                const centerX = el.x + el.width / 2;
                                const centerY = el.y + el.height / 2;
                                const initialMouseAngle = Math.atan2(rawMouseY - centerY, rawMouseX - centerX) * (180 / Math.PI);
                                setInitialAngleOffset(initialMouseAngle - (el.rotation || 0));
                                setIsRotating(true);
                                setInitialElementState(el);
                              }}
                            />
                          </>
                        )}
                      </g>
                    );
                  }

                  // 2. Freehand Pencil
                  if (el.type === "pencil" && el.points) {
                    return (
                      <path
                        key={el.id}
                        d={getPencilPathData(el.points)}
                        fill="none"
                        stroke={isSelected ? "#38BDF8" : el.borderColor}
                        strokeWidth={isSelected ? el.strokeWidth + 2 : el.strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (activeTool === "eraser") {
                            recordHistory(elements.filter((item) => item.id !== el.id));
                            notify("Deleted path");
                            return;
                          }
                          setSelectedIds([el.id]);
                          setIsDragging(true);
                          setInitialElementState(el);
                          setDragStartPos(getCoordinates(e));
                        }}
                        className="cursor-grab"
                      />
                    );
                  }

                  // 3. Line / Wall
                  if (el.type === "line" && el.points && el.points.length >= 2) {
                    return (
                      <line
                        key={el.id}
                        x1={el.points[0].x}
                        y1={el.points[0].y}
                        x2={el.points[1].x}
                        y2={el.points[1].y}
                        stroke={isSelected ? "#38BDF8" : el.borderColor}
                        strokeWidth={isSelected ? el.strokeWidth + 2 : el.strokeWidth}
                        strokeLinecap="round"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (activeTool === "eraser") {
                            recordHistory(elements.filter((item) => item.id !== el.id));
                            notify("Deleted line");
                            return;
                          }
                          setSelectedIds([el.id]);
                          setIsDragging(true);
                          setInitialElementState(el);
                          setDragStartPos(getCoordinates(e));
                        }}
                        className="cursor-grab"
                      />
                    );
                  }

                  // 4. Arc / Curve
                  if (el.type === "arc" && el.points && el.points.length >= 2 && el.arcControl) {
                    return (
                      <path
                        key={el.id}
                        d={`M ${el.points[0].x} ${el.points[0].y} Q ${el.arcControl.x} ${el.arcControl.y} ${el.points[1].x} ${el.points[1].y}`}
                        fill="none"
                        stroke={isSelected ? "#38BDF8" : el.borderColor}
                        strokeWidth={isSelected ? el.strokeWidth + 2 : el.strokeWidth}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (activeTool === "eraser") {
                            recordHistory(elements.filter((item) => item.id !== el.id));
                            notify("Deleted arc");
                            return;
                          }
                          setSelectedIds([el.id]);
                          setIsDragging(true);
                          setInitialElementState(el);
                          setDragStartPos(getCoordinates(e));
                        }}
                        className="cursor-grab"
                      />
                    );
                  }

                  // 5. Text Label
                  if (el.type === "text") {
                    return (
                      <g
                        key={el.id}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (activeTool === "eraser") {
                            recordHistory(elements.filter((item) => item.id !== el.id));
                            notify("Deleted text");
                            return;
                          }
                          setSelectedIds([el.id]);
                          setIsDragging(true);
                          setInitialElementState(el);
                          setDragStartPos(getCoordinates(e));
                        }}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <text
                          x={el.x}
                          y={el.y}
                          fill={el.textColor || "#FFFFFF"}
                          fontSize="13"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {el.number}
                        </text>
                        {isSelected && (
                          <rect
                            x={el.x - 4}
                            y={el.y - 14}
                            width={el.width || 100}
                            height={20}
                            fill="none"
                            stroke="#38BDF8"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                          />
                        )}
                      </g>
                    );
                  }

                  return null;
                })}

                {/* Drawing Rectangle Preview */}
                {drawingRect && (
                  <rect
                    x={drawingRect.x}
                    y={drawingRect.y}
                    width={drawingRect.width}
                    height={drawingRect.height}
                    fill={activeFillColor === "transparent" ? "none" : activeFillColor}
                    fillOpacity={0.6}
                    stroke={activeStrokeColor}
                    strokeWidth={activeStrokeWidth}
                    strokeDasharray="4 4"
                    rx={activeBorderRadius}
                  />
                )}

                {/* Marquee Box Selection Preview */}
                {selectionMarquee && (
                  <rect
                    x={Math.min(selectionMarquee.x1, selectionMarquee.x2)}
                    y={Math.min(selectionMarquee.y1, selectionMarquee.y2)}
                    width={Math.abs(selectionMarquee.x2 - selectionMarquee.x1)}
                    height={Math.abs(selectionMarquee.y2 - selectionMarquee.y1)}
                    fill="rgba(56, 189, 248, 0.15)"
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}
              </svg>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

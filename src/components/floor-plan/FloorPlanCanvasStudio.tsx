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
  ArrowUpToLine,
  ArrowDownToLine,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Pentagon,
  Hexagon,
  Shapes,
  Settings,
  FileUp,
  RefreshCw,
} from "lucide-react";

export interface CanvasElement {
  id: string;
  type: "stall" | "text" | "zone" | "pencil" | "arc" | "line" | "polygon";
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

  // Active Tool: select | rectangle | polygon | arc | line | pencil | text | eraser
  const [activeTool, setActiveTool] = useState<"select" | "rectangle" | "polygon" | "arc" | "line" | "pencil" | "text" | "eraser">("select");
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
  const [initialMultiPosMap, setInitialMultiPosMap] = useState<{ [id: string]: { x: number; y: number; points?: { x: number; y: number }[]; arcControl?: { x: number; y: number } } }>({});

  // Drawing & Marquee Selection States
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawingShapeRole, setDrawingShapeRole] = useState<"stall" | "zone" | "outline">("stall");
  const [zoneLabel, setZoneLabel] = useState<string>("VIP LOUNGE");
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPencilPoints, setCurrentPencilPoints] = useState<{ x: number; y: number }[]>([]);
  const [currentPolygonPoints, setCurrentPolygonPoints] = useState<{ x: number; y: number }[]>([]);
  const [polygonHoverPos, setPolygonHoverPos] = useState<{ x: number; y: number } | null>(null);
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

  // Canvas Custom Dimensions (Width & Height in Pixels)
  const [canvasWidth, setCanvasWidth] = useState<number>(1200);
  const [canvasHeight, setCanvasHeight] = useState<number>(850);
  const [showCanvasSettingsModal, setShowCanvasSettingsModal] = useState<boolean>(false);
  const bgFileInputRef = useRef<HTMLInputElement | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Smooth Arrow Keys Nudge Engine Refs
  const pressedArrowKeys = useRef<{ [key: string]: boolean }>({});
  const elementsRef = useRef<CanvasElement[]>(elements);
  elementsRef.current = elements;
  const selectedIdsRef = useRef<string[]>(selectedIds);
  selectedIdsRef.current = selectedIds;
  const isHoldingArrow = useRef<boolean>(false);
  const lastDuplicateDirection = useRef<"right" | "left" | "down" | "up">("right");

  // Toast
  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Background Image File Upload Handler
  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        notify("Image size too large (max 15MB)");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        if (dataUrl) {
          setBgImageSrc(dataUrl);
          setShowBgImage(true);
          notify("Custom blueprint background image loaded!");
        }
      };
      reader.readAsDataURL(file);
    }
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
          if (resData.data.canvasBgMode) setCanvasBgMode(resData.data.canvasBgMode);
          if (resData.data.showBgImage !== undefined) setShowBgImage(resData.data.showBgImage);
          if (resData.data.canvasWidth) setCanvasWidth(Number(resData.data.canvasWidth) || 1200);
          if (resData.data.canvasHeight) setCanvasHeight(Number(resData.data.canvasHeight) || 850);
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
        const localBg = localStorage.getItem("hhe_canvas_bg_mode");
        if (localBg) setCanvasBgMode(localBg as any);
        const localShowBg = localStorage.getItem("hhe_show_bg_image");
        if (localShowBg !== null) setShowBgImage(localShowBg === "true");
        const localW = localStorage.getItem("hhe_canvas_width");
        if (localW) setCanvasWidth(Number(localW) || 1200);
        const localH = localStorage.getItem("hhe_canvas_height");
        if (localH) setCanvasHeight(Number(localH) || 850);
        const localImg = localStorage.getItem("hhe_canvas_bg_image");
        if (localImg) setBgImageSrc(localImg);
        const localOp = localStorage.getItem("hhe_blueprint_opacity");
        if (localOp) setBlueprintOpacity(Number(localOp) || 0.65);
      } catch (e) { }
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

  // Get SVG mouse coordinates with native SVG Matrix precision & Snap
  const getCoordinates = useCallback(
    (e: MouseEvent | React.MouseEvent<any>) => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const svg = svgRef.current;

      let rawX: number | null = null;
      let rawY: number | null = null;

      // Method 1: Exact SVG Matrix transformation (accounts for scroll, zoom, aspect ratio & retina DPI)
      if (typeof svg.getScreenCTM === "function") {
        const ctm = svg.getScreenCTM();
        if (ctm) {
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const svgPt = pt.matrixTransform(ctm.inverse());
          rawX = svgPt.x;
          rawY = svgPt.y;
        }
      }

      // Method 2: Fallback to bounding client rect
      if (rawX === null || rawY === null) {
        const rect = svg.getBoundingClientRect();
        const scaleX = canvasWidth / (rect.width || 1);
        const scaleY = canvasHeight / (rect.height || 1);
        rawX = (e.clientX - rect.left) * scaleX;
        rawY = (e.clientY - rect.top) * scaleY;
      }

      const clampedX = Math.max(0, Math.min(canvasWidth, rawX));
      const clampedY = Math.max(0, Math.min(canvasHeight, rawY));

      return {
        x: activeTool === "pencil" ? Math.round(clampedX) : applySnap(clampedX),
        y: activeTool === "pencil" ? Math.round(clampedY) : applySnap(clampedY),
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
              const basePos = initialMultiPosMap[el.id];
              const newX = applySnap(basePos.x + dx);
              const newY = applySnap(basePos.y + dy);
              const shiftX = newX - basePos.x;
              const shiftY = newY - basePos.y;

              const updatedEl: CanvasElement = {
                ...el,
                x: newX,
                y: newY,
              };

              if (basePos.points) {
                updatedEl.points = basePos.points.map((pt) => ({
                  x: pt.x + shiftX,
                  y: pt.y + shiftY,
                }));
              }

              if (basePos.arcControl) {
                updatedEl.arcControl = {
                  x: basePos.arcControl.x + shiftX,
                  y: basePos.arcControl.y + shiftY,
                };
              }

              return updatedEl;
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

  // Helper to finalize and create a Polygon Element
  const finishPolygon = (pointsToFinish?: { x: number; y: number }[]) => {
    const pts = pointsToFinish || currentPolygonPoints;
    if (pts.length < 3) {
      notify("Polygon requires at least 3 points");
      return;
    }
    const minX = Math.min(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y));
    const maxX = Math.max(...pts.map((p) => p.x));
    const maxY = Math.max(...pts.map((p) => p.y));
    const width = Math.max(20, maxX - minX);
    const height = Math.max(20, maxY - minY);

    const isStall = drawingShapeRole === "stall";
    const isZone = drawingShapeRole === "zone";
    const isOutline = drawingShapeRole === "outline";

    const label = isStall
      ? `${counterPrefix}${counterNum}`
      : isZone
      ? (zoneLabel || "EXHIBIT ZONE")
      : "";

    const category = isStall
      ? selectedCategory.name
      : isZone
      ? "Zone / Functional Area"
      : "Hollow Wall / Boundary";

    const color = isOutline
      ? "transparent"
      : isZone
      ? (activeFillColor === "transparent" ? "#0284C7" : activeFillColor)
      : (activeFillColor === "transparent" ? "transparent" : (activeFillColor || selectedCategory.color));

    const fillOpacity = isOutline
      ? 0
      : isZone
      ? 0.45
      : (activeFillColor === "transparent" ? 0 : (selectedCategory.fillOpacity ?? 0.85));

    const newPolyEl: CanvasElement = {
      id: isZone ? `ZONE_${Date.now()}` : isOutline ? `OUTLINE_${Date.now()}` : `POLY_${Date.now()}`,
      type: "polygon",
      number: label,
      category,
      dimensions: isStall ? (selectedCategory.defaultDim || `${Math.round(width / 10)}m × ${Math.round(height / 10)}m`) : (isOutline ? "Wall" : ""),
      sizeSqM: isStall ? (selectedCategory.sqm || Math.round((width * height) / 100)) : 0,
      sizeSqFt: isStall ? Math.round((selectedCategory.sqm || (width * height) / 100) * 10.764) : 0,
      priceNPR: isStall ? selectedCategory.npr : 0,
      priceUSD: isStall ? selectedCategory.usd : 0,
      status: "Available",
      color,
      fillOpacity,
      borderColor: activeStrokeColor || (isOutline ? "#38BDF8" : selectedCategory.border),
      textColor: isOutline ? (activeStrokeColor || "#38BDF8") : "#FFFFFF",
      strokeWidth: activeStrokeWidth,
      borderRadius: activeBorderRadius,
      x: minX,
      y: minY,
      width,
      height,
      rotation: 0,
      points: pts,
    };

    recordHistory([...elements, newPolyEl]);
    setSelectedIds([newPolyEl.id]);
    if (isStall) setCounterNum((prev) => prev + 1);
    setCurrentPolygonPoints([]);
    setPolygonHoverPos(null);
    setIsDrawing(false);
    notify(isStall ? `Created Polygon Stall ${label}` : isZone ? `Created Zone: ${label}` : "Created Boundary Outline");
  };

  // Helper to stamp regular geometric polygons (Triangle, Pentagon, Hexagon, Octagon, L-Shape)
  const stampRegularPolygon = (sides: number, radius: number = 60, shapeName: string = "Polygon") => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const pts: { x: number; y: number }[] = [];
    const angleStep = (2 * Math.PI) / sides;
    const offsetAngle = -Math.PI / 2;

    for (let i = 0; i < sides; i++) {
      const angle = offsetAngle + i * angleStep;
      pts.push({
        x: applySnap(Math.round(centerX + radius * Math.cos(angle))),
        y: applySnap(Math.round(centerY + radius * Math.sin(angle))),
      });
    }

    const minX = Math.min(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y));
    const maxX = Math.max(...pts.map((p) => p.x));
    const maxY = Math.max(...pts.map((p) => p.y));
    const width = maxX - minX;
    const height = maxY - minY;

    const isStall = drawingShapeRole === "stall";
    const isZone = drawingShapeRole === "zone";
    const isOutline = drawingShapeRole === "outline";

    const label = isStall
      ? `${counterPrefix}${counterNum}`
      : isZone
      ? (zoneLabel || `${shapeName.toUpperCase()} ZONE`)
      : "";

    const category = isStall
      ? `${shapeName} Stall`
      : isZone
      ? "Zone / Functional Area"
      : "Hollow Wall / Boundary";

    const color = isOutline
      ? "transparent"
      : isZone
      ? (activeFillColor === "transparent" ? "#0284C7" : activeFillColor)
      : (activeFillColor === "transparent" ? "transparent" : (activeFillColor || selectedCategory.color));

    const fillOpacity = isOutline
      ? 0
      : isZone
      ? 0.45
      : (activeFillColor === "transparent" ? 0 : (selectedCategory.fillOpacity ?? 0.85));

    const newPoly: CanvasElement = {
      id: isZone ? `ZONE_${Date.now()}` : isOutline ? `OUTLINE_${Date.now()}` : `POLY_${Date.now()}`,
      type: "polygon",
      number: label,
      category,
      dimensions: isStall ? `${Math.round(width / 10)}m × ${Math.round(height / 10)}m` : (isOutline ? "Wall" : ""),
      sizeSqM: isStall ? (selectedCategory.sqm || Math.round((width * height) / 100)) : 0,
      sizeSqFt: isStall ? Math.round((selectedCategory.sqm || (width * height) / 100) * 10.764) : 0,
      priceNPR: isStall ? selectedCategory.npr : 0,
      priceUSD: isStall ? selectedCategory.usd : 0,
      status: "Available",
      color,
      fillOpacity,
      borderColor: activeStrokeColor || (isOutline ? "#38BDF8" : selectedCategory.border),
      textColor: isOutline ? (activeStrokeColor || "#38BDF8") : "#FFFFFF",
      strokeWidth: activeStrokeWidth,
      borderRadius: activeBorderRadius,
      x: minX,
      y: minY,
      width,
      height,
      rotation: 0,
      points: pts,
    };

    recordHistory([...elements, newPoly]);
    setSelectedIds([newPoly.id]);
    if (isStall) setCounterNum((prev) => prev + 1);
    notify(isStall ? `Stamped ${shapeName} (${sides}-sided) Stall ${label}` : isZone ? `Stamped ${shapeName} Zone` : `Stamped ${shapeName} Outline`);
  };

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
    } else if (activeTool === "polygon") {
      if (currentPolygonPoints.length === 0) {
        setIsDrawing(true);
        setCurrentPolygonPoints([coords]);
        setPolygonHoverPos(coords);
      } else {
        const firstPt = currentPolygonPoints[0];
        const distToStart = Math.hypot(coords.x - firstPt.x, coords.y - firstPt.y);
        // If clicking near first point and has 3+ points, close polygon
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
      };
      recordHistory([...elements, newText]);
      setSelectedIds([newText.id]);
      notify("Placed text label");
    }
  };

  // Canvas Mouse Move (during drawing / marquee selection)
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
          const isStall = drawingShapeRole === "stall";
          const isZone = drawingShapeRole === "zone";
          const isOutline = drawingShapeRole === "outline";

          const label = isStall
            ? `${counterPrefix}${counterNum}`
            : isZone
            ? (zoneLabel || "EXHIBIT ZONE")
            : "";

          const category = isStall
            ? selectedCategory.name
            : isZone
            ? "Zone / Functional Area"
            : "Hollow Wall / Boundary";

          const color = isOutline
            ? "transparent"
            : isZone
            ? (activeFillColor === "transparent" ? "#0284C7" : activeFillColor)
            : (activeFillColor === "transparent" ? "transparent" : (activeFillColor || selectedCategory.color));

          const fillOpacity = isOutline
            ? 0
            : isZone
            ? 0.45
            : (activeFillColor === "transparent" ? 0 : (selectedCategory.fillOpacity ?? 0.85));

          const newEl: CanvasElement = {
            id: isZone ? `ZONE_${Date.now()}` : isOutline ? `OUTLINE_${Date.now()}` : `STALL_${Date.now()}`,
            type: isZone ? "zone" : "stall",
            number: label,
            category,
            dimensions: isStall ? selectedCategory.defaultDim : (isOutline ? "Wall" : ""),
            sizeSqM: isStall ? selectedCategory.sqm : 0,
            sizeSqFt: isStall ? Math.round(selectedCategory.sqm * 10.764) : 0,
            priceNPR: isStall ? selectedCategory.npr : 0,
            priceUSD: isStall ? selectedCategory.usd : 0,
            status: "Available",
            color,
            fillOpacity,
            borderColor: activeStrokeColor || (isOutline ? "#38BDF8" : selectedCategory.border),
            textColor: isOutline ? (activeStrokeColor || "#38BDF8") : "#FFFFFF",
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
          if (isStall) setCounterNum((prev) => prev + 1);
          notify(isStall ? `Created Stall ${label}` : isZone ? `Created Zone: ${label}` : "Created Outline Box");
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

  // Helper to auto-increment stall numbers (e.g. C1 -> C2, A-101 -> A-102, Stall 5 -> Stall 6)
  const getNextStallNumber = (currentNumber: string, existingNumbers: Set<string>): string => {
    if (!currentNumber || currentNumber.trim() === "") return "";
    const match = currentNumber.match(/^(.*?)(\d+)$/);
    let prefix = "";
    let num = 1;
    let digits = 1;

    if (match) {
      prefix = match[1];
      num = parseInt(match[2], 10);
      digits = match[2].length;
    } else {
      prefix = currentNumber.trim() + " ";
      num = 1;
      digits = 1;
    }

    let nextNum = num + 1;
    while (true) {
      const formatted = `${prefix}${String(nextNum).padStart(digits, "0")}`;
      if (!existingNumbers.has(formatted)) {
        return formatted;
      }
      nextNum++;
    }
  };

  // Smart Flush & Angled Duplicate
  const duplicateSelected = (direction: "right" | "left" | "down" | "up" | "auto" = "auto") => {
    if (selectedIds.length === 0) return;

    const actualDirection = direction === "auto" ? lastDuplicateDirection.current : direction;
    lastDuplicateDirection.current = actualDirection;

    const currentSelected = elements.filter((el) => selectedIds.includes(el.id));
    if (currentSelected.length === 0) return;

    const primary = currentSelected[0];
    const angleDeg = primary.rotation || 0;
    const rad = (angleDeg * Math.PI) / 180;

    // Calculate displacement vector along the element's local axis
    let dx = 0;
    let dy = 0;

    // If a single element is selected
    if (currentSelected.length === 1) {
      let width = primary.width || 80;
      let height = primary.height || 60;
      if (primary.type === "polygon" && primary.points && primary.points.length > 0) {
        const xs = primary.points.map((p) => p.x);
        const ys = primary.points.map((p) => p.y);
        width = Math.max(...xs) - Math.min(...xs);
        height = Math.max(...ys) - Math.min(...ys);
      }

      if (actualDirection === "right") {
        dx = Math.round(width * Math.cos(rad));
        dy = Math.round(width * Math.sin(rad));
      } else if (actualDirection === "left") {
        dx = -Math.round(width * Math.cos(rad));
        dy = -Math.round(width * Math.sin(rad));
      } else if (actualDirection === "down") {
        dx = Math.round(-height * Math.sin(rad));
        dy = Math.round(height * Math.cos(rad));
      } else if (actualDirection === "up") {
        dx = Math.round(height * Math.sin(rad));
        dy = -Math.round(height * Math.cos(rad));
      }
    } else {
      // Multiple elements selected: compute rotated bounding span
      const cos = Math.cos(-rad);
      const sin = Math.sin(-rad);
      let minRotX = Infinity;
      let maxRotX = -Infinity;
      let minRotY = Infinity;
      let maxRotY = -Infinity;

      currentSelected.forEach((el) => {
        const w = el.width || 80;
        const h = el.height || 60;
        const corners = [
          { x: el.x, y: el.y },
          { x: el.x + w, y: el.y },
          { x: el.x, y: el.y + h },
          { x: el.x + w, y: el.y + h },
        ];
        corners.forEach((c) => {
          const rx = c.x * cos - c.y * sin;
          const ry = c.x * sin + c.y * cos;
          if (rx < minRotX) minRotX = rx;
          if (rx > maxRotX) maxRotX = rx;
          if (ry < minRotY) minRotY = ry;
          if (ry > maxRotY) maxRotY = ry;
        });
      });

      const spanX = Math.max(1, maxRotX - minRotX);
      const spanY = Math.max(1, maxRotY - minRotY);

      if (actualDirection === "right") {
        dx = Math.round(spanX * Math.cos(rad));
        dy = Math.round(spanX * Math.sin(rad));
      } else if (actualDirection === "left") {
        dx = -Math.round(spanX * Math.cos(rad));
        dy = -Math.round(spanX * Math.sin(rad));
      } else if (actualDirection === "down") {
        dx = Math.round(-spanY * Math.sin(rad));
        dy = Math.round(spanY * Math.cos(rad));
      } else if (actualDirection === "up") {
        dx = Math.round(spanY * Math.sin(rad));
        dy = -Math.round(spanY * Math.cos(rad));
      }
    }

    const existingNumbers = new Set(elements.map((e) => e.number).filter(Boolean));
    const newItems: CanvasElement[] = [];
    const newSelectedIds: string[] = [];

    currentSelected.forEach((el, idx) => {
      const nextNum = getNextStallNumber(el.number, existingNumbers);
      if (nextNum) existingNumbers.add(nextNum);

      const cloned: CanvasElement = {
        ...el,
        id: `STALL_${Date.now()}_${idx}`,
        number: nextNum || `${el.number}_copy`,
        x: Math.round(el.x + dx),
        y: Math.round(el.y + dy),
        ...(el.points
          ? {
              points: el.points.map((p) => ({
                x: Math.round(p.x + dx),
                y: Math.round(p.y + dy),
              })),
            }
          : {}),
      };
      newItems.push(cloned);
      newSelectedIds.push(cloned.id);
    });

    recordHistory([...elements, ...newItems]);
    setSelectedIds(newSelectedIds);
    notify(`Duplicated ${newItems.length} element(s) (${actualDirection.toUpperCase()})`);
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
    const ids = elements.filter((e) => e.type === "stall" || e.type === "zone" || (e.type === "polygon" && e.category !== "Hollow Wall / Boundary")).map((e) => e.id);
    setSelectedIds(ids);
    notify(`Selected all ${ids.length} stalls`);
  };

  // Z-Index Layering Operations
  const bringToFront = () => {
    if (selectedIds.length === 0) return;
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const unselected = elements.filter((el) => !selectedIds.includes(el.id));
    const newElements = [...unselected, ...selected];
    recordHistory(newElements);
    notify("Brought to Front (Top Layer)");
  };

  const sendToBack = () => {
    if (selectedIds.length === 0) return;
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const unselected = elements.filter((el) => !selectedIds.includes(el.id));
    const newElements = [...selected, ...unselected];
    recordHistory(newElements);
    notify("Sent to Back (Bottom Layer)");
  };

  const bringForward = () => {
    if (selectedIds.length === 0) return;
    const newElements = [...elements];
    for (let i = newElements.length - 2; i >= 0; i--) {
      if (selectedIds.includes(newElements[i].id) && !selectedIds.includes(newElements[i + 1].id)) {
        const temp = newElements[i];
        newElements[i] = newElements[i + 1];
        newElements[i + 1] = temp;
      }
    }
    recordHistory(newElements);
    notify("Brought Forward 1 Level");
  };

  const sendBackward = () => {
    if (selectedIds.length === 0) return;
    const newElements = [...elements];
    for (let i = 1; i < newElements.length; i++) {
      if (selectedIds.includes(newElements[i].id) && !selectedIds.includes(newElements[i - 1].id)) {
        const temp = newElements[i];
        newElements[i] = newElements[i - 1];
        newElements[i - 1] = temp;
      }
    }
    recordHistory(newElements);
    notify("Sent Backward 1 Level");
  };

  // Continuous Arrow Keys Nudge Engine
  const moveSelectedBy = useCallback(
    (dx: number, dy: number) => {
      if (selectedIdsRef.current.length === 0 || (dx === 0 && dy === 0)) return;
      const ids = selectedIdsRef.current;
      setElements((prev) =>
        prev.map((el) => {
          if (ids.includes(el.id)) {
            const updatedEl: CanvasElement = {
              ...el,
              x: Math.round(el.x + dx),
              y: Math.round(el.y + dy),
            };
            if (el.points && el.points.length > 0) {
              updatedEl.points = el.points.map((pt) => ({
                x: Math.round(pt.x + dx),
                y: Math.round(pt.y + dy),
              }));
            }
            if (el.arcControl) {
              updatedEl.arcControl = {
                x: Math.round(el.arcControl.x + dx),
                y: Math.round(el.arcControl.y + dy),
              };
            }
            return updatedEl;
          }
          return el;
        })
      );
    },
    []
  );

  // --------------------------------------------------------------------------
  // GLOBAL KEYBOARD SHORTCUTS (Ctrl+Z, Ctrl+Y, Delete, Ctrl+A, Escape, Continuous Arrow Keys)
  // --------------------------------------------------------------------------
  useEffect(() => {
    let animationFrameId: number | null = null;

    const tick = () => {
      const keys = pressedArrowKeys.current;
      let dx = 0;
      let dy = 0;

      const isShift = keys["Shift"];
      const speed = isShift ? 6 : 1; // 1px/frame pixel-wise (or 6px/frame with Shift)

      if (keys["ArrowUp"]) dy -= speed;
      if (keys["ArrowDown"]) dy += speed;
      if (keys["ArrowLeft"]) dx -= speed;
      if (keys["ArrowRight"]) dx += speed;

      if (dx !== 0 || dy !== 0) {
        moveSelectedBy(dx, dy);
        isHoldingArrow.current = true;
      }

      const hasActiveArrow =
        keys["ArrowUp"] || keys["ArrowDown"] || keys["ArrowLeft"] || keys["ArrowRight"];

      if (hasActiveArrow) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        animationFrameId = null;
      }
    };

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

      // 0. ACTIVE POLYGON DRAWING SHORTCUTS
      if (currentPolygonPoints.length > 0) {
        if (e.key === "Enter") {
          e.preventDefault();
          if (currentPolygonPoints.length >= 3) {
            finishPolygon();
          } else {
            notify("Need at least 3 vertices to finish polygon");
          }
          return;
        } else if (e.key === "Escape") {
          e.preventDefault();
          setCurrentPolygonPoints([]);
          setPolygonHoverPos(null);
          notify("Cancelled polygon drawing");
          return;
        } else if (e.key === "Backspace" || e.key === "Delete") {
          e.preventDefault();
          setCurrentPolygonPoints((prev) => prev.slice(0, -1));
          return;
        }
      }

      // 1. DELETE / BACKSPACE
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIdsRef.current.length > 0) {
          e.preventDefault();
          deleteSelected();
        }
      }

      // 1.5. SMART DUPLICATE (Ctrl+D / Cmd+D)
      else if (isCmdOrCtrl && e.key.toLowerCase() === "d") {
        if (selectedIdsRef.current.length > 0) {
          e.preventDefault();
          duplicateSelected("auto");
        }
      }

      // 1.8. SAVE (Ctrl+S / Cmd+S)
      else if (isCmdOrCtrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveToStorage();
      }

      // 2. SELECT ALL (Ctrl+A / Cmd+A)
      else if (isCmdOrCtrl && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelectedIds(elementsRef.current.map((e) => e.id));
        notify(`Selected all ${elementsRef.current.length} elements`);
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

      // 6. Z-INDEX LAYERING ( ] / [ / Shift+] / Shift+[ / Ctrl+] / Ctrl+[ )
      else if (e.key === "]" || e.key === "}") {
        if (selectedIdsRef.current.length > 0) {
          e.preventDefault();
          if (e.shiftKey || isCmdOrCtrl) {
            bringToFront();
          } else {
            bringForward();
          }
        }
      } else if (e.key === "[" || e.key === "{") {
        if (selectedIdsRef.current.length > 0) {
          e.preventDefault();
          if (e.shiftKey || isCmdOrCtrl) {
            sendToBack();
          } else {
            sendBackward();
          }
        }
      }

      // 6.5. DIRECTIONAL FLUSH DUPLICATE (Alt + Arrow Keys)
      else if (
        e.altKey &&
        (e.key === "ArrowUp" ||
          e.key === "ArrowDown" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight")
      ) {
        if (selectedIdsRef.current.length > 0) {
          e.preventDefault();
          if (e.key === "ArrowRight") duplicateSelected("right");
          else if (e.key === "ArrowLeft") duplicateSelected("left");
          else if (e.key === "ArrowDown") duplicateSelected("down");
          else if (e.key === "ArrowUp") duplicateSelected("up");
        }
      }

      // 7. ARROW KEYS MOVEMENT (Pixel-by-pixel precision + Fluid continuous holding)
      else if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        if (selectedIdsRef.current.length > 0) {
          e.preventDefault();
          if (e.shiftKey) pressedArrowKeys.current["Shift"] = true;

          // Initial immediate single pixel step
          if (!pressedArrowKeys.current[e.key]) {
            pressedArrowKeys.current[e.key] = true;
            const singleStep = e.shiftKey ? 10 : 1;
            let initialDx = 0;
            let initialDy = 0;
            if (e.key === "ArrowUp") initialDy = -singleStep;
            if (e.key === "ArrowDown") initialDy = singleStep;
            if (e.key === "ArrowLeft") initialDx = -singleStep;
            if (e.key === "ArrowRight") initialDx = singleStep;
            moveSelectedBy(initialDx, initialDy);
          }

          // Start continuous 60fps frame loop
          if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(tick);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Shift"
      ) {
        delete pressedArrowKeys.current[e.key];
        const remaining =
          pressedArrowKeys.current["ArrowUp"] ||
          pressedArrowKeys.current["ArrowDown"] ||
          pressedArrowKeys.current["ArrowLeft"] ||
          pressedArrowKeys.current["ArrowRight"];

        if (!remaining) {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
          if (isHoldingArrow.current) {
            isHoldingArrow.current = false;
            recordHistory(elementsRef.current);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [moveSelectedBy, currentPolygonPoints, deleteSelected, finishPolygon, handleRedo, handleUndo]);

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
      localStorage.setItem("hhe_canvas_bg_mode", canvasBgMode);
      localStorage.setItem("hhe_show_bg_image", String(showBgImage));
      localStorage.setItem("hhe_canvas_width", String(canvasWidth));
      localStorage.setItem("hhe_canvas_height", String(canvasHeight));
      localStorage.setItem("hhe_canvas_bg_image", bgImageSrc);
      localStorage.setItem("hhe_blueprint_opacity", String(blueprintOpacity));

      const response = await fetch("/api/floor-plan/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elements,
          bgImageSrc,
          blueprintOpacity,
          canvasBgMode,
          showBgImage,
          canvasWidth,
          canvasHeight,
        }),
      });

      const resJson = await response.json();
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

      if (resJson.success) {
        notify("Floor plan & background settings saved to server database!");
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
            type="button"
            onClick={saveToStorage}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white !text-white text-xs font-bold shadow-md transition-all"
          >
            <Save
              className={`w-4 h-4 text-black ${isSaving ? "animate-spin" : ""
                }`}
            />
            <span className="!text-black !opacity-100">
              {isSaving ? "Saving..." : "Save Canvas"}
            </span>
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
              className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${leftSidebarTab === "tools"
                ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs border border-slate-200/80 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
            >
              <MousePointer className={`w-3.5 h-3.5 ${leftSidebarTab === "tools" ? "text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-400"}`} />
              <span>Drawing Tools</span>
            </button>
            <button
              onClick={() => setLeftSidebarTab("inspector")}
              className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${leftSidebarTab === "inspector"
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
                          ? `${primarySelected.number || "UNNAMED"} · ${primarySelected.category || "Shape"}`
                          : `${selectedElements.length} Elements Selected`}
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

                  {/* 0. SHAPE ROLE / PURPOSE SWITCHER (STALL vs ZONE vs OUTLINE) */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                        <span>Shape Purpose / Role</span>
                      </span>
                      <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono font-bold">
                        {primarySelected.color === "transparent" || primarySelected.fillOpacity === 0 || primarySelected.category === "Hollow Wall / Boundary"
                          ? "🔲 Boundary Outline"
                          : primarySelected.category === "Zone / Functional Area" || primarySelected.type === "zone"
                          ? "🏷️ Functional Zone"
                          : "🏢 Bookable Stall"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {/* 1. Bookable Stall */}
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedBatch({
                            type: primarySelected.type === "polygon" ? "polygon" : "stall",
                            category:
                              primarySelected.category === "Hollow Wall / Boundary" ||
                              primarySelected.category === "Zone / Functional Area"
                                ? selectedCategory.name
                                : primarySelected.category,
                            fillOpacity: 0.85,
                            color:
                              primarySelected.color === "transparent" || primarySelected.color === "none"
                                ? selectedCategory.color
                                : primarySelected.color,
                            priceNPR: primarySelected.priceNPR || selectedCategory.npr,
                            priceUSD: primarySelected.priceUSD || selectedCategory.usd,
                          })
                        }
                        className={`py-2 px-1 rounded-lg text-center text-[10px] font-bold border transition-all cursor-pointer ${
                          primarySelected.color !== "transparent" &&
                          primarySelected.fillOpacity !== 0 &&
                          primarySelected.category !== "Zone / Functional Area" &&
                          primarySelected.category !== "Hollow Wall / Boundary"
                            ? "bg-sky-600 text-white border-sky-500 shadow-sm"
                            : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                        }`}
                      >
                        🏢 Stall (Booth)
                      </button>

                      {/* 2. Functional Zone */}
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedBatch({
                            type: primarySelected.type === "polygon" ? "polygon" : "zone",
                            category: "Zone / Functional Area",
                            fillOpacity: 0.45,
                            color:
                              primarySelected.color === "transparent" || primarySelected.color === "none"
                                ? "#0284C7"
                                : primarySelected.color,
                            priceNPR: 0,
                            priceUSD: 0,
                          })
                        }
                        className={`py-2 px-1 rounded-lg text-center text-[10px] font-bold border transition-all cursor-pointer ${
                          primarySelected.category === "Zone / Functional Area" || primarySelected.type === "zone"
                            ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                            : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                        }`}
                      >
                        🏷️ Zone / Area
                      </button>

                      {/* 3. Architectural Outline */}
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedBatch({
                            category: "Hollow Wall / Boundary",
                            color: "transparent",
                            fillOpacity: 0,
                            textColor: primarySelected.borderColor || "#38BDF8",
                            priceNPR: 0,
                            priceUSD: 0,
                          })
                        }
                        className={`py-2 px-1 rounded-lg text-center text-[10px] font-bold border transition-all cursor-pointer ${
                          primarySelected.color === "transparent" ||
                          primarySelected.fillOpacity === 0 ||
                          primarySelected.category === "Hollow Wall / Boundary"
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                            : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                        }`}
                      >
                        🔲 Outline / Wall
                      </button>
                    </div>
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
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${primarySelected.color === "transparent" || primarySelected.color === "none"
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
                            className={`w-5 h-5 rounded-md border border-slate-700 hover:scale-110 transition-transform ${primarySelected.color === sw.hex ? "ring-2 ring-white scale-110" : ""
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
                            className={`w-5 h-5 rounded-full border border-slate-700 hover:scale-110 transition-transform ${primarySelected.borderColor === c ? "ring-2 ring-white scale-110" : ""
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
                            className={`w-5 h-5 rounded-full border border-slate-700 hover:scale-110 transition-transform ${primarySelected.textColor === c ? "ring-2 ring-white scale-110" : ""
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
                            className={`p-1.5 rounded-lg border text-left text-[10px] font-medium transition-all ${primarySelected.orientation === ori
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
                              className={`px-2 py-1 rounded-md text-[10px] border transition-all ${hasAmenity
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
                          className={`py-1.5 rounded-lg border text-center text-[11px] font-bold transition-all ${primarySelected.status === st.id ? st.bg : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
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

                  {/* 8. LAYER ORDERING (Z-INDEX) */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-sky-500" />
                        <span>Layer Order (Z-Index)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">[ / ]</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={bringToFront}
                        className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        title="Bring to Very Top (Shift + ])"
                      >
                        <ArrowUpToLine className="w-3 h-3 text-sky-500" />
                        <span>To Front</span>
                      </button>
                      <button
                        type="button"
                        onClick={sendToBack}
                        className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        title="Send to Very Bottom (Shift + [)"
                      >
                        <ArrowDownToLine className="w-3 h-3 text-amber-500" />
                        <span>To Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={bringForward}
                        className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Bring Forward 1 Level (])"
                      >
                        <ChevronUp className="w-3 h-3 text-sky-400" />
                        <span>Forward</span>
                      </button>
                      <button
                        type="button"
                        onClick={sendBackward}
                        className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Send Backward 1 Level ([)"
                      >
                        <ChevronDown className="w-3 h-3 text-amber-400" />
                        <span>Backward</span>
                      </button>
                    </div>
                  </div>

                  {/* 9. SMART FLUSH DUPLICATE & DELETE */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>Smart Flush Duplicate</span>
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono font-semibold">
                          Ctrl+D
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        Duplicates beside the stall along the exact angle line with auto-incremented numbering (e.g. C1 ➔ C2).
                      </p>

                      <button
                        type="button"
                        onClick={() => duplicateSelected("auto")}
                        className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Smart Duplicate ({selectedElements.length})</span>
                      </button>

                      {/* Directional Pad */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => duplicateSelected("right")}
                          className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-semibold flex items-center justify-between cursor-pointer"
                          title="Duplicate Flush Right along element angle (Alt+Right)"
                        >
                          <span className="flex items-center gap-1">
                            <ArrowRight className="w-3 h-3 text-emerald-500" />
                            <span>Right</span>
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">Alt+→</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateSelected("down")}
                          className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-semibold flex items-center justify-between cursor-pointer"
                          title="Duplicate Flush Down along element angle (Alt+Down)"
                        >
                          <span className="flex items-center gap-1">
                            <ArrowDown className="w-3 h-3 text-sky-500" />
                            <span>Down</span>
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">Alt+↓</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateSelected("left")}
                          className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-semibold flex items-center justify-between cursor-pointer"
                          title="Duplicate Flush Left along element angle (Alt+Left)"
                        >
                          <span className="flex items-center gap-1">
                            <ArrowLeft className="w-3 h-3 text-amber-500" />
                            <span>Left</span>
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">Alt+←</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateSelected("up")}
                          className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-semibold flex items-center justify-between cursor-pointer"
                          title="Duplicate Flush Up along element angle (Alt+Up)"
                        >
                          <span className="flex items-center gap-1">
                            <ArrowUp className="w-3 h-3 text-violet-500" />
                            <span>Up</span>
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">Alt+↑</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={deleteSelected}
                      className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 border border-rose-500/30 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
                {/* 0. SHAPE CREATION PURPOSE SELECTOR */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                      <span>Shape Creation Mode</span>
                    </span>
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono font-bold">
                      {drawingShapeRole === "stall" ? "🏢 Stall" : drawingShapeRole === "zone" ? "🏷️ Zone" : "🔲 Outline"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDrawingShapeRole("stall");
                        setActiveFillColor(selectedCategory.color === "transparent" ? "#0284C7" : selectedCategory.color);
                        notify("Drawing Mode: Bookable Stall");
                      }}
                      className={`py-2 px-1 rounded-lg text-center text-[10px] font-bold border transition-all cursor-pointer ${
                        drawingShapeRole === "stall"
                          ? "bg-sky-600 text-white border-sky-500 shadow-sm"
                          : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      🏢 Stall (Booth)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDrawingShapeRole("zone");
                        setActiveFillColor("#0284C7");
                        notify("Drawing Mode: Functional Zone / Area");
                      }}
                      className={`py-2 px-1 rounded-lg text-center text-[10px] font-bold border transition-all cursor-pointer ${
                        drawingShapeRole === "zone"
                          ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                          : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      🏷️ Zone / Area
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDrawingShapeRole("outline");
                        setActiveFillColor("transparent");
                        notify("Drawing Mode: Architectural Boundary Outline");
                      }}
                      className={`py-2 px-1 rounded-lg text-center text-[10px] font-bold border transition-all cursor-pointer ${
                        drawingShapeRole === "outline"
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                          : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      🔲 Outline / Wall
                    </button>
                  </div>
                </div>

                {/* Stroke Width */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                    <span>Border / Stroke Width</span>
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

                {/* Contextual Settings for Stall vs Zone vs Outline */}
                {drawingShapeRole === "zone" ? (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-300">Zone Name / Title</span>
                    <input
                      type="text"
                      value={zoneLabel}
                      onChange={(e) => setZoneLabel(e.target.value)}
                      placeholder="e.g. VIP LOUNGE, MAIN STAGE, FOOD COURT"
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-[#090D14] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs focus:border-amber-500 focus:outline-none uppercase font-mono"
                    />
                  </div>
                ) : drawingShapeRole === "stall" ? (
                  <>
                    {/* Preset Categories */}
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Stall Presets
                      </div>
                      <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
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
                  </>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Boundary Outline Mode</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Shapes drawn will have hollow transparent fill with clean perimeter stroke lines for walls and halls.
                    </p>
                  </div>
                )}

                {/* Polygon Tools & Quick Shape Presets */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Shapes className="w-3.5 h-3.5 text-sky-500" />
                      <span>Polygon Presets</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTool("polygon");
                        notify("Polygon tool active: Click canvas to add vertices, double-click or click start point to finish.");
                      }}
                      className="text-[10px] text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                    >
                      + Draw Custom
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => stampRegularPolygon(3, 50, "Triangle")}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 hover:border-sky-400 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Stamp 3-Sided Triangle Stall"
                    >
                      <span className="text-xs">▲</span>
                      <span>Triangle (3)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => stampRegularPolygon(5, 55, "Pentagon")}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 hover:border-sky-400 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Stamp 5-Sided Pentagon Stall"
                    >
                      <Pentagon className="w-3 h-3 text-sky-500" />
                      <span>Pentagon (5)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => stampRegularPolygon(6, 60, "Hexagon")}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 hover:border-sky-400 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Stamp 6-Sided Hexagon Stall"
                    >
                      <Hexagon className="w-3 h-3 text-amber-500" />
                      <span>Hexagon (6)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => stampRegularPolygon(8, 65, "Octagon")}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 hover:border-sky-400 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Stamp 8-Sided Octagon Stall"
                    >
                      <span className="text-xs font-bold">⯃</span>
                      <span>Octagon (8)</span>
                    </button>
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
              { id: "select", icon: MousePointer, label: "Select / Marquee Box (V)" },
              { id: "rectangle", icon: Square, label: "Draw Rectangle Stall (R)" },
              { id: "polygon", icon: Pentagon, label: "Draw Polygon / Multi-Point (P)" },
              { id: "line", icon: Minus, label: "Draw Straight Wall (L)" },
              { id: "arc", icon: Spline, label: "Draw Curved Wall (A)" },
              { id: "pencil", icon: Pencil, label: "Freehand Pencil (B)" },
              { id: "text", icon: Type, label: "Text Label (T)" },
              { id: "eraser", icon: Eraser, label: "Eraser Tool (E)" },
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
                  className={`p-2.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all ${isActive
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
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${snapToGrid ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 font-bold" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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

            {/* Background Mode Selector: Blueprint Image / Solid Black / Clean White / CAD Navy */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 px-1.5">
                BG:
              </span>

              {/* 1. Blueprint Image BG */}
              <button
                onClick={() => {
                  setShowBgImage(true);
                  notify("Canvas: Blueprint Image Background");
                }}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${showBgImage
                  ? "bg-sky-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                title="Show Blueprint / Custom Background Image"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Image</span>
              </button>

              {/* Upload Custom BG image button */}
              <button
                onClick={() => bgFileInputRef.current?.click()}
                className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Upload Custom Blueprint / Floor Plan Image from computer"
              >
                <FileUp className="w-3.5 h-3.5" />
              </button>

              {/* 2. Solid CAD Black BG */}
              <button
                onClick={() => {
                  setShowBgImage(false);
                  setCanvasBgMode("cad-dark");
                  notify("Canvas: Solid CAD Black Background");
                }}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${!showBgImage && canvasBgMode === "cad-dark"
                  ? "bg-slate-900 text-white border border-slate-600 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                title="Solid CAD Dark / Black Background"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-500 shrink-0" />
                <span>Black</span>
              </button>

              {/* 3. Clean White BG */}
              <button
                onClick={() => {
                  setShowBgImage(false);
                  setCanvasBgMode("clean-white");
                  notify("Canvas: Clean White Background");
                }}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${!showBgImage && canvasBgMode === "clean-white"
                  ? "bg-white text-slate-900 border border-slate-300 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                title="Clean White Canvas Background"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400 shrink-0" />
                <span>White</span>
              </button>

              {/* 4. CAD Navy BG */}
              <button
                onClick={() => {
                  setShowBgImage(false);
                  setCanvasBgMode("cad-navy");
                  notify("Canvas: CAD Navy Blueprint Background");
                }}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${!showBgImage && canvasBgMode === "cad-navy"
                  ? "bg-sky-950 text-sky-200 border border-sky-700 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                title="CAD Navy Blueprint Background"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-sky-900 border border-sky-500 shrink-0" />
                <span>Navy</span>
              </button>
            </div>

            {/* Blueprint Opacity Toggle when in Image mode */}
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
                {elements.map((el) => {
                  const isSelected = selectedIds.includes(el.id);
                  const isSelectOrEraser = activeTool === "select" || activeTool === "eraser";

                  // 1. Stall / Rectangle
                  if (el.type === "stall" || el.type === "zone") {
                    const isOutline =
                      el.color === "transparent" ||
                      el.color === "none" ||
                      el.fillOpacity === 0 ||
                      el.category === "Hollow Wall / Boundary";

                    return (
                      <g
                        key={el.id}
                        transform={
                          el.rotation
                            ? `rotate(${el.rotation}, ${el.x + el.width / 2}, ${el.y + el.height / 2})`
                            : undefined
                        }
                        onMouseDown={(e) => {
                          if (!isSelectOrEraser) return;
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
                        className={isSelectOrEraser ? "cursor-grab active:cursor-grabbing pointer-events-auto" : "pointer-events-none"}
                      >
                        <rect
                          x={el.x}
                          y={el.y}
                          width={el.width}
                          height={el.height}
                          rx={el.borderRadius !== undefined ? el.borderRadius : 4}
                          ry={el.borderRadius !== undefined ? el.borderRadius : 4}
                          fill={isOutline ? "none" : el.color === "transparent" || el.color === "none" ? "none" : el.color}
                          fillOpacity={
                            isOutline || el.color === "transparent" || el.color === "none"
                              ? 0
                              : el.fillOpacity !== undefined
                                ? el.fillOpacity
                                : isSelected
                                  ? 0.95
                                  : 0.85
                          }
                          stroke={isSelected ? "#38BDF8" : el.borderColor}
                          strokeWidth={isSelected ? Math.max(3, el.strokeWidth + 1.5) : el.strokeWidth || 2}
                          pointerEvents={isOutline ? "stroke" : undefined}
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
                              className="cursor-se-resize pointer-events-auto"
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
                              className="cursor-ne-resize pointer-events-auto"
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
                              className="cursor-sw-resize pointer-events-auto"
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
                              className="cursor-nw-resize pointer-events-auto"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing("nw");
                                setInitialElementState(el);
                                setDragStartPos(getCoordinates(e));
                              }}
                            />

                            {/* Top Rotation Stem & Handle */}
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
                              className="cursor-grab active:cursor-grabbing hover:scale-125 transition-transform pointer-events-auto"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                if (!svgRef.current) return;
                                const rect = svgRef.current.getBoundingClientRect();
                                const scaleX = canvasWidth / (rect.width || 1);
                                const scaleY = canvasHeight / (rect.height || 1);
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
                          if (!isSelectOrEraser) return;
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
                        className={isSelectOrEraser ? "cursor-grab pointer-events-auto" : "pointer-events-none"}
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
                          if (!isSelectOrEraser) return;
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
                        className={isSelectOrEraser ? "cursor-grab pointer-events-auto" : "pointer-events-none"}
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
                          if (!isSelectOrEraser) return;
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
                        className={isSelectOrEraser ? "cursor-grab pointer-events-auto" : "pointer-events-none"}
                      />
                    );
                  }

                  // 5. Text Label
                  if (el.type === "text") {
                    const textW = el.width || 120;
                    const textH = el.height || 24;
                    const centerX = el.x + textW / 2;
                    const centerY = el.y - 14 + textH / 2;

                    return (
                      <g
                        key={el.id}
                        transform={
                          el.rotation
                            ? `rotate(${el.rotation}, ${centerX}, ${centerY})`
                            : undefined
                        }
                        onMouseDown={(e) => {
                          if (!isSelectOrEraser) return;
                          e.stopPropagation();
                          if (activeTool === "eraser") {
                            recordHistory(elements.filter((item) => item.id !== el.id));
                            notify("Deleted text");
                            return;
                          }
                          setSelectedIds([el.id]);
                          setIsDragging(true);
                          setInitialElementState({
                            ...el,
                            width: textW,
                            height: textH,
                            x: el.x,
                            y: el.y - 14,
                          });
                          setDragStartPos(getCoordinates(e));
                        }}
                        className={isSelectOrEraser ? "cursor-grab active:cursor-grabbing pointer-events-auto" : "pointer-events-none"}
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
                          <>
                            <rect
                              x={el.x - 4}
                              y={el.y - 14}
                              width={textW}
                              height={textH}
                              fill="none"
                              stroke="#38BDF8"
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                            />
                            {/* Top Rotation Stem & Handle for Text */}
                            {selectedIds.length === 1 && (
                              <>
                                <line
                                  x1={centerX}
                                  y1={el.y - 14}
                                  x2={centerX}
                                  y2={el.y - 34}
                                  stroke="#38BDF8"
                                  strokeWidth="1.5"
                                  strokeDasharray="2 2"
                                  pointerEvents="none"
                                />
                                {el.rotation !== 0 && (
                                  <text
                                    x={centerX}
                                    y={el.y - 40}
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
                                  cx={centerX}
                                  cy={el.y - 34}
                                  r="6"
                                  fill="#10B981"
                                  stroke="#FFFFFF"
                                  strokeWidth="2"
                                  className="cursor-grab active:cursor-grabbing hover:scale-125 transition-transform pointer-events-auto"
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    if (!svgRef.current) return;
                                    const rect = svgRef.current.getBoundingClientRect();
                                    const scaleX = canvasWidth / (rect.width || 1);
                                    const scaleY = canvasHeight / (rect.height || 1);
                                    const rawMouseX = (e.clientX - rect.left) * scaleX;
                                    const rawMouseY = (e.clientY - rect.top) * scaleY;

                                    const initialMouseAngle = Math.atan2(rawMouseY - centerY, rawMouseX - centerX) * (180 / Math.PI);
                                    setInitialAngleOffset(initialMouseAngle - (el.rotation || 0));
                                    setIsRotating(true);
                                    setInitialElementState({
                                      ...el,
                                      width: textW,
                                      height: textH,
                                      x: el.x,
                                      y: el.y - 14,
                                    });
                                  }}
                                />
                              </>
                            )}
                          </>
                        )}
                      </g>
                    );
                  }

                  // 6. Polygon / Multi-Point Shape Stall
                  if (el.type === "polygon" && el.points && el.points.length >= 3) {
                    const pointsString = el.points.map((p) => `${p.x},${p.y}`).join(" ");
                    const centerX = el.x + el.width / 2;
                    const centerY = el.y + el.height / 2;
                    const isOutline =
                      el.color === "transparent" ||
                      el.color === "none" ||
                      el.fillOpacity === 0 ||
                      el.category === "Hollow Wall / Boundary";

                    return (
                      <g key={el.id} className={isSelectOrEraser ? "pointer-events-auto" : "pointer-events-none"}>
                        <polygon
                          points={pointsString}
                          fill={isOutline ? "none" : el.color === "transparent" || el.color === "none" ? "none" : el.color}
                          fillOpacity={
                            isOutline || el.color === "transparent" || el.color === "none"
                              ? 0
                              : el.fillOpacity !== undefined
                                ? el.fillOpacity
                                : 0.85
                          }
                          stroke={isSelected ? "#38BDF8" : el.borderColor || "#38BDF8"}
                          strokeWidth={isSelected ? (el.strokeWidth || 2) + 2 : (el.strokeWidth || 2)}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          pointerEvents={isOutline ? "stroke" : undefined}
                          onMouseDown={(e) => {
                            if (!isSelectOrEraser) return;
                            e.stopPropagation();
                            if (activeTool === "eraser") {
                              recordHistory(elements.filter((item) => item.id !== el.id));
                              notify("Deleted polygon");
                              return;
                            }

                            if (!isSelected) {
                              setSelectedIds([el.id]);
                            }

                            const currentSelectedIds = isSelected ? selectedIds : [el.id];
                            const posMap: { [id: string]: { x: number; y: number; points?: { x: number; y: number }[]; arcControl?: { x: number; y: number } } } = {};
                            elements.forEach((item) => {
                              if (currentSelectedIds.includes(item.id)) {
                                posMap[item.id] = {
                                  x: item.x,
                                  y: item.y,
                                  points: item.points ? item.points.map((p) => ({ ...p })) : undefined,
                                  arcControl: item.arcControl ? { ...item.arcControl } : undefined,
                                };
                              }
                            });

                            setInitialMultiPosMap(posMap);
                            setIsDragging(true);
                            setInitialElementState(el);
                            setDragStartPos(getCoordinates(e));
                          }}
                          className={isSelectOrEraser ? "cursor-grab active:cursor-grabbing" : ""}
                        />

                        {/* Stall Number / Label */}
                        {el.number && (
                          <text
                            x={centerX}
                            y={centerY + 4}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={el.textColor || "#FFFFFF"}
                            fontSize="12"
                            fontWeight="bold"
                            fontFamily="monospace"
                            className="select-none pointer-events-none drop-shadow-md"
                          >
                            {el.number}
                          </text>
                        )}

                        {/* Selected Vertex Handles & Bounding Outline */}
                        {isSelected && (
                          <>
                            {/* Bounding Box Outline */}
                            <rect
                              x={el.x - 2}
                              y={el.y - 2}
                              width={el.width + 4}
                              height={el.height + 4}
                              fill="none"
                              stroke="#38BDF8"
                              strokeWidth="1"
                              strokeDasharray="3 3"
                              pointerEvents="none"
                            />
                            {/* Vertices Anchors */}
                            {el.points.map((pt, pIdx) => (
                              <circle
                                key={pIdx}
                                cx={pt.x}
                                cy={pt.y}
                                r="4.5"
                                fill="#38BDF8"
                                stroke="#0C121C"
                                strokeWidth="1.5"
                                className="pointer-events-none"
                              />
                            ))}
                          </>
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

                {/* 1. Live Target Indicator before 1st point is placed */}
                {activeTool === "polygon" && currentPolygonPoints.length === 0 && polygonHoverPos && (
                  <g className="pointer-events-none">
                    <circle
                      cx={polygonHoverPos.x}
                      cy={polygonHoverPos.y}
                      r="10"
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={polygonHoverPos.x}
                      cy={polygonHoverPos.y}
                      r="4"
                      fill="#38BDF8"
                      stroke="#0C121C"
                      strokeWidth="1.5"
                    />
                    <rect
                      x={polygonHoverPos.x + 12}
                      y={polygonHoverPos.y - 12}
                      width="132"
                      height="22"
                      rx="6"
                      fill="#0F172A"
                      stroke="#38BDF8"
                      strokeWidth="1"
                      fillOpacity="0.9"
                    />
                    <text
                      x={polygonHoverPos.x + 18}
                      y={polygonHoverPos.y + 3}
                      fill="#38BDF8"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      Click to place pt 1
                    </text>
                  </g>
                )}

                {/* 2. Active Polygon In-Progress Drawing Preview */}
                {activeTool === "polygon" && currentPolygonPoints.length > 0 && (
                  <g className="pointer-events-none">
                    {/* Ghost Fill Preview */}
                    {currentPolygonPoints.length >= 2 && polygonHoverPos && (
                      <polygon
                        points={[...currentPolygonPoints, polygonHoverPos].map((p) => `${p.x},${p.y}`).join(" ")}
                        fill={activeFillColor === "transparent" ? "none" : activeFillColor}
                        fillOpacity={0.35}
                        stroke="none"
                      />
                    )}

                    {/* Polyline Path for existing points */}
                    <polyline
                      points={currentPolygonPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke={activeStrokeColor || "#38BDF8"}
                      strokeWidth={activeStrokeWidth || 2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Rubberband line from last point to cursor */}
                    {polygonHoverPos && currentPolygonPoints.length > 0 && (
                      <line
                        x1={currentPolygonPoints[currentPolygonPoints.length - 1].x}
                        y1={currentPolygonPoints[currentPolygonPoints.length - 1].y}
                        x2={polygonHoverPos.x}
                        y2={polygonHoverPos.y}
                        stroke={activeStrokeColor || "#38BDF8"}
                        strokeWidth={activeStrokeWidth || 2}
                        strokeDasharray="4 4"
                      />
                    )}

                    {/* Rubberband current hover target */}
                    {polygonHoverPos && (
                      <g>
                        <circle
                          cx={polygonHoverPos.x}
                          cy={polygonHoverPos.y}
                          r="6"
                          fill="#38BDF8"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        <rect
                          x={polygonHoverPos.x + 10}
                          y={polygonHoverPos.y - 12}
                          width="85"
                          height="20"
                          rx="4"
                          fill="#0F172A"
                          stroke="#38BDF8"
                          strokeWidth="1"
                          fillOpacity="0.9"
                        />
                        <text
                          x={polygonHoverPos.x + 16}
                          y={polygonHoverPos.y + 2}
                          fill="#38BDF8"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          Pt #{currentPolygonPoints.length + 1}
                        </text>
                      </g>
                    )}

                    {/* Existing Vertex Circles with Numbers */}
                    {currentPolygonPoints.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={idx === 0 ? "8" : "6"}
                          fill={idx === 0 ? "#10B981" : "#38BDF8"}
                          stroke="#0C121C"
                          strokeWidth="2"
                        />
                        <text
                          x={p.x}
                          y={p.y + 3}
                          textAnchor="middle"
                          fill="#0C121C"
                          fontSize="8"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {idx + 1}
                        </text>
                      </g>
                    ))}

                    {/* First Point Closing Target Halo */}
                    {currentPolygonPoints.length >= 3 && (
                      <g>
                        <circle
                          cx={currentPolygonPoints[0].x}
                          cy={currentPolygonPoints[0].y}
                          r="18"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                          className="animate-pulse"
                        />
                        <text
                          x={currentPolygonPoints[0].x}
                          y={currentPolygonPoints[0].y - 22}
                          textAnchor="middle"
                          fill="#10B981"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                          className="drop-shadow-md"
                        >
                          🎯 Click to Close
                        </text>
                      </g>
                    )}
                  </g>
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

            {/* Floating In-Progress Polygon Banner Controls */}
            {activeTool === "polygon" && currentPolygonPoints.length > 0 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white border border-sky-500/40 shadow-2xl backdrop-blur font-sans text-xs">
                <div className="flex items-center gap-1.5 font-mono text-sky-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Polygon: {currentPolygonPoints.length} vertices</span>
                </div>
                <div className="h-4 w-px bg-slate-700" />
                <button
                  type="button"
                  disabled={currentPolygonPoints.length < 3}
                  onClick={() => finishPolygon()}
                  className="px-3 py-1.5 text-white rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-white">Finish Polygon (Enter)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPolygonPoints((prev) => prev.slice(0, -1))}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all cursor-pointer"
                >
                  Undo Point (Del)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPolygonPoints([]);
                    setPolygonHoverPos(null);
                    setActiveTool("select");
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-medium transition-all cursor-pointer"
                >
                  Cancel (Esc)
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* =========================================================================
          CANVAS DIMENSIONS & BACKGROUND SETTINGS MODAL
         ========================================================================= */}
      {showCanvasSettingsModal && (
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
                onClick={() => setShowCanvasSettingsModal(false)}
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
                  onClick={() => setShowCanvasSettingsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await saveToStorage();
                    setShowCanvasSettingsModal(false);
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
      )}
    </div>
  );
}

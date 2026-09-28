import { CanvasElement, DrawingShapeRole, PRESET_CATEGORIES } from "./types";
import { applySnap } from "./utils";

interface CreateShapeContext {
  drawingShapeRole: DrawingShapeRole;
  selectedCategory: (typeof PRESET_CATEGORIES)[0];
  counterPrefix: string;
  counterNum: number;
  zoneLabel: string;
  activeFillColor: string;
  activeStrokeColor: string;
  activeStrokeWidth: number;
  activeBorderRadius: number;
}

export function createPolygonElement(
  points: { x: number; y: number }[],
  ctx: CreateShapeContext
): CanvasElement {
  const minX = Math.min(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxX = Math.max(...points.map((p) => p.x));
  const maxY = Math.max(...points.map((p) => p.y));
  const width = Math.max(20, maxX - minX);
  const height = Math.max(20, maxY - minY);

  const isStall = ctx.drawingShapeRole === "stall";
  const isZone = ctx.drawingShapeRole === "zone";
  const isOutline = ctx.drawingShapeRole === "outline";

  const label = isStall
    ? `${ctx.counterPrefix}${ctx.counterNum}`
    : isZone
    ? ctx.zoneLabel || "EXHIBIT ZONE"
    : "";

  const category = isStall
    ? ctx.selectedCategory.name
    : isZone
    ? "Zone / Functional Area"
    : "Hollow Wall / Boundary";

  const color = isOutline
    ? "transparent"
    : isZone
    ? ctx.activeFillColor === "transparent"
      ? "#0284C7"
      : ctx.activeFillColor
    : ctx.activeFillColor === "transparent"
    ? "transparent"
    : ctx.activeFillColor || ctx.selectedCategory.color;

  const fillOpacity = isOutline
    ? 0
    : isZone
    ? 0.45
    : ctx.activeFillColor === "transparent"
    ? 0
    : (ctx.selectedCategory.fillOpacity ?? 0.85);

  return {
    id: isZone ? `ZONE_${Date.now()}` : isOutline ? `OUTLINE_${Date.now()}` : `POLY_${Date.now()}`,
    type: "polygon",
    number: label,
    category,
    dimensions: isStall
      ? ctx.selectedCategory.defaultDim || `${Math.round(width / 10)}m × ${Math.round(height / 10)}m`
      : isOutline
      ? "Wall"
      : "",
    sizeSqM: isStall ? ctx.selectedCategory.sqm || Math.round((width * height) / 100) : 0,
    sizeSqFt: isStall ? Math.round((ctx.selectedCategory.sqm || (width * height) / 100) * 10.764) : 0,
    priceNPR: isStall ? ctx.selectedCategory.npr : 0,
    priceUSD: isStall ? ctx.selectedCategory.usd : 0,
    status: "Available",
    color,
    fillOpacity,
    borderColor: ctx.activeStrokeColor || (isOutline ? "#38BDF8" : ctx.selectedCategory.border),
    textColor: isOutline ? ctx.activeStrokeColor || "#38BDF8" : "#FFFFFF",
    strokeWidth: ctx.activeStrokeWidth,
    borderRadius: ctx.activeBorderRadius,
    x: minX,
    y: minY,
    width,
    height,
    rotation: 0,
    points,
  };
}

export function createRegularPolygonElement(
  sides: number,
  radius: number = 60,
  shapeName: string = "Polygon",
  canvasWidth: number,
  canvasHeight: number,
  snapToGrid: boolean,
  gridSize: number,
  ctx: CreateShapeContext
): CanvasElement {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const pts: { x: number; y: number }[] = [];
  const angleStep = (2 * Math.PI) / sides;
  const offsetAngle = -Math.PI / 2;

  for (let i = 0; i < sides; i++) {
    const angle = offsetAngle + i * angleStep;
    pts.push({
      x: applySnap(Math.round(centerX + radius * Math.cos(angle)), snapToGrid, gridSize),
      y: applySnap(Math.round(centerY + radius * Math.sin(angle)), snapToGrid, gridSize),
    });
  }

  const minX = Math.min(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxX = Math.max(...pts.map((p) => p.x));
  const maxY = Math.max(...pts.map((p) => p.y));
  const width = maxX - minX;
  const height = maxY - minY;

  const isStall = ctx.drawingShapeRole === "stall";
  const isZone = ctx.drawingShapeRole === "zone";
  const isOutline = ctx.drawingShapeRole === "outline";

  const label = isStall
    ? `${ctx.counterPrefix}${ctx.counterNum}`
    : isZone
    ? ctx.zoneLabel || `${shapeName.toUpperCase()} ZONE`
    : "";

  const category = isStall
    ? `${shapeName} Stall`
    : isZone
    ? "Zone / Functional Area"
    : "Hollow Wall / Boundary";

  const color = isOutline
    ? "transparent"
    : isZone
    ? ctx.activeFillColor === "transparent"
      ? "#0284C7"
      : ctx.activeFillColor
    : ctx.activeFillColor === "transparent"
    ? "transparent"
    : ctx.activeFillColor || ctx.selectedCategory.color;

  const fillOpacity = isOutline
    ? 0
    : isZone
    ? 0.45
    : ctx.activeFillColor === "transparent"
    ? 0
    : (ctx.selectedCategory.fillOpacity ?? 0.85);

  return {
    id: isZone ? `ZONE_${Date.now()}` : isOutline ? `OUTLINE_${Date.now()}` : `POLY_${Date.now()}`,
    type: "polygon",
    number: label,
    category,
    dimensions: isStall ? `${Math.round(width / 10)}m × ${Math.round(height / 10)}m` : isOutline ? "Wall" : "",
    sizeSqM: isStall ? ctx.selectedCategory.sqm || Math.round((width * height) / 100) : 0,
    sizeSqFt: isStall ? Math.round((ctx.selectedCategory.sqm || (width * height) / 100) * 10.764) : 0,
    priceNPR: isStall ? ctx.selectedCategory.npr : 0,
    priceUSD: isStall ? ctx.selectedCategory.usd : 0,
    status: "Available",
    color,
    fillOpacity,
    borderColor: ctx.activeStrokeColor || (isOutline ? "#38BDF8" : ctx.selectedCategory.border),
    textColor: isOutline ? ctx.activeStrokeColor || "#38BDF8" : "#FFFFFF",
    strokeWidth: ctx.activeStrokeWidth,
    borderRadius: ctx.activeBorderRadius,
    x: minX,
    y: minY,
    width,
    height,
    rotation: 0,
    points: pts,
  };
}

export function createRectangleElement(
  rect: { x: number; y: number; width: number; height: number },
  ctx: CreateShapeContext
): CanvasElement {
  const isStall = ctx.drawingShapeRole === "stall";
  const isZone = ctx.drawingShapeRole === "zone";
  const isOutline = ctx.drawingShapeRole === "outline";

  const label = isStall
    ? `${ctx.counterPrefix}${ctx.counterNum}`
    : isZone
    ? ctx.zoneLabel || "EXHIBIT ZONE"
    : "";

  const category = isStall
    ? ctx.selectedCategory.name
    : isZone
    ? "Zone / Functional Area"
    : "Hollow Wall / Boundary";

  const color = isOutline
    ? "transparent"
    : isZone
    ? ctx.activeFillColor === "transparent"
      ? "#0284C7"
      : ctx.activeFillColor
    : ctx.activeFillColor === "transparent"
    ? "transparent"
    : ctx.activeFillColor || ctx.selectedCategory.color;

  const fillOpacity = isOutline
    ? 0
    : isZone
    ? 0.45
    : ctx.activeFillColor === "transparent"
    ? 0
    : (ctx.selectedCategory.fillOpacity ?? 0.85);

  return {
    id: isZone ? `ZONE_${Date.now()}` : isOutline ? `OUTLINE_${Date.now()}` : `STALL_${Date.now()}`,
    type: isZone ? "zone" : "stall",
    number: label,
    category,
    dimensions: isStall ? ctx.selectedCategory.defaultDim : isOutline ? "Wall" : "",
    sizeSqM: isStall ? ctx.selectedCategory.sqm : 0,
    sizeSqFt: isStall ? Math.round(ctx.selectedCategory.sqm * 10.764) : 0,
    priceNPR: isStall ? ctx.selectedCategory.npr : 0,
    priceUSD: isStall ? ctx.selectedCategory.usd : 0,
    status: "Available",
    color,
    fillOpacity,
    borderColor: ctx.activeStrokeColor || (isOutline ? "#38BDF8" : ctx.selectedCategory.border),
    textColor: isOutline ? ctx.activeStrokeColor || "#38BDF8" : "#FFFFFF",
    strokeWidth: ctx.activeStrokeWidth,
    borderRadius: ctx.activeBorderRadius,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    rotation: 0,
  };
}

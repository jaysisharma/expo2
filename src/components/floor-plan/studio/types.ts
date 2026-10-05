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
  textRotation?: number;
  textOffsetX?: number;
  textOffsetY?: number;
  fontSize?: number;
  fontWeight?: string;
  groupId?: string;
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

export type ToolType =
  | "select"
  | "rectangle"
  | "polygon"
  | "arc"
  | "line"
  | "pencil"
  | "text"
  | "eraser";

export type DrawingShapeRole = "stall" | "zone" | "outline";

export type CanvasBgMode = "cad-dark" | "cad-navy" | "clean-white";

export interface PresetCategory {
  name: string;
  color: string;
  fillOpacity: number;
  border: string;
  text: string;
  defaultDim: string;
  sqm: number;
  npr: number;
  usd: number;
  prefix: string;
  defaultW: number;
  defaultH: number;
}

export const PRESET_CATEGORIES: PresetCategory[] = [
  { name: "Hollow Wall / Boundary", color: "transparent", fillOpacity: 0, border: "#38BDF8", text: "#38BDF8", defaultDim: "Wall", sqm: 0, npr: 0, usd: 0, prefix: "WALL", defaultW: 40, defaultH: 40 },
  { name: "Walking Corridor / Aisle", color: "transparent", fillOpacity: 0, border: "#F59E0B", text: "#F59E0B", defaultDim: "Aisle", sqm: 0, npr: 0, usd: 0, prefix: "AISLE", defaultW: 60, defaultH: 40 },
  { name: "10m × 7m Bare Space", color: "#0284C7", fillOpacity: 0.85, border: "#38BDF8", text: "#FFFFFF", defaultDim: "10m × 7m", sqm: 70, npr: 875000, usd: 6500, prefix: "C", defaultW: 140, defaultH: 98 },
  { name: "6m × 6m Space", color: "#D97706", fillOpacity: 0.85, border: "#FBBF24", text: "#FFFFFF", defaultDim: "6m × 6m", sqm: 36, npr: 378000, usd: 3000, prefix: "A", defaultW: 90, defaultH: 90 },
  { name: "Prime Space", color: "#16A34A", fillOpacity: 0.85, border: "#4ADE80", text: "#FFFFFF", defaultDim: "6m × 6m", sqm: 36, npr: 600000, usd: 4500, prefix: "P", defaultW: 90, defaultH: 90 },
  { name: "3m × 3m Shell Scheme", color: "#DC2626", fillOpacity: 0.85, border: "#F87171", text: "#FFFFFF", defaultDim: "3m × 3m", sqm: 9, npr: 180000, usd: 1350, prefix: "B", defaultW: 45, defaultH: 45 },
  { name: "Central Pavilion", color: "#9333EA", fillOpacity: 0.85, border: "#C084FC", text: "#FFFFFF", defaultDim: "8m × 8m", sqm: 64, npr: 1200000, usd: 9000, prefix: "A47", defaultW: 120, defaultH: 120 },
  { name: "5m × 6m Prime Space", color: "#475569", fillOpacity: 0.85, border: "#94A3B8", text: "#FFFFFF", defaultDim: "5m × 6m", sqm: 30, npr: 450000, usd: 3400, prefix: "A", defaultW: 75, defaultH: 90 },
  { name: "20ft × 60ft Bare Space", color: "#854D0E", fillOpacity: 0.85, border: "#FACC15", text: "#FFFFFF", defaultDim: "20ft × 60ft", sqm: 111, npr: 1450000, usd: 11000, prefix: "BS", defaultW: 180, defaultH: 60 },
  { name: "Seminar & Stage Hall", color: "#1E293B", fillOpacity: 0.9, border: "#64748B", text: "#FFFFFF", defaultDim: "20m × 40m", sqm: 800, npr: 0, usd: 0, prefix: "STAGE", defaultW: 300, defaultH: 150 },
];

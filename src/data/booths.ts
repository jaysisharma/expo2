import { Booth } from "@/lib/types";
import savedFloorPlan from "./savedCustomFloorPlan.json";

function getSortRank(num: string): number {
  const prefix = num.replace(/[0-9]/g, "").toUpperCase();
  const intVal = parseInt(num.replace(/[^0-9]/g, "")) || 0;
  const pRank: Record<string, number> = { C: 1, B: 2, A: 3, H: 4, F: 5 };
  return (pRank[prefix] || 6) * 1000 + intVal;
}

export function extractBoothsFromElements(elements: any[]): Booth[] {
  if (!Array.isArray(elements)) return [];

  const rawStalls = elements.filter((el) => {
    if (!el) return false;
    if (
      el.category === "Hollow Wall / Boundary" ||
      el.category === "Zone / Functional Area" ||
      el.type === "zone"
    )
      return false;
    if (el.color === "transparent" || el.color === "none" || el.fillOpacity === 0)
      return false;
    if (
      el.type === "line" ||
      el.type === "pencil" ||
      el.type === "arc" ||
      el.type === "text" ||
      el.type === "polygon"
    )
      return false;
    if (el.points && el.points.length >= 3) return false;
    if (!el.number || typeof el.number !== "string") return false;
    const num = el.number.trim().toUpperCase();
    if (
      num.startsWith("BLOCK") ||
      num.startsWith("WALL") ||
      num.startsWith("OUTLINE") ||
      num.startsWith("CURVE")
    )
      return false;
    return true;
  });

  rawStalls.sort((a, b) => getSortRank(a.number) - getSortRank(b.number));

  return rawStalls.map((el) => {
    const num = el.number.trim();
    const upper = num.toUpperCase();

    let hall = "Block A";
    let type = el.category || "Standard Exhibition Space";
    let defaultDimensions = "6m x 6m";
    let defaultSqM = 36;
    let defaultPriceUSD = 3000;
    let defaultPriceNPR = 378000;
    let powerIncluded = "16A Single Phase";

    if (upper.startsWith("C")) {
      hall = "Block C";
      type = "10m × 7m Bare Space";
      defaultDimensions = "10m x 7m";
      defaultSqM = 70;
      defaultPriceUSD = 3500;
      defaultPriceNPR = 450000;
      powerIncluded = "3-Phase 32A";
    } else if (upper.startsWith("B")) {
      hall = "Block B";
      type = "3m × 3m Stall";
      defaultDimensions = "3m x 3m";
      defaultSqM = 9;
      defaultPriceUSD = 1350;
      defaultPriceNPR = 180000;
      powerIncluded = "Single Phase 15A";
    } else if (["A5", "A6", "A7", "A8"].includes(upper)) {
      hall = "Block A";
      type = "5m × 6m Prime Space";
      defaultDimensions = "5m x 6m";
      defaultSqM = 30;
      defaultPriceUSD = 3400;
      defaultPriceNPR = 450000;
      powerIncluded = "16A Single Phase";
    } else if (upper.startsWith("A")) {
      hall = "Block A";
      type = "6m × 6m Space";
      defaultDimensions = "6m x 6m";
      defaultSqM = 36;
      defaultPriceUSD = 3000;
      defaultPriceNPR = 378000;
      powerIncluded = "16A Single Phase";
    } else if (upper.startsWith("H")) {
      hall = "Special (Hydro)";
      type = "Hydro Competition";
      defaultDimensions = "2m x 2m";
      defaultSqM = 4;
      defaultPriceUSD = 380;
      defaultPriceNPR = 50000;
      powerIncluded = "5A Single Phase";
    } else if (upper.startsWith("F")) {
      hall = "Outdoor / Food";
      type = "Food Court";
      defaultDimensions = "6m x 6m";
      defaultSqM = 36;
      defaultPriceUSD = 2250;
      defaultPriceNPR = 300000;
      powerIncluded = "16A Single Phase";
    }

    return {
      id: el.id || num,
      hall,
      number: num,
      sizeSqM: el.sizeSqM && el.sizeSqM > 0 ? Number(el.sizeSqM) : defaultSqM,
      type:
        el.category && el.category !== "10m × 7m Bare Space" && el.category !== "Wall"
          ? el.category
          : type,
      priceUSD: el.priceUSD && el.priceUSD > 0 ? Number(el.priceUSD) : defaultPriceUSD,
      priceNPR: el.priceNPR && el.priceNPR > 0 ? Number(el.priceNPR) : defaultPriceNPR,
      status: (el.status === "Booked" || el.status === "Reserved" ? el.status : "Available") as "Available" | "Reserved" | "Booked",
      dimensions: el.dimensions && el.dimensions !== "Wall" ? el.dimensions : defaultDimensions,
      powerIncluded: el.powerIncluded || powerIncluded,
      coordinates: {
        x: Number(el.x) || 0,
        y: Number(el.y) || 0,
        width: Number(el.width) || 40,
        height: Number(el.height) || 40,
      },
    };
  });
}

export const boothsData: Booth[] = extractBoothsFromElements(savedFloorPlan.elements || []);

// Live stall inventory for the admin pages: the floor plan's stalls with booth overrides applied
// (status, exhibitor, sheet prices) and the price checkout charges. Shared by the Stalls page and
// the Dashboard so their counts and values always agree.
import { boothsData, extractBoothsFromElements } from "@/data/booths";
import { Booth } from "@/lib/types";
import { resolveStall, type ResolvedStall } from "@/lib/stallPricing";

export const BLOCKS = ["Block A", "Block B", "Block C", "Outdoor & Special"] as const;
export type BlockName = (typeof BLOCKS)[number];
export const STALL_STATUSES = ["Available", "Reserved", "Booked"] as const;

/** A1 -> Block A; H, F and other stalls -> Outdoor & Special */
export function blockOf(booth: Pick<Booth, "number">): BlockName {
  const prefix = booth.number.trim().toUpperCase().match(/^([A-Z]+)\d/)?.[1];
  if (prefix === "A") return "Block A";
  if (prefix === "B") return "Block B";
  if (prefix === "C") return "Block C";
  return "Outdoor & Special";
}

export const STATUS_STYLES: Record<string, { badge: string; tile: string; dot: string; bar: string }> = {
  Booked: {
    badge: "text-emerald-700 bg-emerald-50 border-emerald-200",
    tile: "bg-emerald-50 border-emerald-200 hover:border-emerald-400",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  Reserved: {
    badge: "text-amber-800 bg-amber-50 border-amber-200",
    tile: "bg-amber-50 border-amber-200 hover:border-amber-400",
    dot: "bg-amber-500",
    bar: "bg-amber-400",
  },
  Available: {
    badge: "text-slate-600 bg-slate-100 border-slate-200",
    tile: "bg-white border-slate-200 hover:border-slate-400",
    dot: "bg-slate-300",
    bar: "bg-slate-200",
  },
};

/** Floor plan stalls (or the built-in list) with their booth overrides applied */
export function mergeBoothOverrides(floorPlanElements: any[], boothOverrides: Record<string, any> | undefined): Booth[] {
  const extracted = floorPlanElements?.length ? extractBoothsFromElements(floorPlanElements) : [];
  const base = extracted.length > 0 ? extracted : boothsData;
  return base.map((b) => {
    const zeroPadded = b.number.replace(/^([A-Za-z]+)(\d)$/, "$10$2");
    const strippedZero = b.number.replace(/^([A-Za-z]+)0+(\d+)$/, "$1$2");
    const override = boothOverrides?.[b.number] || boothOverrides?.[zeroPadded] || boothOverrides?.[strippedZero];
    return override
      ? {
          ...b,
          status: (override.status || b.status) as any,
          exhibitorName: override.exhibitorName !== undefined ? override.exhibitorName : b.exhibitorName,
          priceUSD: override.priceUSD !== undefined ? Number(override.priceUSD) : b.priceUSD,
          priceNPR: override.priceNPR !== undefined ? Number(override.priceNPR) : b.priceNPR,
          isPrime: override.isPrime !== undefined ? Boolean(override.isPrime) : Boolean(b.isPrime),
        }
      : { ...b, isPrime: Boolean(b.isPrime) };
  });
}

/** Checkout price (sheet price, prime surcharge, sheet size) for every stall */
export function resolveBooths(
  booths: Booth[],
  floorPlanElements: any[],
  boothOverrides: Record<string, any> | undefined,
  primeSurchargePercent: number
) {
  const inputs = { elements: floorPlanElements, boothOverrides: boothOverrides || {}, primeSurchargePercent };
  const map = new Map<string, ResolvedStall>();
  for (const b of booths) map.set(b.number, resolveStall(b.number, inputs));
  return map;
}

export interface BlockSummary {
  block: BlockName;
  total: number;
  booked: number;
  reserved: number;
  available: number;
}

export function summarizeInventory(booths: Booth[], resolved: Map<string, ResolvedStall>) {
  const count = (status: string) => booths.filter((b) => b.status === status).length;
  const value = (status: string) =>
    booths.filter((b) => b.status === status).reduce((sum, b) => sum + (resolved.get(b.number)?.priceNPR || 0), 0);
  const blocks: BlockSummary[] = BLOCKS.map((block) => {
    const inBlock = booths.filter((b) => blockOf(b) === block);
    return {
      block,
      total: inBlock.length,
      booked: inBlock.filter((b) => b.status === "Booked").length,
      reserved: inBlock.filter((b) => b.status === "Reserved").length,
      available: inBlock.filter((b) => b.status === "Available").length,
    };
  }).filter((b) => b.total > 0);
  const total = booths.length;
  const booked = count("Booked");
  const reserved = count("Reserved");
  return {
    total,
    booked,
    reserved,
    available: count("Available"),
    occupancyPct: total ? Math.round(((booked + reserved) / total) * 100) : 0,
    bookedValueNPR: value("Booked"),
    reservedValueNPR: value("Reserved"),
    blocks,
  };
}

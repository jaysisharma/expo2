// Stall & package pricing — the single source of truth for both the booking wizard
// (what the visitor sees) and the server (what they are charged). Prices come from,
// in order: admin Stalls page overrides → admin floor plan studio → official tariff → defaults.
import { boothsData } from "@/data/booths";
import { officialStalls } from "@/data/officialFloorPlanData";
import { PARTICIPATION_PACKAGES } from "@/data/participationPackages";

export const VAT_RATE = 0.13;
export const DEFAULT_PRIME_SURCHARGE_PERCENT = 25;

export interface PricingInputs {
  /** Floor plan studio elements (admin-configured) */
  elements: any[];
  /** Admin Stalls page overrides, keyed by stall number */
  boothOverrides: Record<string, any>;
  /** settings.primeStallSurchargePercent */
  primeSurchargePercent: number;
}

const toNumber = (v: unknown) => (v !== undefined && v !== null && !isNaN(Number(v)) ? Number(v) : undefined);

// Filters out walls, labels and zones from floor plan elements
export function isActualStall(el: any) {
  if (el.type === "text" || el.type === "line" || el.type === "arc" || el.type === "pencil") return false;
  if (el.category === "Hollow Wall / Boundary" || el.category === "Boundary Wall" || el.category === "Curved Wall") return false;
  if (el.category === "Zone / Functional Area" || el.type === "zone") return false;
  if (el.number === "WALL" || el.number === "CURVE" || el.number === "OUTLINE" || !el.number) return false;
  return true;
}

/** Resolves a stall's details and price, prioritising the admin configuration. */
export function resolveStall(num: string, { elements, boothOverrides, primeSurchargePercent }: PricingInputs) {
  const cleanNum = (num || "").trim().toLowerCase();
  const custom =
    elements.find(
      (el: any) =>
        isActualStall(el) &&
        ((el.number && el.number.toLowerCase() === cleanNum) || (el.id && el.id.toLowerCase() === cleanNum))
    ) ||
    elements.find(
      (el: any) => (el.number && el.number.toLowerCase() === cleanNum) || (el.id && el.id.toLowerCase() === cleanNum)
    );
  const official = officialStalls.find((s) => s.id.toLowerCase() === cleanNum || s.number.toLowerCase() === cleanNum);
  const fallback = boothsData.find((b) => b.number.toLowerCase() === cleanNum);

  const number = custom?.number || official?.number || fallback?.number || num;
  const category = custom?.category || official?.category || fallback?.type || "Standard Exhibition Stall";
  const dimensions = custom?.dimensions || official?.dimensions || fallback?.dimensions || "3m × 3m";
  const sizeSqM = Number(custom?.sizeSqM ?? official?.sizeSqM ?? fallback?.sizeSqM ?? 9);
  const sizeSqFt = Number(custom?.sizeSqFt ?? official?.sizeSqFt ?? Math.round(sizeSqM * 10.76));

  const override =
    boothOverrides[cleanNum] || boothOverrides[number?.toLowerCase()] || (custom?.id && boothOverrides[custom.id]);
  // Overrides are saved under the stall number as typed (e.g. "A1"), so also try an exact match
  const overrideExact = override || boothOverrides[num] || boothOverrides[number];

  const isPrime =
    overrideExact?.isPrime !== undefined
      ? Boolean(overrideExact.isPrime)
      : custom?.isPrime !== undefined
        ? Boolean(custom.isPrime)
        : Boolean(fallback?.isPrime);

  const basePriceNPR =
    toNumber(overrideExact?.priceNPR) ?? toNumber(custom?.priceNPR) ?? toNumber(official?.priceNPR) ?? toNumber(fallback?.priceNPR) ?? 180000;
  const basePriceUSD =
    toNumber(overrideExact?.priceUSD) ?? toNumber(custom?.priceUSD) ?? toNumber(official?.priceUSD) ?? toNumber(fallback?.priceUSD) ?? 1350;

  const primeSurchargeRate = (primeSurchargePercent || DEFAULT_PRIME_SURCHARGE_PERCENT) / 100;
  const primeSurchargeNPR = isPrime ? Math.round(basePriceNPR * primeSurchargeRate) : 0;
  const primeSurchargeUSD = isPrime ? Math.round(basePriceUSD * primeSurchargeRate) : 0;

  const block = custom?.block || official?.block || fallback?.hall || (number ? `Block ${number.charAt(0).toUpperCase()}` : "Main Pavilion");
  const status = custom?.status || official?.status || fallback?.status || "Available";

  // Rule: B1–B22 and H1–H8 are standard stalls (do not write Shell Scheme). All other stalls are Bare Space!
  const upper = (number || "").trim().toUpperCase();
  const bMatch = upper.match(/^B(\d+)$/);
  const isB = Boolean(bMatch && parseInt(bMatch[1], 10) >= 1 && parseInt(bMatch[1], 10) <= 22);
  const hMatch = upper.match(/^H(\d+)$/);
  const isH = Boolean(hMatch && parseInt(hMatch[1], 10) >= 1 && parseInt(hMatch[1], 10) <= 8);
  const isBareSpace = !isB && !isH;

  // Detect Irregular Bare Space (custom footprint charged per sq.m)
  const isIrregular = Boolean(
    custom?.isIrregular ||
      custom?.category === "Irregular Bare Space" ||
      (custom?.dimensions && custom.dimensions.toLowerCase().includes("custom")) ||
      (category && category.toLowerCase().includes("irregular")) ||
      upper.startsWith("IRR")
  );

  const ratePerSqMNPR = Number(custom?.ratePerSqMNPR || (basePriceNPR && sizeSqM ? Math.round(basePriceNPR / sizeSqM) : 10500));
  const ratePerSqMUSD = Number(
    custom?.ratePerSqMUSD || (basePriceUSD && sizeSqM ? Number((basePriceUSD / sizeSqM).toFixed(2)) : 83.33)
  );

  const displayName = isIrregular
    ? `STALL ${number} (Irregular Bare Space)`
    : isBareSpace
      ? `STALL ${number} (Bare Space)`
      : `STALL ${number}`;

  return {
    number,
    displayName,
    spaceType: isIrregular ? "Irregular Bare Space" : isBareSpace ? "Bare Space" : "",
    isBareSpace,
    isIrregular,
    ratePerSqMNPR,
    ratePerSqMUSD,
    isPrime,
    block,
    dimensions,
    sizeSqM,
    sizeSqFt,
    basePriceNPR,
    basePriceUSD,
    primeSurchargeNPR,
    primeSurchargeUSD,
    priceNPR: basePriceNPR + primeSurchargeNPR,
    priceUSD: basePriceUSD + primeSurchargeUSD,
    category: isIrregular ? "Irregular Bare Space" : isBareSpace ? `${dimensions} Bare Space` : category,
    status,
    powerIncluded:
      custom?.powerIncluded || official?.powerIncluded || (isBareSpace ? "Direct Power Provision" : "Standard 15A Included"),
  };
}

export type ResolvedStall = ReturnType<typeof resolveStall>;

/** Totals for a selection of stalls, or a sponsor package (which has a fixed price). */
export function quoteBooking(stallNumbers: string[], packageId: string | null | undefined, inputs: PricingInputs) {
  const stalls = stallNumbers.map((n) => resolveStall(n, inputs));
  const pkg = PARTICIPATION_PACKAGES.find((p) => p.id === packageId);
  const isSponsorPackage = Boolean(pkg && pkg.type === "sponsor");
  const sum = (key: "basePriceNPR" | "basePriceUSD" | "primeSurchargeNPR" | "primeSurchargeUSD" | "priceNPR" | "priceUSD" | "sizeSqM") =>
    stalls.reduce((acc, s) => acc + (s[key] || 0), 0);

  const rawTotalPriceNPR = sum("priceNPR");
  const rawTotalPriceUSD = sum("priceUSD");
  const finalPriceNPR = isSponsorPackage && pkg ? pkg.priceNPR : rawTotalPriceNPR;
  const finalPriceUSD = isSponsorPackage && pkg ? pkg.priceUSD : rawTotalPriceUSD;
  const vatNPR = Math.round(finalPriceNPR * VAT_RATE);
  const vatUSD = Math.round(finalPriceUSD * VAT_RATE);

  return {
    stalls,
    selectedPackage: pkg,
    isSponsorPackage,
    totalAreaSqM: sum("sizeSqM"),
    rawBasePriceNPR: sum("basePriceNPR"),
    rawBasePriceUSD: sum("basePriceUSD"),
    totalPrimeSurchargeNPR: sum("primeSurchargeNPR"),
    totalPrimeSurchargeUSD: sum("primeSurchargeUSD"),
    rawTotalPriceNPR,
    rawTotalPriceUSD,
    hasPrimeStalls: stalls.some((s) => s.isPrime),
    finalPriceNPR,
    finalPriceUSD,
    finalBasePriceNPR: isSponsorPackage && pkg ? pkg.priceNPR : sum("basePriceNPR"),
    finalBasePriceUSD: isSponsorPackage && pkg ? pkg.priceUSD : sum("basePriceUSD"),
    vatNPR,
    vatUSD,
    totalWithVatNPR: finalPriceNPR + vatNPR,
    totalWithVatUSD: finalPriceUSD + vatUSD,
  };
}

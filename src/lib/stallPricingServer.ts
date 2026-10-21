// Loads the admin-configured pricing data on the server, from the same sources the
// booking wizard reads (Firestore first, then local files), and quotes a booking.
import "server-only";
import fs from "fs/promises";
import path from "path";
import savedFloorPlanFallback from "@/data/savedCustomFloorPlan.json";
import { PARTICIPATION_PACKAGES } from "@/data/participationPackages";
import { getFirebaseBoothOverrides, getFirebaseFloorPlan, getFirebaseSettings } from "./firebaseDb";
import { DEFAULT_PRIME_SURCHARGE_PERCENT, quoteBooking, type PricingInputs } from "./stallPricing";

async function readLocalJson(file: string): Promise<any | null> {
  for (const p of [path.join(process.cwd(), "data", file), path.join(process.cwd(), "src", "data", file)]) {
    try {
      return JSON.parse(await fs.readFile(p, "utf-8"));
    } catch {}
  }
  return null;
}

export async function loadPricingInputs(): Promise<PricingInputs> {
  const [fbFloor, fbOverrides, fbSettings, localFloor, localAdmin] = await Promise.all([
    getFirebaseFloorPlan(),
    getFirebaseBoothOverrides(),
    getFirebaseSettings(),
    readLocalJson("savedCustomFloorPlan.json"),
    readLocalJson("adminData.json"),
  ]);

  const elements =
    (Array.isArray(fbFloor?.elements) && fbFloor.elements.length > 0 && fbFloor.elements) ||
    (Array.isArray(localFloor?.elements) && localFloor.elements.length > 0 && localFloor.elements) ||
    (savedFloorPlanFallback as any).elements ||
    [];

  const settings = fbSettings || localAdmin?.settings || {};
  return {
    elements,
    boothOverrides: { ...(localAdmin?.boothOverrides || {}), ...(fbOverrides || {}) },
    primeSurchargePercent: Number(settings.primeStallSurchargePercent) || DEFAULT_PRIME_SURCHARGE_PERCENT,
  };
}

/**
 * Server-side price for a booking. Throws an Error with a user-facing message when the
 * selection is invalid (e.g. more stalls than a sponsor package includes).
 */
export async function quoteBookingOnServer(stallNumbers: string[], packageId: unknown) {
  const pkg = PARTICIPATION_PACKAGES.find((p) => p.id === packageId);
  const sponsorPackageId = pkg && pkg.type === "sponsor" ? pkg.id : null;
  if (pkg && pkg.type === "sponsor" && stallNumbers.length > pkg.spaceCount) {
    throw new Error(`The ${pkg.name} package includes ${pkg.spaceCount} stall${pkg.spaceCount === 1 ? "" : "s"}.`);
  }
  return quoteBooking(stallNumbers, sponsorPackageId, await loadPricingInputs());
}

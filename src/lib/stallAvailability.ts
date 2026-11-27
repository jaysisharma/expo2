// Shared rule for whether a stall can be booked. Used by the floor plan, the booking
// wizard and the booking API so the browser and the server agree.

export const HOLD_STATUS = "72h Hold";
/** Minutes a "Book" reservation stays Reserved while the exhibitor pays and uploads a receipt. */
export const BOOKING_PAYMENT_MINUTES = 10;
const TAKEN_STATUSES = new Set(["booked", "reserved", "sold"]);

type OverrideLike = { status?: string; holdExpiresAt?: string; reservationExpiresAt?: string } | null | undefined;

const isPast = (iso: string | undefined, now: number) => {
  if (!iso) return false;
  const t = Date.parse(iso);
  return !Number.isNaN(t) && t <= now;
};

/** True while a 72-hour hold has not yet expired (a hold with no expiry counts as live). */
export function isLiveHold(override: OverrideLike, now = Date.now()): boolean {
  if (!override || override.status !== HOLD_STATUS) return false;
  if (!override.holdExpiresAt) return true;
  const expires = Date.parse(override.holdExpiresAt);
  return Number.isNaN(expires) || expires > now;
}

/**
 * Status to display/enforce for a stall: the admin override wins over the floor plan.
 * A live 72h hold shows as "Reserved"; an expired one shows as "Available". A booking
 * reservation past its payment window (reservationExpiresAt) also shows as "Available".
 */
export function effectiveStallStatus(override: OverrideLike, elementStatus?: string, now = Date.now()): string {
  const status = override?.status || elementStatus || "Available";
  // A "Book" reservation whose payment window ran out without a receipt is free again.
  // Uploading a receipt or any admin edit clears reservationExpiresAt, so those never expire.
  if (status === "Reserved" && override?.status === "Reserved" && isPast(override.reservationExpiresAt, now)) {
    return "Available";
  }
  if (status === HOLD_STATUS) {
    // Floor plan elements carry no expiry, so defer to the override's hold window
    if (!override?.status) return "Reserved";
    return isLiveHold(override, now) ? "Reserved" : "Available";
  }
  return status;
}

export function isStatusTaken(status?: string): boolean {
  return TAKEN_STATUSES.has((status || "").trim().toLowerCase());
}

/** Look up a stall's override regardless of how its key was cased. */
export function findOverride(overrides: Record<string, any> | null | undefined, ...keys: (string | undefined)[]) {
  if (!overrides) return undefined;
  for (const k of keys) {
    if (!k) continue;
    if (overrides[k]) return overrides[k];
  }
  const wanted = new Set(keys.filter(Boolean).map((k) => (k as string).toLowerCase()));
  for (const [key, value] of Object.entries(overrides)) {
    if (wanted.has(key.toLowerCase())) return value;
  }
  return undefined;
}

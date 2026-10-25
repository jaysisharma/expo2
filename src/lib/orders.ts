// Stall / sponsor bookings and paid dinner registrations, persisted in Firestore
// (the source of truth on Vercel) with the local adminData.json kept in sync for local dev.
import "server-only";
import fs from "fs/promises";
import path from "path";
import {
  getFirebaseFloorPlan,
  getFirebaseRegistrationById,
  getFirebaseStallBooking,
  saveFirebaseFloorPlan,
  saveFirebaseStallBooking,
  setFirebaseBoothOverride,
  updateFirebaseRegistration,
} from "./firebaseDb";
import { pushStallToGoogleSheet } from "./googleSheetSync";

const ADMIN_DATA_PATHS = [
  path.join(process.cwd(), "data", "adminData.json"),
  path.join(process.cwd(), "src", "data", "adminData.json"),
];
const FLOOR_PLAN_PATHS = [
  path.join(process.cwd(), "data", "savedCustomFloorPlan.json"),
  path.join(process.cwd(), "src", "data", "savedCustomFloorPlan.json"),
];

async function readJson(paths: string[]): Promise<any | null> {
  for (const p of paths) {
    try {
      return JSON.parse(await fs.readFile(p, "utf-8"));
    } catch {}
  }
  return null;
}

async function writeJson(paths: string[], data: any) {
  const content = JSON.stringify(data, null, 2);
  for (const p of paths) {
    try {
      await fs.writeFile(p, content, "utf-8");
    } catch {}
  }
}

export type Order = { kind: "stall"; record: any } | { kind: "registration"; record: any };

export async function findOrder(orderId: string): Promise<Order | null> {
  const booking = await getFirebaseStallBooking(orderId);
  if (booking) return { kind: "stall", record: booking };
  const registration = await getFirebaseRegistrationById(orderId);
  if (registration) return { kind: "registration", record: registration };

  const local = await readJson(ADMIN_DATA_PATHS);
  const localBooking = (local?.stallBookings || []).find((b: any) => b.id === orderId);
  if (localBooking) return { kind: "stall", record: localBooking };
  const localReg = (local?.registrations || []).find((r: any) => r.id === orderId);
  if (localReg) return { kind: "registration", record: localReg };
  return null;
}

/** A client-suggested booking ID is only used if no booking has it yet (prevents overwriting someone's booking). */
export async function resolveNewOrderId(suggested: unknown, prefix: string) {
  const fresh = () => `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
  if (typeof suggested === "string" && /^[A-Z0-9-]{6,40}$/.test(suggested) && !(await findOrder(suggested))) {
    return suggested;
  }
  let id = fresh();
  while (await findOrder(id)) id = fresh();
  return id;
}

export async function saveStallBooking(booking: Record<string, any>) {
  return saveFirebaseStallBooking(booking);
}

/** Amount (in paisa) the order should have been paid, from the record saved at checkout. */
export async function expectedAmountPaisa(orderId: string): Promise<number | null> {
  const order = await findOrder(orderId);
  if (!order) return null;
  const npr =
    order.kind === "stall" ? Number(order.record.amountNPR) : Number(order.record.ticketDetails?.totalAmountNPR);
  return npr > 0 ? Math.round(npr * 100) : null;
}

/**
 * Records a payment result on the booking / registration, marks paid stalls as Booked
 * (booth overrides + floor plan). Anyone can open a callback URL, so a FAILED result
 * never downgrades a paid order or one waiting on bank transfer / QR verification.
 */
export async function markOrderPaymentStatus(
  orderId: string,
  paymentStatus: "PAID" | "FAILED",
  pidx?: string,
  transactionId?: string
) {
  const order = await findOrder(orderId);
  if (!order) {
    console.warn(`[orders] Payment ${paymentStatus} for unknown order ${orderId}`);
    return;
  }
  // Only an order waiting on an online payment can fail; bank-transfer, QR and free-hold orders are left alone
  const current = String(order.record.paymentStatus || "");
  if (paymentStatus === "FAILED" && !["", "INITIATED", "UNPAID", "FAILED"].includes(current)) return;

  const now = new Date().toISOString();
  const patch: Record<string, any> = {
    paymentStatus,
    ...(pidx ? { pidx } : {}),
    ...(transactionId ? { transactionId } : {}),
    ...(paymentStatus === "PAID" ? { paidAt: now } : { failedAt: now }),
  };
  const stalls: string[] = order.kind === "stall" && Array.isArray(order.record.stalls) ? order.record.stalls : [];
  const exhibitorName = order.record.company || order.record.contactPerson || "Confirmed Exhibitor";

  // Firestore
  if (order.kind === "stall") {
    await saveFirebaseStallBooking({
      ...order.record,
      ...patch,
      bookingStatus: paymentStatus === "PAID" ? "Confirmed" : "Failed",
    });
    if (paymentStatus === "PAID") {
      await Promise.all(
        stalls.map((s) => setFirebaseBoothOverride(s, { status: "Booked", exhibitorName, bookingRef: orderId }))
      );
      const floor = await getFirebaseFloorPlan();
      if (floor && Array.isArray(floor.elements) && stalls.length) {
        await saveFirebaseFloorPlan({
          ...floor,
          elements: floor.elements.map((el: any) =>
            stalls.includes(el.number || el.id) ? { ...el, status: "Booked", exhibitorName } : el
          ),
        });
      }
      // Async push to Google Sheet if configured
      stalls.forEach((s) => {
        pushStallToGoogleSheet({
          stallNo: s,
          status: "Booked",
          companyName: exhibitorName,
          bookedDate: now.slice(0, 10),
          contact: order.record.phone || order.record.email || "",
        }).catch(() => {});
      });
    }
  } else {
    await updateFirebaseRegistration(orderId, { ...patch, status: paymentStatus === "PAID" ? "Confirmed" : "Failed" });
  }

  // Local files (local development / non-Vercel hosting)
  const local = await readJson(ADMIN_DATA_PATHS);
  if (local) {
    const booking = (local.stallBookings || []).find((b: any) => b.id === orderId);
    if (booking) {
      Object.assign(booking, patch, { bookingStatus: paymentStatus === "PAID" ? "Confirmed" : "Failed" });
      if (paymentStatus === "PAID") {
        local.boothOverrides = local.boothOverrides || {};
        for (const s of stalls) {
          local.boothOverrides[s] = { status: "Booked", exhibitorName, bookingRef: orderId, updatedAt: now };
        }
      }
    }
    const registration = (local.registrations || []).find((r: any) => r.id === orderId);
    if (registration) Object.assign(registration, patch, { status: paymentStatus === "PAID" ? "Confirmed" : "Failed" });
    if (booking || registration) await writeJson(ADMIN_DATA_PATHS, local);
  }

  if (paymentStatus === "PAID" && stalls.length) {
    const floor = await readJson(FLOOR_PLAN_PATHS);
    if (floor && Array.isArray(floor.elements)) {
      floor.elements = floor.elements.map((el: any) => (stalls.includes(el.number || el.id) ? { ...el, status: "Booked" } : el));
      await writeJson(FLOOR_PLAN_PATHS, floor);
    }
  }
}

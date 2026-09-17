import { NextResponse } from "next/server";
import { verifyFonepayPayment } from "@/lib/fonepay";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ROOT_ADMIN_DATA_PATH = path.join(process.cwd(), "data", "adminData.json");
const SRC_ADMIN_DATA_PATH = path.join(process.cwd(), "src", "data", "adminData.json");
const ROOT_FLOOR_PATH = path.join(process.cwd(), "data", "savedCustomFloorPlan.json");
const SRC_FLOOR_PATH = path.join(process.cwd(), "src", "data", "savedCustomFloorPlan.json");

async function syncBookingAndStallStatus(
  orderId: string,
  paymentStatus: "PAID" | "FAILED",
  uid?: string
) {
  try {
    let adminData: any = null;
    try {
      const raw = await fs.readFile(ROOT_ADMIN_DATA_PATH, "utf-8");
      adminData = JSON.parse(raw);
    } catch {
      try {
        const raw = await fs.readFile(SRC_ADMIN_DATA_PATH, "utf-8");
        adminData = JSON.parse(raw);
      } catch {}
    }

    if (adminData) {
      const booking = (adminData.stallBookings || []).find((b: any) => b.id === orderId);
      if (booking) {
        booking.paymentStatus = paymentStatus;
        booking.bookingStatus = paymentStatus === "PAID" ? "Confirmed" : "Failed";
        booking.transactionId = uid || booking.transactionId;
        booking.paidAt = new Date().toISOString();

        if (paymentStatus === "PAID" && Array.isArray(booking.stalls)) {
          if (!adminData.boothOverrides) adminData.boothOverrides = {};
          for (const sNum of booking.stalls) {
            adminData.boothOverrides[sNum] = {
              status: "Booked",
              exhibitorName: booking.company || booking.contactPerson || "Confirmed Exhibitor",
              bookingRef: orderId,
              updatedAt: new Date().toISOString(),
            };
          }
        }
      }

      const content = JSON.stringify(adminData, null, 2);
      try {
        await fs.writeFile(ROOT_ADMIN_DATA_PATH, content, "utf-8");
      } catch {}
      try {
        await fs.writeFile(SRC_ADMIN_DATA_PATH, content, "utf-8");
      } catch {}
    }

    // Sync Floor Plan status
    if (paymentStatus === "PAID") {
      let floorData: any = null;
      try {
        const raw = await fs.readFile(ROOT_FLOOR_PATH, "utf-8");
        floorData = JSON.parse(raw);
      } catch {
        try {
          const raw = await fs.readFile(SRC_FLOOR_PATH, "utf-8");
          floorData = JSON.parse(raw);
        } catch {}
      }

      if (floorData && Array.isArray(floorData.elements)) {
        const booking = (adminData?.stallBookings || []).find((b: any) => b.id === orderId);
        const bookedStalls: string[] = booking?.stalls || [];

        floorData.elements = floorData.elements.map((el: any) => {
          const elNum = el.number || el.id;
          if (bookedStalls.includes(elNum)) {
            return { ...el, status: "Booked" };
          }
          return el;
        });

        const floorContent = JSON.stringify(floorData, null, 2);
        try {
          await fs.writeFile(ROOT_FLOOR_PATH, floorContent, "utf-8");
        } catch {}
        try {
          await fs.writeFile(SRC_FLOOR_PATH, floorContent, "utf-8");
        } catch {}
      }
    }
  } catch (err) {
    console.error("Error syncing Fonepay booking callback:", err);
  }
}

async function handleFonepayCallback(request: Request) {
  const { searchParams } = new URL(request.url);
  const prn = searchParams.get("PRN") || searchParams.get("order_id");
  const pid = searchParams.get("PID");
  const uid = searchParams.get("UID");
  const dv = searchParams.get("DV");
  const ps = searchParams.get("PS");
  const rc = searchParams.get("RC");
  const amt = searchParams.get("AMT");
  const stalls = searchParams.get("stalls") || "";

  console.log("Fonepay Callback:", { prn, pid, uid, dv, ps, rc, amt });

  if (!prn) {
    return NextResponse.redirect(new URL("/payment/failed?error=missing_order_id", request.url));
  }

  try {
    const result = await verifyFonepayPayment({ pid: pid || undefined, uid: uid || undefined, dv: dv || undefined, ps: ps || undefined, rc: rc || undefined });

    if (result.success) {
      await syncBookingAndStallStatus(prn, "PAID", uid || undefined);

      const successUrl = new URL("/payment/success", request.url);
      successUrl.searchParams.set("id", prn);
      successUrl.searchParams.set("gateway", "fonepay");
      if (uid) successUrl.searchParams.set("txn", uid);
      if (amt) successUrl.searchParams.set("amount", amt);
      if (stalls) successUrl.searchParams.set("stalls", stalls);

      return NextResponse.redirect(successUrl);
    } else {
      await syncBookingAndStallStatus(prn, "FAILED", uid || undefined);
      return NextResponse.redirect(
        new URL(`/payment/failed?id=${encodeURIComponent(prn)}&gateway=fonepay&reason=verification_failed`, request.url)
      );
    }
  } catch (err: any) {
    console.error("Fonepay callback processing error:", err);
    return NextResponse.redirect(
      new URL(`/payment/failed?id=${encodeURIComponent(prn)}&gateway=fonepay&error=${encodeURIComponent(err.message)}`, request.url)
    );
  }
}

export async function GET(request: Request) {
  return handleFonepayCallback(request);
}

export async function POST(request: Request) {
  return handleFonepayCallback(request);
}

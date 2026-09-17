import { NextResponse } from "next/server";
import { verifyKhaltiPayment } from "@/lib/khalti";
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
  pidx?: string,
  transactionId?: string
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
        booking.pidx = pidx || booking.pidx;
        booking.transactionId = transactionId || booking.transactionId;
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

    // Also update saved floor plan elements if matching
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
    console.error("Error syncing stall booking callback:", err);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pidx = searchParams.get("pidx");
  const status = searchParams.get("status");
  const transaction_id = searchParams.get("transaction_id");
  const amount = searchParams.get("amount");
  const purchase_order_id = searchParams.get("purchase_order_id") || searchParams.get("order_id");
  const stalls = searchParams.get("stalls") || "";

  console.log("Khalti Callback Received:", { pidx, status, purchase_order_id, transaction_id, amount });

  if (!pidx || !purchase_order_id) {
    return NextResponse.redirect(new URL(`/payment/failed?error=missing_parameters`, request.url));
  }

  try {
    const verification = await verifyKhaltiPayment(pidx);
    console.log("Khalti Verification Result:", verification);

    if (verification.status === "Completed") {
      await syncBookingAndStallStatus(
        purchase_order_id,
        "PAID",
        pidx,
        transaction_id || verification.transaction_id
      );

      const successUrl = new URL(`/payment/success`, request.url);
      successUrl.searchParams.set("id", purchase_order_id);
      successUrl.searchParams.set("gateway", "khalti");
      successUrl.searchParams.set("pidx", pidx);
      if (transaction_id || verification.transaction_id) {
        successUrl.searchParams.set("txn", (transaction_id || verification.transaction_id)!);
      }
      if (amount) successUrl.searchParams.set("amount", (Number(amount) / 100).toString());
      if (stalls) successUrl.searchParams.set("stalls", stalls);

      return NextResponse.redirect(successUrl);
    } else {
      await syncBookingAndStallStatus(purchase_order_id, "FAILED", pidx);
      return NextResponse.redirect(
        new URL(
          `/payment/failed?id=${encodeURIComponent(purchase_order_id)}&gateway=khalti&reason=${encodeURIComponent(
            verification.status
          )}`,
          request.url
        )
      );
    }
  } catch (error: any) {
    console.error("Khalti callback processing error:", error);
    return NextResponse.redirect(
      new URL(
        `/payment/failed?id=${encodeURIComponent(purchase_order_id)}&error=${encodeURIComponent(
          error.message || "verification_failed"
        )}`,
        request.url
      )
    );
  }
}

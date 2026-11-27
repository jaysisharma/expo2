import { NextResponse } from "next/server";
import {
  getFirebaseBoothOverrides,
  setFirebaseBoothOverride,
  getFirebaseFloorPlan,
  saveFirebaseFloorPlan,
  getFirebaseStallBooking,
  saveFirebaseStallBooking,
  getFirebaseSponsorshipHolds,
  setFirebaseSponsorshipHold,
} from "@/lib/firebaseDb";
import { getAdminSession } from "@/lib/session";
import { HOLD_STATUS } from "@/lib/stallAvailability";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// "PENDING_EMAIL_CONFIRMATION" is what bookings made before the online flow were saved as
const UNPAID_BOOKING_STATUSES = new Set(["PENDING_PAYMENT", "PENDING_EMAIL_CONFIRMATION"]);

const isExpired = (holdExpiresAt: unknown, now: number) => {
  if (typeof holdExpiresAt !== "string" || !holdExpiresAt) return false;
  const t = Date.parse(holdExpiresAt);
  return !Number.isNaN(t) && t <= now;
};

// GET: run by the Vercel cron (see vercel.json), authorised with CRON_SECRET.
// Releases stalls and sponsorship packages whose 72-hour free hold has expired, and
// "Book" reservations still unpaid after their payment deadline (RESERVATION_PAYMENT_DAYS).
// Admins can call it too: it previews what would be released; add ?apply=1 to release now.
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const isCron = !!cronSecret && req.headers.get("authorization") === `Bearer ${cronSecret}`;
  const isAdmin = !isCron && !!(await getAdminSession(req));
  if (!isCron && !isAdmin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const apply = isCron || new URL(req.url).searchParams.get("apply") === "1";

  try {
    const now = Date.now();
    const [overrides, sponsorHolds] = await Promise.all([getFirebaseBoothOverrides(), getFirebaseSponsorshipHolds()]);
    if (!overrides) {
      return NextResponse.json({ success: false, message: "Could not read stall overrides" }, { status: 503 });
    }

    const expiredStalls = Object.entries(overrides)
      .filter(([, o]: [string, any]) => o?.status === HOLD_STATUS && isExpired(o.holdExpiresAt, now))
      .map(([num, o]: [string, any]) => ({ num, bookingRef: o.bookingRef as string | undefined, exhibitor: o.exhibitorName }));

    const expiredPackages = Object.entries(sponsorHolds || {})
      .filter(([, h]: [string, any]) => h?.status === HOLD_STATUS && !h.deleted && isExpired(h.holdExpiresAt, now))
      .map(([packageId, h]: [string, any]) => ({ packageId, company: h.company, bookingRef: h.bookingRef as string | undefined }));

    const bookingRefs = [
      ...new Set([...expiredStalls, ...expiredPackages].map((x) => x.bookingRef).filter((r): r is string => Boolean(r))),
    ];

    // "Book" reservations past their payment deadline. Only released while the booking is
    // still unpaid; an admin marking the stall Booked (or editing it) stops the release.
    const overdueReservations = Object.entries(overrides)
      .filter(([, o]: [string, any]) => o?.status === "Reserved" && isExpired(o.reservationExpiresAt, now))
      .map(([num, o]: [string, any]) => ({ num, bookingRef: o.bookingRef as string | undefined, exhibitor: o.exhibitorName }));
    const overdueRefs = [...new Set(overdueReservations.map((r) => r.bookingRef).filter((r): r is string => Boolean(r)))];
    const overdueBookings = new Map<string, any>();
    for (const ref of overdueRefs) overdueBookings.set(ref, await getFirebaseStallBooking(ref));
    const isUnpaid = (ref?: string) => !!ref && UNPAID_BOOKING_STATUSES.has(overdueBookings.get(ref)?.paymentStatus);
    const unpaidReservations = overdueReservations.filter((r) => isUnpaid(r.bookingRef));
    const settledReservations = overdueReservations.filter((r) => !isUnpaid(r.bookingRef));

    if (!apply) {
      return NextResponse.json({
        success: true,
        preview: true,
        expiredStalls,
        expiredPackages,
        bookingRefs,
        unpaidReservations,
        settledReservations,
      });
    }

    // Overdue but paid / no longer pending: just stop checking them
    await Promise.all(settledReservations.map(({ num }) => setFirebaseBoothOverride(num, { reservationExpiresAt: "" })));

    // 1. Free the stalls (keep price/size fields on the override, clear the hold / reservation)
    const stallsToFree = [...expiredStalls, ...unpaidReservations];
    await Promise.all(
      stallsToFree.map(({ num }) =>
        setFirebaseBoothOverride(num, {
          status: "Available",
          exhibitorName: "",
          bookingRef: "",
          is72hHold: false,
          holdExpiresAt: "",
          reservationExpiresAt: "",
        })
      )
    );

    // 2. Reset those stalls on the saved floor plan design
    if (stallsToFree.length > 0) {
      const releasedHolds = new Set(expiredStalls.map((s) => s.num.trim().toLowerCase()));
      const releasedReservations = new Set(unpaidReservations.map((s) => s.num.trim().toLowerCase()));
      const floor = await getFirebaseFloorPlan();
      if (floor && Array.isArray(floor.elements)) {
        let changed = false;
        const elements = floor.elements.map((el: any) => {
          const key = (el.number || el.id || "").trim().toLowerCase();
          if (
            (releasedHolds.has(key) && el.status === HOLD_STATUS) ||
            (releasedReservations.has(key) && el.status === "Reserved")
          ) {
            changed = true;
            return { ...el, status: "Available", exhibitorName: "" };
          }
          return el;
        });
        if (changed) await saveFirebaseFloorPlan({ ...floor, elements });
      }
    }

    // 3. Release expired sponsorship package holds (same shape the admin "release" action writes)
    await Promise.all(
      expiredPackages.map(({ packageId }) => setFirebaseSponsorshipHold(packageId, { status: "Available", deleted: true }))
    );

    // 4. Mark the bookings as expired, unless they were paid or confirmed meanwhile
    const releasedAt = new Date().toISOString();
    let bookingsExpired = 0;
    for (const ref of bookingRefs) {
      const booking = await getFirebaseStallBooking(ref);
      if (booking && booking.paymentStatus === "FREE_HOLD_72H") {
        await saveFirebaseStallBooking({ id: ref, bookingStatus: "Hold Expired", paymentStatus: "HOLD_EXPIRED", releasedAt });
        bookingsExpired++;
      }
    }

    // 5. Mark unpaid "Book" reservations as expired
    for (const ref of new Set(unpaidReservations.map((r) => r.bookingRef as string))) {
      await saveFirebaseStallBooking({ id: ref, bookingStatus: "Expired - Unpaid", paymentStatus: "EXPIRED_UNPAID", releasedAt });
      bookingsExpired++;
    }

    console.log(
      `[release-holds] Released ${expiredStalls.length} held + ${unpaidReservations.length} unpaid stall(s), ${expiredPackages.length} package(s), ${bookingsExpired} booking(s)`
    );
    return NextResponse.json({
      success: true,
      applied: true,
      releasedStalls: expiredStalls.map((s) => s.num),
      releasedUnpaidReservations: unpaidReservations.map((s) => s.num),
      releasedPackages: expiredPackages.map((p) => p.packageId),
      bookingsExpired,
    });
  } catch (error: any) {
    console.error("[release-holds] Failed:", error);
    return NextResponse.json({ success: false, message: error?.message || "Release failed" }, { status: 500 });
  }
}

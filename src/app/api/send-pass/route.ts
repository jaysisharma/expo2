import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { deliverPass, findRegistration } from "@/lib/passDelivery";
import { isPaidTicketOrder } from "@/lib/orders";

// Visitors can only trigger the email shortly after registering (admins can resend any time)
const PUBLIC_SEND_WINDOW_MS = 30 * 60 * 1000;

export const dynamic = "force-dynamic";

function requestAppUrl(req: NextRequest) {
  const reqHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const reqProto = req.headers.get("x-forwarded-proto") || (reqHost.includes("localhost") ? "http" : "https");
  let appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  if (!appUrl || (appUrl.includes("localhost") && reqHost && !reqHost.includes("localhost"))) {
    appUrl = reqHost ? `${reqProto}://${reqHost}` : "";
  }
  return appUrl || "https://www.higex.org";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const passId = typeof body.passId === "string" ? body.passId.trim() : "";
    if (!passId) {
      return NextResponse.json({ success: false, message: "Missing passId." }, { status: 400 });
    }

    // Pass details always come from the stored registration, never from the request,
    // so nobody can mint a pass for a name / pass type they didn't register with.
    const registration = await findRegistration(passId);
    if (!registration?.email || !registration?.name) {
      return NextResponse.json({ success: false, message: "Registration not found." }, { status: 404 });
    }
    const isAdmin = !!(await getAdminSession(req));

    // Paid tickets (Networking Dinner) only get a pass once the payment is verified
    if (isPaidTicketOrder(registration) && registration.paymentStatus !== "PAID") {
      return NextResponse.json(
        { success: false, message: "Your pass is sent automatically once your payment is verified." },
        { status: 402 }
      );
    }

    const registeredAt = new Date(registration.registeredAt || 0).getTime();
    if (!isAdmin && Date.now() - registeredAt > PUBLIC_SEND_WINDOW_MS) {
      return NextResponse.json(
        { success: false, message: "Please contact the organisers to have your pass re-sent." },
        { status: 403 }
      );
    }

    await deliverPass(registration, requestAppUrl(req));
    return NextResponse.json({ success: true, message: "Pass badge and QR sent successfully to email." });
  } catch (err: any) {
    console.error("[send-pass] Email error:", err?.message || err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to send pass email. Please verify SMTP settings." },
      { status: 500 }
    );
  }
}

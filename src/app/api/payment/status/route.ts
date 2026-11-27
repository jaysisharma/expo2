import { NextResponse } from "next/server";
import { findOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

// GET ?id=<order reference>: the real payment status of a booking / ticket, so pages never
// show "confirmed" just because the URL says so. Returns status only, no personal details.
export async function GET(req: Request) {
  const id = (new URL(req.url).searchParams.get("id") || "").trim();
  if (!/^[A-Za-z0-9-]{4,40}$/.test(id)) {
    return NextResponse.json({ found: false }, { status: 400 });
  }
  const order = await findOrder(id).catch(() => null);
  if (!order) return NextResponse.json({ found: false }, { status: 404 });
  return NextResponse.json(
    { found: true, kind: order.kind, paymentStatus: String(order.record.paymentStatus || "") },
    { headers: { "Cache-Control": "no-store" } }
  );
}

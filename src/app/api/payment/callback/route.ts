import { NextResponse } from "next/server";
import { verifyKhaltiPayment } from "@/lib/khalti";
import { expectedAmountPaisa, markOrderPaymentStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

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

    // A real Khalti payment for a smaller amount (e.g. from another order) must not confirm this one
    const expected = await expectedAmountPaisa(purchase_order_id);
    const underpaid =
      process.env.NODE_ENV !== "development" &&
      expected !== null &&
      Number(verification.total_amount) < expected;
    if (expected === null) {
      console.warn(`[payment/callback] No stored amount for ${purchase_order_id}; could not check the paid amount`);
    }
    if (underpaid) {
      console.error(
        `[payment/callback] Amount mismatch for ${purchase_order_id}: paid ${verification.total_amount}, expected ${expected}`
      );
    }

    if (verification.status === "Completed" && !underpaid) {
      await markOrderPaymentStatus(
        purchase_order_id,
        "PAID",
        pidx,
        transaction_id || verification.transaction_id
      );

      const isGala =
        searchParams.get("type") === "gala" ||
        purchase_order_id.startsWith("GALA-") ||
        purchase_order_id.startsWith("HHE27-GALA");
      const successUrl = new URL(`/payment/success`, request.url);
      successUrl.searchParams.set("id", purchase_order_id);
      successUrl.searchParams.set("gateway", "khalti");
      successUrl.searchParams.set("pidx", pidx);
      if (isGala) successUrl.searchParams.set("type", "gala");
      if (searchParams.get("pass")) successUrl.searchParams.set("pass", searchParams.get("pass")!);
      if (searchParams.get("qty")) successUrl.searchParams.set("qty", searchParams.get("qty")!);
      if (transaction_id || verification.transaction_id) {
        successUrl.searchParams.set("txn", (transaction_id || verification.transaction_id)!);
      }
      if (amount) successUrl.searchParams.set("amount", (Number(amount) / 100).toString());
      if (stalls) successUrl.searchParams.set("stalls", stalls);

      return NextResponse.redirect(successUrl);
    } else {
      await markOrderPaymentStatus(purchase_order_id, "FAILED", pidx);
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

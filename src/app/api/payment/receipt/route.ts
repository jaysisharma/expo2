import { NextResponse, after } from "next/server";
import type { UploadApiResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";
import { sendMail } from "@/lib/mailer";
import {
  getFirebaseStallBooking,
  saveFirebaseStallBooking,
  getFirebaseBoothOverrides,
  setFirebaseBoothOverride,
} from "@/lib/firebaseDb";
import { findOverride } from "@/lib/stallAvailability";
import { PAYMENT_PROOF_CC, PAYMENT_PROOF_EMAIL } from "@/lib/paymentDetails";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = /^(image\/(png|jpe?g|webp|heic|heif)|application\/pdf)$/i;
const MAX_RECEIPTS_PER_BOOKING = 10;
// Statuses that mean "we are waiting for this exhibitor's money"
const AWAITING_PAYMENT = new Set(["PENDING_PAYMENT", "PENDING_EMAIL_CONFIRMATION", "FREE_HOLD_72H", "PENDING_WIRE", "INITIATED", "UNPAID", "PROOF_SUBMITTED"]);
const TEAM_EMAILS = [PAYMENT_PROOF_EMAIL, PAYMENT_PROOF_CC];

function esc(str: unknown) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const bad = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

// POST multipart: bookingId, email (the one used to book), file, optional amount + note.
// The reference ID + booking email pair is what proves the uploader owns the booking.
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const bookingId = String(form.get("bookingId") || "").trim().toUpperCase();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const amount = String(form.get("amount") || "").trim().slice(0, 40);
    const note = String(form.get("note") || "").trim().slice(0, 500);
    const file = form.get("file");

    if (!/^[A-Z0-9-]{6,40}$/.test(bookingId)) return bad("Please enter your booking reference ID.");
    if (!email) return bad("Please enter the email address you booked with.");
    if (!(file instanceof File) || file.size === 0) return bad("Please choose your receipt file.");
    if (file.size > MAX_BYTES || !ALLOWED_TYPES.test(file.type)) {
      return bad("Please upload a photo (JPG, PNG, WEBP, HEIC) or PDF under 10MB.");
    }

    const booking = await getFirebaseStallBooking(bookingId);
    // Same message for "no such booking" and "wrong email" so IDs can't be probed
    if (!booking || String(booking.email || "").trim().toLowerCase() !== email) {
      return bad("We couldn't find a booking with that reference ID and email. Please check both and try again.", 404);
    }
    const receipts: any[] = Array.isArray(booking.receipts) ? booking.receipts : [];
    if (receipts.length >= MAX_RECEIPTS_PER_BOOKING) {
      return bad("This booking already has the maximum number of receipts. Please contact the secretariat.", 429);
    }

    // 1. Store the file
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "expo/payment-receipts", resource_type: "auto" }, (error, res) =>
          error || !res ? reject(error || new Error("Upload failed")) : resolve(res)
        )
        .end(buffer);
    });

    const now = new Date().toISOString();
    const receipt = {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      fileName: file.name.slice(0, 120),
      fileType: file.type,
      amount,
      note,
      uploadedAt: now,
    };

    // 2. Record it on the booking. Paid / confirmed bookings keep their status.
    const current = String(booking.paymentStatus || "");
    const markSubmitted = AWAITING_PAYMENT.has(current);
    await saveFirebaseStallBooking({
      id: bookingId,
      receipts: [...receipts, receipt],
      lastReceiptAt: now,
      ...(markSubmitted ? { paymentStatus: "PROOF_SUBMITTED", bookingStatus: "Payment Proof Submitted" } : {}),
    });

    // 3. Keep the stalls reserved while the team verifies: turn a hold / deadline into a plain
    //    Reserved with no expiry, but only where the stall still belongs to this booking.
    const stalls: string[] = Array.isArray(booking.stalls) ? booking.stalls : [];
    const overrides = (await getFirebaseBoothOverrides()) || {};
    const stillOurs: string[] = [];
    const lost: string[] = [];
    for (const num of stalls) {
      const o = findOverride(overrides, num);
      const ours = o?.bookingRef === bookingId && ["Reserved", "72h Hold", "Booked"].includes(o?.status);
      if (!ours) lost.push(num);
      else if (o.status !== "Booked") stillOurs.push(num);
    }
    if (markSubmitted) {
      await Promise.all(
        stillOurs.map((num) =>
          setFirebaseBoothOverride(num, {
            status: "Reserved",
            is72hHold: false,
            holdExpiresAt: "",
            reservationExpiresAt: "",
          })
        )
      );
    }

    // 4. Emails: acknowledgement to the exhibitor, receipt to the team
    const stallList = stalls.join(", ") || "-";
    const company = booking.company || booking.contactPerson || "Exhibitor";
    const tariff =
      booking.packageTariffNPR || booking.amountNPR
        ? `NPR ${Number(booking.packageTariffNPR || booking.amountNPR).toLocaleString()} / USD $${Number(booking.packageTariffUSD || booking.amountUSD || 0).toLocaleString()}`
        : "-";

    const customerHtml = `
      <div style="font-family: Arial, sans-serif; color: #0f172a; max-width: 600px; line-height: 1.6;">
        <h2 style="margin: 0 0 8px; font-size: 18px; color: #065f46;">We've received your payment receipt</h2>
        <p style="font-size: 14px;">Dear ${esc(booking.contactPerson || company)},</p>
        <p style="font-size: 14px;">Thank you. Your payment receipt for booking <strong>${esc(bookingId)}</strong> has been received.
        ${
          lost.length > 0
            ? `Your reservation time had run out and stall ${esc(lost.join(", "))} is no longer held for you. Our team will check your payment and contact you about your stall within 1–2 working days.`
            : "Your stall(s) stay reserved in your name while our team verifies the payment, which usually takes 1–2 working days. Your booking is confirmed once the payment is verified, and you'll get a confirmation email then."
        }</p>
        <table style="border-collapse: collapse; font-size: 13px; margin: 12px 0;">
          <tr><td style="padding: 5px 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 600;">Reference</td><td style="padding: 5px 10px; border: 1px solid #e2e8f0;">${esc(bookingId)}</td></tr>
          <tr><td style="padding: 5px 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 600;">Stalls</td><td style="padding: 5px 10px; border: 1px solid #e2e8f0;">${esc(stallList)}</td></tr>
          <tr><td style="padding: 5px 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 600;">Receipt</td><td style="padding: 5px 10px; border: 1px solid #e2e8f0;">${esc(receipt.fileName)}</td></tr>
          ${amount ? `<tr><td style="padding: 5px 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 600;">Amount paid</td><td style="padding: 5px 10px; border: 1px solid #e2e8f0;">${esc(amount)}</td></tr>` : ""}
        </table>
        <p style="font-size: 13px; color: #475569;">Questions? Reply to this email or call +977-9703606348 / 9703606345.</p>
        <p style="font-size: 13px; color: #475569;">Himalayan Green Energy Expo 2027 Secretariat</p>
      </div>`;

    const teamHtml = `
      <div style="font-family: Arial, sans-serif; color: #0f172a; max-width: 620px;">
        <h2 style="margin: 0 0 6px; font-size: 18px;">Payment receipt uploaded: ${esc(company)} (Stall ${esc(stallList)})</h2>
        ${
          lost.length > 0
            ? `<p style="margin: 8px 0; padding: 10px 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; font-size: 13px; color: #991b1b;"><strong>Check before confirming:</strong> stall ${esc(lost.join(", "))} is no longer reserved for this booking (its hold or 10-minute payment window expired and it was released or taken). Re-assign it in admin if the payment is valid.</p>`
            : ""
        }
        <table style="border-collapse: collapse; font-size: 13px; width: 100%;">
          ${[
            ["Reference", bookingId],
            ["Company", company],
            ["Contact", `${booking.contactPerson || "-"} · ${booking.email} · ${booking.phone || "-"}`],
            ["Stalls", stallList],
            ["Tariff (incl. VAT)", tariff],
            ["Amount stated", amount || "-"],
            ["Note", note || "-"],
            ["Previous status", current || "-"],
          ]
            .map(
              ([k, v]) =>
                `<tr><td style="padding: 6px 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 600; white-space: nowrap;">${esc(k)}</td><td style="padding: 6px 10px; border: 1px solid #e2e8f0;">${esc(v)}</td></tr>`
            )
            .join("")}
        </table>
        <p style="margin: 16px 0;"><a href="${esc(receipt.url)}" style="display: inline-block; background: #047857; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 13px;">View receipt (${esc(receipt.fileName)})</a></p>
        <p style="font-size: 12px; color: #475569;">Once the money is in the account, set the stall(s) to <strong>Booked</strong> in admin. The stalls are held as Reserved (no expiry) until then.</p>
      </div>`;

    after(async () => {
      await Promise.all([
        sendMail({
          to: [booking.email],
          subject: `Payment receipt received - Ref ${bookingId} | Himalayan Green Energy Expo 2027`,
          html: customerHtml,
        }).catch((err) => console.warn("[receipt] Exhibitor email failed:", err)),
        sendMail({
          to: TEAM_EMAILS,
          subject: `[Payment Receipt] ${company} - Stall ${stallList} (Ref ${bookingId})`,
          html: teamHtml,
        }).catch((err) => console.warn("[receipt] Team email failed:", err)),
      ]);
    });

    return NextResponse.json({ success: true, receiptCount: receipts.length + 1, stallsLost: lost });
  } catch (error: any) {
    console.error("[receipt] Upload failed:", error);
    return bad("Upload failed. Please try again in a moment.", 500);
  }
}

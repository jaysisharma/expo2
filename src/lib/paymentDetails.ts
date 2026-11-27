// Single source of truth for where exhibitors send stall payments.
// Used by the booking wizard, the payment success page and the confirmation emails.

export const PAYMENT_BANK = {
  beneficiary: "EVENT SOLUTION PVT. LTD.",
  accountNumber: "01-382609001",
  bankName: "Standard Chartered Bank Nepal Limited",
  branch: "Lalitpur, Bagmati Province, Nepal",
  swift: "SCBLNPKA",
  // NepalPay / NepalQR merchant QR for domestic (NPR) payments
  qrPath: "/STANDARD%20CHARTERED%20BANK-QR.png",
  qrMerchantId: "0601TC8FMY7",
} as const;

// Where exhibitors send their payment receipt / SWIFT advice
export const PAYMENT_PROOF_EMAIL = "Shrestha.anup101@gmail.com";
export const PAYMENT_PROOF_CC = "info@himalayanenergyexpo.com";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.higex.org";

/** Absolute QR image URL, for use inside emails. */
export const PAYMENT_QR_ABSOLUTE_URL = `${SITE_URL.replace(/\/$/, "")}${PAYMENT_BANK.qrPath}`;

/** mailto: link that opens a pre-filled "here is my payment proof" email. */
export function paymentProofMailto(ref: string, stalls?: string) {
  const subject = `Payment Proof - Ref ${ref}${stalls ? ` (Stalls: ${stalls})` : ""} - Himalayan Green Energy Expo 2027`;
  const body =
    `Dear Secretariat,\n\nPlease find attached our payment receipt / SWIFT advice.\n\n` +
    `Reference ID: ${ref}\n${stalls ? `Stalls: ${stalls}\n` : ""}Amount Paid: \nPaid Via: QR / SWIFT wire\n\nThank you.`;
  return `mailto:${PAYMENT_PROOF_EMAIL}?cc=${PAYMENT_PROOF_CC}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

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

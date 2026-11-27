"use client";

import React from "react";
import { Globe, Landmark, QrCode } from "lucide-react";
import { PAYMENT_BANK, PAYMENT_PROOF_EMAIL } from "@/lib/paymentDetails";
import ReceiptUpload from "./ReceiptUpload";

type Props = {
  bookingRef: string;
  stalls?: string;
  amountNPR?: number;
  amountUSD?: number;
  /** Highlight the SWIFT option first for international exhibitors */
  international?: boolean;
  /** Optional heading override, e.g. for holds where payment is not due yet */
  title?: string;
  /** Booking email, if known; otherwise the receipt form asks for it */
  email?: string;
  /** Stall bookings can upload a receipt; other orders (e.g. gala) are told where to send it */
  allowReceiptUpload?: boolean;
};

/**
 * How to pay for a stall: NepalPay QR (domestic, NPR) or SWIFT wire (international, USD),
 * then send the receipt quoting the reference ID.
 */
export default function PaymentInstructions({
  bookingRef,
  stalls,
  amountNPR,
  amountUSD,
  international = false,
  title = "Complete Your Payment",
  email,
  allowReceiptUpload = true,
}: Props) {
  const qrCard = (
    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
        <QrCode className="w-4 h-4 text-[#007A5E]" />
        <span>Pay in Nepal (NPR) – Scan &amp; Pay</span>
      </div>
      <a
        href={PAYMENT_BANK.qrPath}
        target="_blank"
        rel="noopener noreferrer"
        className="block mx-auto w-full max-w-[220px]"
        title="Open full-size QR"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PAYMENT_BANK.qrPath}
          alt={`NepalPay QR for ${PAYMENT_BANK.beneficiary}`}
          className="w-full h-auto rounded-lg border border-slate-200"
        />
      </a>
      <p className="text-[11.5px] text-slate-600 leading-relaxed">
        Scan with any Nepali banking or wallet app that supports <strong>NepalPay / NepalQR</strong>.
        {typeof amountNPR === "number" && amountNPR > 0 && (
          <> Amount: <strong className="text-slate-900">NPR {amountNPR.toLocaleString()}</strong>.</>
        )}{" "}
        Add <strong className="font-mono">{bookingRef}</strong> in the payment remarks.
      </p>
    </div>
  );

  const swiftCard = (
    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
        <Globe className="w-4 h-4 text-sky-600" />
        <span>Pay from Abroad (USD) – SWIFT Wire</span>
      </div>
      <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1.5 text-[11.5px] font-mono text-slate-800">
        <dt className="text-slate-500">Beneficiary</dt>
        <dd className="font-semibold">{PAYMENT_BANK.beneficiary}</dd>
        <dt className="text-slate-500">Account No.</dt>
        <dd className="font-bold text-slate-900">{PAYMENT_BANK.accountNumber}</dd>
        <dt className="text-slate-500">Bank</dt>
        <dd className="font-semibold">{PAYMENT_BANK.bankName}</dd>
        <dt className="text-slate-500">Branch</dt>
        <dd className="font-semibold">{PAYMENT_BANK.branch}</dd>
        <dt className="text-slate-500">SWIFT / BIC</dt>
        <dd className="font-bold text-sky-700">{PAYMENT_BANK.swift}</dd>
        <dt className="text-slate-500">Remarks</dt>
        <dd className="font-semibold">{bookingRef}</dd>
        {typeof amountUSD === "number" && amountUSD > 0 && (
          <>
            <dt className="text-slate-500">Amount</dt>
            <dd className="font-semibold">USD ${amountUSD.toLocaleString()}</dd>
          </>
        )}
      </dl>
      <p className="text-[11px] text-slate-500 leading-relaxed">
        Questions about the wire? Email{" "}
        <a href={`mailto:${PAYMENT_PROOF_EMAIL}`} className="underline">{PAYMENT_PROOF_EMAIL}</a>.
      </p>
    </div>
  );

  return (
    <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left space-y-4">
      <div className="flex items-center gap-2 font-bold text-[#15803D] text-sm">
        <Landmark className="w-4 h-4" />
        <span>{title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {international ? (
          <>
            {swiftCard}
            {qrCard}
          </>
        ) : (
          <>
            {qrCard}
            {swiftCard}
          </>
        )}
      </div>

      {allowReceiptUpload ? (
        <>
          <p className="text-[11.5px] text-emerald-900 leading-relaxed">
            Quote <strong className="font-mono">{bookingRef}</strong> in the payment remarks, then upload your receipt below.
            Your stall is confirmed once payment is verified.
          </p>
          <ReceiptUpload bookingRef={bookingRef} email={email} />
        </>
      ) : (
        <p className="text-[11.5px] text-emerald-900 leading-relaxed">
          Quote <strong className="font-mono">{bookingRef}</strong> in the payment remarks and send your receipt to{" "}
          <strong>{PAYMENT_PROOF_EMAIL}</strong>. Your reservation is confirmed once payment is verified.
        </p>
      )}
    </div>
  );
}

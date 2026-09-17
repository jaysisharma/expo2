"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Download,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  FileText,
  CreditCard,
  QrCode,
  Landmark,
} from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || `HHE26-STALL-${Math.floor(100000 + Math.random() * 900000)}`;
  const gateway = searchParams.get("gateway") || "khalti";
  const stalls = searchParams.get("stalls") || "Confirmed Allocation";
  const amount = searchParams.get("amount");
  const txn = searchParams.get("txn") || searchParams.get("pidx");

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#10B981", "#34D399", "#059669", "#38BDF8", "#F59E0B"],
    });
  }, []);

  const isBank = gateway.toLowerCase() === "bank";
  const isKhalti = gateway.toLowerCase() === "khalti";
  const isFonepay = gateway.toLowerCase() === "fonepay";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* Top Emerald Header */}
      <div className="bg-[#04281E] text-white pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono font-bold text-[#34D399] uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>OFFICIAL STALL ALLOCATION CONFIRMATION</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {isBank ? "Stall Reservation Received!" : "Payment & Stall Booking Confirmed!"}
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/80 max-w-xl mx-auto leading-relaxed">
            {isBank
              ? "Your booth allocation has been provisionally reserved. Please complete the bank wire remittance within 48 hours to finalize badge and pro-forma issuance."
              : "Your payment has been successfully verified. Your exhibition booth is now officially locked in for the 2027 Himalayan Hydro & Green Energy Expo."}
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#10B981] flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                    BOOKING REFERENCE NUMBER
                  </span>
                  <div className="font-mono font-black text-xl text-slate-900 mt-0.5">
                    {id}
                  </div>
                </div>
              </div>

              {/* Gateway Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700 self-start sm:self-auto">
                {isKhalti && (
                  <>
                    <CreditCard className="w-4 h-4 text-[#5D2E8E]" />
                    <span>Paid via Khalti ePayment</span>
                  </>
                )}
                {isFonepay && (
                  <>
                    <QrCode className="w-4 h-4 text-[#D92525]" />
                    <span>Paid via Fonepay Direct</span>
                  </>
                )}
                {isBank && (
                  <>
                    <Landmark className="w-4 h-4 text-[#218A59]" />
                    <span>Bank Wire / Invoice Requested</span>
                  </>
                )}
              </div>
            </div>

            {/* Receipt Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">ALLOCATED STALL(S)</span>
                <div className="font-sans font-black text-lg text-[#218A59] mt-0.5">
                  STALL {stalls}
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">TOTAL AMOUNT</span>
                <div className="font-sans font-black text-lg text-slate-900 mt-0.5">
                  {amount ? `NPR ${Number(amount).toLocaleString()}` : "NPR 875,000"}
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">VENUE & LOCATION</span>
                <div className="font-sans font-bold text-slate-800 mt-0.5">
                  Bhrikutimandap Exhibition Complex, Kathmandu
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">EXPO DATES</span>
                <div className="font-sans font-bold text-slate-800 mt-0.5">
                  Magh 2–4, 2083 · Jan 16–18, 2027
                </div>
              </div>

              {txn && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                  <span>TRANSACTION ID / PIDX:</span>
                  <span className="font-mono font-bold text-slate-800">{txn}</span>
                </div>
              )}
            </div>

            {/* Bank Wire Details Box (if bank transfer chosen) */}
            {isBank && (
              <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-3 font-mono">
                <div className="flex items-center gap-2 font-bold text-[#15803D]">
                  <Landmark className="w-4 h-4" />
                  <span>IPPAN OFFICIAL BANK ACCOUNT DETAILS FOR REMITTANCE</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800 pt-1">
                  <div><strong>Account Name:</strong> IPPAN - EXPO SECRETARIAT</div>
                  <div><strong>Bank Name:</strong> Nepal Investment Mega Bank (NIMB)</div>
                  <div><strong>Account No:</strong> 001001201928471</div>
                  <div><strong>Branch / SWIFT:</strong> Durbarmarg, Kathmandu / NIMBNPKA</div>
                </div>
                <p className="text-[11px] text-slate-600 font-sans font-normal pt-1">
                  Please mention Reference ID <strong>{id}</strong> in your wire remarks and email the swift advice/voucher to <strong>expo@ippan.org.np</strong>.
                </p>
              </div>
            )}

            {/* Exhibitor Next Steps */}
            <div className="space-y-3 pt-2">
              <h3 className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wide">
                Exhibitor Onboarding & Next Steps
              </h3>
              <ul className="text-xs text-slate-600 space-y-2 pl-1 font-normal">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#15803D] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Our secretariat will issue your formal tax receipt and exhibitor manual via email within 24 hours.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#15803D] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Submit fascia branding typography, exhibitor badges, and electrical load requirements by <strong>Poush 15, 2083</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#15803D] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Stall setup and shell-scheme decoration begins on <strong>Magh 1, 2083 (Jan 15, 2027)</strong> at Bhrikutimandap.
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-3 rounded-full bg-white border border-slate-300 hover:border-[#218A59] text-slate-800 font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#218A59]" />
                <span>PRINT / SAVE CONFIRMATION</span>
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href="/book-stall"
                  className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold transition-colors"
                >
                  Floor Plan Map
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 rounded-full bg-[#218A59] hover:bg-[#186a43] text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>RETURN HOME</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Secretariat Contact Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-700">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#10B981] shrink-0" />
              <div>
                <div className="font-bold text-slate-900">Expo Secretariat Assistance</div>
                <div className="text-slate-500 text-[11px] font-normal">
                  Questions regarding stall setup, electricity or invoices?
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-slate-800">
                <Phone className="w-3.5 h-3.5 text-[#218A59]" />
                <span>+977 1 4169175</span>
              </span>
              <span className="flex items-center gap-1 text-slate-800">
                <Mail className="w-3.5 h-3.5 text-[#10B981]" />
                <span>expo@ippan.org.np</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs text-slate-500">
          LOADING CONFIRMATION DETAILS...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

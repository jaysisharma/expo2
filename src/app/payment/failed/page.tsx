"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  RotateCcw,
  ArrowRight,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  Building2,
} from "lucide-react";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const reason = searchParams.get("reason") || searchParams.get("error") || "Transaction could not be completed";
  const gateway = searchParams.get("gateway") || "payment gateway";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* Dark Header */}
      <div className="bg-[#04281E] text-white pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/30 text-xs font-mono font-bold text-red-400 uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>TRANSACTION INCOMPLETE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Payment Could Not Be Completed
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/80 max-w-xl mx-auto leading-relaxed">
            Your stall reservation has not been finalized because the payment process was canceled or timed out.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-200 text-red-500 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle className="w-9 h-9" />
            </div>

            <div>
              <h2 className="font-sans font-bold text-2xl text-slate-900">
                Payment Verification Unsuccessful
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-normal mt-2 max-w-md mx-auto leading-relaxed">
                We were unable to verify your payment via {gateway.toUpperCase()}. No funds have been permanently deducted, or any provisional holds will be refunded automatically by your bank.
              </p>
            </div>

            {/* Error metadata */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-left space-y-1.5 text-slate-700">
              {id && (
                <div>
                  <span className="text-slate-400 uppercase font-bold">Booking Ref:</span>{" "}
                  <strong>{id}</strong>
                </div>
              )}
              <div>
                <span className="text-slate-400 uppercase font-bold">Error Reason:</span>{" "}
                <span className="text-red-600 font-semibold">{reason}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/book-stall"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#218A59] hover:bg-[#186a43] text-white font-mono text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RETRY STALL BOOKING</span>
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs font-bold transition-colors text-center"
              >
                Return to Homepage
              </Link>
            </div>
          </div>

          {/* Secretariat Hotline Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 uppercase">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Need Immediate Assistance or Bank Invoice?</span>
            </div>
            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              If your bank account was debited or if you prefer an official pro-forma wire invoice, please contact the IPPAN Expo Secretariat immediately:
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-700 pt-1">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#218A59]" />
                <span>+977 1 4169175 / +977 9851458275</span>
              </span>
              <span className="flex items-center gap-1.5">
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

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs text-slate-500">
          LOADING...
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}

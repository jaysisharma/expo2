import React, { Suspense } from "react";
import type { Metadata } from "next";
import DelegateRegistration from "@/components/booking/DelegateRegistration";
import Link from "next/link";
import { Calendar, MapPin, CheckCircle2, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Visitor & Delegate Registration | Himalayan Hydro Expo Nepal 2026",
  description:
    "Register for complimentary trade visitor admission or full-access conference delegate credentials at Bhrikutimandap, Kathmandu.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* =========================================================================
          01: SIMPLE HEADER WITH BACKGROUND COLOR (GREEN THEME)
         ========================================================================= */}
      <div className="bg-[#04281E] text-white pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-300/70 font-mono mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#34D399]">Register</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Visitor & Delegate Registration
              </h1>
              <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-xl">
                Get your official digital entry badge with personalized QR code for fast-track entry at Bhrikutimandap, Kathmandu.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-100/80 shrink-0">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-900/60 border border-emerald-500/30 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Magh 2–4, 2083 · 16–18 Jan</span>
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-[#10B981]/25 text-[#34D399] border border-[#10B981]/50 font-bold">
                Free Trade Admission
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02: REGISTRATION WIZARD FORM
         ========================================================================= */}
      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-5xl mx-auto">
          <Suspense
            fallback={
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center font-mono text-xs text-slate-500 shadow-sm">
                LOADING DELEGATE REGISTRATION DESK...
              </div>
            }
          >
            <DelegateRegistration />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

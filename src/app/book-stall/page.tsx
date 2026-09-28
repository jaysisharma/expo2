import React, { Suspense } from "react";
import type { Metadata } from "next";
import StallBookingWizard from "@/components/booking/StallBookingWizard";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Exhibitor Stall Booking & Reservation | Himalayan Green Energy Expo 2027",
  description:
    "Reserve your premium exhibition booth at Bhrikutimandap, Kathmandu for Nepal's 5th Edition Himalayan Green Energy Expo 2027.",
};

export default function BookStallPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* =========================================================================
          01: HERO HEADER (UNIFIED DEEP GREEN THEME MATCHING OTHER PAGES)
         ========================================================================= */}
      <div className="bg-[#04281E] text-white pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20">
        <div className="max-w-[1600px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-300/70 font-mono mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#34D399]">Book a Stall</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono font-bold text-[#34D399] uppercase mb-3 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>EXHIBITOR STALL ALLOCATION · 5TH EDITION</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Exhibitor Stall Booking & Reservation
              </h1>
              <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-2xl leading-relaxed">
                Reserve your high-visibility exhibition space at Bhrikutimandap, Kathmandu. Select standard stalls or bare space booths with direct power, lighting, and fascia branding.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-emerald-100/80 shrink-0">
              <span className="px-3.5 py-2 rounded-xl bg-emerald-900/60 border border-emerald-500/30 flex items-center gap-2 shadow-xs">
                <Calendar className="w-4 h-4 text-[#34D399]" />
                <span>17th–19th Jan, 2027 · 3rd–5th Magh, 2083</span>
              </span>
              <span className="px-3.5 py-2 rounded-xl bg-emerald-900/60 border border-emerald-500/30 flex items-center gap-2 shadow-xs">
                <MapPin className="w-4 h-4 text-[#34D399]" />
                <span>Bhrikutimandap, Kathmandu</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02: MAIN CONTENT (INTERACTIVE FLOOR PLAN WIZARD)
         ========================================================================= */}
      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-[1600px] mx-auto">
          {/* Stall Booking Wizard with Interactive Floor Plan embedded */}
          <div>
            <Suspense
              fallback={
                <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center font-mono text-xs text-slate-500 shadow-sm">
                  LOADING EXHIBITOR STALL DESK & FLOOR PLAN...
                </div>
              }
            >
              <StallBookingWizard />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { Suspense } from "react";
import type { Metadata } from "next";
import StallBookingWizard from "@/components/booking/StallBookingWizard";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  Map,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Exhibitor Stall Booking & Reservation | Himalayan Hydro & Green Energy Expo 2026",
  description:
    "Reserve your premium exhibition booth at Bhrikutimandap, Kathmandu for Nepal's 5th Edition Himalayan Hydro & Green Energy Expo.",
};

export default function BookStallPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* =========================================================================
          01: HERO HEADER (UNIFIED DEEP GREEN THEME MATCHING OTHER PAGES)
         ========================================================================= */}
      <div className="bg-[#04281E] text-white pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto">
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
                Reserve your high-visibility exhibition space at Bhrikutimandap, Kathmandu. Select standard shell scheme or bare space booths with direct power, lighting, and fascia branding.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-emerald-100/80 shrink-0">
              <span className="px-3.5 py-2 rounded-xl bg-emerald-900/60 border border-emerald-500/30 flex items-center gap-2 shadow-xs">
                <Calendar className="w-4 h-4 text-[#34D399]" />
                <span>Magh 2–4, 2083 · Jan 16–18, 2027</span>
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
          02: MAIN CONTENT (WIZARD + SIDEBAR CARDS)
         ========================================================================= */}
      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Stall Booking Wizard Form (8 Cols) */}
          <div className="lg:col-span-8">
            <Suspense
              fallback={
                <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center font-mono text-xs text-slate-500 shadow-sm">
                  LOADING EXHIBITOR STALL DESK...
                </div>
              }
            >
              <StallBookingWizard />
            </Suspense>
          </div>

          {/* RIGHT: Informational Sidebar & Inclusions (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: Interactive Floor Plan Preview CTA */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#061A2A] to-[#040E18] text-white border border-slate-700 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#38BDF8] bg-[#087EA4]/20 border border-[#38BDF8]/30 px-2.5 py-1 rounded-full uppercase">
                  <Map className="w-3 h-3" />
                  <span>INTERACTIVE MAP</span>
                </div>
                <h3 className="font-sans font-bold text-lg text-white">
                  Inspect Available Stalls Live
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  View the real-time architectural floor plan of Bhrikutimandap halls, corner prime locations, and reserved pavilions.
                </p>
              </div>

              <Link
                href="/floor-plan"
                className="w-full py-3 rounded-full bg-[#10B981] hover:bg-[#059669] text-slate-950 font-mono text-xs font-bold text-center flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <span>OPEN 2D FLOOR MAP</span>
                <span>→</span>
              </Link>
            </div>

            {/* Card 2: Stall Types & Standard Inclusions */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#059669]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-base text-slate-900">
                    Stall Packages & Specs
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">Official Standards</span>
                </div>
              </div>

              {/* Shell Scheme Specs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-900">
                  <span className="text-[#087EA4]">● Shell Scheme (Built)</span>
                  <span className="text-slate-500">Standard 9m²–36m²</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-2 font-normal">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    <span>Octanorm pre-fabricated partition walls</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    <span>Company fascia board with vinyl lettering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    <span>Carpet flooring, 1 table, 2 chairs & trash bin</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    <span>Spotlights & 15A single-phase power plug</span>
                  </li>
                </ul>
              </div>

              {/* Bare Space Specs */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-900">
                  <span className="text-[#059669]">● Bare Space (Raw)</span>
                  <span className="text-slate-500">Min 36m² +</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal pl-2">
                  Ideal for custom-built structural pavilions, double-decker lounges, and heavy physical turbine model demonstrations.
                </p>
              </div>
            </div>

            {/* Card 3: Download Official Prospectus */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-sans font-bold text-sm text-slate-900">
                  Official Expo Proposal
                </div>
                <div className="text-xs text-slate-500">
                  Detailed brochure, tariff, and floor plan PDF
                </div>
              </div>

              <a
                href="/files/hydroproposal-13-2-2024.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-full bg-[#087EA4] hover:bg-[#066584] text-white font-mono text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </a>
            </div>

            {/* Card 4: IPPAN Secretariat Assistance */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 uppercase">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>IPPAN Secretariat Desk</span>
              </div>
              <p className="text-xs text-slate-600 font-normal leading-relaxed">
                For customized large pavilions, sponsorship packages, or international wire payments, contact our desk directly:
              </p>
              <div className="space-y-2 pt-1 text-xs font-mono text-slate-700">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#087EA4]" />
                  <span>+977 1 4169175 / +977 9851458275</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>expo@ippan.org.np</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

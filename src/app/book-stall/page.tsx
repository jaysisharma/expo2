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
          02: MAIN CONTENT (INTERACTIVE FLOOR PLAN WIZARD + INCLUSIONS)
         ========================================================================= */}
      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-7xl mx-auto space-y-10">
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

          {/* Informational Cards & Secretariat Inclusions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Stall Packages & Official Standards */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#218A59]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-base text-slate-900">
                    Stall Packages & Specs
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">Official Standards</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-900">
                  <span className="text-[#218A59]">● Shell Scheme (Built)</span>
                  <span className="text-slate-500">9m²–36m²</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-1 font-normal">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    <span>Octanorm partition walls & carpet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    <span>Fascia board name & spotlights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    <span>1 Table, 2 Chairs & 15A Power</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2: Download Official Prospectus */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#218A59] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase">
                  <FileText className="w-3 h-3" />
                  <span>OFFICIAL PROPOSAL</span>
                </div>
                <h3 className="font-sans font-bold text-base text-slate-900">
                  Event Tariff & Prospectus PDF
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Download the complete official exhibition prospectus with technical electrical guidelines, stall dimensions, and sponsorship tiers.
                </p>
              </div>

              <a
                href="/files/hydroproposal-13-2-2024.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-full bg-[#218A59] hover:bg-[#186a43] text-white font-mono text-xs font-bold text-center flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>DOWNLOAD PROPOSAL PDF</span>
              </a>
            </div>

            {/* Card 3: IPPAN Secretariat Assistance */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 uppercase">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>Secretariat Help Desk</span>
              </div>
              <p className="text-xs text-slate-600 font-normal leading-relaxed">
                For custom pavilions, bank wire transfers, or immediate assistance:
              </p>
              <div className="space-y-2 pt-1 text-xs font-mono text-slate-700">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#218A59]" />
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

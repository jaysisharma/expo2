import React from "react";
import type { Metadata } from "next";
import FAQAccordion from "@/components/faq/FAQAccordion";
import Link from "next/link";
import { ArrowRight, HelpCircle, Mail, Phone, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) | Himalayan Green Energy Expo 2027",
  description:
    "Find answers regarding visitor badge registration, exhibition stall booking, conference delegate passes, international visa facilitation letters, and customs support.",
};

export default function FAQPage() {
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
            <span className="text-[#34D399]">FAQ</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Frequently Asked Questions
              </h1>
              <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-xl">
                Quick answers on stall bookings, free visitor registration, delegate passes, hotel accommodations, and visa facilitation.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-slate-950 text-xs font-black flex items-center gap-2 transition-colors shadow-md"
              >
                <span>Ask Secretariat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02: FAQ SEARCH & ACCORDION
         ========================================================================= */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-5xl mx-auto space-y-16">
          
          <FAQAccordion />

          {/* Secretariat Support Card */}
          <div className="bg-[#061A2A] text-white p-8 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#19BFE8] font-bold mb-1">
                <MessageSquare className="w-4 h-4" />
                <span>DIRECT SECRETARIAT ASSISTANCE</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Have a Specific or Technical Question?
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-lg">
                Our support team is available to assist with machinery floor loading limits, visa invitation letters, and custom pavilion fabrication.
              </p>
            </div>

            <Link
              href="/contact"
              className="px-6 py-3 rounded-lg bg-[#19A974] hover:bg-[#158f62] text-white text-xs font-semibold tracking-wide transition-colors whitespace-nowrap shadow-xs shrink-0 flex items-center gap-2"
            >
              <span>CONTACT SUPPORT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

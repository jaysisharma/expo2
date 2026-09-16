import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  ArrowRight,
  Zap,
  Building2,
  ShieldCheck,
  Globe2,
  Layers,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Exhibit & Stall Booking | Himalayan Hydro Expo Nepal 2026",
  description:
    "Showcase your hydropower machinery, electro-mechanical turbines, 400kV grid equipment, and engineering services to 10,000+ buyers and developers at Bhrikutimandap, Kathmandu.",
};

const standPackages = [
  {
    name: "Standard Shell Scheme",
    size: "3m × 3m (9 m²)",
    description: "Fully pre-equipped modular booth ideal for equipment distributors, engineering consultancies, and component suppliers.",
    features: [
      "Pre-fabricated octanorm white partition walls",
      "Company name fascia lettering header board",
      "1 Information reception counter & 2 chairs",
      "3 Spotlights & 5A single-phase power connection",
      "Synthetic needle-punch floor carpet",
      "Official Expo Directory & Mobile App listing",
      "2 Complimentary Exhibitor Badges",
    ],
    recommended: false,
    badgeText: "",
  },
  {
    name: "Premium Corner Shell",
    size: "6m × 3m (18 m²)",
    description: "Double open corner booth providing prime two-way aisle visibility in the main exhibition hall.",
    features: [
      "Double open side (prominent corner visibility)",
      "Pre-fabricated modular shell walls",
      "Dual company fascia lettering boards",
      "2 Information counters & 4 chairs",
      "6 Spotlights & 15A industrial power socket",
      "Directory highlight & Logo inclusion",
      "4 Complimentary Exhibitor Badges",
      "Access to B2B Matchmaking Deal Suite",
    ],
    recommended: true,
    badgeText: "POPULAR FOR OEMS",
  },
  {
    name: "Island Bare Space",
    size: "36 m² – 72 m² (Custom)",
    description: "Four-side open raw island space for bespoke designer pavilions and heavy hydraulic turbine runner displays.",
    features: [
      "4-side open raw island space for custom stand build",
      "Heavy machinery floor loading support (up to 5T/m²)",
      "3-Phase 32A/63A industrial power connection",
      "Dedicated VIP Lounge Meeting Passes",
      "Full-page profile in Official Event Catalog",
      "8 Complimentary Exhibitor Badges",
      "Priority speaking slot consideration",
    ],
    recommended: false,
    badgeText: "",
  },
];

const exhibitorSectors = [
  {
    title: "Hydro Turbines & Plant Automation",
    description: "Pelton, Francis, Kaplan turbine runners, digital governors, SCADA automation, and inlet valves.",
  },
  {
    title: "400kV Transmission & Substation GIS",
    description: "High-voltage switchgear, power transformers, transmission towers, and cross-border conductors.",
  },
  {
    title: "Tunneling, TBM & Civil Geotechnics",
    description: "Tunnel Boring Machines (TBM), shotcrete rigs, rock bolts, penstock pipes, and desanding basins.",
  },
  {
    title: "Green Hydrogen & Energy Storage",
    description: "Electrolyzer stacks, hydrogen storage vessels, pumped-storage hydro, and hybrid battery banks.",
  },
];

export default function ExhibitPage() {
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
            <span className="text-[#34D399]">Exhibit</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Exhibit & Showcase
              </h1>
              <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-xl">
                Position your machinery, equipment, and engineering solutions in front of 10,000+ developers, EPCs, and policymakers.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/book-stall"
                className="px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-slate-950 text-xs font-black flex items-center gap-2 transition-colors shadow-md"
              >
                <span>Book a Stall</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/floor-plan"
                className="px-5 py-2.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/60 border border-emerald-500/30 text-white font-mono text-xs font-bold transition-all"
              >
                View Floor Plan
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02: MAIN EXHIBIT CONTENT
         ========================================================================= */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* Section 1: Stall Packages Matrix (No Price Revealed) */}
          <div>
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold text-[#087EA4] uppercase tracking-wider block mb-1 font-mono">
                COMMERCIAL BOOTH TIERS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Exhibition Space & Packages
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Standard shell scheme booths are turn-key with power and furniture. Bare space allows custom designer fabrication.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {standPackages.map((pkg, idx) => (
                <div
                  key={idx}
                  className={`p-6 sm:p-8 rounded-2xl border transition-all flex flex-col justify-between relative ${
                    pkg.recommended
                      ? "bg-white border-[#087EA4] ring-2 ring-[#087EA4]/20 shadow-md"
                      : "bg-white border-slate-200 shadow-xs hover:border-slate-300"
                  }`}
                >
                  {pkg.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#087EA4] text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-xs">
                      {pkg.badgeText}
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-mono text-[#087EA4] font-bold block mb-1">
                      {pkg.size}
                    </span>
                    <h3 className="font-bold text-lg text-slate-900">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {pkg.description}
                    </p>

                    <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block font-mono">
                        Package Inclusions:
                      </span>
                      {pkg.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-[#19A974] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <Link
                      href="/floor-plan"
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold text-center block transition-all shadow-xs ${
                        pkg.recommended
                          ? "bg-[#087EA4] hover:bg-[#07698a] text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      Select on Floor Plan →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Key Exhibitor Sectors */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="mb-6">
              <span className="text-xs font-bold text-[#087EA4] uppercase tracking-wider block mb-1 font-mono">
                EXHIBITION PROFILE
              </span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Featured Product Sectors
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                The expo caters to the complete clean energy supply chain from turbine manufacturing to transmission engineering.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {exhibitorSectors.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                >
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    {sec.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {sec.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Live Interactive Floor Plan Callout */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#087EA4] font-bold mb-1">
                <Layers className="w-4 h-4" />
                <span>INTERACTIVE BOOTH MAP</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Select Your Exact Booth Location
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-lg">
                View real-time reserved and available booths across the main hall, outdoor machinery arena, and premium corner locations.
              </p>
            </div>

            <Link
              href="/floor-plan"
              className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-[#087EA4] text-white text-xs font-semibold tracking-wide transition-colors whitespace-nowrap shadow-xs shrink-0 flex items-center gap-2"
            >
              <span>Explore Live Floor Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

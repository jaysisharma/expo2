import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { sponsorsData } from "@/data/sponsors";
import OfficialTariffsSection from "@/components/sponsors/OfficialTariffsSection";
import {
  ArrowRight,
  Award,
  Check,
  Building,
  ShieldCheck,
  Users,
  Sparkles,
  Zap,
  Globe2,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sponsors & Partners | Himalayan Green Energy Expo 2027",
  description:
    "Explore the official government patrons, diplomatic missions, apex industry federations, and global engineering OEMs supporting the Himalayan Green Energy Expo in Kathmandu.",
};

interface SponsorshipTierItem {
  tier: string;
  badge?: string;
  priceNPR: string;
  priceUSD: string;
  space: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

const sponsorshipTiers: SponsorshipTierItem[] = [
  {
    tier: "Title Sponsor",
    badge: "FLAGSHIP",
    priceNPR: "NPR 50,00,000",
    priceUSD: "USD $35,000",
    space: "6M × 6M × 2 (2 Bare Space Stalls · 72m²)",
    description: "Exclusive highest-tier summit naming & plenary stage presence across all official backdrops, lanyards, and VIP networking dinner.",
    features: [
      "2 Bare Space Stalls (72m² prime central positioning)",
      "25 VIP Networking Dinner passes at Royal Tulip Kathmandu",
      "50 Inauguration VIP passes & 500 entry passes",
      "20 Official Exhibitor badges & VIP lounge access",
      "6FT × 4FT × 5 Promotional display branding areas",
    ],
    recommended: true,
  },
  {
    tier: "In Association With",
    badge: "PRINCIPAL",
    priceNPR: "NPR 40,00,000",
    priceUSD: "USD $25,000",
    space: "6M × 6M × 1 (1 Bare Space Stall · 36m²)",
    description: "Principal summit partner co-branding on keynotes, summit literature, delegate badges, and official press releases.",
    features: [
      "1 Bare Space Stall (36m² prime corner pavilion)",
      "20 VIP Networking Dinner passes",
      "50 Inauguration VIP passes & 300 entry passes",
      "20 Official Exhibitor badges",
      "6FT × 4FT × 4 Promotional display branding areas",
    ],
    recommended: false,
  },
  {
    tier: "Powered By",
    badge: "MAJOR",
    priceNPR: "NPR 30,00,000",
    priceUSD: "USD $20,000",
    space: "6M × 6M × 1 (1 Bare Space Stall · 36m²)",
    description: "Major partner positioning as a clean energy innovation champion with prominent exhibition presence.",
    features: [
      "1 Bare Space Stall (36m² prime stall)",
      "15 VIP Networking Dinner passes",
      "40 Inauguration VIP passes & 200 entry passes",
      "20 Official Exhibitor badges",
      "6FT × 4FT × 3 Promotional display branding areas",
    ],
    recommended: false,
  },
  {
    tier: "Sponsor",
    badge: "STRATEGIC",
    priceNPR: "NPR 15,00,000",
    priceUSD: "USD $10,000",
    space: "6M × 6M × 1 (1 Bare Space Stall · 36m²)",
    description: "Strategic commercial exposure, B2B procurement visibility, and executive networking privileges.",
    features: [
      "1 Bare Space Stall (36m²)",
      "8 VIP Networking Dinner passes",
      "20 Inauguration VIP passes & 150 entry passes",
      "20 Official Exhibitor badges",
      "6FT × 4FT × 3 Promotional display branding areas",
    ],
    recommended: false,
  },
  {
    tier: "Official Partner",
    badge: "PARTNER",
    priceNPR: "NPR 13,00,000",
    priceUSD: "USD $9,000",
    space: "6M × 6M × 1 (1 Bare Space Stall · 36m²)",
    description: "Sector-focused partnership aligning your organization with Nepal's clean energy leadership.",
    features: [
      "1 Bare Space Stall (36m²)",
      "5 VIP Networking Dinner passes",
      "20 Inauguration VIP passes & 120 entry passes",
      "20 Official Exhibitor badges",
      "6FT × 4FT × 2 Promotional display branding areas",
    ],
    recommended: false,
  },
  {
    tier: "Co-Sponsor",
    badge: "COMMERCIAL",
    priceNPR: "NPR 10,00,000",
    priceUSD: "USD $7,000",
    space: "6M × 6M × 1 (1 Bare Space Stall · 36m²)",
    description: "High-yield commercial exposure for technology manufacturers, suppliers, and engineering consultancies.",
    features: [
      "1 Bare Space Stall (36m²)",
      "5 VIP Networking Dinner passes",
      "20 Inauguration VIP passes & 100 entry passes",
      "20 Official Exhibitor badges",
      "6FT × 4FT × 2 Promotional display branding areas",
    ],
    recommended: false,
  },
  {
    tier: "Supporter",
    badge: "ASSOCIATE",
    priceNPR: "NPR 5,00,000",
    priceUSD: "USD $5,000",
    space: "6M × 6M × 1 (1 Bare Space Stall · 36m²)",
    description: "Entry-level summit participation with exhibition stall and directory listing for growing enterprises.",
    features: [
      "1 Bare Space Stall (36m²)",
      "3 VIP Networking Dinner passes",
      "20 Inauguration VIP passes & 50 entry passes",
      "20 Official Exhibitor badges",
      "6FT × 4FT × 1 Promotional display branding area",
    ],
    recommended: false,
  },
];

const exhibitionStalls = [
  {
    name: "Standard Stall (3m × 3m)",
    badge: "BUILT STALL",
    priceNPR: "NPR 85,000 – 1,80,000",
    priceUSD: "USD $700 – $1,350",
    space: "3M × 3M Built Stall (B1–B22, H1–H8)",
    description: "Ready-to-move-in Octonorm shell stall with standard booth furniture, spotlights, and power supply.",
    features: [
      "Pre-built partition walls (3m × 3m · 9m²)",
      "1 Information table & 2 Chairs",
      "15A Multi-pin power socket & 2 Spotlights",
      "Fascia board with official company name",
    ],
  },
  {
    name: "Bare Space Stall (Custom)",
    badge: "RAW SPACE",
    priceNPR: "From NPR 3,78,000",
    priceUSD: "From USD $3,000",
    space: "6M × 6M or 10M × 7M (Block A / Block C)",
    description: "Open floor space for bespoke architectural fabrication, heavy machinery, or interactive demonstrations.",
    features: [
      "Marked floor footprint for custom fabrication",
      "3-Phase industrial electricity hookup available",
      "Direct vehicle and forklift access for setup",
      "Ideal for turbine models, EV chargers & large equipment",
    ],
  },
];

const sponsorBenefits = [
  {
    title: "10,000+ High-Value Attendees",
    desc: "Connect directly with project owners, EPC contractors, utility engineers, and procurement directors.",
  },
  {
    title: "Direct Access to $15B+ Pipelines",
    desc: "Position your brand at the center of Nepal's 28,000 MW generation and 15,000 MW export roadmaps.",
  },
  {
    title: "Sovereign & Multilateral Visibility",
    desc: "Share stage with Ministers, NEA leadership, Indian/Bangladeshi delegations, and multilateral financiers.",
  },
  {
    title: "Dedicated B2B Deal Rooms",
    desc: "Host private meetings with developers, banking syndicates, and technology partners in executive suites.",
  },
];

export default function SponsorsPage() {
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
            <span className="text-[#34D399]">Sponsors & Partners</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Sponsors &amp; Partners
              </h1>
              <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-xl">
                Supported across previous editions by sovereign energy ministries, national utility operators, apex industry chambers, and global engineering pioneers.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/contact?type=Sponsorship"
                className="px-5 py-2.5 rounded-lg bg-[#007A5E] hover:bg-[#005C42] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <span>Inquire for Sponsorship</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02: PREVIOUS OFFICIAL SPONSORS & PATRONS DIRECTORY
         ========================================================================= */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* Categorized Sponsor Logos */}
          <div className="space-y-12">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-bold text-[#087EA4] uppercase tracking-wider block mb-1 font-mono">
                PREVIOUS EDITIONS · PARTNERS &amp; PATRONS MATRIX
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Our Previous Institutional Partners &amp; Sponsors
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Organizations, sovereign authorities, and industry leaders that supported previous editions of the Himalayan Green Energy Expo.
              </p>
            </div>

            {sponsorsData.map((category, cIdx) => (
              <div key={cIdx} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h3 className="font-bold text-lg text-slate-900">
                    {category.tier}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {category.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                  {category.sponsors.map((sponsor, sIdx) => (
                    <div
                      key={sIdx}
                      className="group bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#087EA4]/40 hover:shadow-md transition-all duration-300 flex items-center justify-center min-h-[160px] sm:min-h-[180px]"
                    >
                      {/* Large prominent logo container */}
                      <div className="relative w-full h-24 sm:h-28 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300">
                        {sponsor.logo.startsWith("http") || sponsor.logo.startsWith("/") ? (
                          <Image
                            src={sponsor.logo}
                            alt={sponsor.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-contain"
                          />
                        ) : (
                          <span className="font-mono font-bold text-3xl text-[#087EA4]">
                            {sponsor.name.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Official Sponsorship & Space Tariff Tables (Verified Brochure Data) */}
          <div className="pt-8 border-t border-slate-200">
            <OfficialTariffsSection />
          </div>

          {/* Section 2: Sponsorship Packages Matrix */}
          <div className="pt-8 border-t border-slate-200">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold text-[#087EA4] uppercase tracking-wider block mb-1 font-mono">
                PARTNERSHIP TIERS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                2027 Sponsorship Opportunities
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Maximize your executive visibility and lead generation through tailored commercial sponsorship packages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsorshipTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className={`p-6 sm:p-7 rounded-2xl border transition-all flex flex-col justify-between relative ${
                    tier.recommended
                      ? "bg-white border-[#218A59] ring-2 ring-[#218A59]/20 shadow-md"
                      : "bg-white border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  {tier.badge && (
                    <div
                      className={`absolute -top-3 left-6 px-3 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                        tier.recommended
                          ? "bg-[#218A59] text-white"
                          : "bg-slate-800 text-white"
                      }`}
                    >
                      {tier.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5 pt-1">
                      <span className="text-xs font-mono text-[#007A5E] font-bold">
                        TIER // 0{idx + 1}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 font-medium truncate">
                        {tier.space.split("(")[0].trim()}
                      </span>
                    </div>

                    <h3 className="font-bold text-xl text-slate-900 tracking-tight">
                      {tier.tier}
                    </h3>

                    {/* Pricing */}
                    <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-base font-extrabold text-slate-950 font-mono">
                          {tier.priceNPR}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 font-mono">
                          {tier.priceUSD}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        Booth: {tier.space}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {tier.description}
                    </p>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block font-mono">
                        Included Privileges:
                      </span>
                      {tier.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-[#218A59] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <Link
                      href="/book-stall"
                      className={`py-2 rounded-xl text-xs font-bold text-center block transition-all shadow-xs ${
                        tier.recommended
                          ? "bg-[#218A59] hover:bg-[#1b734a] text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      Book Tier →
                    </Link>
                    <Link
                      href={`/contact?subject=Sponsorship%20Inquiry%20${encodeURIComponent(tier.tier)}`}
                      className="py-2 rounded-xl text-xs font-semibold text-center block text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Inquire
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Exhibition Stalls Breakdown */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="mb-6">
                <span className="text-xs font-bold text-[#007A5E] uppercase tracking-wider block mb-1 font-mono">
                  EXHIBITION STALL TIERS
                </span>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Standard Built &amp; Custom Bare Space Stalls
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exhibitionStalls.map((stall, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#218A59]/60 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                          {stall.badge}
                        </span>
                        <span className="text-xs font-mono text-slate-500 font-medium">
                          {stall.space}
                        </span>
                      </div>

                      <h4 className="font-bold text-lg text-slate-900">
                        {stall.name}
                      </h4>

                      <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-extrabold text-slate-950 font-mono">
                            {stall.priceNPR}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 font-mono">
                            {stall.priceUSD}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {stall.description}
                      </p>

                      <div className="space-y-2 pt-3 border-t border-slate-100">
                        {stall.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                            <Check className="w-3.5 h-3.5 text-[#218A59] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <Link
                        href="/book-stall"
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#218A59] text-white text-xs font-bold text-center block transition-colors shadow-xs"
                      >
                        Select on Interactive Floor Plan →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Why Sponsor / ROI Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="mb-6">
              <span className="text-xs font-bold text-[#087EA4] uppercase tracking-wider block mb-1 font-mono">
                COMMERCIAL VALUE PROPOSITION
              </span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Why Partner with Himalayan Green Energy Expo 2027?
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sponsorBenefits.map((benefit, bIdx) => (
                <div
                  key={bIdx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                >
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    {benefit.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Sponsorship Contact Callout */}
          <div className="bg-[#061A2A] text-white p-8 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">
                Custom Sponsorship & Branding Packages
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Looking for tailored branding options such as badge sponsorship, VIP networking dinner hosting, or technical stage naming rights? Contact our partnership team.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/contact?type=Sponsorship"
                className="px-6 py-3 rounded-lg bg-[#19A974] hover:bg-[#158f62] text-white text-xs font-semibold tracking-wide transition-colors flex items-center gap-2"
              >
                <span>CONTACT PARTNERSHIPS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { sponsorsData } from "@/data/sponsors";
import {
  ArrowRight,
  ExternalLink,
  Award,
  Check,
  Building,
  ShieldCheck,
  Users,
  Sparkles,
  Zap,
  Globe2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sponsors & Partners | Himalayan Green Energy Expo 2027",
  description:
    "Explore the official government patrons, diplomatic missions, apex industry federations, and global engineering OEMs supporting the Himalayan Green Energy Expo in Kathmandu.",
};

const sponsorshipTiers = [
  {
    tier: "Platinum Title Partner",
    badge: "FLAGSHIP",
    description: "Exclusive top-tier brand placement across all plenary backdrops, badges, lanyards, and VIP gala events.",
    features: [
      "72 m² Prime Island Pavilion in Hall A (Central Atrium)",
      "Opening Plenary Keynote Address (15 Minutes)",
      "Title logo branding on delegate badges & lanyards",
      "10 VIP Gala Dinner invitations with Ministers & NEA Chiefs",
      "Full-page back cover advertisement in official Expo Directory",
      "Dedicated VIP business lounge with private catering",
    ],
    recommended: true,
  },
  {
    tier: "Gold Strategic Sponsor",
    badge: "STRATEGIC",
    description: "Prominent exhibition space with high-impact stage presence and targeted B2B media exposure.",
    features: [
      "36 m² Corner Stand in Hall A or Hall B",
      "Session Panelist slot in Technical or Finance track",
      "Prominent logo on main stage backdrop & official portal",
      "6 VIP Gala Dinner passes and delegate networking access",
      "Full-page inner color advertisement in Expo Directory",
      "Branded press release syndicated to regional energy networks",
    ],
    recommended: false,
  },
  {
    tier: "Silver Co-Sponsor",
    badge: "COMMERCIAL",
    description: "Ideal for equipment suppliers and technology providers seeking targeted B2B visibility.",
    features: [
      "18 m² Shell Scheme Stall in prime aisle location",
      "Logo on conference timetable and website sponsor matrix",
      "4 Conference Delegate badges & VIP lounge access",
      "Half-page color advertisement in Expo Directory",
      "Inclusion in pre-expo digital newsletter to 50,000+ engineers",
    ],
    recommended: false,
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
                Sponsors & Partners
              </h1>
              <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-xl">
                Backed by sovereign energy ministries, national utility operators, apex industry chambers, and global engineering pioneers.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/contact?type=Sponsorship"
                className="px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-slate-950 text-xs font-black flex items-center gap-2 transition-colors shadow-md"
              >
                <span>Inquire for Sponsorship</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02: CURRENT OFFICIAL SPONSORS & PATRONS DIRECTORY
         ========================================================================= */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* Categorized Sponsor Logos */}
          <div className="space-y-12">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-bold text-[#087EA4] uppercase tracking-wider block mb-1 font-mono">
                OFFICIAL PATRONS & PARTNERS MATRIX
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Our Institutional Partners & Sponsors
              </h2>
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {category.sponsors.map((sponsor, sIdx) => (
                    <a
                      key={sIdx}
                      href={sponsor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#087EA4] hover:shadow-md transition-all flex flex-col items-center justify-between text-center min-h-[160px]"
                    >
                      {/* Logo container */}
                      <div className="relative w-full h-14 rounded-xl flex items-center justify-center p-2 mb-2 group-hover:scale-105 transition-transform overflow-hidden">
                        {sponsor.logo.startsWith("http") || sponsor.logo.startsWith("/") ? (
                          <Image
                            src={sponsor.logo}
                            alt={sponsor.name}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <span className="font-mono font-black text-2xl text-[#087EA4]">
                            {sponsor.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 w-full">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-[#087EA4] transition-colors line-clamp-2 leading-tight block">
                          {sponsor.name}
                        </span>
                        <span className="inline-block font-mono text-[10px] text-slate-500 line-clamp-1">
                          {sponsor.type}
                        </span>
                      </div>

                      <div className="pt-2 text-[10px] font-mono text-slate-400 group-hover:text-[#087EA4] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Visit Site</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {sponsorshipTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className={`p-6 sm:p-8 rounded-2xl border transition-all flex flex-col justify-between relative ${
                    tier.recommended
                      ? "bg-white border-[#087EA4] ring-2 ring-[#087EA4]/20 shadow-md"
                      : "bg-white border-slate-200 shadow-xs hover:border-slate-300"
                  }`}
                >
                  {tier.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#087EA4] text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-xs">
                      {tier.badge}
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-mono text-[#087EA4] font-bold block mb-1">
                      TIER // 0{idx + 1}
                    </span>
                    <h3 className="font-bold text-lg text-slate-900">
                      {tier.tier}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {tier.description}
                    </p>

                    <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block font-mono">
                        Key Package Inclusions:
                      </span>
                      {tier.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-[#19A974] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <Link
                      href={`/contact?subject=Sponsorship%20Inquiry%20${encodeURIComponent(tier.tier)}`}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold text-center block transition-all shadow-xs ${
                        tier.recommended
                          ? "bg-[#087EA4] hover:bg-[#07698a] text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      Inquire for {tier.tier.split(" ")[0]} →
                    </Link>
                  </div>
                </div>
              ))}
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
                Looking for tailored branding options such as badge sponsorship, VIP gala dinner hosting, or technical stage naming rights? Contact our partnership secretariat.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/contact?type=Sponsorship"
                className="px-6 py-3 rounded-lg bg-[#19A974] hover:bg-[#158f62] text-white text-xs font-semibold tracking-wide transition-colors flex items-center gap-2"
              >
                <span>CONTACT SECRETARIAT</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

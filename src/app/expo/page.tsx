import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  Zap,
  Building2,
  Users,
  Layers,
  Award,
  Clock,
  ShieldCheck,
  Check,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Expo Highlights & Experience | Himalayan Green Energy Expo 2027",
  description:
    "Explore exhibition pavilions, heavy machinery arenas, B2B matchmaking deal rooms, and daily technical showcases at Bhrikutimandap, Kathmandu.",
};

const pavilions = [
  {
    title: "Himalayan Hydro Machinery Pavilion",
    code: "HALL A · MAIN COMPLEX",
    description: "Massive turbine runner displays, hydro-mechanical gates, penstock pipes, digital governors, and heavy engineering systems.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    tags: ["Pelton & Francis Runners", "Inlet Valves", "SCADA Systems"],
  },
  {
    title: "400kV Grid & Substation Arena",
    code: "HALL B · ELECTRICAL PAVILION",
    description: "High-voltage GIS switchgear, power transformers, cross-border conductors, smart relays, and grid stabilization equipment.",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
    tags: ["GIS Switchgears", "Power Transformers", "Transmission Lines"],
  },
  {
    title: "Solar, Storage & Clean Tech Zone",
    code: "PAVILION C · RENEWABLE HUB",
    description: "Utility-scale solar PV, grid battery energy storage systems (BESS), green hydrogen electrolyzers, and commercial EV fleets.",
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    tags: ["Grid-scale BESS", "Solar PV Modules", "Hydrogen Stacks"],
  },
  {
    title: "B2B Deal Lounge & Investor Suites",
    code: "MEZZANINE · EXECUTIVE SUITES",
    description: "Dedicated high-level negotiation rooms for bilateral Power Purchase Agreements (PPAs), debt syndications, and joint venture MOUs.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    tags: ["Private Meeting Rooms", "MOU Signing Stage", "Investor Matchmaking"],
  },
];

const dailySchedule = [
  {
    day: "Day 01 · Friday, 16 January",
    theme: "Inauguration, Sovereign Plenary & Policy Framework",
    events: [
      { time: "09:00 AM", title: "Gates & Registration Open for Trade Delegates" },
      { time: "10:30 AM", title: "Official Ribbon-Cutting & VIP Exhibition Tour" },
      { time: "01:00 PM", title: "Networking Luncheon & B2B Matchmaking Launch" },
      { time: "03:00 PM", title: "Trilateral Cross-Border Power Trade Summit" },
      { time: "06:00 PM", title: "Exhibition Hall Closes for Day 1" },
    ],
  },
  {
    day: "Day 02 · Saturday, 17 January",
    theme: "Engineering Masterclasses, 400kV Grids & Heavy Tech",
    events: [
      { time: "09:30 AM", title: "Exhibition Hall Open to All Registered Visitors" },
      { time: "11:00 AM", title: "High-Head Turbine & Silt Erosion Technical Workshop" },
      { time: "02:30 PM", title: "Global OEM Live Product Demos & Technical Showcase" },
      { time: "04:30 PM", title: "Clean Energy Innovation & Safety Awards Ceremony" },
      { time: "06:00 PM", title: "Exhibition Hall Closes for Day 2" },
    ],
  },
  {
    day: "Day 03 · Sunday, 18 January",
    theme: "Project Financing, Green Hydrogen & Future Energy",
    events: [
      { time: "09:30 AM", title: "Exhibition Hall Open" },
      { time: "10:30 AM", title: "Multilateral Banking & $15B Debt Syndication Roundtables" },
      { time: "02:00 PM", title: "Green Hydrogen & Energy Storage Strategic Roadmap" },
      { time: "04:30 PM", title: "Closing Valedictory & Signing of Expo Declarations" },
      { time: "06:00 PM", title: "Official Expo Concludes" },
    ],
  },
];

export default function ExpoPage() {
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
            <span className="text-[#34D399]">Expo</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Expo Highlights & Experience
              </h1>
              <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-xl">
                Bhrikutimandap Exhibition Complex, Kathmandu · 16–18 January 2027
              </p>

              {/* Quick Metrics */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-100/80">
                <span className="px-2.5 py-1 rounded bg-emerald-900/60 border border-emerald-500/30">
                  150+ Exhibitors
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-900/60 border border-emerald-500/30">
                  300+ Stalls
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-900/60 border border-emerald-500/30">
                  4 Pavilions
                </span>
                <span className="px-2.5 py-1 rounded bg-[#10B981]/25 text-[#34D399] border border-[#10B981]/50 font-bold">
                  10,000+ Visitors
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-slate-950 hover:text-white text-xs font-black flex items-center gap-2 transition-colors shadow-md"
              >
                <span>Register Free Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/floor-plan"
                className="px-5 py-2.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/60 border border-emerald-500/30 text-white font-mono text-xs font-bold transition-all"
              >
                Floor Plan
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02: MAIN EXPO EXPERIENCE CONTENT
         ========================================================================= */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* Section 1: Major Expo Pavilions */}
          <div>
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold text-[#087EA4] uppercase tracking-wider block mb-1 font-mono">
                EXHIBITION ZONES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured Thematic Pavilions
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Explore specialized display areas bringing together leading international OEMs, EPC builders, and innovators.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {pavilions.map((pav, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-[#087EA4]/40 transition-all flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full bg-slate-100">
                    <Image
                      src={pav.image}
                      alt={pav.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#061A2A]/90 backdrop-blur-md text-white text-[10px] font-mono font-bold">
                      {pav.code}
                    </div>
                  </div>

                  <div className="p-5 space-y-2 flex-grow">
                    <h3 className="font-bold text-base text-slate-900">
                      {pav.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {pav.description}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {pav.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Daily Expo Timetable */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold text-[#087EA4] uppercase tracking-wider block mb-1 font-mono">
                EVENT SCHEDULE
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Daily Expo Timetable & Milestones
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Overview of daily hall opening, ribbon-cutting ceremonies, B2B deal hours, and keynote summits.
              </p>
            </div>

            <div className="space-y-6">
              {dailySchedule.map((d, dIdx) => (
                <div
                  key={dIdx}
                  className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/80 pb-2">
                    <h4 className="font-bold text-sm text-slate-900">
                      {d.day}
                    </h4>
                    <span className="text-xs font-medium text-[#087EA4]">
                      {d.theme}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {d.events.map((ev, evIdx) => (
                      <div key={evIdx} className="flex items-center gap-2 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-[#087EA4] shrink-0" />
                        <span className="font-mono font-semibold text-slate-900 shrink-0">
                          {ev.time}:
                        </span>
                        <span>{ev.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Callout Banner */}
          <div className="bg-[#061A2A] text-white p-8 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">
                Visit the Exhibition Free of Charge
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Pre-register online to receive your personalized digital visitor badge and skip the entry registration queues at the venue.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/register"
                className="px-6 py-3 rounded-lg bg-[#19A974] hover:bg-[#158f62] text-white text-xs font-semibold tracking-wide transition-colors flex items-center gap-2"
              >
                <span>GET FREE VISITOR PASS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

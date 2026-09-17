"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const committeeMembers = [
  {
    name: "Mr. Mohan Kumar Dangi",
    title: "President, IPPAN",
    photo: "/images/committee/mohan-kumar-dangi.png",
  },
  {
    name: "Mr. Uttam Bhlon Lama",
    title: "Senior Vice President, IPPAN",
    photo: "/images/committee/uttam-bhlon-lama.jpg",
  },
  {
    name: "Mr. Bikram Bista",
    title: "Vice President, IPPAN",
    photo: "/images/committee/bikram-bista.png",
  },
  {
    name: "Mr. Him Prasad Pathak",
    title: "Vice President, IPPAN",
    photo: "/images/committee/him-prasad-pathak.png",
  },
  {
    name: "Mr. Narendra Ballav Panth",
    title: "Vice President, IPPAN",
    photo: "/images/committee/narendra-ballav-panth.png",
  },
  {
    name: "Ms. Susan Karmacharya",
    title: "Vice President, IPPAN",
    photo: "/images/committee/susan-karmacharya.png",
  },
];

const editions = [
  {
    year: "2018",
    edition: "1ST EDITION",
    image: "/images/gallery/2018/IMG_0005.webp",
    desc: "Inaugural gathering of Nepal's independent hydropower developers — the beginning of an annual industry platform.",
  },
  {
    year: "2019",
    edition: "2ND EDITION",
    image: "/images/gallery/2019/IMG_0030.webp",
    desc: "International technology pavilions expanded. Chinese, Indian and European OEMs joined Nepal's growing energy floor.",
  },
  {
    year: "2022",
    edition: "3RD EDITION",
    image: "/images/gallery/2022/DSC_6305.webp",
    desc: "Post-pandemic return marked a surge in energy sector investment interest and regional trade discussions.",
  },
  {
    year: "2024",
    edition: "4TH EDITION",
    image: "/images/WhatsApp Image 2026-08-27 at 06.52.06.jpeg",
    desc: "Ministerial plenary, tri-nation power export framework discussions, and 250+ exhibitors across 3 days.",
  },
];


const ecosystem = [
  "IPP / DEVELOPERS", "EQUIPMENT OEMs", "EPC CONTRACTORS", "PROJECT FINANCE",
  "GOVERNMENT", "UTILITIES / NEA", "TECHNOLOGY", "INVESTORS",
  "CONSULTANTS", "INTERNATIONAL PARTNERS", "CONSTRUCTION", "ENGINEERING",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen font-sans text-[#061A2A] overflow-x-hidden">

      {/* =========================================================================
          01: CLEAN HEADER BANNER (GREEN THEME — MATCHING ALL PAGES)
         ========================================================================= */}
      <div className="bg-[#04281E] text-white pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-300/70 font-mono mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#34D399]">About</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                About The Expo
              </h1>
              <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-xl">
                Bhrikutimandap Exhibition Complex, Kathmandu · 16–18 January 2027
              </p>

              {/* Quick Metrics */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-100/80">
                <span className="px-2.5 py-1 rounded bg-emerald-900/60 border border-emerald-500/30">
                  5th Edition
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-900/60 border border-emerald-500/30">
                  150+ Exhibitors
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-900/60 border border-emerald-500/30">
                  12 Plenaries
                </span>
                <span className="px-2.5 py-1 rounded bg-[#10B981]/25 text-[#34D399] border border-[#10B981]/50 font-bold">
                  10,000+ Delegates
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-slate-950 text-xs font-black flex items-center gap-2 transition-colors shadow-md"
              >
                <span>Register Badge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/book-stall"
                className="px-5 py-2.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/60 border border-emerald-500/30 text-white font-mono text-xs font-bold transition-all"
              >
                Book a Stall
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          02 — WHY THE EXPO: WHITE EDITORIAL
         ===================================================================== */}
      <section className="bg-white py-20 sm:py-28 px-4 sm:px-10 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Large statement */}
          <div className="space-y-6">
            <p className="text-[11px] font-mono font-bold text-[#10B981] uppercase tracking-[0.2em]">02 / WHY HIMALAYAN GREEN ENERGY EXPO</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#061A2A] leading-tight tracking-tight">
              RESILIENT ENERGY,<br />
              <span className="text-[#10B981]">PROSPEROUS NEPAL.</span>
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-[#061A2A]/50 leading-snug">
              Building an energy future that is sustainable and disaster-resilient.
            </p>
          </div>

          {/* Right: Editorial paragraphs grounded in official background */}
          <div className="space-y-5 text-sm sm:text-base text-slate-600 leading-relaxed border-l-2 border-slate-100 pl-8">
            <p>
              Nepal&apos;s energy sector is entering a pivotal phase. Hydropower capacity has grown to approximately 4,145.7 MW, with a national target of 30,000 MW by 2035 — expanding beyond domestic power needs toward industrial growth, electric mobility, renewable energy, and cross-border power trade with India and Bangladesh.
            </p>
            <p>
              But this growth is now being tested. Recent flash floods and debris flows have damaged hydropower projects across the country, exposing the vulnerability of energy infrastructure to climate-related disasters. The sector&apos;s future depends not only on scaling capacity, but on building it to withstand a changing climate.
            </p>
            <p>
              Since 2018, the Himalayan Hydro Expo has connected key stakeholders across four editions through 2024. Himalayan Green Energy Expo 2027 marks the next chapter, expanding this established platform into a broader green-energy forum, while placing resilience at the center of the conversation.
            </p>
          </div>
        </div>

        {/* Full-width editorial image */}
        <div className="max-w-6xl mx-auto mt-14">
          <div className="relative h-72 sm:h-96 lg:h-[480px] rounded-3xl overflow-hidden">
            <Image
              src="/images/gallery/2022/FOTO5680.webp"
              alt="Expo visitors and exhibitors on the floor"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061A2A]/60 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest bg-[#061A2A]/70 px-3 py-1 rounded-full border border-emerald-500/30">
                BHRIKUTIMANDAP · KATHMANDU
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          03 — NEPAL'S ENERGY JOURNEY: 3 MILESTONE CARDS
         ===================================================================== */}
      <section className="bg-[#03160F] py-20 sm:py-28 px-4 sm:px-10 lg:px-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image src="/images/background/5.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-[#03160F]/85" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-4 max-w-3xl">
            <p className="text-[11px] font-mono font-bold text-[#34D399] uppercase tracking-[0.2em]">03 / NEPAL&apos;S ENERGY JOURNEY</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              A COUNTRY<br />
              <span className="text-[#34D399]">POWERING</span> FORWARD.
            </h2>
            <p className="text-sm text-emerald-100/70 leading-relaxed">
              From the historic 500 kW origin to sovereign cross-border power syndication across South Asia.
            </p>
          </div>

          {/* 3 Milestone Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: 1911 AD */}
            <div className="relative rounded-3xl overflow-hidden min-h-[420px] border border-emerald-500/20 bg-emerald-950/40 p-6 sm:p-7 flex flex-col justify-between group shadow-xl">
              <Image
                src="/images/hydro_1911.jpg"
                alt="1911 Pharping Hydropower Genesis"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-45"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03160F] via-[#03160F]/70 to-transparent" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-[#087EA4] text-white font-mono text-xs font-black shadow-md border border-[#38BDF8]">
                  1911 AD
                </span>
                <span className="px-2 py-0.5 rounded-md bg-black/40 text-slate-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-white/10">
                  HISTORIC ORIGIN
                </span>
              </div>

              <div className="relative z-10 space-y-2 text-white">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black font-sans text-[#38BDF8]">0.5</span>
                  <span className="text-xs font-mono font-bold text-slate-300 px-2 py-0.5 rounded bg-white/10 border border-white/15">MW</span>
                </div>
                <h3 className="font-bold text-lg text-white">Pharping Powerhouse</h3>
                <p className="text-xs text-emerald-100/70 leading-relaxed">
                  Nepal&apos;s clean energy journey commenced in 1911 AD with the commissioning of the 500 kW Pharping powerhouse, Asia&apos;s second hydropower plant.
                </p>
              </div>
            </div>

            {/* Card 2: 2035 AD Target (Existing 4,145 MW) */}
            <div className="relative rounded-3xl overflow-hidden min-h-[420px] border-2 border-[#10B981] bg-emerald-950/50 p-6 sm:p-7 flex flex-col justify-between group shadow-xl ring-2 ring-[#10B981]/20">
              <Image
                src="/images/illustrations/solar_hydro_hybrid.jpg"
                alt="2035 Clean Power Target"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03160F] via-[#03160F]/70 to-transparent" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-[#059669] text-white font-mono text-xs font-black shadow-md border border-[#34D399]">
                  2035 AD
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-[#34D399] font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  NATIONAL TARGET
                </span>
              </div>

              <div className="relative z-10 space-y-2 text-white">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black font-sans text-[#34D399]">30,000</span>
                  <span className="text-xs font-mono font-bold text-slate-300 px-2 py-0.5 rounded bg-white/10 border border-white/15">MW</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm text-xs font-mono">
                  <span className="text-slate-300">Existing Installed:</span>
                  <span className="text-[#38BDF8] font-bold">4,145.7 MW</span>
                </div>

                <h3 className="font-bold text-lg text-white">Sovereign Clean Power Target</h3>
                <p className="text-xs text-emerald-100/70 leading-relaxed">
                  Scaling from 4,145.7 MW existing capacity towards the 30,000 MW national target by 2035 AD — expanding beyond domestic power needs toward industrial growth, e-mobility, and regional power trade.
                </p>
              </div>
            </div>

            {/* Card 3: 2035 AD Allocation (India 10k, Bangladesh 5k, Domestic 13.5k) */}
            <div className="relative rounded-3xl overflow-hidden min-h-[420px] border border-emerald-500/20 bg-emerald-950/40 p-6 sm:p-7 flex flex-col justify-between group shadow-xl">
              <Image
                src="/images/illustrations/transmission_grid_substation.jpg"
                alt="Regional Power Trade"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03160F] via-[#03160F]/70 to-transparent" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-[#04281E] text-[#34D399] font-mono text-xs font-black shadow-md border border-[#34D399]/40">
                  2035 AD
                </span>
                <span className="px-2 py-0.5 rounded-md bg-black/40 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                  ALLOCATION BREAKDOWN
                </span>
              </div>

              <div className="relative z-10 space-y-2 text-white">
                <h3 className="font-bold text-base text-white">Power Flow & Regional Trade</h3>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-xs">
                    <span className="text-slate-200 font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                      India Export
                    </span>
                    <span className="font-mono font-black text-[#38BDF8]">10,000 MW</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-xs">
                    <span className="text-slate-200 font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                      Bangladesh Export
                    </span>
                    <span className="font-mono font-black text-[#34D399]">5,000 MW</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-xs">
                    <span className="text-slate-200 font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Domestic Demand
                    </span>
                    <span className="font-mono font-black text-amber-300">15,000 MW</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          04 — JOURNEY OF THE EXPO: WHITE + HISTORICAL PHOTOS
         ===================================================================== */}
      <section className="bg-[#F8FAFB] py-20 sm:py-28 px-4 sm:px-10 lg:px-20">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-8">
            <div className="space-y-3">
              <p className="text-[11px] font-mono font-bold text-[#087EA4] uppercase tracking-[0.2em]">04 / THE JOURNEY OF THE EXPO</p>
              <h2 className="text-4xl sm:text-5xl font-black text-[#061A2A] leading-tight tracking-tight">
                FOUR EDITIONS.<br />ONE JOURNEY.
              </h2>
            </div>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#087EA4] hover:text-[#061A2A] transition-colors uppercase tracking-wider shrink-0"
            >
              <span>View Photo Gallery</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Edition cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {editions.map((ed) => (
              <div key={ed.year} className="group flex flex-col">
                {/* Photo */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200">
                  <Image
                    src={ed.image}
                    alt={`${ed.edition} — ${ed.year}`}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061A2A] via-[#061A2A]/30 to-transparent" />
                  {/* Year badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-md bg-[#061A2A]/80 backdrop-blur-sm text-white font-mono text-[10px] font-bold">
                      {ed.year}
                    </span>
                  </div>
                  {/* Edition label at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[10px] font-mono font-bold text-[#34D399] uppercase tracking-widest mb-1">{ed.edition}</p>
                    <p className="text-xs text-white/85 leading-snug">{ed.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 5th Edition teaser — official announcement card with press_meet banner */}
          <div className="rounded-3xl bg-gradient-to-br from-[#03160F] via-[#04281E] to-[#02130C] border border-emerald-500/30 p-8 sm:p-12 relative overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-6 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-[#34D399] font-mono text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                  <span>2027 · THE 5TH MILESTONE</span>
                </div>
                <h3 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                  RESILIENT ENERGY, <br />
                  <span className="text-[#34D399]">PROSPEROUS NEPAL.</span>
                </h3>
                <p className="text-sm text-emerald-100/80 leading-relaxed max-w-lg">
                  17th–19th January 2027 (Magh 3–5, 2083) at Bhrikutimandap Exhibition Complex, Kathmandu. Jointly organized by IPPAN and Event Solution, spotlighting Green Hydrogen, Solar, Wind, EV, and Alternative Clean Energy.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    href="/register"
                    className="px-5 py-2.5 rounded-full bg-[#10B981] hover:bg-[#059669] text-slate-950 font-mono text-xs font-black tracking-wider transition-all shadow-md inline-flex items-center gap-2"
                  >
                    <span>REGISTER AS VISITOR</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/news"
                    className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold tracking-wider transition-all border border-white/20"
                  >
                    <span>READ PRESS RELEASE</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl group">
                  <Image
                    src="/images/press_meet.jpeg"
                    alt="Himalayan Green Energy Expo 2027 Official Press Meet Banner"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-left">
                    <span className="text-[10px] font-mono text-[#34D399] uppercase font-bold tracking-wider block">OFFICIAL PRESS MEET CREATIVE</span>
                    <span className="text-xs text-white font-medium">Bhrikutimandap, Kathmandu · IPPAN × Event Solution</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          05 — WHAT THE EXPO CONNECTS: DARK + ECOSYSTEM
         ===================================================================== */}
      <section className="bg-[#061A2A] py-20 sm:py-28 px-4 sm:px-10 lg:px-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/gallery/2022/FOTO6112.webp" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-[#061A2A]/80" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <p className="text-[11px] font-mono font-bold text-[#34D399] uppercase tracking-[0.2em]">05 / WHAT THE EXPO CONNECTS</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              ONE PLATFORM.<br />
              <span className="text-[#34D399]">AN ENTIRE INDUSTRY.</span>
            </h2>
          </div>

          {/* Centre hub + surrounding tags */}
          <div className="relative flex items-center justify-center py-4">
            {/* Hub */}
            <div className="relative z-10 flex flex-col items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-[#10B981] bg-[#04281E] shadow-2xl shadow-emerald-900/50 p-3">
              <p className="text-[10px] font-mono font-bold text-[#34D399] uppercase tracking-widest text-center leading-tight">
                HIMALAYAN<br />GREEN ENERGY<br />EXPO
              </p>
            </div>

            {/* Radial ring of tags — hidden on mobile, visible on md+ */}
            <div className="absolute inset-0 hidden md:block">
              {ecosystem.map((item, idx) => {
                const angle = (idx / ecosystem.length) * 2 * Math.PI - Math.PI / 2;
                const radius = 210;
                const x = 50 + (radius / 5) * Math.cos(angle);
                const y = 50 + (radius / 5) * Math.sin(angle);
                return (
                  <div
                    key={item}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-emerald-200/80 uppercase tracking-wider whitespace-nowrap hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all cursor-default">
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: simple tag cloud */}
          <div className="md:hidden flex flex-wrap justify-center gap-2 pt-4">
            {ecosystem.map((item) => (
              <span
                key={item}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-emerald-200/80 uppercase tracking-wider"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          06 — THE EXPERIENCE: WHITE + EVENT PHOTOS
         ===================================================================== */}
      <section className="bg-white py-20 sm:py-28 px-4 sm:px-10 lg:px-20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-3">
            <p className="text-[11px] font-mono font-bold text-[#087EA4] uppercase tracking-[0.2em]">06 / THE EXPERIENCE</p>
            <h2 className="text-4xl sm:text-5xl font-black text-[#061A2A] leading-tight tracking-tight">
              MORE THAN<br />AN EXHIBITION.
            </h2>
          </div>

          {/* Main large image + 4 editorial blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Big photo */}
            <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-full min-h-[360px] rounded-3xl overflow-hidden">
              <Image
                src="/images/WhatsApp Image 2026-08-27 at 06.52.07.jpeg"
                alt="VIP delegation on exhibition floor"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061A2A]/60 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <span className="text-[10px] font-mono text-emerald-300 bg-[#061A2A]/75 px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-widest">
                  EXHIBITION FLOOR · 2024
                </span>
              </div>
            </div>

            {/* 4 editorial blocks */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              {[
                { label: "EXHIBITION", desc: "Explore technologies, equipment and solutions from across the industry.", img: "/images/gallery/2022/DSC_6546.webp" },
                { label: "CONFERENCE", desc: "Hear from industry leaders, engineers and policymakers across 12 plenaries.", img: "/images/WhatsApp Image 2026-08-27 at 06.52.06.jpeg" },
                { label: "NETWORKING", desc: "Meet the people behind Nepal's energy ecosystem.", img: "/images/gallery/2022/DSC_6648.webp" },
                { label: "BUSINESS", desc: "Build partnerships and discover new opportunities.", img: "/images/WhatsApp Image 2026-08-27 at 06.52.07 (1).jpeg" },
              ].map((block) => (
                <div key={block.label} className="relative rounded-2xl overflow-hidden group h-44 sm:h-52">
                  <Image
                    src={block.img}
                    alt={block.label}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061A2A] via-[#061A2A]/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-[10px] font-mono font-bold text-[#34D399] uppercase tracking-widest">{block.label}</p>
                    <p className="text-[11px] text-white/80 leading-snug mt-0.5">{block.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          07 — IPPAN × EVENT SOLUTION: DEEP GREEN
         ===================================================================== */}
      <section className="bg-[#04281E] py-20 sm:py-28 px-4 sm:px-10 lg:px-20 border-t border-emerald-500/15">
        <div className="max-w-5xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <p className="text-[11px] font-mono font-bold text-[#34D399] uppercase tracking-[0.2em]">07 / THE ORGANIZERS</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              POWERED BY INDUSTRY.<br />
              <span className="text-[#34D399]">DELIVERED WITH EXPERIENCE.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 items-center">
            {/* IPPAN */}
            <div className="lg:col-span-5 p-8 rounded-3xl bg-emerald-900/30 border border-emerald-500/20 space-y-5">
              <div className="relative h-12 w-32">
                <Image src="/ippan.png" alt="IPPAN" fill className="object-contain object-left" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-[#34D399] uppercase tracking-widest mb-2">INDUSTRY KNOWLEDGE</p>
                <h3 className="text-lg font-bold text-white mb-3">
                  Independent Power Producers&apos; Association, Nepal
                </h3>
                <p className="text-sm text-emerald-100/70 leading-relaxed">
                  IPPAN represents Nepal&apos;s private clean energy developers — the companies building the projects that are transforming the country&apos;s energy future. The association brings sectoral authority, government relationships and industry credibility to Himalayan Hydro Expo.
                </p>
              </div>
              <a href="https://ippan.org.np" target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-bold text-[#34D399] hover:underline inline-flex items-center gap-1">
                ippan.org.np <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            {/* Divider × */}
            <div className="lg:col-span-1 flex items-center justify-center">
              <span className="text-4xl font-black text-emerald-500/40">×</span>
            </div>

            {/* Event Solution */}
            <div className="lg:col-span-5 p-8 rounded-3xl bg-emerald-900/30 border border-emerald-500/20 space-y-5">
              <div className="relative h-12 w-40">
                <Image src="/event_solution.png" alt="Event Solution" fill className="object-contain object-left" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-[#34D399] uppercase tracking-widest mb-2">EVENT EXECUTION</p>
                <h3 className="text-lg font-bold text-white mb-3">
                  Event Solution Pvt. Ltd.
                </h3>
                <p className="text-sm text-emerald-100/70 leading-relaxed">
                  Event Solution is Nepal&apos;s leading professional exhibition management company — handling international pavilions, stall fabrication, audiovisual systems, logistics and complete on-ground operations across four editions of the expo.
                </p>
              </div>
              <a href="https://eventsolutionnepal.com.np" target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-bold text-[#34D399] hover:underline inline-flex items-center gap-1">
                eventsolutionnepal.com.np <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          08 — ORGANIZING COMMITTEE: WHITE + PEOPLE
         ===================================================================== */}
      <section className="bg-white py-20 sm:py-28 px-4 sm:px-10 lg:px-20">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-8">
            <div className="space-y-3">
              <p className="text-[11px] font-mono font-bold text-[#087EA4] uppercase tracking-[0.2em]">08 / THE PEOPLE</p>
              <h2 className="text-4xl sm:text-5xl font-black text-[#061A2A] leading-tight tracking-tight">
                THE PEOPLE<br />BEHIND THE PLATFORM.
              </h2>
            </div>
            <Link
              href="/speakers"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#087EA4] hover:text-[#061A2A] transition-colors uppercase tracking-wider shrink-0"
            >
              <span>View Full Committee</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {committeeMembers.map((person) => (
              <div key={person.name} className="group text-center">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 mb-3">
                  <Image
                    src={person.photo}
                    alt={person.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061A2A]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs font-bold text-[#061A2A] leading-snug">{person.name}</p>
                <p className="text-[10px] font-mono text-[#087EA4] mt-0.5">{person.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          09 — THE 5TH EDITION: DARK
         ===================================================================== */}
      <section className="relative py-28 sm:py-40 px-4 sm:px-10 lg:px-20 overflow-hidden min-h-[80vh] flex items-center justify-center">
        {/* Full-bleed background */}
        <div className="absolute inset-0">
          <Image
            src="/images/background/22.jpg"
            alt="Himalayan hydropower backdrop"
            fill
            className="object-cover object-center"
          />
          {/* Deep overlay: dark green tint so text pops */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#03160F]/90 via-[#04281E]/80 to-[#03160F]/95" />
          {/* Subtle emerald glow from bottom */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36">
              <Image
                src="/images/logo.jpeg"
                alt="Himalayan Green Energy Expo"
                fill
                className="object-contain drop-shadow-[0_0_40px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>

          {/* Expo full name */}
          <p className="text-xs sm:text-sm font-mono font-bold text-[#34D399] uppercase tracking-[0.3em]">
            Himalayan Green Energy Expo
          </p>

          <p className="text-[11px] font-mono text-emerald-300/60 uppercase tracking-[0.2em]">
            2027 / 5TH EDITION
          </p>

          <h2 className="text-5xl sm:text-7xl font-black text-white leading-[1.0] tracking-tight">
            THE NEXT<br />
            <span className="text-[#34D399]">CHAPTER</span><br />
            STARTS HERE.
          </h2>

          <div className="flex flex-wrap justify-center gap-3 text-xs font-mono text-emerald-200/70">
            <span className="px-4 py-2 rounded-xl bg-emerald-900/50 border border-emerald-500/25 backdrop-blur-sm">16–18 JANUARY 2027</span>
            <span className="px-4 py-2 rounded-xl bg-emerald-900/50 border border-emerald-500/25 backdrop-blur-sm">KATHMANDU, NEPAL</span>
            <span className="px-4 py-2 rounded-xl bg-emerald-900/50 border border-emerald-500/25 backdrop-blur-sm">5TH EDITION</span>
          </div>

          <p className="text-sm sm:text-base text-emerald-100/70 max-w-xl mx-auto leading-relaxed">
            Under the theme <strong className="text-white">&ldquo;Resilient Energy, Prosperous Nepal,&rdquo;</strong> the fifth edition marks the next chapter — uniting clean energy innovation, sustainable infrastructure, and disaster resilience to power Nepal and the region.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/expo"
              className="px-8 py-3.5 rounded-xl bg-emerald-900/60 border border-emerald-500/30 text-white font-mono text-xs font-bold hover:bg-emerald-800/70 transition-all backdrop-blur-sm"
            >
              EXPLORE THE 5TH EDITION
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 font-mono text-xs font-black transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              REGISTER NOW
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}


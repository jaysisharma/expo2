"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import defaultAboutData from "@/data/aboutPageData.json";

export default function AboutPage() {
  const [data, setData] = useState<any>(defaultAboutData);

  useEffect(() => {
    async function loadDynamicAbout() {
      try {
        const res = await fetch("/api/about");
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.warn("Using fallback default about data:", err);
      }
    }
    loadDynamicAbout();
  }, []);

  const {
    header,
    whyExpo,
    energyJourney,
    journeyExpo,
    ecosystemSection,
    experienceSection,
    organizersSection,
    peopleSection,
    fifthEditionDark,
  } = data || defaultAboutData;

  const ecosystemItems: string[] = ecosystemSection?.items || defaultAboutData.ecosystemSection.items;

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
                {header?.title || "About The Expo"}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-xl">
                {header?.subtitle || "Bhrikutimandap Exhibition Hall, Kathmandu · 17–19 January 2027"}
              </p>

              {/* Quick Metrics */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-100/80">
                {(header?.metrics || []).map((m: any, idx: number) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded ${
                      m.isHighlighted
                        ? "bg-[#10B981]/25 text-[#34D399] border border-[#10B981]/50 font-bold"
                        : "bg-emerald-900/60 border border-emerald-500/30"
                    }`}
                  >
                    {m.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-lg bg-[#007A5E] hover:bg-[#005C42] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <span>{header?.ctaRegisterText || "Register Badge"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/book-stall"
                className="px-5 py-2.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/60 border border-emerald-500/30 text-white font-mono text-xs font-bold transition-all"
              >
                {header?.ctaStallText || "Book a Stall"}
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
            <p className="text-[11px] font-mono font-bold text-[#10B981] uppercase tracking-[0.2em]">
              {whyExpo?.badge || "02 / WHY HIMALAYAN GREEN ENERGY EXPO"}
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#061A2A] leading-tight tracking-tight">
              {whyExpo?.titleLine1 || "RESILIENT ENERGY,"}<br />
              <span className="text-[#10B981]">{whyExpo?.titleLine2 || "PROSPEROUS NEPAL."}</span>
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-[#061A2A]/50 leading-snug">
              {whyExpo?.substatement || "Building an energy future that is sustainable and disaster-resilient."}
            </p>
          </div>

          {/* Right: Editorial paragraphs grounded in official background */}
          <div className="space-y-5 text-sm sm:text-base text-slate-600 leading-relaxed border-l-2 border-slate-100 pl-8">
            {(whyExpo?.paragraphs || []).map((para: string, idx: number) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>

        {/* Full-width editorial image */}
        {whyExpo?.featureImage && (
          <div className="max-w-6xl mx-auto mt-14">
            <div className="relative h-72 sm:h-96 lg:h-[480px] rounded-3xl overflow-hidden">
              <Image
                src={whyExpo.featureImage}
                alt="Expo visitors and exhibitors on the floor"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061A2A]/60 to-transparent" />
              {whyExpo?.featureCaption && (
                <div className="absolute bottom-6 left-6">
                  <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest bg-[#061A2A]/70 px-3 py-1 rounded-full border border-emerald-500/30">
                    {whyExpo.featureCaption}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================================
          03 — NEPAL'S ENERGY JOURNEY: 3 MILESTONE CARDS
         ===================================================================== */}
      <section className="bg-[#03160F] py-20 sm:py-28 px-4 sm:px-10 lg:px-20 relative overflow-hidden">
        {energyJourney?.backgroundImage && (
          <div className="absolute inset-0 opacity-20">
            <Image src={energyJourney.backgroundImage} alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-[#03160F]/85" />
          </div>
        )}

        <div className="relative z-10 max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-4 max-w-3xl">
            <p className="text-[11px] font-mono font-bold text-[#34D399] uppercase tracking-[0.2em]">
              {energyJourney?.badge || "03 / NEPAL'S ENERGY JOURNEY"}
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              {energyJourney?.titleLine1 || "A COUNTRY"}<br />
              <span className="text-[#34D399]">{energyJourney?.titleLine2 || "POWERING FORWARD."}</span>
            </h2>
            <p className="text-sm text-emerald-100/70 leading-relaxed">
              {energyJourney?.description || "From the historic 500 kW origin to sovereign cross-border power syndication across South Asia."}
            </p>
          </div>

          {/* 3 Milestone Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: 1911 AD */}
            {energyJourney?.card1 && (
              <div className="relative rounded-3xl overflow-hidden min-h-[420px] border border-emerald-500/20 bg-emerald-950/40 p-6 sm:p-7 flex flex-col justify-between group shadow-xl">
                {energyJourney.card1.image && (
                  <Image
                    src={energyJourney.card1.image}
                    alt={energyJourney.card1.title || "1911 Pharping Hydropower"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-45"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#03160F] via-[#03160F]/70 to-transparent" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-[#087EA4] text-white font-mono text-xs font-bold shadow-md border border-[#38BDF8]">
                    {energyJourney.card1.year}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-black/40 text-slate-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-white/10">
                    {energyJourney.card1.badge}
                  </span>
                </div>

                <div className="relative z-10 space-y-2 text-white">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-bold font-sans text-[#38BDF8]">
                      {energyJourney.card1.capacity}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300 px-2 py-0.5 rounded bg-white/10 border border-white/15">
                      {energyJourney.card1.capacityUnit || "MW"}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-white">{energyJourney.card1.title}</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    {energyJourney.card1.description}
                  </p>
                </div>
              </div>
            )}

            {/* Card 2: 2035 AD Target */}
            {energyJourney?.card2 && (
              <div className="relative rounded-3xl overflow-hidden min-h-[420px] border-2 border-[#10B981] bg-emerald-950/50 p-6 sm:p-7 flex flex-col justify-between group shadow-xl ring-2 ring-[#10B981]/20">
                {energyJourney.card2.image && (
                  <Image
                    src={energyJourney.card2.image}
                    alt={energyJourney.card2.title || "2035 Clean Power Target"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-55"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#03160F] via-[#03160F]/65 to-transparent" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-[#059669] text-white font-mono text-xs font-bold shadow-md border border-[#34D399]">
                    {energyJourney.card2.year}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-[#34D399] font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                    {energyJourney.card2.badge}
                  </span>
                </div>

                <div className="relative z-10 space-y-2 text-white">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-bold font-sans text-[#34D399]">
                      {energyJourney.card2.targetCapacity}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300 px-2 py-0.5 rounded bg-white/10 border border-white/15">
                      MW
                    </span>
                  </div>

                  {energyJourney.card2.installedCapacity && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm text-xs font-mono">
                      <span className="text-slate-300">Existing Installed:</span>
                      <span className="text-[#38BDF8] font-bold">{energyJourney.card2.installedCapacity}</span>
                    </div>
                  )}

                  <h3 className="font-bold text-lg text-white">{energyJourney.card2.title}</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    {energyJourney.card2.description}
                  </p>
                </div>
              </div>
            )}

            {/* Card 3: 2035 AD Regional Trade Allocation */}
            {energyJourney?.card3 && (
              <div className="relative rounded-3xl overflow-hidden min-h-[420px] border border-emerald-500/20 bg-emerald-950/40 p-6 sm:p-7 flex flex-col justify-between group shadow-xl">
                {energyJourney.card3.image && (
                  <Image
                    src={energyJourney.card3.image}
                    alt={energyJourney.card3.title || "Regional Power Trade"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-55"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#03160F] via-[#03160F]/65 to-transparent" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-[#04281E] text-[#34D399] font-mono text-xs font-bold shadow-md border border-[#34D399]/40">
                    {energyJourney.card3.year}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-black/40 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                    {energyJourney.card3.badge}
                  </span>
                </div>

                <div className="relative z-10 space-y-2 text-white">
                  <h3 className="font-bold text-base text-white">{energyJourney.card3.title}</h3>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-xs">
                      <span className="text-slate-200 font-mono flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                        India Export
                      </span>
                      <span className="font-mono font-bold text-[#38BDF8]">{energyJourney.card3.indiaExport}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-xs">
                      <span className="text-slate-200 font-mono flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                        Bangladesh Export
                      </span>
                      <span className="font-mono font-bold text-[#34D399]">{energyJourney.card3.bangladeshExport}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-xs">
                      <span className="text-slate-200 font-mono flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        Domestic Demand
                      </span>
                      <span className="font-mono font-bold text-amber-300">{energyJourney.card3.domesticDemand}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              <p className="text-[11px] font-mono font-bold text-[#087EA4] uppercase tracking-[0.2em]">
                {journeyExpo?.badge || "04 / THE JOURNEY OF THE EXPO"}
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-[#061A2A] leading-tight tracking-tight">
                {journeyExpo?.titleLine1 || "FOUR EDITIONS."}<br />
                {journeyExpo?.titleLine2 || "ONE JOURNEY."}
              </h2>
            </div>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#087EA4] hover:text-[#061A2A] transition-colors uppercase tracking-wider shrink-0"
            >
              <span>{journeyExpo?.galleryLinkText || "View Photo Gallery"}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Edition cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(journeyExpo?.editions || []).map((ed: any, idx: number) => (
              <div key={idx} className="group flex flex-col">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200">
                  {ed.image && (
                    <Image
                      src={ed.image}
                      alt={`${ed.edition} — ${ed.year}`}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061A2A] via-[#061A2A]/30 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-md bg-[#061A2A]/80 backdrop-blur-sm text-white font-mono text-[10px] font-bold">
                      {ed.year}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[10px] font-mono font-bold text-[#34D399] uppercase tracking-widest mb-1">
                      {ed.edition}
                    </p>
                    <p className="text-xs text-white/85 leading-snug">{ed.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 5th Edition teaser — official announcement card */}
          {journeyExpo?.milestoneCard && (
            <div className="rounded-3xl bg-gradient-to-br from-[#03160F] via-[#04281E] to-[#02130C] border border-emerald-500/30 p-8 sm:p-12 relative overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-6 space-y-4 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-[#34D399] font-mono text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                    <span>{journeyExpo.milestoneCard.badge}</span>
                  </div>
                  <h3 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
                    {journeyExpo.milestoneCard.titleLine1} <br />
                    <span className="text-[#34D399]">{journeyExpo.milestoneCard.titleLine2}</span>
                  </h3>
                  <p className="text-sm text-emerald-100/80 leading-relaxed max-w-lg">
                    {journeyExpo.milestoneCard.description}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <Link
                      href="/register"
                      className="px-5 py-2.5 rounded-full bg-[#007A5E] hover:bg-[#005C42] text-white font-mono text-xs font-bold tracking-wider transition-all shadow-md inline-flex items-center gap-2"
                    >
                      <span>{journeyExpo.milestoneCard.button1Text || "REGISTER AS VISITOR"}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/news"
                      className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold tracking-wider transition-all border border-white/20"
                    >
                      <span>{journeyExpo.milestoneCard.button2Text || "READ PRESS RELEASE"}</span>
                    </Link>
                  </div>
                </div>

                {journeyExpo.milestoneCard.bannerImage && (
                  <div className="lg:col-span-6">
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl group">
                      <Image
                        src={journeyExpo.milestoneCard.bannerImage}
                        alt="Himalayan Green Energy Expo 2027 Official Press Meet Banner"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-left">
                        <span className="text-[10px] font-mono text-[#34D399] uppercase font-bold tracking-wider block">
                          {journeyExpo.milestoneCard.bannerBadge || "OFFICIAL PRESS MEET CREATIVE"}
                        </span>
                        <span className="text-xs text-white font-medium">
                          {journeyExpo.milestoneCard.bannerCaption || "Bhrikutimandap, Kathmandu · IPPAN × Event Solution"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-10 sm:space-y-12">
          <div className="space-y-4">
            <p className="text-[11px] font-mono font-bold text-[#34D399] uppercase tracking-[0.2em]">
              {ecosystemSection?.badge || "05 / WHAT THE EXPO CONNECTS"}
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              {ecosystemSection?.titleLine1 || "ONE PLATFORM."}<br />
              <span className="text-[#34D399]">{ecosystemSection?.titleLine2 || "AN ENTIRE ENERGY ECOSYSTEM."}</span>
            </h2>
          </div>

          {/* Centre hub + surrounding orbital tags */}
          <div className="relative flex items-center justify-center py-8 min-h-[420px] sm:min-h-[480px]">
            {/* Orbital Rings */}
            <div className="absolute w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full border border-emerald-500/20 border-dashed pointer-events-none" />
            <div className="absolute w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] rounded-full border border-emerald-500/10 pointer-events-none" />

            {/* Hub */}
            <div className="relative z-10 flex flex-col items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-[#10B981] bg-[#04281E] shadow-2xl shadow-emerald-900/60 p-4">
              <p className="text-[11px] sm:text-xs font-mono font-bold text-[#34D399] uppercase tracking-widest text-center leading-snug">
                {(ecosystemSection?.hubText || ["HIMALAYAN", "GREEN ENERGY", "EXPO"]).map((line: string, i: number) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            </div>

            {/* Radial ring of tags — visible on md+ */}
            <div className="absolute inset-0 hidden md:block pointer-events-none">
              {ecosystemItems.map((item, idx) => {
                const angle = (idx / ecosystemItems.length) * 2 * Math.PI - Math.PI / 2;
                const radiusX = 42; // percentage
                const radiusY = 38; // percentage
                const x = 50 + radiusX * Math.cos(angle);
                const y = 50 + radiusY * Math.sin(angle);
                return (
                  <div
                    key={idx}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <span className="px-3.5 py-1.5 rounded-full bg-[#04281E]/90 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-200/90 uppercase tracking-wider whitespace-nowrap shadow-md hover:bg-emerald-500/20 hover:border-emerald-400 hover:text-white transition-all cursor-default backdrop-blur-sm">
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: rounded pill tags (only visible on mobile below md) */}
          <div className="md:hidden flex flex-wrap justify-center gap-2 pt-2 max-w-md mx-auto">
            {ecosystemItems.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-full bg-[#04281E]/90 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-200/90 uppercase tracking-wider"
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
            <p className="text-[11px] font-mono font-bold text-[#087EA4] uppercase tracking-[0.2em]">
              {experienceSection?.badge || "06 / THE EXPERIENCE"}
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#061A2A] leading-tight tracking-tight">
              {experienceSection?.titleLine1 || "MORE THAN"}<br />
              {experienceSection?.titleLine2 || "AN EXHIBITION."}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Big photo */}
            {experienceSection?.mainImage && (
              <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-full min-h-[360px] rounded-3xl overflow-hidden">
                <Image
                  src={experienceSection.mainImage}
                  alt="VIP delegation on exhibition floor"
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061A2A]/60 to-transparent" />
                {experienceSection?.mainCaption && (
                  <div className="absolute bottom-5 left-5">
                    <span className="text-[10px] font-mono text-emerald-300 bg-[#061A2A]/75 px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-widest">
                      {experienceSection.mainCaption}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 4 editorial blocks */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              {(experienceSection?.blocks || []).map((block: any, idx: number) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden group h-44 sm:h-52">
                  {block.img && (
                    <Image
                      src={block.img}
                      alt={block.label}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
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
            <p className="text-[11px] font-mono font-bold text-[#34D399] uppercase tracking-[0.2em]">
              {organizersSection?.badge || "07 / THE ORGANIZERS"}
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
              {organizersSection?.titleLine1 || "POWERED BY INDUSTRY."}<br />
              <span className="text-[#34D399]">{organizersSection?.titleLine2 || "DELIVERED WITH EXPERIENCE."}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 sm:gap-8 items-stretch">
            {/* IPPAN */}
            {organizersSection?.ippan && (
              <div className="lg:col-span-5 p-8 sm:p-9 rounded-3xl bg-emerald-950/40 border border-emerald-500/25 flex flex-col justify-between h-full shadow-lg hover:border-emerald-500/40 transition-all">
                <div>
                  {organizersSection.ippan.logo && (
                    <div className="relative h-14 w-36 mb-6">
                      <Image src={organizersSection.ippan.logo} alt="IPPAN" fill className="object-contain object-left" />
                    </div>
                  )}
                  <div>
                    <p className="text-[10.5px] font-mono font-bold text-[#34D399] uppercase tracking-widest mb-2.5">
                      {organizersSection.ippan.subtitle || "INDUSTRY KNOWLEDGE"}
                    </p>
                    <h3 className="text-xl font-bold text-white mb-3 min-h-[56px] flex items-center leading-snug">
                      {organizersSection.ippan.title}
                    </h3>
                    <p className="text-sm text-emerald-100/75 leading-relaxed">
                      {organizersSection.ippan.description}
                    </p>
                  </div>
                </div>
                {organizersSection.ippan.website && (
                  <div className="pt-6 mt-6 border-t border-emerald-500/20">
                    <a
                      href={organizersSection.ippan.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-bold text-[#34D399] hover:text-white inline-flex items-center gap-1.5 transition-colors group"
                    >
                      <span>{organizersSection.ippan.websiteLabel || "ippan.org.np"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Divider × */}
            <div className="lg:col-span-1 flex items-center justify-center self-center py-2 lg:py-0">
              <span className="text-3xl sm:text-4xl font-light text-emerald-400/50 select-none">×</span>
            </div>

            {/* Event Solution */}
            {organizersSection?.eventSolution && (
              <div className="lg:col-span-5 p-8 sm:p-9 rounded-3xl bg-emerald-950/40 border border-emerald-500/25 flex flex-col justify-between h-full shadow-lg hover:border-emerald-500/40 transition-all">
                <div>
                  {organizersSection.eventSolution.logo && (
                    <div className="relative h-14 w-44 mb-6">
                      <Image src={organizersSection.eventSolution.logo} alt="Event Solution" fill className="object-contain object-left" />
                    </div>
                  )}
                  <div>
                    <p className="text-[10.5px] font-mono font-bold text-[#34D399] uppercase tracking-widest mb-2.5">
                      {organizersSection.eventSolution.subtitle || "EVENT EXECUTION"}
                    </p>
                    <h3 className="text-xl font-bold text-white mb-3 min-h-[56px] flex items-center leading-snug">
                      {organizersSection.eventSolution.title}
                    </h3>
                    <p className="text-sm text-emerald-100/75 leading-relaxed">
                      {organizersSection.eventSolution.description}
                    </p>
                  </div>
                </div>
                {organizersSection.eventSolution.website && (
                  <div className="pt-6 mt-6 border-t border-emerald-500/20">
                    <a
                      href={organizersSection.eventSolution.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-bold text-[#34D399] hover:text-white inline-flex items-center gap-1.5 transition-colors group"
                    >
                      <span>{organizersSection.eventSolution.websiteLabel || "eventsolutionnepal.com.np"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                )}
              </div>
            )}
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
              <p className="text-[11px] font-mono font-bold text-[#087EA4] uppercase tracking-[0.2em]">
                {peopleSection?.badge || "08 / THE PEOPLE"}
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-[#061A2A] leading-tight tracking-tight">
                {peopleSection?.titleLine1 || "THE PEOPLE"}<br />
                {peopleSection?.titleLine2 || "BEHIND THE PLATFORM."}
              </h2>
            </div>
            <Link
              href="/speakers"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#087EA4] hover:text-[#061A2A] transition-colors uppercase tracking-wider shrink-0"
            >
              <span>{peopleSection?.speakersLinkText || "View Full Committee"}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-12">
            {/* 01: IPPAN Leadership */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#005C42] border border-emerald-200 text-xs font-mono font-bold uppercase tracking-wider">
                  {peopleSection?.ippanBadge || "IPPAN LEADERSHIP"}
                </span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  {peopleSection?.ippanSubtitle || "Independent Power Producers' Association, Nepal"}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {(peopleSection?.ippanMembers || []).map((person: any, idx: number) => (
                  <div key={idx} className="group text-center">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-200/80 shadow-2xs group-hover:shadow-md group-hover:border-emerald-300 transition-all duration-300">
                      {person.photo && (
                        <Image
                          src={person.photo}
                          alt={person.name}
                          fill
                          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#061A2A]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs font-bold text-[#061A2A] leading-snug line-clamp-1">{person.name}</p>
                    <p className="text-[10px] font-mono text-[#005C42] mt-0.5 font-medium line-clamp-1">{person.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 02: Event Solution Management Team */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-900 border border-sky-200 text-xs font-mono font-bold uppercase tracking-wider">
                  {peopleSection?.eventSolutionBadge || "EVENT SOLUTION TEAM"}
                </span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  {peopleSection?.eventSolutionSubtitle || "Event Solution Nepal Pvt. Ltd. (Operations & Management)"}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {(peopleSection?.eventSolutionMembers || []).map((person: any, idx: number) => (
                  <div key={idx} className="group text-center">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-200/80 shadow-2xs group-hover:shadow-md group-hover:border-sky-300 transition-all duration-300">
                      {person.photo && (
                        <Image
                          src={person.photo}
                          alt={person.name}
                          fill
                          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#061A2A]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs font-bold text-[#061A2A] leading-snug line-clamp-1">{person.name}</p>
                    <p className="text-[10px] font-mono text-[#087EA4] mt-0.5 font-medium line-clamp-1">{person.title}</p>
                  </div>
                ))}
              </div>
            </div>
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
            src={fifthEditionDark?.backgroundImage || "/images/background/22.webp"}
            alt="Himalayan hydropower backdrop"
            fill
            className="object-cover object-center"
          />
          {/* Refined midnight overlay matching hero styling */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/95 via-[#061A2A]/85 to-[#071322]/95" />
          {/* Subtle ambient energy glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7">
          {/* Logo (Navbar expo logo) */}
          <div className="flex justify-center">
            <div className="relative w-48 h-28 sm:w-64 sm:h-36">
              <Image
                src={fifthEditionDark?.logo || "/images/logo-expo.webp"}
                alt={fifthEditionDark?.badge1 || "Himalayan Green Energy Expo"}
                fill
                className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
              />
            </div>
          </div>

          {/* Expo full name */}
          <p className="text-xs sm:text-sm font-mono font-bold text-[#00E599] uppercase tracking-[0.25em]">
            {fifthEditionDark?.badge1 || "Himalayan Green Energy Expo"}
          </p>

          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-[0.2em]">
            {fifthEditionDark?.badge2 || "2027 / 5TH EDITION"}
          </p>

          <h2 className="text-5xl sm:text-7xl font-bold text-white leading-[1.0] tracking-tight">
            {fifthEditionDark?.titleLine1 || "THE NEXT"}<br />
            <span className="text-[#00E599]">{fifthEditionDark?.titleHighlight || "CHAPTER"}</span><br />
            {fifthEditionDark?.titleLine2 || "STARTS HERE."}
          </h2>

          <div className="flex flex-wrap justify-center gap-3 text-xs font-mono text-slate-200">
            {(fifthEditionDark?.pills || ["16–18 JANUARY 2027", "KATHMANDU, NEPAL", "5TH EDITION"]).map((pill: string, idx: number) => (
              <span key={idx} className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/15 backdrop-blur-md hover:border-white/30 transition-colors">
                {pill}
              </span>
            ))}
          </div>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            {fifthEditionDark?.description}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/expo"
              className="px-8 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono text-xs font-bold hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              {fifthEditionDark?.exploreButtonText || "EXPLORE THE 5TH EDITION"}
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-[#007A5E] hover:bg-[#005C42] text-white font-mono text-xs font-bold transition-all shadow-[0_0_30px_rgba(0,122,94,0.3)]"
            >
              {fifthEditionDark?.registerButtonText || "REGISTER NOW"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

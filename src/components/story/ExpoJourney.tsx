'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUp, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

interface StoryEdition {
  year: string;
  edition: string;
  phase: string;
  title: string;
  story: string;
  meta: string;
  image: string;
  caption: string;
  aspect: string;
}

const storyEditions: StoryEdition[] = [
  {
    year: '2018',
    edition: '1ST EDITION',
    phase: 'CHAPTER 01 · THE INAUGURAL CONVERGENCE',
    title: 'Where the clean energy movement began.',
    story:
      "Nepal's pioneer independent power producers, state utility leaders, and international equipment makers gathered under one roof at Bhrikutimandap for the first time in national history.",
    meta: 'Inaugural Trade Floor · 10,000+ Visitors',
    image: '/images/gallery/2018/IMG_0047.webp',
    caption: 'Inaugural ceremony uniting developers, global OEMs, and public utilities.',
    aspect: 'h-[240px] sm:h-[320px]',
  },
  {
    year: '2019',
    edition: '2ND EDITION',
    phase: 'CHAPTER 02 · INTERNATIONAL EXPANSION',
    title: 'Building regional clean power momentum.',
    story:
      'The exhibition doubled its international footprint with dedicated European and Asian technology pavilions, technical turbine symposia, and domestic commercial banking syndicates.',
    meta: 'Global Technology Pavilions · Banking Syndicates',
    image: '/images/gallery/2019/shankar(MATINA P & V)289.webp',
    caption: 'International exhibition pavilions and cross-border clean trade plenaries.',
    aspect: 'h-[240px] sm:h-[320px]',
  },
  {
    year: '2022',
    edition: '3RD EDITION',
    phase: 'CHAPTER 03 · RESILIENCE & GREEN TECH',
    title: 'Reconvening the sector post-disruption.',
    story:
      'Following the global disruption, the expo reconvened the regional sector with a powerful focus on silt-abrasion resistant turbines, 400kV gas-insulated substations, and cross-border power transmission.',
    meta: 'Heavy Turbine Engineering · 400kV Switchgear',
    image: '/images/gallery/2022/DSC_6673.webp',
    caption: 'Official 2022 inaugural stage and high-tech hydro-mechanical exhibitions.',
    aspect: 'h-[240px] sm:h-[320px]',
  },
  {
    year: '2024',
    edition: '4TH EDITION',
    phase: 'CHAPTER 04 · RECORD REGIONAL SCALE',
    title: "South Asia's clean energy powerhouse.",
    story:
      'The largest edition in history featured over 100 global brands, official trilateral trade delegations from India and Bangladesh, and landmark commercial power purchase agreements.',
    meta: '100+ Global Brands · Trilateral Delegations',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.07.jpeg',
    caption: 'Ministers, ambassadors, and trade delegations exploring global turbine pavilions and clean tech stalls.',
    aspect: 'h-[260px] sm:h-[340px]',
  },
];

export function ExpoJourney() {
  return (
    <section className="relative w-full py-12 sm:py-16 bg-[var(--c-bg)] text-[var(--c-text-primary)] transition-colors duration-300 border-b border-black/[0.08] dark:border-white/[0.1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* ── 01: SECTION HEADER ────────────────────────────────────────── */}
        <ScrollReveal direction="up" distance={25}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#218A59]/10 text-[#218A59] dark:bg-[#25C176]/15 dark:text-[#25C176] border border-[#218A59]/25 dark:border-[#25C176]/30 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#218A59] dark:bg-[#25C176]" />
                <span>THE EXPO JOURNEY</span>
              </div>

              <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-gray-900 dark:text-white leading-tight">
                FOUR EDITIONS. <br />
                <span className="text-[#234679] dark:text-[#4A7EC7]">ONE GREEN</span>{' '}
                <span className="text-[#218A59] dark:text-[#25C176]">JOURNEY.</span>
              </h2>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-normal mt-2 max-w-2xl leading-relaxed">
                From its first edition in 2018 to the upcoming 5th milestone, Himalayan Green Energy Expo has evolved step-by-step with Nepal&apos;s clean energy transformation.
              </p>
            </div>

            <button
              onClick={() => {
                const lenis = (window as any).__lenis;
                if (lenis) {
                  lenis.scrollTo(0, { duration: 1.2 });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-mono font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer self-start"
              title="Scroll back to top"
            >
              <ArrowUp size={14} className="text-[#218A59] dark:text-[#25C176]" />
              <span>&uarr; Back to Top</span>
            </button>
          </div>
        </ScrollReveal>

        {/* ── 02: EDITORIAL DOCUMENTARY STORY TIMELINE (2018 -> 2024) ──────── */}
        <div className="space-y-12 sm:space-y-16 relative mb-14">
          {/* Vertical Connecting Timeline Spine */}
          <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-px bg-black/10 dark:bg-white/10 -translate-x-1/2" />

          {storyEditions.map((item, index) => {
            const isEven = index % 2 === 0;

            return (
              <ScrollReveal
                key={item.year}
                direction="up"
                distance={35}
                duration={0.7}
              >
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center relative ${
                    isEven ? '' : 'lg:flex-row-reverse'
                  }`}
                >
                {/* Visual Column */}
                <div
                  className={`lg:col-span-6 ${
                    isEven ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 shadow-sm group">
                    <div className={`relative w-full ${item.aspect}`}>
                      <Image
                        src={item.image}
                        alt={`Himalayan Green Energy Expo ${item.year}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 600px"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Editorial Story Column */}
                <div
                  className={`lg:col-span-6 space-y-3 ${
                    isEven ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-[#234679] dark:text-[#4A7EC7]">
                      {item.year}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 font-mono text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                      {item.edition}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    {item.phase}
                  </div>

                  <h3 className="font-display font-bold text-xl sm:text-2xl text-gray-900 dark:text-white tracking-tight leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-normal leading-relaxed">
                    {item.story}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[#234679] dark:text-[#6FA0E8] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#218A59] dark:bg-[#25C176]" />
                    <span>{item.meta}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>

      {/* ── 03: FULL SCREEN WIDTH 5TH EDITION SHOWCASE BLOCK (MATCHING EXPO FOLDER) ── */}
      <ScrollReveal direction="up" distance={35} duration={0.8}>
        <div className="w-full bg-gradient-to-r from-[#061A2A] via-[#072B42] to-[#04201B] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-12 border-t border-b border-white/10 mt-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#10B981] text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-md">
                  NOW · THE 5TH EDITION
                </span>
                <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-widest font-bold">
                  HIMALAYAN GREEN ENERGY EXPO 2027
                </span>
              </div>

              <h3 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                NOW, <br />
                <span className="text-[#38BDF8]">THE FIFTH</span>{' '}
                <span className="text-[#34D399]">MILESTONE.</span>
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 font-normal max-w-xl leading-relaxed">
                Under the theme <strong className="text-white">&ldquo;Resilient Energy, Prosperous Nepal,&rdquo;</strong> the 5th edition expands into an integrated Green Energy Marketplace — placing climate resilience, sustainable infrastructure, cross-border trade, and disaster-resilient clean tech at the center of the conversation.
              </p>

              {/* Confirmed Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  <div>
                    <div className="text-[9px] font-mono text-slate-400 uppercase font-bold">CONFIRMED DATE</div>
                    <div className="text-xs sm:text-sm font-bold text-white">Magh 2 - 4 · 16–18 January 2027</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#34D399] shrink-0" />
                  <div>
                    <div className="text-[9px] font-mono text-slate-400 uppercase font-bold">VENUE</div>
                    <div className="text-xs sm:text-sm font-bold text-white">Bhrikutimandap Complex, Kathmandu</div>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-full bg-[#10B981] hover:bg-[#059669] text-slate-950 font-mono text-xs font-black tracking-wider transition-all shadow-lg hover:scale-105 inline-flex items-center gap-2 active:scale-95"
                >
                  <span>REGISTER FOR 5TH EDITION</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/floor-plan"
                  className="px-6 py-3 rounded-full bg-[#087EA4]/60 hover:bg-[#087EA4] border border-[#38BDF8]/40 text-white text-xs font-mono font-bold tracking-wider transition-all hover:scale-105 active:scale-95"
                >
                  <span>VIEW FLOOR PLAN</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Official Press Meet Announcement Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative h-[260px] sm:h-[340px] w-full rounded-2xl border border-white/20 overflow-hidden bg-slate-950 shadow-2xl group cursor-pointer">
                <Image
                  src="/images/press_meet.jpeg"
                  alt="Himalayan Green Energy Expo 2027 Official Press Meet Announcement"
                  fill
                  sizes="(max-width: 1024px) 100vw, 550px"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#10B981]/90 text-slate-950 font-mono text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md">
                  OFFICIAL CREATIVE
                </div>
                <div className="absolute bottom-3 left-3 right-3 p-3 bg-black/75 backdrop-blur-md border border-white/10 rounded-xl">
                  <div className="text-[10px] font-mono text-[#34D399] font-bold uppercase tracking-wider">
                    PRESS MEET · 17–19 JAN 2027
                  </div>
                  <div className="text-xs text-white font-semibold mt-0.5">
                    Resilient Energy, Prosperous Nepal · Bhrikutimandap
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

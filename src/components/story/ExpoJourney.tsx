'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Globe2,
  ShieldCheck,
  Sun,
  Zap,
  ArrowUpRight,
  ArrowRight,
  Calendar,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { ScrollReveal, TopographicContours, MountainCrestSvg } from '@/components/ui';

interface StoryEdition {
  year: string;
  edition: string;
  phase: string;
  title: string;
  story: string;
  meta: string;
  image: string;
  caption: string;
}

const storyEditions: StoryEdition[] = [
  {
    year: '2018',
    edition: '1ST EDITION',
    phase: 'THE INAUGURAL CONVERGENCE',
    title: 'Where the clean energy movement began.',
    story:
      "Nepal's pioneer independent power producers, state utilities, and global equipment makers gathered under one roof at Bhrikutimandap.",
    meta: 'Inaugural Trade Floor · 10,000+ Visitors',
    image: '/images/gallery/2018/IMG_0047.webp',
    caption: 'Inaugural ceremony uniting developers and public utilities.',
  },
  {
    year: '2019',
    edition: '2ND EDITION',
    phase: 'INTERNATIONAL EXPANSION',
    title: 'Building regional clean power momentum.',
    story:
      'Doubled international footprint with dedicated European and Asian technology pavilions and commercial banking syndicates.',
    meta: 'Global Pavilions · Banking Syndicates',
    image: '/images/gallery/2019/shankar(MATINA P & V)289.webp',
    caption: 'International exhibition pavilions & plenaries.',
  },
  {
    year: '2022',
    edition: '3RD EDITION',
    phase: 'RESILIENCE & GREEN TECH',
    title: 'Reconvening the sector post-disruption.',
    story:
      'Focused on silt-abrasion resistant turbines, 400kV gas-insulated substations, and cross-border power transmission.',
    meta: 'Turbine Engineering · 400kV Switchgear',
    image: '/images/gallery/2022/DSC_6673.webp',
    caption: 'Official 2022 inaugural stage & hydro exhibitions.',
  },
  {
    year: '2024',
    edition: '4TH EDITION',
    phase: 'RECORD REGIONAL SCALE',
    title: "South Asia's clean energy powerhouse.",
    story:
      'Featured over 100 global brands, official trilateral trade delegations from India and Bangladesh, and landmark power purchase agreements.',
    meta: '100+ Global Brands · Trilateral Delegations',
    image: '/images/event-photo-6.webp',
    caption: 'Ministers and delegations exploring global pavilions.',
  },
];

export function ExpoJourney() {
  return (
    <section
      id="expo-journey"
      className="relative w-full pt-16 sm:pt-24 pb-0 bg-[#FAFAFA] text-slate-900 font-inter-tight border-b border-slate-200/80 transition-colors duration-300 overflow-hidden"
    >
      {/* ── Topographic Elevation Contours ── */}
      <TopographicContours opacity="opacity-[0.035] text-slate-700" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-14 sm:mb-16">
        {/* ── 01: SECTION HEADER (Giveon Style) ─────────────────────────── */}
        <ScrollReveal direction="up" distance={25}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#007A5E] uppercase tracking-wider font-mono">
                  THE EXPO JOURNEY
                </span>
                <div className="w-12 h-0.5 bg-[#007A5E]/40 rounded-full" />
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-slate-900 leading-[1.18] tracking-tight">
                Four Editions. <span className="text-[#007A5E]">One Green Journey.</span>
              </h2>

              <p className="text-sm text-slate-500 font-normal">
                A verified track record of advancing clean energy and cross-border power in Nepal.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#007A5E]" />
              <span>A Decade of Verified Clean Impact</span>
            </div>
          </div>
        </ScrollReveal>

        {/* ── 02: EDITORIAL DOCUMENTARY STORY TIMELINE (Clean, Uncluttered Cards) ── */}
        <div className="space-y-6 sm:space-y-8 relative mb-14 sm:mb-16">
          {storyEditions.map((item, index) => {
            const isEven = index % 2 === 0;

            return (
              <ScrollReveal
                key={item.year}
                direction="up"
                distance={25}
                duration={0.65}
              >
                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-100/90 shadow-[0_6px_24px_-6px_rgba(0,0,0,0.06),0_12px_28px_-8px_rgba(0,122,94,0.06)] hover:shadow-[0_20px_45px_-10px_rgba(0,122,94,0.18)] hover:border-emerald-200/80 transition-all duration-300 group">
                  <div
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center ${
                      isEven ? '' : 'lg:flex-row-reverse'
                    }`}
                  >
                    {/* Visual Column */}
                    <div
                      className={`lg:col-span-5 ${
                        isEven ? 'lg:order-1' : 'lg:order-2'
                      }`}
                    >
                      <div className="relative h-48 sm:h-56 w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.1)]">
                        <Image
                          src={item.image}
                          alt={`Himalayan Green Energy Expo ${item.year}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 500px"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <span className="absolute bottom-2.5 left-2.5 text-[10px] font-bold text-white bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-xs">
                          {item.caption}
                        </span>
                      </div>
                    </div>

                    {/* Editorial Story Column */}
                    <div
                      className={`lg:col-span-7 space-y-2.5 ${
                        isEven ? 'lg:order-2' : 'lg:order-1'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl font-bold text-[#007A5E] tracking-tight leading-none">
                          {item.year}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-[#007A5E] uppercase tracking-wider">
                          {item.edition}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                          {item.phase}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                        {item.story}
                      </p>

                      <div className="pt-1 flex items-center gap-2 text-xs text-[#007A5E] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#007A5E]" />
                        <span>{item.meta}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* ── 03: 5TH EDITION MILESTONE SHOWCASE (Full Width Dark Teal Banner) ── */}
      <div className="relative w-full bg-[#051D2C] border-t border-[#0C3952] py-14 sm:py-20 lg:py-24 text-white overflow-hidden">
        {/* Subtle Topographic Accent in Teal across full width */}
        <TopographicContours opacity="opacity-[0.04] text-emerald-400" />

        {/* Ambient Radial Lights for Depth */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <ScrollReveal direction="up" distance={25} duration={0.7}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
              {/* Left Column: Official Announcement & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                {/* Top Badge Tagline */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#12B981] text-[#051D2C] text-xs font-bold tracking-wider uppercase shadow-sm">
                    NOW · THE 5TH EDITION
                  </span>
                  <span className="text-xs font-bold tracking-wider text-[#38BDF8] uppercase">
                    HIMALAYAN GREEN ENERGY EXPO 2027
                  </span>
                </div>

                {/* Main Headline */}
                <div className="space-y-1.5">
                  <h3 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-none">
                    NOW,
                  </h3>
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-none">
                    <span className="text-[#38BDF8]">THE FIFTH </span>
                    <span className="text-[#12B981]">MILESTONE.</span>
                  </h3>
                </div>

                {/* Subtitle / Paragraph */}
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  Under the theme &quot;<strong className="text-white font-semibold">Resilient Energy, Prosperous Nepal,</strong>&quot; HIGEX 2027 expands into an Integrated Green Energy Marketplace, bringing together hydropower, renewable energy, green technologies, investment, innovation and sustainable infrastructure, with climate-resilient energy development at its centre.
                </p>

                {/* Confirmed Date & Venue Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* Date Card */}
                  <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#0D2839]/90 border border-sky-400/20 shadow-sm">
                    <div className="p-2.5 rounded-lg bg-sky-500/10 text-[#38BDF8] shrink-0">
                      <Calendar className="w-5 h-5 text-[#38BDF8]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        DATE
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white tracking-tight">
                        Magh 3–5 · 17–19 January 2027
                      </div>
                    </div>
                  </div>

                  {/* Venue Card */}
                  <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#0D2839]/90 border border-sky-400/20 shadow-sm">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-[#12B981] shrink-0">
                      <MapPin className="w-5 h-5 text-[#12B981]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        VENUE
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white tracking-tight">
                        Bhrikutimandap, Kathmandu
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3.5">
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#12B981] hover:bg-[#0ea372] text-[#051D2C] text-xs font-bold tracking-wider uppercase shadow-lg shadow-[#12B981]/25 transition-all duration-200"
                  >
                    <span>REGISTER FOR HIGEX 2027</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    href="/floor-plan"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#085A79] hover:bg-[#0B6B8E] text-white text-xs font-bold tracking-wider uppercase border border-sky-400/20 transition-all duration-200 shadow-sm"
                  >
                    <span>VIEW FLOOR PLAN</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Pinwheel Motif + Official Creative Card */}
              <div className="lg:col-span-5 space-y-3.5">
                {/* Himalayan Clean Energy Pinwheel Motif */}
                <div className="flex items-center justify-start pl-1">
                  <div className="relative flex items-center justify-center w-8 h-8">
                    <svg className="w-7 h-7 animate-[spin_12s_linear_infinite]" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="4" r="1.5" fill="#38BDF8" opacity="0.8" />
                      <circle cx="31.3" cy="8.7" r="1.5" fill="#12B981" opacity="0.8" />
                      <circle cx="36" cy="20" r="1.5" fill="#38BDF8" opacity="0.8" />
                      <circle cx="31.3" cy="31.3" r="1.5" fill="#12B981" opacity="0.8" />
                      <circle cx="20" cy="36" r="1.5" fill="#38BDF8" opacity="0.8" />
                      <circle cx="8.7" cy="31.3" r="1.5" fill="#12B981" opacity="0.8" />
                      <circle cx="4" cy="20" r="1.5" fill="#38BDF8" opacity="0.8" />
                      <circle cx="8.7" cy="8.7" r="1.5" fill="#12B981" opacity="0.8" />
                      <path d="M20 20 C22 13 26 11 29 14 C26 17 22 18 20 20 Z" fill="#38BDF8" />
                      <path d="M20 20 C27 20 29 24 26 27 C23 25 21 22 20 20 Z" fill="#12B981" />
                      <path d="M20 20 C20 27 16 29 13 26 C15 23 18 21 20 20 Z" fill="#38BDF8" />
                      <path d="M20 20 C13 20 11 16 14 13 C17 15 19 18 20 20 Z" fill="#12B981" />
                      <path d="M20 20 C18 13 14 11 11 14 C14 17 18 18 20 20 Z" fill="#38BDF8" />
                      <path d="M20 20 C22 27 26 29 29 26 C26 23 22 21 20 20 Z" fill="#12B981" />
                      <circle cx="20" cy="20" r="3.5" fill="white" />
                    </svg>
                    <div className="absolute inset-0 bg-[#38BDF8]/20 blur-md rounded-full pointer-events-none" />
                  </div>
                </div>

                {/* Creative Poster Container */}
                <div className="relative rounded-2xl overflow-hidden border border-sky-400/25 shadow-2xl bg-[#071322]">
                  <Image
                    src="/fifth_edition.jpeg"
                    alt="Himalayan Green Energy Expo 2027 5th Edition Announcement Creative"
                    width={1600}
                    height={999}
                    priority
                    className="w-full h-auto object-contain block"
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

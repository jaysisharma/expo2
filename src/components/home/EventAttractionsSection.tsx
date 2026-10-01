'use client';

import React from 'react';
import Image from 'next/image';
import { ScrollReveal } from '@/components/ui';

export type AttractionPillar = 'all' | 'business' | 'knowledge' | 'technology' | 'engagement';

export interface EventAttractionItem {
  id: string;
  title: string;
  pillar: 'business' | 'knowledge' | 'technology' | 'engagement';
  desc: string;
  image: string;
}

export const ALL_11_ATTRACTIONS: EventAttractionItem[] = [
  // ── Pillar 1: Business & Trade ─────────────────────────────────
  {
    id: 'b2b-meetings',
    title: 'B2B Business Meetings',
    pillar: 'business',
    desc: 'Executive suites for bilateral PPAs, EPC contracts & project financing.',
    image: '/images/why-participate/b2b-contracts.webp',
  },
  {
    id: 'country-pavilions',
    title: 'International Country Pavilions',
    pillar: 'business',
    desc: 'National delegations showcasing cross-border clean energy transmission.',
    image: '/images/attractions/country-pavilions.webp',
  },
  {
    id: 'networking-dinner',
    title: 'Networking Dinner',
    pillar: 'business',
    desc: 'High-level diplomatic banquet and sovereign clean energy networking.',
    image: '/images/attractions/gala-dinner.webp',
  },

  // ── Pillar 2: Knowledge & Policy ───────────────────────────────
  {
    id: 'conference',
    title: 'Himalayan Green Energy Conference',
    pillar: 'knowledge',
    desc: 'High-level ministerial dialogues on regional power trade and green tariffs.',
    image: '/images/why-participate/finance-plenary.webp',
  },
  {
    id: 'knowledge-hub',
    title: 'Green Energy Knowledge Hub',
    pillar: 'knowledge',
    desc: 'Technical paper presentations, whitepapers, and academic innovations.',
    image: '/images/attractions/knowledge-hub.webp',
  },
  {
    id: 'site-visits',
    title: 'Project Site Visits',
    pillar: 'knowledge',
    desc: 'Guided delegation tours to operational Himalayan alpine hydro cascades.',
    image: '/images/dam_reservoir_himalaya.webp',
  },

  // ── Pillar 3: Technology & Innovation ──────────────────────────
  {
    id: 'live-tech-demos',
    title: 'Live Technology Demonstrations',
    pillar: 'technology',
    desc: 'Real-time turbine tests, battery storage demos, and grid automation.',
    image: '/images/why-participate/machinery-pavilion.webp',
  },
  {
    id: 'startup-hub',
    title: 'Startup Hub',
    pillar: 'technology',
    desc: 'Next-gen energy tech founders pitching to venture funds and angel syndicates.',
    image: '/images/gallery/2022/DSC_6546.webp',
  },
  {
    id: 'hydro-con',
    title: 'Hydro Con Show',
    pillar: 'technology',
    desc: 'Specialized hydropower engineering, equipment components & contractors.',
    image: '/images/attractions/hydro-con.webp',
  },

  // ── Pillar 4: Engagement & Competition ─────────────────────────
  {
    id: 'product-competition',
    title: 'Energy Product & Service Competition',
    pillar: 'engagement',
    desc: 'National jury contest recognizing breakthrough clean energy products.',
    image: '/images/why-participate/delegates-networking.webp',
  },
  {
    id: 'ev-rally',
    title: 'EV Rally',
    pillar: 'engagement',
    desc: 'Zero-emission electric vehicle roadshow through the Kathmandu Valley.',
    image: '/images/attractions/ev-rally.webp',
  },
];

export function EventAttractionsSection({ className = '' }: { className?: string }) {
  return (
    <section
      id="event-attractions"
      className={`relative w-full py-16 sm:py-24 bg-[#F8FAFC] text-slate-900 border-b border-slate-200/80 font-inter-tight overflow-hidden transition-colors duration-300 ${className}`}
    >
      <div className="relative z-10 w-full max-w-7xl lg:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ────────────────────────────────────────── */}
        <ScrollReveal direction="up" distance={20}>
          <div className="space-y-2 max-w-2xl mb-10 sm:mb-14">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#007A5E] uppercase tracking-wider font-mono">
                11 SIGNATURE EXPERIENCES
              </span>
              <div className="w-12 h-0.5 bg-[#007A5E]/40 rounded-full" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Event Attractions &amp; <span className="text-[#007A5E]">Showcases</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              11 official experiential programs connecting deal-making, innovation, and field technology.
            </p>
          </div>
        </ScrollReveal>

        {/* ── 3-COLUMN CINEMATIC FULL-BLEED POSTER CARDS ───────────── */}
        <ScrollReveal direction="up" distance={25} stagger={0.04} duration={0.6}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {ALL_11_ATTRACTIONS.map((item) => (
              <div
                key={item.id}
                className="group relative h-[380px] sm:h-[420px] rounded-3xl overflow-hidden border border-slate-200/80 hover:border-emerald-400/80 shadow-xs hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 bg-slate-950 flex flex-col justify-end p-6 sm:p-7"
              >
                {/* Immersive Photo Background */}
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Gradient Overlay for Crisp Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/15 group-hover:opacity-95 transition-opacity" />

                {/* Title & Content Anchored at the Very Bottom of the Card */}
                <div className="relative z-10 space-y-1.5 mt-auto">
                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors tracking-tight leading-snug">
                    {item.title}
                  </h3>

                  {/* Description: Hidden by default, reveals on hover */}
                  <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-out overflow-hidden">
                    <div className="min-h-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pt-1.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default EventAttractionsSection;

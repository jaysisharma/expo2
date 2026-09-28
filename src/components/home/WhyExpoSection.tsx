'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Globe2,
} from 'lucide-react';
import { TopographicContours } from '@/components/ui';

const THREE_PILLARS = [
  {
    icon: Globe2,
    stat: '30,000 MW',
    label: 'National Target',
    headline: 'Nepal is open for energy business',
    body: "Cross-border power treaties with India and Bangladesh are unlocking the world's largest untapped hydropower reserve.",
    accent: '#007A5E',
  },
  {
    icon: ShieldCheck,
    stat: 'Climate-First',
    label: 'Engineering Mandate',
    headline: 'Growth must be resilient',
    body: 'Flash floods and landslides are rewriting project specs. The 2027 expo puts resilient design at the centre of every deal.',
    accent: '#0F766E',
  },
  {
    icon: TrendingUp,
    stat: '5th Edition',
    label: 'Expanded Mandate',
    headline: 'Beyond hydro — full green energy',
    body: 'Solar, storage, green hydrogen, e-mobility, and digital grids join hydropower under one regional marketplace for the first time.',
    accent: '#059669',
  },
];

export function WhyExpoSection() {
  return (
    <section
      id="why-himalayan-green-energy-expo"
      className="relative w-full bg-[#FCFCFB] text-slate-900 border-t border-slate-200/80 font-inter-tight overflow-hidden"
    >
      <TopographicContours opacity="opacity-[0.025] text-slate-900" />

      {/* ── HERO BAND ── */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

          {/* Left: Headline */}
          <div className="space-y-5">
            <p className="text-[11px] font-mono font-bold tracking-widest text-[#007A5E] uppercase">
              WHY HIMALAYAN GREEN ENERGY EXPO 2027?
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-slate-900 tracking-tight leading-[1.12]">
              The 5th edition is{' '}
              <span className="text-[#007A5E]">a different kind</span>{' '}
              of expo.
            </h2>
            <p className="text-sm sm:text-[15px] text-slate-500 leading-relaxed max-w-lg">
              Not a trade show. A convergence of capital, policy, and technology — purpose-built to move South Asia&apos;s energy transition from ambition to bankable reality.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/conference"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#007A5E] hover:bg-[#00624B] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
              >
                <span>Conference Themes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/book-stall"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <span>Book Exhibition Stall</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Right: Image with overlay stats */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md aspect-[4/3] bg-slate-900 group">
            <Image
              src="/images/nepal_tamakoshi.jpg"
              alt="Upper Tamakoshi Hydropower — Nepal"
              fill
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

            {/* Floating stat pills */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E599]" />
                456 MW · Upper Tamakoshi
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Dolakha District, Nepal
              </span>
            </div>

            {/* Bottom bar */}
            <div className="absolute bottom-0 inset-x-0 px-5 py-4 flex items-end justify-between">
              <div>
                <p className="text-[11px] text-emerald-400 font-mono font-bold uppercase tracking-wider">Nepal&apos;s Clean Energy Future</p>
                <p className="text-white text-sm font-bold leading-tight mt-0.5">30,000 MW national target by 2035</p>
              </div>
              <span className="text-3xl font-black text-white/10 select-none leading-none">MW</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── THREE PILLARS ── */}
      <div className="relative z-10 border-t border-slate-200/80 bg-white">
        <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

          <p className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase mb-8">
            Three reasons the 2027 edition matters
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {THREE_PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-7 sm:p-8 flex flex-col gap-5 group hover:bg-slate-50/60 transition-colors"
                >
                  {/* Icon + stat */}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: `${pillar.accent}18`, color: pillar.accent }}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900 leading-none tracking-tight">
                        {pillar.stat}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                        {pillar.label}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2 flex-1">
                    <h3
                      className="text-base sm:text-lg font-bold leading-snug tracking-tight"
                      style={{ color: pillar.accent }}
                    >
                      {pillar.headline}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-normal">
                      {pillar.body}
                    </p>
                  </div>

                  {/* Animated accent bar */}
                  <div
                    className="h-0.5 w-8 rounded-full group-hover:w-16 transition-all duration-300"
                    style={{ backgroundColor: pillar.accent }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyExpoSection;

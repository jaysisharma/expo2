'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, MapPin } from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

export function RegionalEventsSection() {
  return (
    <section
      id="regional-events"
      className="w-full bg-white py-14 sm:py-20 border-b border-slate-100 font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <ScrollReveal direction="up" distance={30} duration={0.8}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="md:col-span-5 lg:col-span-4">
              <div className="relative aspect-square w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                <Image
                  src="/asean.jpg"
                  alt="ASEAN Smart Energy & Energy Storage Expo, 17–19 March 2027, IMPACT Exhibition Center, Bangkok"
                  fill
                  sizes="(min-width: 1024px) 380px, (min-width: 768px) 40vw, 90vw"
                  className="object-contain"
                />
              </div>
            </div>

            <div className="md:col-span-7 lg:col-span-8 space-y-5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#007A5E] uppercase tracking-wider font-mono">
                  PARTNER & REGIONAL EVENTS
                </span>
                <div className="w-12 h-0.5 bg-[#007A5E]/40 rounded-full" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                ASEAN Smart Energy & <br className="hidden sm:block" />
                Energy Storage Expo
              </h2>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl">
                Continue your clean energy journey in Southeast Asia. Co-located shows cover solar PV,
                battery energy storage, wind and biomass energy.
              </p>

              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-[#007A5E]" />
                  17–19 March 2027
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-[#007A5E]" />
                  IMPACT Exhibition Center, Bangkok
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

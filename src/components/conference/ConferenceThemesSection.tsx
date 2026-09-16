'use client';

import React from 'react';
import Image from 'next/image';
import {
  Atom,
  Car,
  Sparkles,
  Wind,
  Sun,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

interface SectorItem {
  id: string;
  num: string;
  title: string;
  badge: string;
  tagline: string;
  icon: React.ElementType;
  image: string;
  themeColor: 'green' | 'blue' | 'amber';
}

const exhibitionSectors: SectorItem[] = [
  {
    id: 's1',
    num: '01',
    title: 'Green Hydrogen Show',
    badge: 'HYDROGEN & CLEAN FUELS',
    tagline: 'Water electrolysis, green ammonia synthesis, and industrial zero-carbon molecular energy systems.',
    icon: Atom,
    image: '/images/sectors/green_hydrogen_show.jpg',
    themeColor: 'green',
  },
  {
    id: 's2',
    num: '02',
    title: 'EV Show',
    badge: 'ELECTRIC MOBILITY',
    tagline: 'Electric vehicles, commercial fleet electrification, ultra-fast charging corridors & next-gen battery tech.',
    icon: Car,
    image: '/images/sectors/ev_show.jpg',
    themeColor: 'blue',
  },
  {
    id: 's3',
    num: '03',
    title: 'Alternative Energy Show',
    badge: 'ALTERNATIVE RENEWABLES',
    tagline: 'Biomass energy plants, geothermal power, smart microgrids & decentralized clean technologies.',
    icon: Sparkles,
    image: '/images/sectors/alternative_energy_show.jpg',
    themeColor: 'amber',
  },
  {
    id: 's4',
    num: '04',
    title: 'Windmill Energy Show',
    badge: 'WIND POWER SYSTEMS',
    tagline: 'High-altitude wind turbine engineering, wind-hydro hybrid farms & smart grid synchronization.',
    icon: Wind,
    image: '/images/sectors/windmill_energy_show.jpg',
    themeColor: 'blue',
  },
  {
    id: 's5',
    num: '05',
    title: 'Solar Energy Show',
    badge: 'SOLAR PV & STORAGE',
    tagline: 'Utility-scale solar PV parks, floating solar arrays on hydro reservoirs & commercial BESS storage.',
    icon: Sun,
    image: '/images/sectors/solar_energy_show.jpg',
    themeColor: 'amber',
  },
  {
    id: 's6',
    num: '06',
    title: 'Green Energy Show',
    badge: 'HYDRO & GRID INFRASTRUCTURE',
    tagline: 'High-head hydro turbines, pumped storage powerhouses, 400kV substations & cross-border transmission.',
    icon: Zap,
    image: '/images/sectors/green_energy_show.jpg',
    themeColor: 'green',
  },
];

export function ConferenceThemesSection() {
  return (
    <section
      id="exhibition-sectors"
      className="relative w-full py-16 sm:py-24 bg-[var(--c-bg)] text-[var(--c-text-primary)] font-sans border-b border-black/[0.08] dark:border-white/[0.1] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <ScrollReveal direction="up" distance={25}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-black/10 dark:border-white/10 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#218A59]/10 text-[#218A59] dark:bg-[#25C176]/15 dark:text-[#25C176] border border-[#218A59]/25 dark:border-[#25C176]/30 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#218A59] dark:bg-[#25C176]" />
                <span>6 INTEGRATED EXHIBITION SECTORS</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-4xl text-gray-900 dark:text-white tracking-tight">
                Major Exhibition Sectors
              </h2>
            </div>

            <a
              href="/files/hydroproposal-13-2-2024.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#234679] dark:text-[#6FA0E8] hover:text-[#218A59] dark:hover:text-[#25C176] transition-colors uppercase tracking-wider self-start sm:self-auto cursor-pointer"
            >
              <span>Download Full Proposal (PDF)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </ScrollReveal>

        {/* 6 Clean Sector Cards (3 Columns) */}
        <ScrollReveal direction="up" distance={30} stagger={0.08} duration={0.65}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {exhibitionSectors.map((sector) => {
              const Icon = sector.icon;

              return (
                <div
                  key={sector.id}
                  className="rounded-3xl overflow-hidden relative min-h-[300px] sm:min-h-[340px] p-6 flex flex-col justify-between group shadow-md hover:shadow-2xl border border-black/10 dark:border-white/10 transition-all duration-500 ease-out cursor-pointer hover:-translate-y-1.5"
                >
                  {/* Background High-Res Generated AI Photography */}
                  <Image
                    src={sector.image}
                    alt={sector.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />

                  {/* Dark Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25 group-hover:from-black/95 group-hover:via-black/60 transition-all duration-300" />

                  {/* Top: Sector Number & Icon */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 font-mono text-xs font-black text-white shadow-xs">
                        {sector.num}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider drop-shadow-sm">
                        {sector.badge}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/20 transition-all duration-300 shadow-md group-hover:bg-[#218A59] group-hover:scale-110">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Bottom Content: Title always visible, Description cleanly sliding in on hover */}
                  <div className="relative z-10 text-white">
                    <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight leading-snug drop-shadow-md group-hover:text-[#34D399] transition-colors duration-300 uppercase">
                      {sector.title}
                    </h3>
                    <div className="overflow-hidden transition-all duration-300 ease-out max-h-0 opacity-0 -translate-y-1 group-hover:max-h-32 group-hover:opacity-100 group-hover:translate-y-0 group-hover:mt-2">
                      <p className="text-xs text-slate-200 font-sans tracking-wide drop-shadow-sm leading-relaxed">
                        {sector.tagline}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default ConferenceThemesSection;

'use client';

import React from 'react';
import Image from 'next/image';
import {
  Waves,
  SunMedium,
  Zap,
  Leaf,
  Briefcase,
  Flame,
  Globe2,
  Wrench,
  ArrowUpRight,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

interface SectorItem {
  id: string;
  num: string;
  title: string;
  tagline: string;
  icon: React.ElementType;
  image: string;
  themeColor: 'blue' | 'green';
}

const exhibitionSectors: SectorItem[] = [
  {
    id: 's1',
    num: '01',
    title: 'Hydro Heavy Equipment & Turbines',
    tagline: 'Francis, Pelton & Kaplan high-head turbine innovations',
    icon: Waves,
    image:
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    themeColor: 'blue',
  },
  {
    id: 's2',
    num: '02',
    title: 'Utility Solar & Hybrid Storage',
    tagline: 'Floating PV, BESS storage & Himalayan solar parks',
    icon: SunMedium,
    image:
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    themeColor: 'green',
  },
  {
    id: 's3',
    num: '03',
    title: 'High-Voltage Transmission & GIS',
    tagline: '400kV cross-border lines, transformers & digital substations',
    icon: Zap,
    image:
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
    themeColor: 'blue',
  },
  {
    id: 's4',
    num: '04',
    title: 'Green Hydrogen & Clean Fuels',
    tagline: 'Water electrolysis, green ammonia & zero-carbon fuels',
    icon: Flame,
    image:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    themeColor: 'green',
  },
  {
    id: 's5',
    num: '05',
    title: 'Cross-Border Clean Power Trade',
    tagline: 'Bilateral open-access power markets with India & Bangladesh',
    icon: Globe2,
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    themeColor: 'blue',
  },
  {
    id: 's6',
    num: '06',
    title: 'Multilateral Climate Finance & ESG',
    tagline: 'Green bonds, debt syndication, private equity & sovereign risk',
    icon: Briefcase,
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    themeColor: 'green',
  },
  {
    id: 's7',
    num: '07',
    title: 'EPC Engineering, Tunnelling & Dam Tech',
    tagline: 'Tunnel boring machines, shotcrete & geological stabilization',
    icon: Wrench,
    image:
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    themeColor: 'blue',
  },
  {
    id: 's8',
    num: '08',
    title: 'Decarbonized E-Mobility & Smart Grids',
    tagline: 'High-power EV charging corridors & IoT grid management',
    icon: Leaf,
    image:
      'https://images.unsplash.com/photo-1558441719-20b1356f9175?auto=format&fit=crop&w=800&q=80',
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
                <span>HIMALAYAN GREEN ENERGY EXPO SECTORS</span>
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

        {/* 8 Clean Sector Horizon Cards */}
        <ScrollReveal direction="up" distance={30} stagger={0.07} duration={0.65}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {exhibitionSectors.map((sector) => {
              const Icon = sector.icon;
              const isGreen = sector.themeColor === 'green';

              return (
                <div
                  key={sector.id}
                  className={`rounded-2xl overflow-hidden relative min-h-[260px] sm:min-h-[280px] p-6 flex flex-col justify-between group shadow-sm hover:shadow-xl border border-black/10 dark:border-white/10 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1 ${
                    isGreen
                      ? 'hover:border-[#218A59] dark:hover:border-[#25C176]'
                      : 'hover:border-[#234679] dark:hover:border-[#4A7EC7]'
                  }`}
                >
                  {/* Background Photography */}
                  <Image
                    src={sector.image}
                    alt={sector.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Dark Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 group-hover:from-black/95 group-hover:via-black/60 transition-all duration-300" />

                  {/* Top: Icon & Sector Number */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white/80 drop-shadow-sm">
                      {sector.num}
                    </span>
                    <div
                      className={`p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/20 transition-all duration-300 shadow-md ${
                        isGreen
                          ? 'group-hover:bg-[#218A59] group-hover:text-white'
                          : 'group-hover:bg-[#234679] group-hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Bottom Content: Minimal Title & Tagline */}
                  <div className="relative z-10 text-white space-y-1">
                    <h3
                      className={`font-display font-bold text-lg sm:text-xl text-white tracking-tight leading-snug drop-shadow-md transition-colors duration-300 ${
                        isGreen
                          ? 'group-hover:text-[#4ADE80]'
                          : 'group-hover:text-[#93C5FD]'
                      }`}
                    >
                      {sector.title}
                    </h3>
                    <p className="text-xs text-white/80 font-mono tracking-wide drop-shadow-sm group-hover:text-white transition-colors">
                      {sector.tagline}
                    </p>
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

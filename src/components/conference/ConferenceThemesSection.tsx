'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

interface SectorItem {
  id: string;
  title: string;
  tagline: string;
  image: string;
}

const exhibitionSectors: SectorItem[] = [
  {
    id: 's1',
    title: 'Green Hydrogen Show',
    tagline: 'Water electrolysis, green ammonia synthesis, and industrial zero-carbon molecular energy systems.',
    image: '/images/sectors/green_hydrogen_show.jpg',
  },
  {
    id: 's2',
    title: 'EV Show',
    tagline: 'Electric vehicles, commercial fleet electrification, ultra-fast charging corridors & next-gen battery tech.',
    image: '/images/sectors/ev_show.jpg',
  },
  {
    id: 's3',
    title: 'Alternative Energy Show',
    tagline: 'Biomass energy plants, geothermal power, smart microgrids & decentralized clean technologies.',
    image: '/images/sectors/alternative_energy_show.jpg',
  },
  {
    id: 's4',
    title: 'Windmill Energy Show',
    tagline: 'High-altitude wind turbine engineering, wind-hydro hybrid farms & smart grid synchronization.',
    image: '/images/sectors/windmill_energy_show.jpg',
  },
  {
    id: 's5',
    title: 'Solar Energy Show',
    tagline: 'Utility-scale solar PV parks, floating solar arrays on hydro reservoirs & commercial BESS storage.',
    image: '/images/sectors/solar_energy_show.jpg',
  },
  {
    id: 's6',
    title: 'Green Energy Show',
    tagline: 'High-head hydro turbines, pumped storage powerhouses, 400kV substations & cross-border transmission.',
    image: '/images/sectors/green_energy_show.jpg',
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

        {/* 6 Clean Minimal Sector Cards (3 Columns) */}
        <ScrollReveal direction="up" distance={30} stagger={0.08} duration={0.65}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {exhibitionSectors.map((sector) => {
              return (
                <div
                  key={sector.id}
                  className="rounded-3xl overflow-hidden relative min-h-[280px] sm:min-h-[320px] p-6 flex flex-col justify-end group shadow-md hover:shadow-2xl border border-black/10 dark:border-white/10 transition-all duration-500 ease-out cursor-pointer hover:-translate-y-1.5"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 group-hover:via-black/60 transition-all duration-300" />

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

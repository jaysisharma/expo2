'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import { ScrollReveal, TopographicContours, MountainCrestSvg } from '@/components/ui';
import {
  HydroTurbineSvg,
  HydrogenMoleculeSvg,
  EvMobilitySvg,
  SolarPhotovoltaicSvg,
  EnergyStorageSvg,
  SmartEnergySvg,
} from './SectorAnimatedSvgs';

interface SectorItem {
  id: string;
  number: string;
  title: string;
  tagline: string;
  image: string;
  AnimatedSvg: React.ComponentType<{ className?: string }>;
}

const exhibitionSectors: SectorItem[] = [
  {
    id: 's1',
    number: '01',
    title: 'HYDROPOWER',
    tagline: 'Hydropower projects, IPPs, turbines, generators and power infrastructure.',
    image: '/images/sectors/green_energy_show.webp',
    AnimatedSvg: HydroTurbineSvg,
  },
  {
    id: 's2',
    number: '02',
    title: 'SOLAR & WIND',
    tagline: 'Solar PV, wind energy and renewable-energy technologies.',
    image: '/images/sectors/solar_energy_show.webp',
    AnimatedSvg: SolarPhotovoltaicSvg,
  },
  {
    id: 's3',
    number: '03',
    title: 'ENERGY STORAGE',
    tagline: 'Batteries, energy storage systems and related power technologies.',
    image: '/images/sectors/alternative_energy_show.webp',
    AnimatedSvg: EnergyStorageSvg,
  },
  {
    id: 's4',
    number: '04',
    title: 'GREEN HYDROGEN',
    tagline: 'Green hydrogen and emerging clean-energy technologies.',
    image: '/images/sectors/green_hydrogen_show.webp',
    AnimatedSvg: HydrogenMoleculeSvg,
  },
  {
    id: 's5',
    number: '05',
    title: 'E-MOBILITY',
    tagline: 'Electric mobility and technologies supporting the transition to cleaner transportation.',
    image: '/images/sectors/ev_show.webp',
    AnimatedSvg: EvMobilitySvg,
  },
  {
    id: 's6',
    number: '06',
    title: 'DIGITAL & SMART ENERGY',
    tagline: 'Digital energy, IoT, AI, automation and smart-energy solutions.',
    image: '/images/sectors/windmill_energy_show.webp',
    AnimatedSvg: SmartEnergySvg,
  },
];

export function ConferenceThemesSection() {
  return (
    <section
      id="exhibition-sectors"
      className="relative w-full py-16 sm:py-24 bg-white text-slate-900 font-inter-tight border-b border-slate-100 transition-colors duration-300 overflow-hidden"
    >
      {/* ── Topographic Elevation Contours (Subtle Mountain Mapping) ── */}
      <TopographicContours opacity="opacity-[0.035] text-slate-700" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <ScrollReveal direction="up" distance={25}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#007A5E] uppercase tracking-wider font-mono">
                  EXHIBITION SECTORS
                </span>
                <div className="w-12 h-0.5 bg-[#007A5E]/40 rounded-full" />
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-slate-900 leading-[1.18] tracking-tight">
                Explore the technologies shaping <br className="hidden sm:inline" />
                <span className="text-[#007A5E]">Nepal&apos;s clean-energy future.</span>
              </h2>

              <p className="text-sm sm:text-[15px] leading-relaxed text-slate-600 font-normal">
                HIGEX 2027 brings together the technologies, projects and solutions driving Nepal&apos;s transition toward an integrated clean-energy ecosystem.
              </p>
            </div>

            {/* Creative Download PDF Button */}
            <a
              href="/Proposal.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-50 hover:bg-[#007A5E] border border-slate-200 hover:border-[#007A5E] text-slate-800 hover:text-white text-xs font-bold tracking-wider uppercase shadow-2xs hover:shadow-md transition-all duration-200 self-start sm:self-auto shrink-0"
            >
              <FileText className="w-4 h-4 text-[#007A5E] group-hover:text-white transition-colors" />
              <span>DOWNLOAD PROPOSAL (PDF)</span>
              <span className="w-6 h-6 rounded-full bg-slate-200/60 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </a>
          </div>
        </ScrollReveal>

        {/* 6 Clean Core Sector Cards */}
        <ScrollReveal direction="up" distance={30} stagger={0.08} duration={0.65}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {exhibitionSectors.map((sector) => {
              const AnimatedSvg = sector.AnimatedSvg;

              return (
                <div
                  key={sector.id}
                  className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06),0_12px_28px_-8px_rgba(0,122,94,0.07)] hover:shadow-[0_22px_45px_-10px_rgba(0,122,94,0.22)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Visual Frame with Inset Shadow */}
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.1)]">
                      <Image
                        src={sector.image}
                        alt={sector.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:opacity-80 transition-opacity" />

                      {/* Lively Animated SVG Emblem in Corner */}
                      <div className="absolute top-3.5 left-3.5 w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-md p-1.5 shadow-[0_6px_16px_rgba(0,0,0,0.2)] flex items-center justify-center group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(0,229,153,0.4)] transition-all duration-300 border border-slate-100">
                        <AnimatedSvg className="w-full h-full" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2 pt-1">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#007A5E] transition-colors leading-tight tracking-tight">
                        <span className="font-mono text-[#007A5E] mr-2">{sector.number} —</span>
                        <span>{sector.title}</span>
                      </h3>
                      <p className="text-xs sm:text-[13.5px] text-slate-500 leading-relaxed font-normal">
                        {sector.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Creative Bottom Link */}
                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href="/book-stall"
                      className="group/btn inline-flex items-center gap-2 text-xs font-bold text-[#007A5E] hover:text-[#005B46] transition-colors"
                    >
                      <span>EXHIBIT IN THIS SECTOR</span>
                      <span className="w-5 h-5 rounded-full bg-emerald-100 group-hover/btn:bg-[#007A5E] group-hover/btn:text-white flex items-center justify-center transition-colors">
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Small supporting line below */}
        <ScrollReveal direction="up" distance={20} delay={0.15}>
          <div className="mt-12 sm:mt-16 pt-8 border-t border-slate-200/80">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-slate-50/90 border border-slate-200/80">
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#007A5E] animate-pulse" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  Also represented across the exhibition:
                </span>
              </div>
              <p className="text-xs sm:text-[13px] font-medium text-slate-600 leading-relaxed">
                Transmission &amp; Distribution <span className="text-slate-300 mx-1.5">·</span> 
                Power &amp; Electricals <span className="text-slate-300 mx-1.5">·</span> 
                Engineering &amp; Construction <span className="text-slate-300 mx-1.5">·</span> 
                Investment &amp; Finance <span className="text-slate-300 mx-1.5">·</span> 
                Climate Technology <span className="text-slate-300 mx-1.5">·</span> 
                Knowledge &amp; Innovation
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

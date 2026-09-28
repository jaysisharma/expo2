'use client';

import React from 'react';
import Image from 'next/image';
import { ScrollReveal } from '@/components/ui';

interface CategoryItem {
  num: string;
  title: string;
  description: string;
}

const VISITOR_CATEGORIES: CategoryItem[] = [
  {
    num: '01',
    title: 'Government & Policy',
    description: 'Policymakers, regulators, government officials, national and international delegations, diplomats.',
  },
  {
    num: '02',
    title: 'Business & Investment',
    description: 'Investors, investment partners, banks, financial institutions, project developers.',
  },
  {
    num: '03',
    title: 'Engineering & Infrastructure',
    description: 'EPC contractors, engineers, project managers, consultants, construction companies.',
  },
  {
    num: '04',
    title: 'Technology & Industry',
    description: 'Technology providers, importers, exporters, dealers, distributors, manufacturers.',
  },
  {
    num: '05',
    title: 'Knowledge & Innovation',
    description: 'Researchers, universities, students, entrepreneurs.',
  },
  {
    num: '06',
    title: 'Sustainability & Media',
    description: 'NGOs, INGOs, sustainability professionals, journalists, industry analysts, energy media.',
  },
];

const EXHIBITOR_CATEGORIES: CategoryItem[] = [
  {
    num: '01',
    title: 'Energy & Projects',
    description: 'Hydropower, solar, wind, biogas & biomass, IPPs, project license holders.',
  },
  {
    num: '02',
    title: 'Investment & Finance',
    description: 'Investors, investment partners, banks, financial institutions, insurance companies.',
  },
  {
    num: '03',
    title: 'Power & Electricals',
    description: 'Turbines, generators, solar PV, inverters, batteries, storage, transformers, switchgear.',
  },
  {
    num: '04',
    title: 'Renewable & Emerging Technology',
    description: 'Wind, biogas, biomass, waste-to-energy, energy management, climate tech.',
  },
  {
    num: '05',
    title: 'Transmission & Distribution',
    description: 'Transmission and distribution companies, electric utilities, grid technology.',
  },
  {
    num: '06',
    title: 'Engineering & Construction',
    description: 'Contractors, engineering & consultancy, construction materials, steel, cement, pipes.',
  },
  {
    num: '07',
    title: 'Digital & Smart Energy',
    description: 'IT, digital energy, IoT, AI, automation, smart energy solutions.',
  },
  {
    num: '08',
    title: 'Government & Institutions',
    description: 'Authorities, regulators, industry associations, INGOs, NGOs, development organizations.',
  },
  {
    num: '09',
    title: 'Knowledge & Innovation',
    description: 'Universities, research institutions, startups, innovation hubs, technology innovators.',
  },
];

export function WhoWillYouMeetSection() {
  return (
    <section
      id="who-will-you-meet"
      className="relative w-full bg-[#F5F6F5] text-slate-900 py-16 sm:py-24 border-t border-slate-200/80 overflow-hidden font-sans"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <ScrollReveal direction="up" distance={25} duration={0.6}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* ── LEFT COLUMN (40% width): Header + Dam & Mountain Clay Visual ── */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-8">
              {/* Header Box */}
              <div>
                {/* Eyebrow */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold text-[#147D72] uppercase tracking-wider font-mono">
                    WHO WILL YOU MEET?
                  </span>
                  <div className="w-12 h-0.5 bg-[#147D72]/40 rounded-full" />
                </div>

                {/* Main Headline */}
                <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-[#0D2E37] tracking-tight leading-[1.12]">
                  The People <br />
                  Behind Nepal’s <br />
                  <span className="text-[#147D72]">Energy Future.</span>
                </h2>

                {/* Description */}
                <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md font-normal">
                  HIGEX 2027 brings together industry leaders, investors, policymakers, technology providers, developers and energy professionals to explore opportunities across Nepal’s evolving clean-energy landscape.
                </p>

                {/* Verified Stats */}
                <div className="mt-6 pt-5 border-t border-slate-300/70 flex items-center gap-8">
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#0D2E37] font-mono leading-none">
                      100+
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium uppercase tracking-wider mt-1">
                      Expected Exhibitors
                    </div>
                  </div>

                  <div className="w-px h-9 bg-slate-300" />

                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#0D2E37] font-mono leading-none">
                      50,000+
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium uppercase tracking-wider mt-1">
                      Expected Visitors
                    </div>
                  </div>
                </div>
              </div>

              {/* Dam & Mountain Landscape: Bleeds to left edge, unzoomed natural aspect ratio, no card container */}
              <div className="relative -ml-4 sm:-ml-6 lg:-ml-12 w-[calc(100%+1rem)] sm:w-[calc(100%+1.5rem)] lg:w-[calc(100%+3rem)] aspect-[3/4] select-none mt-4">
                <Image
                  src="/images/higex_brush_dam.jpg"
                  alt="Himalayan Dam and Mountain Reservoir in Nepal with Brush Edge"
                  fill
                  className="object-contain object-left-bottom"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  priority
                />
              </div>
            </div>

            {/* ── RIGHT COLUMN (60% width): Top Exhibition Photo with Dry Brush Splatter Edge + Two Breakout Lists ── */}
            <div className="lg:col-span-7 flex flex-col space-y-8 lg:space-y-10">
              
              {/* Wide Exhibition Hall Panoramic Photo with Authentic Dry Brush Stroke Edge */}
              <div className="relative w-full h-56 sm:h-72 lg:h-84 overflow-hidden group">
                <Image
                  src="/images/higex_brush_hall.jpg"
                  alt="HIGEX 2027 Clean Energy Trade Exhibition Hall with Brush Stroke Edge"
                  fill
                  className="object-cover object-right group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              </div>

              {/* Bottom Two-Column Breakout: VISITORS vs EXHIBITORS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 pt-2">
                
                {/* ── Column 1: VISITORS (01 to 06) ── */}
                <div className="space-y-5">
                  {/* Eyebrow & Title */}
                  <div className="border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-[11px] font-bold text-[#147D72] uppercase tracking-wider font-mono">
                        VISITORS
                      </span>
                      <div className="w-8 h-0.5 bg-[#147D72]/40 rounded-full" />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-[#0D2E37] tracking-tight leading-tight">
                      A diverse audience <br />
                      driving real change.
                    </h3>
                  </div>

                  {/* List 01 to 06 */}
                  <div className="space-y-3 sm:space-y-3.5">
                    {VISITOR_CATEGORIES.map((item) => (
                      <div
                        key={item.num}
                        className="flex items-start gap-3 sm:gap-3.5 group pb-2.5 border-b border-slate-200/60 last:border-b-0"
                      >
                        <span className="font-mono text-base sm:text-lg font-bold text-[#147D72] shrink-0 w-6">
                          {item.num}
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-[#0D2E37] leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5 font-normal">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Column 2: EXHIBITORS (01 to 09) ── */}
                <div className="space-y-5">
                  {/* Eyebrow & Title */}
                  <div className="border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-[11px] font-bold text-[#147D72] uppercase tracking-wider font-mono">
                        EXHIBITORS
                      </span>
                      <div className="w-8 h-0.5 bg-[#147D72]/40 rounded-full" />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-[#0D2E37] tracking-tight leading-tight">
                      Showcasing solutions <br />
                      for a brighter tomorrow.
                    </h3>
                  </div>

                  {/* List 01 to 09 */}
                  <div className="space-y-3 sm:space-y-3.5">
                    {EXHIBITOR_CATEGORIES.map((item) => (
                      <div
                        key={item.num}
                        className="flex items-start gap-3 sm:gap-3.5 group pb-2.5 border-b border-slate-200/60 last:border-b-0"
                      >
                        <span className="font-mono text-base sm:text-lg font-bold text-[#147D72] shrink-0 w-6">
                          {item.num}
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-[#0D2E37] leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5 font-normal">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default WhoWillYouMeetSection;

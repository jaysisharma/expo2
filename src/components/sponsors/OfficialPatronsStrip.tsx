'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

export function OfficialPatronsStrip() {
  const keyPartners = [
    {
      name: 'Ministry of Energy, Water Resources & Irrigation',
      logo: '/images/sponsors/patron/moewri.png',
      url: 'https://moewri.gov.np',
    },
    {
      name: 'Nepal Electricity Authority',
      logo: '/images/sponsors/endorsed_by/nea.webp',
      url: 'https://nea.org.np',
    },
    {
      name: 'Electricity Regulatory Commission',
      logo: '/images/sponsors/endorsed_by/Electricity_Regulatory_Commission.png',
      url: 'https://erc.gov.np',
    },
    {
      name: 'Hydroelectricity Investment & Development Company',
      logo: '/images/sponsors/endorsed_by/hidc.webp',
      url: 'https://hidcl.org.np',
    },
    {
      name: 'IPPAN',
      logo: '/images/ippan_vector.svg',
      url: 'https://ippan.org.np',
    },
    {
      name: 'Event Solution',
      logo: '/images/event_solution_vector.svg',
      url: 'https://eventsolutionnepal.com.np/',
    },
    {
      name: 'FNCCI',
      logo: '/images/sponsors/endorsed_by/fncci.webp',
      url: 'https://fncci.org',
    },
    {
      name: 'Confederation of Nepalese Industries',
      logo: '/images/sponsors/endorsed_by/cni.webp',
      url: 'https://cnind.org',
    },
    {
      name: 'Embassy of India',
      logo: '/images/sponsors/country_partners/indian_embassy.webp',
      url: 'https://www.indembkathmandu.gov.np',
    },
    {
      name: 'PTC India Limited',
      logo: '/images/sponsors/sponsor/ptc-india.jpeg',
      url: 'https://www.ptcindia.com',
    },
  ];

  return (
    <div className="w-full bg-[var(--c-bg)] border-y border-black/[0.08] dark:border-white/[0.1] py-8 sm:py-10 font-sans select-none overflow-hidden relative transition-colors duration-300">
      <ScrollReveal direction="up" distance={25} duration={0.7}>
        {/* Top Header Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-[#007A5E] uppercase tracking-wider font-mono">
                  OUR PREVIOUS PARTNERS
                </span>
                <div className="w-12 h-0.5 bg-[#007A5E]/40 rounded-full" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Supported by Leading Organizations in Previous Editions
              </h2>
            </div>

            <Link
              href="/sponsors"
              className="group inline-flex items-center gap-2 text-xs font-bold text-[#007A5E] hover:text-[#005B46] dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
            >
              <span>VIEW ALL PARTNERS &amp; SPONSORS</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Side Fade Gradient Overlays */}
        <div className="pointer-events-none absolute left-0 top-16 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[var(--c-bg)] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-16 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[var(--c-bg)] to-transparent z-10" />

        {/* Infinite Moving Strip with CSS Keyframe Animation */}
        <div className="flex whitespace-nowrap overflow-hidden py-2">
          <div
            className="flex items-center gap-8 sm:gap-14 flex-shrink-0 animate-[marquee_30s_linear_infinite]"
            style={{ willChange: 'transform' }}
          >
            {[...keyPartners, ...keyPartners].map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-14 sm:h-16 w-32 sm:w-44 lg:w-52 relative flex items-center justify-center flex-shrink-0 bg-white/90 dark:bg-white/10 rounded-xl px-4 py-2 border border-black/5 dark:border-white/10 opacity-90 hover:opacity-100 transition-all duration-200 group"
                title={item.name}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={item.logo}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 140px, 200px"
                    className="object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

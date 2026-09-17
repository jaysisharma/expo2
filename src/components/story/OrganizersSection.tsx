'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

export function OrganizersSection() {
  return (
    <section className="relative w-full py-16 sm:py-24 bg-[var(--c-bg)] text-[var(--c-text-primary)] font-sans border-b border-black/[0.08] dark:border-white/[0.1] transition-colors duration-300">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 flex flex-col justify-center">
        {/* Compact Section Header */}
        <ScrollReveal direction="up" distance={25}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10 mb-8">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#218A59]/10 text-[#218A59] dark:bg-[#25C176]/15 dark:text-[#25C176] border border-[#218A59]/25 dark:border-[#25C176]/30 text-xs font-mono font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#218A59] dark:bg-[#25C176] animate-pulse" />
                <span>BEHIND THE EXPO</span>
              </div>

              <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight text-gray-900 dark:text-white leading-tight">
                POWERED BY INDUSTRY. <br />
                <span className="text-[#234679] dark:text-[#4A7EC7]">DELIVERED WITH EXPERIENCE.</span>
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-normal max-w-md leading-relaxed">
              Organized jointly by Nepal&apos;s apex clean energy producers and premier trade exhibition leaders.
            </p>
          </div>
        </ScrollReveal>

        {/* 2 Balanced Organizer Cards with Center Connector */}
        <ScrollReveal direction="up" distance={35} duration={0.75}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT CARD: IPPAN */}
          <div className="lg:col-span-5 bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#234679]/50 dark:hover:border-[#4A7EC7]/50 hover:shadow-lg transition-all duration-300 group">
            <div className="space-y-4">
              {/* Header: Logo & Organizer Tag */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
                <div className="relative h-12 w-36 shrink-0 bg-white dark:bg-white/95 rounded-lg px-2 py-1 flex items-center justify-center">
                  <Image
                    src="/ippan.png"
                    alt="IPPAN Logo"
                    fill
                    className="object-contain p-1.5"
                  />
                </div>
                <span className="px-2.5 py-1 rounded-md bg-[#234679]/10 text-[#234679] dark:bg-[#4A7EC7]/15 dark:text-[#6FA0E8] border border-[#234679]/20 font-mono text-[10px] font-bold uppercase tracking-wider">
                  ORGANIZER
                </span>
              </div>

              <div>
                <h3 className="font-display font-black text-xl sm:text-2xl text-gray-900 dark:text-white tracking-tight">
                  IPPAN
                </h3>
                <div className="text-xs font-semibold text-[#234679] dark:text-[#6FA0E8]">
                  Independent Power Producers&apos; Association, Nepal
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-normal leading-relaxed">
                Nepal&apos;s national association of private clean energy producers. IPPAN represents hydropower developers, helps shape energy policies, and works to expand clean electricity across Nepal and South Asia.
              </p>

              {/* Key Highlights */}
              <div className="flex flex-wrap gap-2 pt-1">
                {['Private Energy Producers', 'Energy Policy & Advocacy', 'Cross-Border Power Trade'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 text-[11px] font-mono font-medium text-gray-800 dark:text-gray-200"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Official Portal Link */}
            <div className="pt-4 mt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
              <a
                href="https://ippan.org.np"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#234679] dark:text-[#6FA0E8] hover:text-[#218A59] dark:hover:text-[#25C176] transition-colors"
              >
                <span>VISIT IPPAN WEBSITE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* CENTER CONNECTOR */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center py-2 lg:py-0">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-px h-10 bg-black/15 dark:bg-white/15 hidden lg:block" />
              <div className="px-3 py-1.5 rounded-full bg-white dark:bg-[#0E1A29] border-2 border-black/15 dark:border-white/15 flex items-center justify-center shadow-sm">
                <span className="font-display text-xs sm:text-sm font-black text-[#218A59] dark:text-[#25C176] tracking-wide lowercase">
                  and
                </span>
              </div>
              <div className="w-px h-10 bg-black/15 dark:bg-white/15 hidden lg:block" />
              <span className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">
                JOINT ORGANIZERS
              </span>
            </div>
          </div>

          {/* RIGHT CARD: EVENT SOLUTION */}
          <div className="lg:col-span-5 bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#218A59]/50 dark:hover:border-[#25C176]/50 hover:shadow-lg transition-all duration-300 group">
            <div className="space-y-4">
              {/* Header: Logo & Organizer Tag */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
                <div className="relative h-12 w-36 shrink-0 bg-white dark:bg-white/95 rounded-lg px-2 py-1 flex items-center justify-center">
                  <Image
                    src="/event_solution.png"
                    alt="Event Solution Logo"
                    fill
                    className="object-contain p-1.5"
                  />
                </div>
                <span className="px-2.5 py-1 rounded-md bg-[#218A59]/10 text-[#218A59] dark:bg-[#25C176]/15 dark:text-[#25C176] border border-[#218A59]/20 font-mono text-[10px] font-bold uppercase tracking-wider">
                  ORGANIZER
                </span>
              </div>

              <div>
                <h3 className="font-display font-black text-xl sm:text-2xl text-gray-900 dark:text-white tracking-tight">
                  EVENT SOLUTION
                </h3>
                <div className="text-xs font-semibold text-[#218A59] dark:text-[#25C176]">
                  Event Solution Pvt. Ltd.
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-normal leading-relaxed">
                Nepal&apos;s leading event and exhibition management company. Event Solution handles international pavilions, stall construction, stage setup, and complete on-ground operations for large trade fairs.
              </p>

              {/* Key Highlights */}
              <div className="flex flex-wrap gap-2 pt-1">
                {['Exhibition Management', 'International Pavilions', 'Stall Setup & Operations'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 text-[11px] font-mono font-medium text-gray-800 dark:text-gray-200"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Official Website & Contact Link */}
            <div className="pt-4 mt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
              <a
                href="https://eventsolutionnepal.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#218A59] dark:text-[#25C176] hover:text-[#234679] dark:hover:text-[#4A7EC7] transition-colors"
              >
                <span>VISIT EVENT SOLUTION WEBSITE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <Link
                href="/contact"
                className="text-[11px] font-mono font-semibold text-gray-500 hover:text-[#218A59] dark:text-gray-400 dark:hover:text-[#25C176] underline"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

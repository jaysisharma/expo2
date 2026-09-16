'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { speakersData } from '@/data/speakers';
import { eventSolutionTeam } from '@/data/eventSolutionTeam';
import { ScrollReveal } from '@/components/ui';

export function SpeakersSection() {
  return (
    <section
      id="speakers-section"
      className="relative w-full py-16 sm:py-20 bg-[var(--c-bg)] text-[var(--c-text-primary)] font-sans border-b border-black/[0.08] dark:border-white/[0.1] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 space-y-14">
        {/* PART 01: IPPAN LEADERSHIP */}
        <div>
          <ScrollReveal direction="up" distance={25}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-black/10 dark:border-white/10 mb-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#234679]/10 text-[#234679] dark:bg-[#4A7EC7]/15 dark:text-[#6FA0E8] border border-[#234679]/20 font-mono text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#218A59] dark:bg-[#25C176] animate-pulse" />
                  <span>IPPAN LEADERSHIP</span>
                </div>
                <h2 className="font-display font-black text-xl sm:text-3xl text-gray-900 dark:text-white tracking-tight">
                  Executive Committee Members
                </h2>
              </div>

              <Link
                href="/speakers"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#234679] dark:text-[#6FA0E8] hover:text-[#218A59] dark:hover:text-[#25C176] transition-colors uppercase tracking-wider self-start sm:self-auto"
              >
                <span>View All IPPAN Members</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Compact Card Grid with Stagger */}
          <ScrollReveal direction="up" distance={30} stagger={0.06} duration={0.6}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4.5">
              {speakersData.slice(0, 8).map((speaker) => (
                <div
                  key={speaker.id}
                  className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.03] p-2.5 hover:border-[#234679] dark:hover:border-[#4A7EC7] hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  {/* Compact Portrait */}
                  <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden bg-black/5 dark:bg-black/40">
                    <Image
                      src={speaker.photo}
                      alt={speaker.name}
                      fill
                      unoptimized
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Text Block */}
                  <div className="pt-2 pb-0.5 px-0.5 text-center space-y-0.5">
                    <h3 className="font-display font-bold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-[#234679] dark:group-hover:text-[#6FA0E8] transition-colors leading-snug line-clamp-1">
                      {speaker.name}
                    </h3>
                    <div className="text-[10px] sm:text-[11px] font-mono font-medium text-[#234679] dark:text-[#6FA0E8] line-clamp-1">
                      {speaker.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* PART 02: EVENT SOLUTION TEAM */}
        <div className="pt-4 border-t border-black/10 dark:border-white/10">
          <ScrollReveal direction="up" distance={25}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-black/10 dark:border-white/10 mb-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#218A59]/10 text-[#218A59] dark:bg-[#25C176]/15 dark:text-[#25C176] border border-[#218A59]/20 font-mono text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#218A59] dark:bg-[#25C176] animate-pulse" />
                  <span>EVENT SOLUTION LEADERSHIP</span>
                </div>
                <h2 className="font-display font-black text-xl sm:text-3xl text-gray-900 dark:text-white tracking-tight">
                  Event Solution Team
                </h2>
              </div>

              <a
                href="https://eventsolutionnepal.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#218A59] dark:text-[#25C176] hover:text-[#234679] dark:hover:text-[#4A7EC7] transition-colors uppercase tracking-wider self-start sm:self-auto"
              >
                <span>Visit Event Solution Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </ScrollReveal>

          {/* Card Grid with Stagger */}
          <ScrollReveal direction="up" distance={30} stagger={0.06} duration={0.6}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4.5">
              {eventSolutionTeam.map((member) => (
                <div
                  key={member.id}
                  className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.03] p-2.5 hover:border-[#218A59] dark:hover:border-[#25C176] hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  {/* Compact Portrait */}
                  <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden bg-white dark:bg-black/40">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      unoptimized
                      className={`object-cover object-top ${
                        member.id === 'vinesh-chordia' ? 'translate-y-[10px]' : 'translate-y-[50px]'
                      } scale-105 group-hover:scale-110 transition-transform duration-300`}
                    />
                  </div>

                  {/* Text Block */}
                  <div className="pt-2 pb-0.5 px-0.5 text-center space-y-0.5">
                    <h3 className="font-display font-bold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-[#218A59] dark:group-hover:text-[#25C176] transition-colors leading-snug line-clamp-1">
                      {member.name}
                    </h3>
                    <div className="text-[10px] sm:text-[11px] font-mono font-medium text-[#218A59] dark:text-[#25C176] line-clamp-1">
                      {member.position}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

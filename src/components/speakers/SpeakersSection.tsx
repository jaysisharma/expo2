'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { speakersData } from '@/data/speakers';
import { eventSolutionTeam } from '@/data/eventSolutionTeam';
import { ScrollReveal } from '@/components/ui';

export function SpeakersSection() {
  return (
    <section
      id="speakers-section"
      className="relative w-full py-16 sm:py-24 bg-[#FAFAFA] text-slate-900 font-inter-tight border-b border-slate-200/80 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 space-y-16">

        {/* ── PART 01: IPPAN LEADERSHIP ─────────────────────────────────── */}
        <div>
          <ScrollReveal direction="up" distance={25}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-12">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#007A5E] uppercase tracking-wider font-mono">
                    WHO&apos;S BEHIND THE EXPO
                  </span>
                  <div className="w-12 h-0.5 bg-[#007A5E]/40 rounded-full" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                  Nepal&apos;s Clean Energy Leaders
                </h2>
                <p className="text-sm text-slate-600 font-normal leading-relaxed">
                  Established in 2001, IPPAN is the autonomous apex body encouraging private-sector participation and connecting developers with government and energy stakeholders.
                </p>
              </div>

              <Link
                href="/speakers"
                className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white hover:bg-[#007A5E] border border-slate-200 hover:border-[#007A5E] text-slate-800 hover:text-white text-xs font-bold tracking-wider uppercase shadow-2xs hover:shadow-md transition-all duration-200 self-start sm:self-auto shrink-0"
              >
                <span>View All Members</span>
                <span className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </ScrollReveal>

          {/* Cards with bio snippet */}
          <ScrollReveal direction="up" distance={30} stagger={0.06} duration={0.6}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {speakersData.slice(0, 5).map((speaker) => (
                <div
                  key={speaker.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-3 sm:p-4 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Portrait */}
                  <div className="relative aspect-[4/5] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 mb-3">
                    <Image
                      src={speaker.photo}
                      alt={speaker.name}
                      fill
                      unoptimized
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Name + role */}
                  <div className="space-y-0.5 px-1 pb-1">
                    <h3 className="font-bold text-sm sm:text-[15px] text-slate-900 group-hover:text-[#007A5E] transition-colors leading-snug line-clamp-1">
                      {speaker.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-snug line-clamp-1">
                      {speaker.title}, IPPAN
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* ── PART 02: EVENT SOLUTION TEAM ──────────────────────────────── */}
        <div className="pt-8 border-t border-slate-200/80">
          <ScrollReveal direction="up" distance={25}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-12">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#007A5E] uppercase tracking-wider font-mono">
                    ON-GROUND EXECUTION
                  </span>
                  <div className="w-12 h-0.5 bg-[#007A5E]/40 rounded-full" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                  Event Solution Team
                </h2>
                <p className="text-sm text-slate-600 font-normal leading-relaxed">
                  Founded in 2014, Event Solution Nepal is an event management company focused on creating and delivering events from planning through execution.
                </p>
              </div>

              <a
                href="https://eventsolutionnepal.com.np/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white hover:bg-[#007A5E] border border-slate-200 hover:border-[#007A5E] text-slate-800 hover:text-white text-xs font-bold tracking-wider uppercase shadow-2xs hover:shadow-md transition-all duration-200 self-start sm:self-auto shrink-0"
              >
                <span>Visit Event Solution</span>
                <span className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" distance={30} stagger={0.06} duration={0.6}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {eventSolutionTeam.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-3 sm:p-4 hover:border-slate-300 hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  <div className="relative aspect-[4/5] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 mb-3">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      unoptimized
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="space-y-1 px-1 pb-1">
                    <h3 className="font-bold text-sm sm:text-[15px] text-slate-900 group-hover:text-[#007A5E] transition-colors leading-snug line-clamp-1">
                      {member.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-snug line-clamp-1">
                      {member.position}
                    </p>
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

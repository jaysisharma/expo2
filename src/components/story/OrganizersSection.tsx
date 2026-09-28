'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

export function OrganizersSection() {
  return (
    <section
      id="behind-the-expo"
      className="relative w-full py-16 sm:py-24 bg-white text-slate-900 font-inter-tight border-b border-slate-100 transition-colors duration-300"
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 flex flex-col justify-center">
        {/* Section Header (Giveon Style) */}
        <ScrollReveal direction="up" distance={25}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#007A5E] uppercase tracking-wider font-mono">
                  BEHIND THE EXPO
                </span>
                <div className="w-12 h-0.5 bg-[#007A5E]/40 rounded-full" />
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-slate-900 leading-[1.18] tracking-tight">
                Jointly Organized by{' '}
                <span className="text-[#007A5E]">Two Pillars</span>
              </h2>

              <p className="text-sm sm:text-[15px] leading-relaxed text-slate-600 font-normal">
                Himalayan Green Energy Expo is jointly organized by IPPAN — Nepal&apos;s apex clean energy body — and Event Solution, the country&apos;s leading exhibition management company.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* 2 Balanced Organizer Cards with Center Connector */}
        <ScrollReveal direction="up" distance={30} duration={0.75}>
          <div className="relative">
            {/* Desktop Center Connector: Jointly Organized */}
            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center pointer-events-none">
              <span className="px-4 py-1.5 rounded-full bg-[#007A5E] text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg whitespace-nowrap">
                Jointly Organized
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              {/* LEFT CARD: IPPAN */}
              <div className="lg:col-span-6 bg-slate-50/70 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-7 sm:p-9 flex flex-col justify-between hover:border-emerald-300 hover:bg-emerald-50/20 hover:shadow-xl transition-all duration-300 group">
                <div className="space-y-5">
                  {/* Header: Logo */}
                  <div className="pb-5 border-b border-slate-200/80">
                    <div className="relative h-12 w-40 shrink-0 bg-white rounded-xl p-2 border border-slate-200/60 shadow-2xs flex items-center justify-center">
                      <Image
                        src="/images/ippan_vector.svg"
                        alt="IPPAN Logo"
                        fill
                        className="object-contain p-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                      IPPAN
                    </h3>
                    <div className="text-xs font-bold text-[#007A5E] mt-0.5">
                      Independent Power Producers&apos; Association, Nepal
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 font-normal leading-relaxed">
                    Established in 2001, IPPAN is a non-profit, non-government autonomous organization established to encourage private-sector participation in Nepal&apos;s hydropower sector. It serves as a link between private power developers and government organizations, while supporting the exchange of technology, expertise, knowledge, financial and management information among independent power producers.
                  </p>

                  {/* Key Highlights */}
                  <div className="space-y-2.5 pt-2">
                    {[
                      'Promoting private-sector participation in Nepal’s energy sector',
                      'Connecting the private sector with government and energy stakeholders',
                      'Advocating for an investor-friendly environment for power development',
                    ].map((highlight) => (
                      <div key={highlight} className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-[#007A5E] shrink-0" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Official Portal Link */}
                <div className="pt-6 mt-6 border-t border-slate-200/80 flex items-center justify-between">
                  <a
                    href="https://www.ippan.org.np/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center gap-2 text-xs font-bold text-[#007A5E] hover:text-[#005B46] transition-colors"
                  >
                    <span>VISIT IPPAN OFFICIAL PORTAL</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Mobile Center Divider: Jointly Organized */}
              <div className="lg:hidden flex items-center justify-center -my-3 z-10">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border-2 border-[#007A5E] shadow-md text-[#007A5E] text-xs font-bold uppercase tracking-wider">
                  <span>Jointly Organized</span>
                </div>
              </div>

              {/* RIGHT CARD: EVENT SOLUTION */}
              <div className="lg:col-span-6 bg-slate-50/70 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-7 sm:p-9 flex flex-col justify-between hover:border-emerald-300 hover:bg-emerald-50/20 hover:shadow-xl transition-all duration-300 group">
              <div className="space-y-5">
                {/* Header: Logo */}
                <div className="pb-5 border-b border-slate-200/80">
                  <div className="relative h-12 w-40 shrink-0 bg-white rounded-xl p-2 border border-slate-200/60 shadow-2xs flex items-center justify-center">
                    <Image
                      src="/images/event_solution_vector.svg"
                      alt="Event Solution Logo"
                      fill
                      className="object-contain p-1.5"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                    EVENT SOLUTION
                  </h3>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">
                    Event Solution Nepal Pvt. Ltd.
                  </div>
                </div>

                <p className="text-sm text-slate-600 font-normal leading-relaxed">
                  Founded in 2014, Event Solution Nepal is an event management company focused on creating and delivering events from planning through execution. Its services include event planning and consulting, event management and coordination, event production and setup, event rentals, logistics and event operations, and sound, lighting and LED solutions.
                </p>

                {/* Key Highlights */}
                <div className="space-y-2.5 pt-2">
                  {[
                    '10+ years of experience',
                    '500+ events managed',
                    'Full-cycle event planning, production and execution',
                  ].map((highlight) => (
                    <div key={highlight} className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-[#007A5E] shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Website Link */}
              <div className="pt-6 mt-6 border-t border-slate-200/80 flex items-center justify-between">
                <a
                  href="https://eventsolutionnepal.com.np/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link inline-flex items-center gap-2 text-xs font-bold text-[#007A5E] hover:text-[#005B46] transition-colors"
                >
                  <span>VISIT EVENT SOLUTION PORTAL</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </a>

                <Link
                  href="/contact"
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Organizer Inquiries ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
    </section>
  );
}

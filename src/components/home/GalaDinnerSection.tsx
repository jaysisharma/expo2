'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

export function GalaDinnerSection() {
  return (
    <section
      id="gala-dinner"
      className="relative w-full py-16 sm:py-24 bg-white text-slate-900 font-inter-tight border-b border-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <ScrollReveal direction="up" distance={30} duration={0.8}>
          <div className="relative rounded-[28px] bg-[#091f2e] border border-[#16354b] p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden text-white">

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading & Metadata */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold text-[#F5B544] uppercase tracking-wider font-mono">
                      EXCLUSIVE NETWORKING EVENING
                    </span>
                    <div className="w-12 h-0.5 bg-[#F5B544]/40 rounded-full" />
                  </div>

                  <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-white tracking-tight leading-[1.15]">
                    Himalayan Green Energy Expo <br />
                    <span className="text-[#F5B544]">Gala Dinner</span>
                  </h2>
                </div>

                {/* Date, Time & Venue */}
                <div className="py-4 border-y border-slate-700/50 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <MapPin className="w-4 h-4 text-[#00E599] shrink-0" />
                    <span className="font-semibold">Royal Tulip Kathmandu (Gwarko)</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#F5B544]" />
                      <span className="font-semibold text-slate-200">Monday, 18 January 2027</span>
                    </div>
                    <span className="text-slate-600 hidden sm:inline">|</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#F5B544]" />
                      <span className="font-semibold text-slate-200">6:00 PM onwards</span>
                    </div>
                    <span className="text-slate-600 hidden sm:inline">|</span>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span className="font-medium text-slate-200">Executive Banquet & VIP Networking</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing Pass Card */}
              <div className="lg:col-span-5 relative mt-6 lg:mt-0">
                <div className="relative rounded-2xl bg-[#071722] border-2 border-[#F5B544] p-6 sm:p-8 flex flex-col justify-between shadow-2xl">

                  <div>
                    {/* Overline */}
                    <div className="text-[11px] font-mono tracking-widest uppercase text-slate-400 font-semibold">
                      GALA DINNER PASS BOOKING
                    </div>

                    {/* Card Title */}
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-1.5 mb-6">
                      Executive Dinner Pass
                    </h3>

                    {/* Price Row */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5B544] tracking-tight">
                        NPR 6,000
                      </span>
                      <span className="text-xs sm:text-sm text-slate-400 font-medium">
                        / Person
                      </span>
                    </div>

                    {/* International Price */}
                    <p className="text-[11px] sm:text-xs font-mono text-slate-400 mt-2 mb-8">
                      USD $50 for International Delegates (Excl. VAT)
                    </p>
                  </div>

                  {/* CTA Button — navigates to dedicated page */}
                  <Link
                    href="/book-gala-dinner"
                    className="w-full py-3.5 px-6 rounded-xl bg-[#F5B544] hover:bg-[#e5a83b] active:scale-[0.99] text-[#071722] font-bold text-xs sm:text-sm uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all duration-200 cursor-pointer"
                  >
                    <span>BOOK GALA DINNER PASS</span>
                    <ArrowRight className="w-4 h-4 text-[#071722]" />
                  </Link>

                  <p className="text-center text-[11px] font-mono text-slate-400 mt-4">
                    Instant Khalti ePayment & corporate table reservations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

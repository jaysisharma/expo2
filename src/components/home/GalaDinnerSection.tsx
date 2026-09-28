'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui';
import { GalaBookingModal } from '@/components/booking/GalaBookingModal';

export function GalaDinnerSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <section
      id="gala-dinner"
      className="relative w-full py-16 sm:py-24 bg-white text-slate-900 font-inter-tight border-b border-slate-100 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <ScrollReveal direction="up" distance={30} duration={0.8}>
          <div className="relative rounded-[28px] bg-gradient-to-br from-[#091f2e] via-[#071824] to-[#040f18] border border-[#16354b] p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden text-white">
            {/* Subtle Atmospheric Glows */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F5B544]/10 rounded-full blur-3xl pointer-events-none" />

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

                  {/* Heading */}
                  <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-white tracking-tight leading-[1.15]">
                    Himalayan Green Energy Expo <br />
                    <span className="text-[#F5B544]">Gala Dinner</span>
                  </h2>
                </div>

                {/* Date, Time & Venue Metadata */}
                <div className="py-4 border-y border-slate-700/50 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#F5B544]" />
                    <span className="font-semibold text-slate-200">Saturday, 17 January 2027</span>
                  </div>
                  <span className="text-slate-600 hidden sm:inline">|</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#F5B544]" />
                    <span className="font-semibold text-slate-200">After 6:00 PM NPT</span>
                  </div>
                  <span className="text-slate-600 hidden sm:inline">|</span>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#00E599]" />
                    <span className="font-medium text-slate-200">Royal Tulip Hotel, Kathmandu</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing Pass Card */}
              <div className="lg:col-span-5 relative mt-6 lg:mt-0">
                <div className="relative rounded-2xl bg-[#071722] border-2 border-[#F5B544] p-6 sm:p-8 flex flex-col justify-between shadow-2xl">

                  <div>
                    {/* Overline */}
                    <div className="text-[11px] font-mono tracking-widest uppercase text-slate-400 font-semibold">
                      GALA DINNER PASS
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

                  {/* CTA Button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#F5B544] hover:bg-[#e5a83b] active:scale-[0.99] text-[#071722] font-bold text-xs sm:text-sm uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all duration-200 cursor-pointer"
                    >
                      <span>BOOK GALA DINNER (NPR 6,000)</span>
                      <ArrowRight className="w-4 h-4 text-[#071722]" />
                    </button>

                    {/* Reservation Note */}
                    <div className="text-center mt-4 space-y-1">
                      <p className="text-[11px] font-mono text-slate-400">
                        Instant Khalti ePayment &amp; corporate table reservations.
                      </p>
                      <Link
                        href="/book-gala-dinner"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#F5B544] hover:underline"
                      >
                        <span>Open dedicated booking page</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Gala Booking Modal with Khalti Gateway */}
      <GalaBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTier="national"
      />
    </section>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Wine,
  Users,
  Award,
  Music,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

export function GalaDinnerSection() {
  const galaHighlights = [
    {
      icon: Users,
      title: 'Sovereign & Multilateral Leaders',
      desc: 'Network with the Minister of Energy, NEA Managing Director, IPPAN leadership, and international ambassadors.',
    },
    {
      icon: Award,
      title: 'Clean Energy Excellence Awards',
      desc: 'Celebration and recognition of pioneering hydropower developers, EPC benchmarks, and sustainable safety milestones.',
    },
    {
      icon: Wine,
      title: '5-Star Gourmet Banquet',
      desc: 'Lavish multi-course international buffet, premium beverage pairings, and executive hospitality.',
    },
    {
      icon: Music,
      title: 'Cultural Symphony & Live Ensemble',
      desc: 'Curated live cultural performances celebrating the Himalayan heritage and clean energy prosperity.',
    },
  ];

  return (
    <section className="relative w-full py-16 sm:py-24 bg-[#030B14] text-white font-sans overflow-hidden border-b border-white/10">
      {/* Subtle Golden/Emerald Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E5B54F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#218A59]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Container Box */}
        <ScrollReveal direction="up" distance={35} duration={0.8}>
          <div className="bg-gradient-to-br from-[#061A2A] to-[#0A253A] rounded-3xl border border-amber-500/30 p-8 sm:p-12 lg:p-14 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Background Image */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none">
            <Image
              src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80"
              alt="Gala Dinner Atmosphere"
              fill
              className="object-cover"
            />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Details & Value */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E5B54F]/15 border border-[#E5B54F]/40 text-xs font-mono font-bold text-[#E5B54F] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#E5B54F]" />
                <span>EXECUTIVE NETWORKING NIGHT</span>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
                  Himalayan Green Energy Expo <br />
                  <span className="text-[#E5B54F]">VIP Gala Dinner</span> & Awards
                </h2>
                <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed max-w-xl">
                  An exclusive, black-tie networking evening uniting energy ministers, sovereign utility heads, multilateral bank directors, and international OEM executives.
                </p>
              </div>

              {/* Venue & Date Metadata Bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-300 py-3 border-y border-white/10">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#E5B54F]" />
                  <span>Saturday, 17 January 2027</span>
                </div>
                <span className="text-white/20">|</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#E5B54F]" />
                  <span>07:00 PM – 10:30 PM NPT</span>
                </div>
                <span className="text-white/20">|</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#25C176]" />
                  <span>Grand Ballroom, The Soaltee Kathmandu</span>
                </div>
              </div>

              {/* 4 Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {galaHighlights.map((hl, idx) => {
                  const Icon = hl.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[#E5B54F]" />
                        <h4 className="font-bold font-display text-xs sm:text-sm text-white">
                          {hl.title}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed font-normal">
                        {hl.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Ticket Card with NPR 6,000 */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-[#040E18]/95 rounded-2xl border-2 border-[#E5B54F]/50 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 relative">
                {/* Ribbon Tag */}
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-[#E5B54F] text-[#040E18] font-mono text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                  LIMITED SEATS AVAILABLE
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-[#E5B54F] font-semibold uppercase tracking-wider block">
                    Gala Dinner Pass
                  </span>
                  <h3 className="text-2xl font-bold font-display text-white">
                    Executive Dinner Seat
                  </h3>
                </div>

                {/* Price Display */}
                <div className="py-4 border-y border-white/10 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black font-display text-[#E5B54F]">
                      NPR 6,000
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      / Person
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono block">
                    USD $45 for International Delegates (Excl. VAT)
                  </span>
                </div>

                {/* Inclusions list */}
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#25C176] shrink-0" />
                    <span>Reserved banquet seat at The Soaltee Kathmandu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#25C176] shrink-0" />
                    <span>5-Course Dinner & Premium Beverage Service</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#25C176] shrink-0" />
                    <span>Access to Ministerial & CEO Networking Cocktail</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#25C176] shrink-0" />
                    <span>Clean Energy Innovation Awards Ceremony</span>
                  </div>
                </div>

                {/* Booking Button */}
                <Link
                  href="/register?pass=gala-dinner"
                  className="w-full py-3.5 rounded-xl bg-[#E5B54F] hover:bg-[#d8a63e] text-[#040E18] font-bold text-xs text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:brightness-105 active:scale-95"
                >
                  <span>BOOK GALA DINNER (NPR 6,000)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-[10px] text-center text-gray-400 font-mono">
                  Corporate table reservations (10 Seats) available upon request.
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

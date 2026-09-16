'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Download,
  Calendar,
  MapPin,
  CheckCircle2,
  Users,
  Building2,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

export function ConversionCTASection() {
  return (
    <section
      id="register-cta"
      className="relative w-full py-20 sm:py-28 bg-[#040E1B] text-white font-sans overflow-hidden border-t border-white/10"
    >
      {/* Ambient Green & Blue Glowing Energy Orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#218A59]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#234679]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <ScrollReveal direction="up" distance={25}>
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-bold text-[#6FA0E8] uppercase tracking-wider shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25C176] animate-pulse" />
              <span>PARTICIPATE IN HIMALAYAN GREEN ENERGY EXPO</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
              BE PART OF SOUTH ASIA&apos;S <br />
              <span className="text-[#6FA0E8]">FLAGSHIP CLEAN &</span>{' '}
              <span className="text-[#25C176]">GREEN SUMMIT.</span>
            </h2>

            <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
              Join 10,000+ delegates, 150+ international exhibitors, and sovereign leaders shaping the regional green energy economy at Bhrikutimandap, Kathmandu.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-gray-300 pt-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#6FA0E8]" />
                <span>MAGH 2 - 4 · 16–18 JAN 2027</span>
              </div>
              <span className="text-white/20">|</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#25C176]" />
                <span>BHRIKUTIMANDAP, KATHMANDU</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* 2-Column Action Cards */}
        <ScrollReveal direction="up" distance={30} stagger={0.1} duration={0.7}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
            {/* Card 1: Exhibit & Book Stall */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-[#25C176]/50 hover:bg-white/10 transition-all duration-300 group shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-[#218A59]/20 border border-[#218A59]/30 text-[#25C176]">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold text-[#A7F3D0] bg-emerald-950/80 border border-emerald-400/40 px-2.5 py-1 rounded-full uppercase">
                  EARLY BIRD ACTIVE
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display font-bold text-2xl text-white">
                  Exhibit & Book a Stall
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 font-normal leading-relaxed">
                  Showcase your turbines, solar equipment, batteries, grid tech, or clean energy consulting directly to project developers and government procurement leaders.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs font-mono text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#25C176]" />
                  <span>Prime 9 sqm / 18 sqm / 36 sqm Stalls</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#25C176]" />
                  <span>Dedicated B2B Clean Energy Lounge Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#25C176]" />
                  <span>Official Expo Directory Company Listing</span>
                </div>
              </div>
            </div>

            <Link
              href="/book-stall"
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#5B9F35] to-[#218A59] hover:brightness-110 text-white font-mono text-xs font-black text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-lg active:scale-98"
            >
              <span>REGISTER AS EXHIBITOR</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Register as Visitor */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-[#6FA0E8]/50 hover:bg-white/10 transition-all duration-300 group shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-[#234679]/30 border border-[#234679]/50 text-[#6FA0E8]">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold text-[#6FA0E8] bg-[#234679]/40 border border-[#4A7EC7]/40 px-2.5 py-1 rounded-full uppercase">
                  FREE VISITOR BADGE
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display font-bold text-2xl text-white">
                  Register as Visitor
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 font-normal leading-relaxed">
                  Attend high-level policy plenaries, explore 150+ equipment pavilions, and network with clean energy pioneers across South Asia.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs font-mono text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6FA0E8]" />
                  <span>Access to All 12 Clean Energy Plenaries</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6FA0E8]" />
                  <span>Instant Digital QR Badge & Delegate Pass</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6FA0E8]" />
                  <span>Trade Floor & Technology Pavilions Entry</span>
                </div>
              </div>
            </div>

            <Link
              href="/register"
              className="w-full py-3.5 rounded-full bg-white text-[#040E1B] hover:bg-gray-100 font-mono text-xs font-black text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-lg active:scale-98"
            >
              <span>REGISTER AS VISITOR</span>
              <ArrowUpRight className="w-4 h-4 text-[#234679]" />
            </Link>
          </div>
        </div>
        </ScrollReveal>

        {/* Bottom Proposal & Document Download Bar */}
        <ScrollReveal direction="up" distance={15} delay={0.2}>
          <div className="max-w-5xl mx-auto pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-gray-400">
            <div className="flex items-center gap-2">
              <span>Official Event by IPPAN × Event Solution</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/files/hydroproposal-13-2-2024.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-white hover:text-[#25C176] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD EVENT PROPOSAL (PDF)</span>
              </a>
              <span className="text-white/20">|</span>
              <Link
                href="/contact"
                className="hover:text-white transition-colors"
              >
                CONTACT SECRETARIAT
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

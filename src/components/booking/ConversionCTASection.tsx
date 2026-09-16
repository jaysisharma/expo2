'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Download,
  Users,
  Building2,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

export function ConversionCTASection() {
  return (
    <section
      id="register-cta"
      className="relative w-full py-16 sm:py-20 bg-[#040E1B] text-white font-sans overflow-hidden border-t border-white/10"
    >
      {/* Ambient Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[450px] h-[450px] bg-[#218A59]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#234679]/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <ScrollReveal direction="up" distance={20}>
          <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-10 sm:mb-12">
            <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              Be Part of South Asia&apos;s <br className="hidden sm:inline" />
              <span className="text-[#6FA0E8]">Flagship Clean &</span>{' '}
              <span className="text-[#25C176]">Green Summit</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              16–18 January 2027 · Bhrikutimandap Exhibition Complex, Kathmandu
            </p>
          </div>
        </ScrollReveal>

        {/* 2 Focused Action Cards */}
        <ScrollReveal direction="up" distance={25} stagger={0.1} duration={0.6}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto mb-10">
            {/* Card 1: Exhibitors */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-[#25C176]/50 hover:bg-white/[0.07] transition-all duration-300 group shadow-lg">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#218A59]/20 border border-[#218A59]/30 text-[#25C176] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-xl text-white">
                    Exhibit & Book Stall
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Showcase turbines, grid systems, solar & green energy solutions to 10,000+ buyers and developers.
                  </p>
                </div>
              </div>

              <Link
                href="/book-stall"
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#5B9F35] to-[#218A59] hover:brightness-110 text-white font-mono text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98"
              >
                <span>BOOK EXHIBITION STALL</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 2: Trade Visitors */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-[#6FA0E8]/50 hover:bg-white/[0.07] transition-all duration-300 group shadow-lg">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#234679]/30 border border-[#234679]/50 text-[#6FA0E8] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-xl text-white">
                    Register as Visitor
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Access technical plenaries, explore 150+ pavilions, and receive instant digital QR entry passes.
                  </p>
                </div>
              </div>

              <Link
                href="/register"
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#234679] via-[#087EA4] to-[#0284C7] hover:brightness-110 !text-white font-mono text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-900/40 border border-cyan-400/40 active:scale-98"
              >
                <span className="!text-white">GET FREE VISITOR PASS</span>
                <ArrowUpRight className="w-4 h-4 !text-white" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom Document Download Link */}
        <ScrollReveal direction="up" distance={15} delay={0.15}>
          <div className="max-w-4xl mx-auto pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <span>IPPAN × Event Solution</span>
            <div className="flex items-center gap-4">
              <a
                href="/files/hydroproposal-13-2-2024.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-300 hover:text-[#25C176] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Event Proposal (PDF)</span>
              </a>
              <span className="text-white/20">·</span>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact Secretariat
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Download,
  Users,
  Building2,
  CheckCircle2,
  Phone,
  Mail,
} from 'lucide-react';
import { ScrollReveal, TopographicContours, MountainCrestSvg } from '@/components/ui';
import { CONTACT_DETAILS } from '@/data/contactInfo';

export function ConversionCTASection() {
  return (
    <section
      id="closing-call-to-partnership"
      className="relative w-full py-16 sm:py-24 bg-[#FAFAFA] font-inter-tight border-t border-slate-200/80 overflow-hidden"
    >
      {/* Topographic Elevation Contours */}
      <TopographicContours opacity="opacity-[0.03] text-slate-800" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Executive Bottom Card */}
        <div className="rounded-3xl bg-[#051D2C] text-white p-8 sm:p-12 lg:p-14 shadow-[0_30px_70px_-15px_rgba(2,18,29,0.7),0_12px_24px_rgba(0,0,0,0.3)] relative overflow-hidden border border-[#0C3952]">
          
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* ── 01: SECTION HEADER & SUBTITLE ──────────────────────── */}
          <ScrollReveal direction="up" distance={20}>
            <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4 mb-10 sm:mb-12">

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.1]">
                Join the <span className="text-[#12B981]">Energy Future</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
                Be part of a platform connecting Nepal&apos;s energy potential with the technologies, investments and partnerships of tomorrow.
              </p>

              {/* Tagline pills */}
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {['CONNECT', 'INVEST', 'INNOVATE', 'GROW'].map((word, i) => (
                  <span
                    key={word}
                    className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/15 text-white/70"
                  >
                    {word}{i < 3 ? ' ·' : ''}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* ── 02: TWO DISTINCT CONVERSION PATHS (EXHIBIT VS ATTEND) ─ */}
          <ScrollReveal direction="up" distance={25} delay={0.1} duration={0.65}>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
              
              {/* Card 1: For Exhibitors & Sponsors */}
              <div className="p-7 sm:p-8 rounded-2xl bg-[#0D2839]/90 border border-sky-400/20 backdrop-blur-xl flex flex-col justify-between space-y-6 hover:border-[#12B981]/50 transition-all duration-300 group shadow-lg">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#12B981] flex items-center justify-center shadow-inner">
                    <Building2 className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-[#12B981] font-bold uppercase tracking-wider">
                      FOR EXHIBITORS
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      Showcase. Connect. Grow.
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Present your products, projects, technologies and solutions while connecting with potential clients, investors, partners and industry stakeholders.
                    </p>
                  </div>

                  {/* Bullet Benefits */}
                  <ul className="space-y-2 pt-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#12B981] shrink-0" />
                      <span>Prime exhibition pavilions &amp; dedicated stalls</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#12B981] shrink-0" />
                      <span>VIP B2B matchmaking &amp; deal suites</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#12B981] shrink-0" />
                      <span>Regional brand exposure across South Asia</span>
                    </li>
                  </ul>

                  {/* Stat badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                    <span className="text-lg font-black text-[#12B981] leading-none">100+</span>
                    <span className="text-[11px] text-slate-300 font-semibold uppercase tracking-wide">Expected Exhibitors</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/book-stall"
                    className="w-full py-3.5 px-6 rounded-full bg-[#12B981] hover:bg-[#0ea372] text-[#051D2C] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                  >
                    <span>BOOK EXHIBITION STALL</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Card 2: For Trade Delegates & Visitors */}
              <div className="p-7 sm:p-8 rounded-2xl bg-[#0D2839]/90 border border-sky-400/20 backdrop-blur-xl flex flex-col justify-between space-y-6 hover:border-sky-400/50 transition-all duration-300 group shadow-lg">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 text-[#38BDF8] flex items-center justify-center shadow-inner">
                    <Users className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-[#38BDF8] font-bold uppercase tracking-wider">
                      FOR VISITORS
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      Discover Nepal&apos;s Energy Future
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Meet industry leaders, investors, policymakers, technology providers and energy professionals, while exploring emerging technologies and engaging in industry dialogue.
                    </p>
                  </div>

                  {/* Bullet Benefits */}
                  <ul className="space-y-2 pt-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
                      <span>Instant digital QR pass via email</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
                      <span>Access to all exhibition pavilions &amp; demos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
                      <span>Complimentary for verified trade visitors</span>
                    </li>
                  </ul>

                  {/* Stat badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/25">
                    <span className="text-lg font-black text-[#38BDF8] leading-none">50,000+</span>
                    <span className="text-[11px] text-slate-300 font-semibold uppercase tracking-wide">Expected Visitors</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/register"
                    className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                  >
                    <span>REGISTER</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

            </div>
          </ScrollReveal>

          {/* ── 03: CLOSING STATEMENT ────────────────────────────── */}
          <div className="relative z-10 text-center mb-8">
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight uppercase">
              Let&apos;s Power Nepal&apos;s{' '}
              <span className="text-[#12B981]">Green Future</span>{' '}Together.
            </p>
          </div>

          {/* ── 04: CLEAN BOTTOM ORGANIZER BAR ────────────────────── */}
          <div className="relative z-10 max-w-4xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <MountainCrestSvg className="w-3.5 h-3.5 text-[#12B981]" />
              <span>Jointly Organized by IPPAN &amp; Event Solution Nepal</span>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <a
                href="/Proposal.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white inline-flex items-center gap-1.5 transition-colors font-medium text-slate-300"
              >
                <Download className="w-3.5 h-3.5 text-[#12B981]" />
                <span>Proposal (PDF)</span>
              </a>

              <a
                href={`tel:${CONTACT_DETAILS.mobiles[0].raw}`}
                className="hover:text-white inline-flex items-center gap-1.5 transition-colors font-medium text-slate-300"
              >
                <Phone className="w-3.5 h-3.5 text-[#12B981]" />
                <span>{CONTACT_DETAILS.mobiles[0].display}</span>
              </a>

              <Link
                href="/contact"
                className="hover:text-[#12B981] inline-flex items-center gap-1 transition-colors font-semibold text-white"
              >
                <span>Contact Desk ↗</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default ConversionCTASection;

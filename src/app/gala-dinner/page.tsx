'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Wine,
  Users,
  Music,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  PhoneCall,
  Mail,
} from 'lucide-react';
import { MountainCrestSvg } from '@/components/ui';
import { GalaBookingModal } from '@/components/booking/GalaBookingModal';

export default function GalaDinnerPage() {
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);
  const [selectedTier, setSelectedTier] = React.useState<'national' | 'international'>('national');

  const openBooking = (tier: 'national' | 'international') => {
    setSelectedTier(tier);
    setIsBookingOpen(true);
  };

  const highlights = [
    {
      icon: Users,
      title: 'Sovereign Ministers & Global Dignitaries',
      desc: 'Exclusive executive networking alongside the Minister of Energy, IPPAN leadership, multilateral development directors, and foreign ambassadors.',
    },
    {
      icon: Sparkles,
      title: 'High-Level Policy & Keynote Addresses',
      desc: 'Insightful keynote reflections from the Minister of Energy, regional power utility CEOs, and bilateral development partners.',
    },
    {
      icon: Wine,
      title: '5-Star Gourmet Banquet at Royal Tulip (Gwarko)',
      desc: 'Multi-course international culinary showcase, curated wine & beverage pairings, and five-star hospitality at Royal Tulip Kathmandu (Gwarko).',
    },
    {
      icon: Music,
      title: 'Cultural Symphony & Live Ensemble',
      desc: 'Acoustic performances celebrating Himalayan heritage, clean energy prosperity, and high-level bilateral networking.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#030B08] text-white font-sans">
      {/* ── HERO BANNER ──────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-emerald-500/20">
        <div className="absolute inset-0 pointer-events-none select-none z-0">
          <Image
            src="/images/nepal_machhapuchhre.webp"
            alt="Royal Tulip Kathmandu (Gwarko) Networking Evening"
            fill
            className="object-cover object-center opacity-20 mix-blend-luminosity scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030B08] via-[#041912]/80 to-[#020D09]/95" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-400/80 font-mono">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-emerald-300">Networking Dinner</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            VIP Networking Dinner &amp;{' '}
            <span className="text-[#00E599]">Banquet</span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/80 max-w-2xl leading-relaxed">
            The flagship social and executive climax of the Himalayan Green Energy Expo 2027. Hosted at the prestigious <strong className="text-white">Royal Tulip Kathmandu (Gwarko)</strong>.
          </p>

          {/* Quick Date, Time & Venues Bar */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-emerald-100 py-4 px-5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-300" />
              <span className="font-semibold">Monday, 18 January 2027</span>
            </div>
            <span className="text-white/20 hidden sm:inline">|</span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>6:00 PM onwards</span>
            </div>
            <span className="text-white/20 hidden sm:inline">|</span>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#00E599]" />
              <span className="font-bold text-white">Venue: Royal Tulip Kathmandu (Gwarko)</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/book-networking-dinner"
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#007A5E] to-[#218A59] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
            >
              <span>Book Networking Pass Online</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRICING & TICKETS SECTION ───────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-400">
            OFFICIAL TARIFFS
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Networking Dinner Delegate Passes
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Main summit and trade exhibition is hosted at <strong className="text-white">Bhrikuti Mandap</strong>. Networking Dinner takes place at <strong className="text-white">Royal Tulip Kathmandu (Gwarko)</strong> on Monday, 18 January.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* National Pass Card */}
          <div className="rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-emerald-500/30 p-7 sm:p-9 flex flex-col justify-between hover:border-emerald-400 transition-all shadow-xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🇳🇵</span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
                  National Delegates
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">National Networking Pass</h3>
                <p className="text-xs text-slate-400 mt-1">
                  For Nepali developers, energy professionals, engineers &amp; delegates.
                </p>
              </div>

              <div className="flex items-baseline gap-1 py-3 border-y border-white/10">
                <span className="text-3xl sm:text-4xl font-bold text-white font-mono">
                  6,000
                </span>
                <span className="text-base font-bold text-emerald-400 font-mono">NPR</span>
                <span className="text-xs text-emerald-300 font-sans ml-1">/ person (+ 13% VAT)</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Full evening banquet &amp; beverage pairings at Royal Tulip (Gwarko)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Reserved executive seating for the ministerial networking banquet</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Networking with ministers, IPPAN leaders &amp; ambassadors</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Includes 3-day access to exhibition at Bhrikuti Mandap</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/book-networking-dinner?tier=national"
                className="w-full text-center py-3.5 rounded-full bg-[#007A5E] hover:bg-[#005C42] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider transition-all block shadow-md shadow-emerald-950/20"
              >
                Book National Pass (NPR 6,000 + 13% VAT)
              </Link>
            </div>
          </div>

          {/* International Pass Card */}
          <div className="rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-sky-500/30 p-7 sm:p-9 flex flex-col justify-between hover:border-sky-400 transition-all shadow-xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🌐</span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-300 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-800">
                  International Delegates
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">International Networking Pass</h3>
                <p className="text-xs text-slate-400 mt-1">
                  For international delegations, foreign investors, OEMs &amp; diplomats.
                </p>
              </div>

              <div className="flex items-baseline gap-1 py-3 border-y border-white/10">
                <span className="text-3xl sm:text-4xl font-bold text-white font-mono">
                  50
                </span>
                <span className="text-base font-bold text-sky-400 font-mono">USD</span>
                <span className="text-xs text-sky-300 font-sans ml-1">/ person (+ 13% VAT)</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Dinner &amp; premium drinks at Royal Tulip (Gwarko)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Official Visa Invitation &amp; government facilitation letter</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Cross-border B2B deal-making plenary access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Fast-track access across all halls at Bhrikuti Mandap</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/book-networking-dinner?tier=international"
                className="w-full text-center py-3.5 rounded-full bg-sky-600 hover:bg-sky-500 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider transition-all block shadow-md shadow-sky-950/20"
              >
                Book International Pass (USD $50 + 13% VAT)
              </Link>
            </div>
          </div>
        </div>

        {/* ── HIGHLIGHTS GRID ────────────────────────────────────────── */}
        <div className="mt-16 sm:mt-24 pt-12 border-t border-white/10">
          <h3 className="text-lg font-bold text-white mb-6">
            Evening Highlights &amp; Inclusions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{h.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{h.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CONTACT DESK PROMPT ────────────────────────────────────── */}
        <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-bold text-white block">Need Corporate Table Reservations?</span>
            <p>For corporate delegations of 10+ delegates or sponsor tables, contact our team.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+9779703606348"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs transition-colors"
            >
              +977-9703606348
            </a>
            <a
              href="mailto:info@himalayanenergyexpo.com"
              className="px-4 py-2 rounded-xl bg-[#007A5E] hover:bg-[#005C42] text-white font-bold text-xs transition-colors"
            >
              info@himalayanenergyexpo.com
            </a>
          </div>
        </div>
      </section>

      {/* ── Khalti Gala Pass Booking Modal ── */}
      <GalaBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialTier={selectedTier}
      />
    </div>
  );
}

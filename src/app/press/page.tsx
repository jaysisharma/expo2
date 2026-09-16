'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  FileDown,
  Phone,
  Mail,
  Share2,
  ExternalLink,
  Sparkles,
  Zap,
  Wind,
  Sun,
  Car,
  Atom,
  CheckCircle2,
  ArrowUpRight,
  Maximize2,
  X,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

const SUB_SHOWS = [
  {
    title: 'Green Hydrogen Show',
    icon: Atom,
    desc: 'Electrolyzer technologies, clean ammonia synthesis, and industrial deep decarbonization.',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
  },
  {
    title: 'Green Energy Show',
    icon: Zap,
    desc: 'Run-of-river, peaking, and pumped storage hydropower engineering & cross-border transmission.',
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-cyan-300',
  },
  {
    title: 'EV Show',
    icon: Car,
    desc: 'Electric mobility ecosystems, heavy commercial fleets, charging corridors, and battery tech.',
    color: 'from-lime-500/20 to-emerald-500/20 border-lime-500/30 text-lime-300',
  },
  {
    title: 'Alternative Energy Show',
    icon: Sparkles,
    desc: 'Biomass energy, geothermal exploration, mini-grids, and decentralized rural clean power.',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
  },
  {
    title: 'Windmill Energy Show',
    icon: Wind,
    desc: 'High-altitude wind resource mapping, hybrid wind-hydro turbine installations, and grid integration.',
    color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-300',
  },
  {
    title: 'Solar Energy Show',
    icon: Sun,
    desc: 'Utility-scale solar PV farms, floating solar on hydro reservoirs, and commercial rooftop storage.',
    color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-300',
  },
];

export default function PressPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#03160F] text-white">
      {/* ── 01: HERO SECTION WITH OFFICIAL PRESS MEET GRAPHIC ── */}
      <section className="relative pt-32 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-12 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-radial from-emerald-900/20 via-transparent to-transparent opacity-50" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-10">
          {/* Breadcrumb & Badges */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-300/80">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#34D399]">Press & Media Room</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[#34D399] font-mono text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
              <span>OFFICIAL PRESS STATEMENT</span>
            </div>
          </div>

          {/* Main Title Header */}
          <div className="max-w-4xl space-y-4">
            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
              Official Press Meet: <br />
              <span className="text-[#34D399]">Himalayan Green Energy Expo 2027</span>
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/80 font-normal leading-relaxed max-w-3xl">
              Under the slogan <strong className="text-white">&ldquo;Resilient Energy, Prosperous Nepal,&rdquo;</strong> IPPAN and Event Solution announce the 5th edition of South Asia&apos;s clean energy summit scheduled for 17th–19th January 2027 at Bhrikutimandap, Kathmandu.
            </p>
          </div>

          {/* Centerpiece Image Showcase Card with Lightbox Trigger */}
          <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-slate-950 group">
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/10]">
              <Image
                src="/images/press_meet.jpeg"
                alt="Himalayan Green Energy Expo 2027 Official Press Meet Announcement Creative"
                fill
                priority
                className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

              {/* Lightbox Zoom Trigger */}
              <button
                onClick={() => setLightboxOpen(true)}
                aria-label="View Full Resolution Banner"
                className="absolute top-4 right-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white text-xs font-mono font-bold backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-105"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Resolution Preview</span>
              </button>

              {/* Bottom Quick Bar */}
              <div className="absolute bottom-4 left-4 right-4 p-4 sm:p-5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#34D399] uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-[#34D399]" />
                    <span>17th–19th Jan 2027 · Magh 3rd–5th, 2083</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Bhrikutimandap Exhibition Complex, Kathmandu, Nepal</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href="/images/invitation.jpeg"
                    download="Himalayan_Green_Energy_Expo_Invitation.jpeg"
                    className="px-3.5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono text-xs font-bold tracking-wider inline-flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Invitation Card</span>
                  </a>
                  <a
                    href="/images/press_meet.jpeg"
                    download="Himalayan_Green_Energy_Expo_2027_Press_Meet.jpeg"
                    className="px-3.5 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-mono text-xs font-bold tracking-wider inline-flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Press Banner</span>
                  </a>
                  <a
                    href="/files/hydroproposal-13-2-2024.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-full bg-[#10B981] hover:bg-[#059669] text-slate-950 font-mono text-xs font-black tracking-wider inline-flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Proposal PDF</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02: THE 6 CONCURRENT SUB-SHOWS HIGHLIGHTED IN THE GRAPHIC ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider">
            <span>6 INTEGRATED EXHIBITION SECTORS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Concurrent Sub-Shows at the Expo
          </h2>
          <p className="text-sm text-emerald-100/70 max-w-2xl leading-relaxed">
            As announced in the official press meet, the 2027 edition expands across 6 dedicated sub-shows covering the full spectrum of renewable energy and mobility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUB_SHOWS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`p-6 rounded-2xl bg-gradient-to-br ${item.color} border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-white">{item.title}</h3>
                  <p className="text-xs text-slate-200/90 leading-relaxed">{item.desc}</p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono font-semibold text-emerald-300">
                  <span>CONFIRMED FOR 2027</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 03: OFFICIAL SECRETARIAT CONTACTS & MEDIA ACCREDITATION ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#04281E] to-[#021810] border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Accreditation & Media Desk */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-[#34D399] font-mono text-xs font-bold uppercase tracking-wider">
              <span>MEDIA DESK & ACCREDITATION</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Journalist, Press & Media Support
            </h3>

            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Accredited journalists, television broadcast crews, and industry publications receive complimentary full-access press badges, reserved front-row seating at plenary addresses, and dedicated interview lounges with ministry dignitaries and international CEOs.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="px-6 py-3 rounded-full bg-[#10B981] hover:bg-[#059669] text-slate-950 font-mono text-xs font-black tracking-wider transition-all shadow-lg hover:scale-105 inline-flex items-center gap-2 active:scale-95"
              >
                <span>REGISTER FOR MEDIA BADGE</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold tracking-wider transition-all border border-white/20"
              >
                <span>SECRETARIAT INQUIRY</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Direct Verified Contact Cards */}
          <div className="lg:col-span-5 rounded-3xl bg-black/50 border border-white/15 p-6 sm:p-8 space-y-5 backdrop-blur-md">
            <h4 className="text-xs font-mono font-bold text-[#34D399] uppercase tracking-wider">
              Direct Press & Secretariat Lines
            </h4>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <Phone className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-mono text-slate-400 text-[10px] uppercase">MOBILE / HOTLINE</div>
                  <div className="text-white font-bold text-sm">+977-9703606340 / 9703606355</div>
                  <div className="text-slate-400 text-xs">Landline: 01-5268535, 4169175</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <Mail className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-mono text-slate-400 text-[10px] uppercase">OFFICIAL EMAIL</div>
                  <div className="text-white font-medium">himalayangreenenergyexpo@gmail.com</div>
                  <div className="text-slate-400 text-xs">info@ippan.org.np | ippan2001@gmail.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-mono text-slate-400 text-[10px] uppercase">SECRETARIAT ADDRESS</div>
                  <div className="text-white font-medium">IPPAN Secretariat, Jwagal, Lalitpur, Nepal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 04: LIGHTBOX MODAL FOR FULL RESOLUTION GRAPHIC ── */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-emerald-400 transition-colors cursor-pointer"
              aria-label="Close Preview"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full aspect-[16/10] max-h-[80vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <Image
                src="/images/press_meet.jpeg"
                alt="Full resolution press meet creative"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  MapPin,
  ArrowRight,
  Play,
  X,
  ExternalLink,
} from 'lucide-react';
import { TopographicContours, MountainCrestSvg } from '@/components/ui';
import DroneCinemaModal from './DroneCinemaModal';

export function Hero() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroEl = document.getElementById('hero-section');
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        // Hide on mobile when bottom of hero reaches near top of viewport (e.g. <= 120px)
        setIsPastHero(rect.bottom <= 120);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVideoOpen(false);
      }
    };
    if (isVideoOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVideoOpen]);
  return (
    <div className="relative w-full bg-[#071322]">
      {/* ── 1. CINEMATIC FULL-WIDTH HERO SECTION ───────────────────────────── */}
      <section
        id="hero-section"
        className="relative w-full min-h-[85vh] lg:min-h-[88vh] flex flex-col justify-end overflow-hidden"
      >
        {/* Full-bleed High-Definition Drone Hydro Background Video */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden bg-slate-950">
          <video
            src="https://res.cloudinary.com/gztboref/video/upload/v1790580687/higex/videos/drone_hydroelectric.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/images/himalayan_dam_hero.webp"
            className="w-full h-full object-cover object-center scale-[1.01]"
          />
        </div>

        {/* Himalayan Topographic Elevation Contours (Atmospheric SVG Overlay) */}
        <TopographicContours
          className="z-[1] text-[#00E599]"
          opacity="opacity-[0.06]"
        />

        {/* Directional Vignette: Deep contrast at bottom-left for text legibility, clear daylight across center & right so the dam and mountains shine through */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#071322] via-[#071322]/55 via-40% to-transparent z-[2] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#071322]/95 via-[#071322]/45 via-45% to-transparent z-[2] pointer-events-none"
        />

        {/* ── STICKY TOP-RIGHT ORGANIZER CARD (Attached Fully to Right Edge) ── */}
        <div
          className={`fixed top-24 sm:top-28 right-0 z-40 select-none transition-all duration-300 ${
            isPastHero ? 'max-sm:opacity-0 max-sm:pointer-events-none max-sm:translate-x-full' : 'max-sm:opacity-100 max-sm:translate-x-0'
          }`}
        >
          <div className="w-[116px] sm:w-[132px] bg-white rounded-l-2xl rounded-r-none shadow-[-5px_10px_25px_rgba(0,0,0,0.25)] p-2.5 sm:p-3 flex flex-col items-center text-center border-y border-l border-slate-200/90">
            {/* Header: Jointly Organized */}
            <div className="text-[11.5px] sm:text-[13px] font-bold text-slate-800 leading-snug pb-1.5 mb-2 border-b border-slate-200/80 w-full text-center tracking-tight">
              Jointly Organized by
            </div>

            {/* IPPAN */}
            <a
              href="https://www.ippan.org.np/"
              target="_blank"
              rel="noopener noreferrer"
              title="IPPAN - Independent Power Producers' Association, Nepal"
              className="group block w-full text-center transition-opacity hover:opacity-90 py-1"
            >
              <div className="relative h-7 sm:h-8 w-full flex items-center justify-center">
                <Image
                  src="/images/ippan_vector.svg"
                  alt="IPPAN"
                  fill
                  className="object-contain transition-transform group-hover:scale-105"
                />
              </div>
            </a>

            {/* Divider with & */}
            <div className="relative w-full py-1.5 flex items-center justify-center my-0.5">
              <div className="w-full border-t border-slate-200/80" />
              <span className="absolute px-2 bg-white text-[11px] sm:text-xs font-bold text-slate-500 font-mono">
                &amp;
              </span>
            </div>

            {/* Event Solution */}
            <a
              href="https://eventsolutionnepal.com.np/"
              target="_blank"
              rel="noopener noreferrer"
              title="Event Solution Nepal"
              className="group block w-full text-center transition-opacity hover:opacity-90 py-1"
            >
              <div className="relative h-[34px] sm:h-[40px] w-full flex items-center justify-center">
                <Image
                  src="/images/event_solution_vector.svg"
                  alt="Event Solution"
                  fill
                  className="object-contain scale-105 transition-transform group-hover:scale-115"
                />
              </div>
            </a>
          </div>
        </div>

        {/* ── RIGHT-SIDE VERTICAL FLOATING PLAY PILL (Matching Mockup) ────── */}
        <div className="absolute top-64 sm:top-72 lg:top-76 right-3 sm:right-4 z-20">
          <button
            type="button"
            onClick={() => setIsVideoOpen(true)}
            aria-label="Play Drone Showcase Video by Saligram Dulal"
            className="group relative flex flex-col items-center gap-2.5 py-2 px-1.5 rounded-full bg-slate-950/75 hover:bg-slate-950/90 backdrop-blur-xl border border-white/20 hover:border-[#00E599]/60 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(0,229,153,0.15)] transition-all duration-200 active:scale-95 cursor-pointer"
          >
            {/* Top Teal Orb */}
            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-[#00A37A] to-[#00E599] text-slate-950 shadow-[0_0_12px_rgba(0,229,153,0.5)] group-hover:scale-105 transition-transform shrink-0">
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </div>

            {/* Vertical Label */}
            <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] sm:text-[11px] font-bold text-white tracking-widest uppercase font-inter-tight group-hover:text-[#00E599] transition-colors py-1">
              Watch Drone Film
            </span>

            {/* Circular Thumbnail Preview */}
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/40 shrink-0">
              <Image
                src="/images/himalayan_dam_hero.webp"
                alt="Drone Film Thumbnail"
                fill
                className="object-cover"
              />
            </div>
          </button>
        </div>

        {/* ── 2. HERO FOREGROUND CONTENT (Anchored to Bottom-Left) ─────────── */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mt-auto pt-24 sm:pt-32 pb-10 sm:pb-14 lg:pb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          {/* Left Column: Anchored Bottom-Left */}
          <div className="w-full max-w-2xl text-left space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold font-inter-tight text-white tracking-tight leading-[1.08] drop-shadow-[0_10px_25px_rgba(0,0,0,0.85)]">
                HIMALAYAN <br />
                <span className="text-[#00E599] drop-shadow-[0_0_35px_rgba(0,229,153,0.4)]">GREEN ENERGY EXPO 2027</span> <br />
                {/* <span className="text-white/95">2027</span> */}
              </h1>

              {/* Tagline */}
              <p className="text-base sm:text-lg lg:text-xl font-serif italic text-emerald-300 tracking-wide font-medium drop-shadow-[0_2px_10px_rgba(0,229,153,0.3)]">
                Resilient Energy, Prosperous Nepal
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-[15px] text-slate-200 font-inter-tight leading-relaxed max-w-xl font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              An international platform bringing together hydropower, renewable energy, green technologies, investment, innovation and sustainable infrastructure.
            </p>

            {/* Event Information: Clean Executive Docket with Glass & Elevation Shadows */}
            <div className="pt-0.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 text-white font-inter-tight">
              {/* Date */}
              <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#00E599] shrink-0 shadow-inner">
                  <Calendar className="w-4 h-4" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide leading-tight uppercase font-mono">
                    17–19 JANUARY 2027
                  </span>
                  <span className="text-[11px] text-slate-300 font-medium">
                    Sunday – Tuesday · Magh 3–5, 2083
                  </span>
                </div>
              </div>

              {/* Venue */}
              <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#00E599] shrink-0 shadow-inner">
                  <MapPin className="w-4 h-4" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide leading-tight uppercase font-mono">
                    BHRIKUTIMANDAP, KATHMANDU, NEPAL
                  </span>
                </div>
              </div>
            </div>

            {/* Call-to-Action Buttons with Mountain Elevation Glow & Shadows */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-3.5">
              {/* Primary CTA */}
              <Link
                href="/book-stall"
                className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-full bg-[#00B98B] hover:bg-[#00A37A] text-white text-xs sm:text-sm font-bold tracking-wider uppercase font-inter-tight shadow-[0_12px_28px_-6px_rgba(0,185,139,0.5),0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_36px_-6px_rgba(0,185,139,0.7)] active:scale-98 transition-all duration-200"
              >
                <span>BOOK A STALL</span>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Link>

              {/* Secondary CTA */}
              <Link
                href="/register"
                className="inline-flex items-center px-6 sm:px-7 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/40 hover:border-white text-xs sm:text-sm font-bold tracking-wider uppercase font-inter-tight backdrop-blur-md transition-all duration-200 active:scale-98 shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_25px_rgba(255,255,255,0.15)]"
              >
                REGISTER
              </Link>
            </div>
          </div>

          {/* Right Area: Fully open, letting the Himalayan mountains, dam, and water breathe */}
          <div className="hidden lg:block w-1/3" aria-hidden="true" />
        </div>

        {/* ── Awwwards-Style 5th Edition Circular Rotating Badge (Bottom Right) ── */}
        <div
          className="absolute bottom-8 sm:bottom-12 right-6 sm:right-10 lg:right-16 z-20 group select-none pointer-events-none"
          title="5th Edition · Himalayan Green Energy Expo 2027"
        >
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
            {/* Subtle Glowing Aura */}
            <div className="absolute inset-0 rounded-full bg-[#00E599]/20 blur-xl group-hover:bg-[#00E599]/40 transition-all duration-500 pointer-events-none" />

            {/* Rotating SVG Circular Text */}
            <svg
              className="absolute inset-0 w-full h-full animate-[spin_18s_linear_infinite] group-hover:[animation-duration:8s] transition-all pointer-events-none"
              viewBox="0 0 160 160"
            >
              <defs>
                <path
                  id="awwwards-circle-path"
                  d="M 80, 80 m -58, 0 a 58,58 0 1,1 116,0 a 58,58 0 1,1 -116,0"
                />
              </defs>
              <text
                className="font-inter-tight uppercase font-bold fill-white/80 tracking-[0.24em] text-[9.8px] group-hover:fill-white transition-colors"
              >
                <textPath href="#awwwards-circle-path" startOffset="0%">
                  ★ 5TH EDITION ★ HIMALAYAN GREEN ENERGY EXPO 2027 ★
                </textPath>
              </text>
            </svg>

            {/* Frosted Glass Center Core with Mountain Crest SVG */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-22 lg:h-22 rounded-full bg-slate-950/75 backdrop-blur-xl border border-white/25 flex flex-col items-center justify-center text-center shadow-[0_15px_35px_rgba(0,0,0,0.6)] group-hover:border-[#00E599]/60 group-hover:bg-slate-950/90 transition-all duration-300">
              <MountainCrestSvg className="w-3.5 h-3.5 text-[#00E599] mb-0.5 opacity-90" />
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-inter-tight leading-none tracking-tight">
                5<span className="text-xs sm:text-sm text-[#00E599]">TH</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-semibold tracking-[0.2em] text-emerald-300 uppercase font-inter-tight mt-0.5">
                EDITION
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. CINEMATIC DRONE FILM & PAST EDITIONS GLIMPSE POPUP MODAL ──────── */}
      <DroneCinemaModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />
    </div>
  );
}

export default Hero;

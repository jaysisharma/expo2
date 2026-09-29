'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  ArrowRight,
  Play,
  X,
  ExternalLink,
} from 'lucide-react';
import { TopographicContours, MountainCrestSvg } from '@/components/ui';

export function Hero() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

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

        {/* ── TOP-RIGHT MINIMAL FLOATING PLAY PILL ────────────────────────── */}
        <div className="absolute top-5 sm:top-8 lg:top-10 right-4 sm:right-8 lg:right-12 z-20">
          <button
            type="button"
            onClick={() => setIsVideoOpen(true)}
            aria-label="Play Drone Showcase Video by Saligram Dulal"
            className="group relative flex items-center gap-2.5 sm:gap-3 pl-2.5 pr-4 sm:pr-5 py-2 rounded-full bg-slate-950/70 hover:bg-slate-950/90 backdrop-blur-xl border border-white/20 hover:border-[#00E599]/60 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(0,229,153,0.15)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.75),0_0_28px_rgba(0,229,153,0.35)] transition-all duration-200 active:scale-95 cursor-pointer"
          >
            {/* Pulsing Play Orb */}
            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#00A37A] to-[#00E599] text-slate-950 shadow-[0_0_15px_rgba(0,229,153,0.5)] group-hover:scale-105 transition-transform shrink-0">
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
              <span className="absolute -inset-1 rounded-full border border-[#00E599]/60 animate-ping opacity-60 pointer-events-none" />
            </div>

            {/* Clean Single-Line Label */}
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide font-inter-tight group-hover:text-[#00E599] transition-colors">
              Watch Drone Film
            </span>

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
                <span className="text-[#00E599] drop-shadow-[0_0_35px_rgba(0,229,153,0.4)]">GREEN ENERGY EXPO</span> <br />
                <span className="text-white/95">2027</span>
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
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide leading-tight uppercase">
                    BHRIKUTIMANDAP · KATHMANDU, NEPAL
                  </span>
                  <span className="text-[11px] text-slate-300 font-medium">
                    Exhibition Hall &amp; Grounds
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
                REGISTER FOR FREE PASS
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

      {/* ── 3. CINEMATIC VIDEO OVERLAY MODAL & CREDITS ──────────────────────── */}
      {isVideoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Hydropower Drone Videomaking Competition 2022 Showcase"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200"
        >
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity cursor-pointer"
            onClick={() => setIsVideoOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-4xl bg-[#071322] border border-white/20 rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-end px-4 sm:px-6 py-3 border-b border-white/10 bg-slate-950/70">
              <button
                type="button"
                onClick={() => setIsVideoOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#00E599]"
                aria-label="Close video modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 16:9 Video Frame */}
            <div className="relative w-full aspect-video bg-black">
              <iframe
                src="https://www.youtube-nocookie.com/embed/sJy3FVrESKk?autoplay=1&rel=0&modestbranding=1"
                title="Hydropower Drone Videomaking Competition 2022 - Saligram Dulal"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>

            {/* Credits Docket Footer */}
            <div className="px-4 sm:px-6 py-4 bg-slate-950/95 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-inter-tight">
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-semibold text-white">
                  Hydropower Drone Videomaking Competition 2022
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  Footage &amp; Cinematography by{' '}
                  <span className="text-slate-200 font-medium">Saligram Dulal</span>
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-2 sm:pt-0 shrink-0">
                <a
                  href="https://www.youtube.com/watch?v=sJy3FVrESKk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 hover:border-white/30 transition-all shadow-sm"
                >
                  <span>Watch on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
                <button
                  type="button"
                  onClick={() => setIsVideoOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Hero;

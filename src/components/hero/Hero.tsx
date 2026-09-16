'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Ticket, Volume2, VolumeX, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface MilestoneCard {
  step: string;
  badge: string;
  capacity: string;
  capacityUnit: string;
  title: string;
  tagline: string;
  metricLabel: string;
  accent: 'green' | 'blue';
  image: string;
}

const MILESTONE_CARDS: MilestoneCard[] = [
  {
    step: '01',
    badge: '1911 AD',
    capacity: '0.5',
    capacityUnit: 'MW',
    title: 'Pharping Genesis',
    tagline: "Asia's 2nd oldest hydropower plant, marking the historic dawn of clean energy in Nepal.",
    metricLabel: 'First Hydro Plant',
    accent: 'blue',
    image: '/images/hydro_1911.jpg',
  },
  {
    step: '02',
    badge: 'Target 2035 AD',
    capacity: '30,000',
    capacityUnit: 'MW',
    title: 'Total Clean Energy Vision',
    tagline: "Nepal's sovereign masterplan to generate 30,000 MW of clean hydropower and solar by 2035.",
    metricLabel: 'National Generation Target',
    accent: 'green',
    image: '/images/nepal_machhapuchhre.jpg',
  },
  {
    step: '03',
    badge: 'Supply to India',
    capacity: '10,000',
    capacityUnit: 'MW',
    title: 'Supply to India Targeted',
    tagline: 'Long-term bilateral power agreement exporting 10,000 MW of surplus clean energy to the Indian grid.',
    metricLabel: 'Cross-Border Export',
    accent: 'blue',
    image: '/images/hydro_transmission.jpg',
  },
  {
    step: '04',
    badge: 'Supply to Bangladesh',
    capacity: '5,000',
    capacityUnit: 'MW',
    title: 'Supply to Bangladesh Targeted',
    tagline: 'Tripartite transmission corridor channeling 5,000 MW of clean hydro to Bangladesh.',
    metricLabel: 'Regional Grid Corridor',
    accent: 'blue',
    image: '/images/nepal_sunrise_gorge.jpg',
  },
  {
    step: '05',
    badge: 'Domestic Usage',
    capacity: '15,000',
    capacityUnit: 'MW',
    title: 'Dedicated to Domestic Usage',
    tagline: '15,000 MW allocated for domestic industrial growth, EV transition, green hydrogen, and households.',
    metricLabel: 'National Domestic Demand',
    accent: 'green',
    image: '/images/nepal_tamakoshi.jpg',
  },
];



export function Hero() {
  const heroTrackRef = useRef<HTMLDivElement>(null);
  const stickyFrameRef = useRef<HTMLDivElement>(null);
  const topContentRef = useRef<HTMLDivElement>(null);
  const videoBoxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rectangleContainerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [isMuted, setIsMuted] = useState(true);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const isDesktop = window.innerWidth >= 1024;

      // Card 0 starts visible in the center of the 100vh right column
      if (cardsRef.current[0]) {
        gsap.set(cardsRef.current[0], { y: '0vh', opacity: 1, scale: 1 });
      }
      // Cards 1..4 start at the BOTTOM of 100vh (completely below the screen)
      cardsRef.current.slice(1).forEach((card) => {
        if (card) {
          gsap.set(card, { y: '105vh', opacity: 1, scale: 1 });
        }
      });

      // Left column starts at its resting position
      if (leftColRef.current) {
        gsap.set(leftColRef.current, { y: 0 });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroTrackRef.current,
          start: 'top top',
          end: '+=380%',
          pin: stickyFrameRef.current,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // ── PHASE 1: Expand video to full screen ────────────────────────
      tl.to(
        topContentRef.current,
        {
          opacity: 0,
          y: -40,
          scale: 0.95,
          pointerEvents: 'none',
          ease: 'power2.inOut',
          duration: 0.35,
        },
        0
      );

      tl.to(
        videoBoxRef.current,
        {
          top: '0px',
          bottom: '0px',
          width: '100vw',
          maxWidth: '100vw',
          borderRadius: '0px',
          borderWidth: '0px',
          boxShadow: 'none',
          ease: 'power2.inOut',
          duration: 0.75,
        },
        0.05
      );

      // Brief hold on fully expanded video
      tl.to({}, { duration: 0.15 });

      // ── PHASE 2: Emerges from center (0 to 100vh and 100vw) ─────────
      tl.fromTo(
        rectangleContainerRef.current,
        {
          width: '0vw',
          height: '0vh',
          opacity: 0,
          borderRadius: '32px',
          borderWidth: '1px',
          pointerEvents: 'none',
        },
        {
          width: '100vw',
          height: '100vh',
          opacity: 1,
          borderRadius: '0px',
          borderWidth: '0px',
          pointerEvents: 'auto',
          ease: 'power2.inOut',
          duration: 0.8,
        }
      );

      // Hold briefly so user absorbs Card 1
      tl.to({}, { duration: 0.2 });

      // ── PHASE 3: CARDS TRAVEL FROM BOTTOM TO ABOVE 100VH ───────────
      const storyStart = tl.duration();

      // Card 0 moves ABOVE 100vh; Card 1 enters from BOTTOM of 100vh into center
      tl.to(cardsRef.current[0], {
        y: '-105vh',
        ease: 'power2.inOut',
        duration: 0.85,
      });
      tl.to(
        cardsRef.current[1],
        {
          y: '0vh',
          ease: 'power2.inOut',
          duration: 0.85,
        },
        '<'
      );
      tl.to({}, { duration: 0.22 });

      // Card 1 moves ABOVE 100vh; Card 2 enters from BOTTOM of 100vh into center
      tl.to(cardsRef.current[1], {
        y: '-105vh',
        ease: 'power2.inOut',
        duration: 0.85,
      });
      tl.to(
        cardsRef.current[2],
        {
          y: '0vh',
          ease: 'power2.inOut',
          duration: 0.85,
        },
        '<'
      );
      tl.to({}, { duration: 0.22 });

      // Card 2 moves ABOVE 100vh; Card 3 enters from BOTTOM of 100vh into center
      tl.to(cardsRef.current[2], {
        y: '-105vh',
        ease: 'power2.inOut',
        duration: 0.85,
      });
      tl.to(
        cardsRef.current[3],
        {
          y: '0vh',
          ease: 'power2.inOut',
          duration: 0.85,
        },
        '<'
      );
      tl.to({}, { duration: 0.22 });

      // Card 3 moves ABOVE 100vh; Card 4 enters from BOTTOM of 100vh into center
      tl.to(cardsRef.current[3], {
        y: '-105vh',
        ease: 'power2.inOut',
        duration: 0.85,
      });
      tl.to(
        cardsRef.current[4],
        {
          y: '0vh',
          ease: 'power2.inOut',
          duration: 0.85,
        },
        '<'
      );
      tl.to({}, { duration: 0.25 });

      // ── Concurrently: Left side moves gently down across the 100vh height
      const storyEnd = tl.duration();
      tl.to(
        leftColRef.current,
        {
          y: isDesktop ? '16vh' : '5vh',
          ease: 'none',
          duration: storyEnd - storyStart,
        },
        storyStart
      );

      // Hold on the final milestone card (Dedicated to Domestic Usage)
      tl.to({}, { duration: 0.5 });
    }, heroTrackRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroTrackRef} className="relative w-full h-[460vh] bg-[var(--c-bg)]">
      {/* ── Pinned Viewport Container (100vh with overflow-hidden) ─────── */}
      <div
        ref={stickyFrameRef}
        className="relative h-[100dvh] w-full overflow-hidden bg-[var(--c-bg)] transition-colors duration-300"
      >
        {/* Ambient Glow */}
        <div
          aria-hidden="true"
          className="absolute -top-28 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#218A59]/15 via-[#234679]/8 to-transparent blur-3xl pointer-events-none rounded-full"
        />

        {/* ── TOP ~30%: Centered Headline, Subheadline & CTA Buttons ──────── */}
        <div
          ref={topContentRef}
          className="absolute top-0 left-0 right-0 z-20 h-[30vh] min-h-[170px] pt-4 pb-2 px-4 flex flex-col items-center justify-center text-center max-w-4xl mx-auto"
        >
          {/* Main Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight leading-[1.1] text-gray-900 dark:text-white mb-2.5">
            Himalayan <span className="text-[#218A59] dark:text-[#25C176]">Green Energy</span> Expo
          </h1>

          {/* Sub-headline */}
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-body max-w-3xl mx-auto leading-relaxed line-clamp-2 mb-3 sm:mb-4">
            South Asia&apos;s apex clean energy convergence uniting international developers, turbine OEMs, and sovereign finance around Nepal&apos;s 30,000 MW clean energy roadmap.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/book-stall"
              className="group inline-flex items-center justify-center gap-2 h-9 sm:h-10 px-5 sm:px-6 rounded-full bg-gradient-to-r from-[#5B9F35] to-[#218A59] text-white font-body text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md shadow-[#218A59]/25 hover:shadow-lg hover:shadow-[#218A59]/40 hover:brightness-105 active:scale-95 transition-all duration-200"
            >
              <span>Book Exhibition Stall</span>
              <ArrowRight
                size={14}
                strokeWidth={2.5}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 h-9 sm:h-10 px-5 sm:px-6 rounded-full border-[1.5px] border-[#234679] dark:border-[#4A7EC7] text-[#234679] dark:text-[#6FA0E8] font-body text-xs sm:text-sm font-bold uppercase tracking-wider bg-transparent hover:bg-[#234679] dark:hover:bg-[#4A7EC7] hover:text-white dark:hover:text-white transition-all duration-200 active:scale-95 shadow-xs"
            >
              <Ticket size={14} strokeWidth={2.2} />
              <span>Register Free Pass</span>
            </Link>
          </div>
        </div>

        {/* ── BOTTOM ~70%: Video Container (Expands to full 100vw x 100vh on scroll) ── */}
        <div
          ref={videoBoxRef}
          className="absolute top-[30vh] bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 w-[92vw] max-w-[1360px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/25 dark:shadow-black/60 border border-black/10 dark:border-white/15 bg-black"
          style={{ willChange: 'top, bottom, width, border-radius' }}
        >
          <video
            ref={videoRef}
            src="/videos/hero.mp4"
            poster="/images/himalayan_hydro_hero_bg.jpg"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

          {/* Audio toggle button */}
          <button
            onClick={toggleAudio}
            aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            className="absolute bottom-4 right-4 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-mono font-medium transition-all duration-200 cursor-pointer active:scale-95"
          >
            {isMuted ? (
              <>
                <VolumeX size={14} className="text-red-400" />
                <span className="hidden sm:inline">Muted</span>
              </>
            ) : (
              <>
                <Volume2 size={14} className="text-[#25C176]" />
                <span className="hidden sm:inline">Sound On</span>
              </>
            )}
          </button>
        </div>

        {/* ── RECTANGLE CONTAINER 1: Emerges from center to 100vw & 100vh ─── */}
        <div
          ref={rectangleContainerRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-[var(--c-bg)] flex items-center justify-center overflow-hidden border border-black/15 dark:border-white/15 shadow-2xl"
          style={{
            width: '0vw',
            height: '0vh',
            opacity: 0,
            willChange: 'width, height, opacity, border-radius',
          }}
        >
          {/* Subtle clean ambient tint */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#218A59]/5 via-transparent to-[#234679]/5 pointer-events-none"
          />

          {/* ── FULL 100VH PINNED SPLIT: Left Pinned & Right 100vh Stage ────── */}
          <div className="w-full h-[100dvh] max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14 relative z-10">
            {/* ── Left Pinned Column ────────────────────────────────────────── */}
            <div className="w-full lg:w-5/12 flex flex-col justify-center select-none shrink-0 py-8 lg:py-0">
              <div ref={leftColRef} style={{ willChange: 'transform' }}>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#218A59]/10 text-[#218A59] dark:bg-[#25C176]/15 dark:text-[#25C176] border border-[#218A59]/25 dark:border-[#25C176]/30 mb-4 sm:mb-6 self-start">
                  <Sparkles size={12} className="text-[#218A59] dark:text-[#25C176]" />
                  <span>National Clean Energy Roadmap</span>
                </span>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-gray-900 dark:text-white uppercase leading-[1.12] mb-4 sm:mb-6">
                  NEPAL&apos;S <span className="text-[#218A59] dark:text-[#25C176]">CLEAN ENERGY</span> PROGRESS
                </h2>

                <p className="text-base sm:text-lg lg:text-xl font-medium font-body text-gray-600 dark:text-gray-300 leading-relaxed max-w-md">
                  From <span className="font-bold text-[#234679] dark:text-[#6FA0E8]">0.5 MW in 1911</span> to{' '}
                  <span className="font-bold text-[#218A59] dark:text-[#25C176]">30,000 MW by 2035</span>.
                </p>
              </div>
            </div>

            {/* ── Right Column: 100vh Open Stage for Traveling Cards ────────── */}
            <div className="w-full lg:w-6/12 h-[100dvh] relative flex items-center justify-center lg:justify-end shrink-0 pointer-events-none">
              {/* The 5 Milestone Cards */}
              {MILESTONE_CARDS.map((card, index) => (
                <div
                  ref={(el) => {
                    cardsRef.current[index] = el;
                  }}
                  key={card.step}
                  className="absolute w-full max-w-[460px] h-[450px] sm:h-[480px] rounded-3xl border border-white/20 shadow-2xl flex flex-col justify-between p-6 sm:p-8 overflow-hidden select-none pointer-events-auto"
                  style={{
                    zIndex: index + 10,
                    willChange: 'transform',
                  }}
                >
                  {/* Full Card Background Image */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050C16] via-[#050C16]/80 to-[#050C16]/45" />
                  </div>

                  {/* Card Top Row: Floating Badges */}
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <span
                      className={`text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full border backdrop-blur-md shadow-sm ${
                        card.accent === 'green'
                          ? 'bg-[#218A59]/30 text-[#4ADE80] border-[#218A59]/60'
                          : 'bg-[#234679]/40 text-[#93C5FD] border-[#4A7EC7]/60'
                      }`}
                    >
                      {card.badge}
                    </span>

                    <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                      {card.step} / 05
                    </span>
                  </div>

                  {/* Card Content with High-Impact Typography */}
                  <div className="relative z-10 my-auto py-2">
                    <div className="flex items-baseline gap-2.5 mb-2">
                      <span
                        className={`text-5xl sm:text-6xl font-black font-display tracking-tight leading-none drop-shadow-md ${
                          card.accent === 'green'
                            ? 'text-[#4ADE80]'
                            : 'text-[#93C5FD]'
                        }`}
                      >
                        {card.capacity}
                      </span>
                      <span className="text-2xl sm:text-3xl font-bold font-display text-white/80">
                        {card.capacityUnit}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold font-display text-white mb-2 leading-snug drop-shadow-sm">
                      {card.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-200 font-body leading-relaxed line-clamp-3 drop-shadow-xs">
                      {card.tagline}
                    </p>
                  </div>

                  {/* Card Bottom Row */}
                  <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-gray-300">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-gray-300">
                      {card.metricLabel}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        card.accent === 'green' ? 'text-[#4ADE80]' : 'text-[#93C5FD]'
                      }`}
                    >
                      {card.capacity} {card.capacityUnit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

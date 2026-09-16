'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ArrowRight,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

interface MomentSlide {
  id: string;
  image: string;
  title: string;
  badge: string;
}

const slides: MomentSlide[] = [
  {
    id: 'm3',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.06.jpeg',
    title: 'Sovereign Energy Leaders & Ministers on Stage',
    badge: 'Dignitaries',
  },
  {
    id: 'm4',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.06 (1).jpeg',
    title: 'High-Level Policy Address & Vision',
    badge: 'Plenary Speech',
  },
  {
    id: 'm5',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.06 (2).jpeg',
    title: 'Unveiling the Official Expo Directory',
    badge: 'Launch Ceremony',
  },
  {
    id: 'm6',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.07.jpeg',
    title: 'VIP Exhibition Hall & Technology Tour',
    badge: 'VIP Floor Tour',
  },
  {
    id: 'm7',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.07 (1).jpeg',
    title: 'Honoring Foundational Sponsors & Patrons',
    badge: 'Awards & Honors',
  },
  {
    id: 'm8',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.07 (2).jpeg',
    title: 'National & International Press Briefing',
    badge: 'Press Conference',
  },
  {
    id: 'm9',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.08.jpeg',
    title: '10,000+ Energy Delegates & Leaders Gathering',
    badge: 'Convention Hall',
  },
  {
    id: 'm10',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.08 (1).jpeg',
    title: 'National Clean Energy Milestone Celebration',
    badge: 'Expo Highlights',
  },
  {
    id: 'm1',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.05.jpeg',
    title: 'Official Chief Guest Inaugural Address',
    badge: 'Keynote Speech',
  },
  {
    id: 'm2',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.05 (1).jpeg',
    title: 'Auspicious Inauguration Ceremony & Lamp Lighting',
    badge: 'Inauguration',
  },
];

export function InaugurationMomentsSection() {
  const [selectedSlide, setSelectedSlide] = useState<MomentSlide | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll helper
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 600;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Continuous auto-scroll ticker effect
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: 520, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="relative w-full py-16 sm:py-24 bg-[var(--c-bg)] text-[var(--c-text-primary)] font-sans border-b border-black/[0.08] dark:border-white/[0.1] overflow-hidden transition-colors duration-300">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <ScrollReveal direction="up" distance={25}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#218A59]/10 text-[#218A59] dark:bg-[#25C176]/15 dark:text-[#25C176] border border-[#218A59]/25 dark:border-[#25C176]/30 text-xs font-mono font-bold uppercase tracking-wider mb-2 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#218A59] dark:bg-[#25C176] animate-ping" />
                <span>INAUGURAL MOMENTS & SPEECHES</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-4xl text-gray-900 dark:text-white tracking-tight">
                Chief Guests, Dignitaries & Keynotes
              </h2>
            </div>

            {/* Controls & Gallery Link */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/10 dark:border-white/10">
                <button
                  onClick={() => handleScroll('left')}
                  aria-label="Scroll left"
                  className="w-9 h-9 bg-white dark:bg-white/10 rounded-lg hover:bg-[#218A59] hover:text-white dark:hover:bg-[#25C176] dark:hover:text-black flex items-center justify-center text-gray-700 dark:text-gray-200 transition-colors cursor-pointer border border-black/10 dark:border-white/10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  aria-label="Scroll right"
                  className="w-9 h-9 bg-white dark:bg-white/10 rounded-lg hover:bg-[#218A59] hover:text-white dark:hover:bg-[#25C176] dark:hover:text-black flex items-center justify-center text-gray-700 dark:text-gray-200 transition-colors cursor-pointer border border-black/10 dark:border-white/10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <Link
                href="/gallery"
                className="px-5 py-2.5 bg-[#234679] hover:bg-[#218A59] text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <span>View Gallery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* Large Cinematic Carousel Row */}
        <ScrollReveal direction="up" distance={35} duration={0.8}>
          <div
            ref={scrollContainerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth py-2 cursor-grab active:cursor-grabbing"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              onClick={() => setSelectedSlide(slide)}
              style={{ scrollSnapAlign: 'start' }}
              className="group relative flex-shrink-0 w-[320px] sm:w-[460px] md:w-[540px] lg:w-[620px] flex flex-col bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden hover:border-[#218A59] dark:hover:border-[#25C176] hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              {/* Image Frame */}
              <div className="relative w-full h-[240px] sm:h-[320px] md:h-[380px] lg:h-[420px] bg-black/5 dark:bg-black/40 overflow-hidden">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 768px) 360px, (max-width: 1200px) 580px, 660px"
                  className="object-cover group-hover:scale-102 transition-transform duration-500"
                />

                {/* Top Right Fullscreen Trigger */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>

              {/* Clean Caption Below Image */}
              <div className="p-4 bg-white dark:bg-[#071322] border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-[#234679] dark:text-[#6FA0E8] uppercase tracking-wider block">
                    {slide.badge}
                  </span>
                  <h3 className="font-display font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-snug">
                    {slide.title}
                  </h3>
                </div>
                <div className="shrink-0 text-gray-400 group-hover:text-[#218A59] dark:group-hover:text-[#25C176] transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
        </ScrollReveal>

        {/* Subtle scroll status helper */}
        <div className="mt-4 max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono text-gray-500 dark:text-gray-400">
          <span>Auto-scrolling · Hover to pause</span>
          <span className="hidden sm:inline">Click any image to enlarge</span>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedSlide && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
          onClick={() => setSelectedSlide(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-6xl w-full bg-[#061A2A] border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
          >
            {/* Modal Top Bar */}
            <div className="p-3 px-5 border-b border-white/10 flex items-center justify-between text-white">
              <span className="px-2.5 py-0.5 bg-[#25C176] text-black font-mono text-[10px] font-bold uppercase rounded-md">
                {selectedSlide.badge}
              </span>
              <button
                onClick={() => setSelectedSlide(null)}
                className="p-1 hover:bg-white/10 text-white rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Crisp Image Display */}
            <div className="relative w-full h-[65vh] sm:h-[75vh] bg-black">
              <Image
                src={selectedSlide.image}
                alt={selectedSlide.title}
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            {/* Bottom Caption */}
            <div className="p-4 px-6 bg-[#061A2A] border-t border-white/10 text-white">
              <h4 className="text-sm sm:text-base font-bold font-display">
                {selectedSlide.title}
              </h4>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

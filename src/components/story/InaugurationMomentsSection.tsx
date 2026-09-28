'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

export interface InauguralMoment {
  id: string;
  image: string;
  title: string;
  subtitle: string;
}

export const INAUGURAL_MOMENTS: InauguralMoment[] = [
  {
    id: 'm1',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.05.jpeg',
    title: 'Official Chief Guest Inaugural Address & Keynote',
    subtitle: 'Rt. Hon. Prime Minister addressing the assembly on national energy sovereignty',
  },
  {
    id: 'm2',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.05 (1).jpeg',
    title: 'Auspicious Lamp Lighting Ceremony',
    subtitle: 'Traditional ceremonial Panas lighting marking the formal commencement',
  },
  {
    id: 'm3',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.06.jpeg',
    title: 'Sovereign Energy Leaders & Ministers on Dais',
    subtitle: 'Cabinet Ministers and diplomatic mission heads convened at the leadership summit',
  },
  {
    id: 'm4',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.06 (2).jpeg',
    title: 'Unveiling the Official Himalayan Expo Directory',
    subtitle: 'Official release of the comprehensive national clean energy industry registry',
  },
  {
    id: 'm5',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.07.jpeg',
    title: 'VIP Ministerial Exhibition Hall Walkthrough',
    subtitle: 'Dignitaries touring high-technology pavilions and turbine manufacturing displays',
  },
  {
    id: 'm6',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.07 (1).jpeg',
    title: 'Honoring Apex Patrons & Foundational Sponsors',
    subtitle: 'State recognition presented to foundational developers and power utilities',
  },
  {
    id: 'm7',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.06 (1).jpeg',
    title: 'High-Level Policy Address & Clean Energy Vision',
    subtitle: 'Ministerial roadmap toward regional power trade and cross-border transmission',
  },
  {
    id: 'm8',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.07 (2).jpeg',
    title: 'National & Regional Press Briefing',
    subtitle: 'Joint address announcing milestone bilateral energy partnerships',
  },
  {
    id: 'm9',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.08.jpeg',
    title: '10,000+ Energy Delegates Plenary Assembly',
    subtitle: 'Convention floor gathering of international investors, developers, and engineers',
  },
  {
    id: 'm10',
    image: '/images/WhatsApp Image 2026-08-27 at 06.52.08 (1).jpeg',
    title: 'National Clean Energy Milestone Celebration',
    subtitle: 'Commemorating landmark achievements in sustainable Himalayan energy',
  },
];

export function InaugurationMomentsSection() {
  const [selectedModalIndex, setSelectedModalIndex] = useState<number | null>(null);

  // Modal keyboard shortcuts
  useEffect(() => {
    if (selectedModalIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedModalIndex(null);
      if (e.key === 'ArrowRight') {
        setSelectedModalIndex((prev) => (prev !== null ? (prev + 1) % INAUGURAL_MOMENTS.length : null));
      }
      if (e.key === 'ArrowLeft') {
        setSelectedModalIndex((prev) => (prev !== null ? (prev - 1 + INAUGURAL_MOMENTS.length) % INAUGURAL_MOMENTS.length : null));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedModalIndex]);

  const modalMoment = selectedModalIndex !== null ? INAUGURAL_MOMENTS[selectedModalIndex] : null;

  return (
    <section
      id="inauguration-moments"
      className="relative w-full py-16 sm:py-24 bg-[#F8FAFC] text-slate-900 font-inter-tight border-b border-slate-200/80 transition-colors duration-300 overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl lg:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ────────────────────────────────────────── */}
        <ScrollReveal direction="up" distance={20}>
          <div className="space-y-2 max-w-2xl mb-10 sm:mb-14">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#007A5E] uppercase tracking-wider font-mono">
                STATE PATRONAGE &bull; HISTORICAL RECORD
              </span>
              <div className="w-12 h-0.5 bg-[#007A5E]/40 rounded-full" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Inaugural Moments &amp;{' '}
              <span className="text-[#007A5E]">Sovereign Dignitaries</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Presided over by the Rt. Hon. Prime Minister of Nepal, Cabinet Ministers, and international mission heads across historic editions.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Clean Editorial Photo Mosaic ────────────────────────────── */}
        <ScrollReveal direction="up" distance={25} duration={0.6}>
            <div className="space-y-6">
              {/* Grand Panoramic Centerpiece */}
              <div
                onClick={() => setSelectedModalIndex(0)}
                className="group relative h-[380px] sm:h-[460px] lg:h-[500px] w-full rounded-3xl overflow-hidden border border-slate-200/90 hover:border-emerald-400 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer bg-slate-950 flex flex-col justify-end p-5 sm:p-7 pb-4 sm:pb-5"
              >
                <Image
                  src={INAUGURAL_MOMENTS[0].image}
                  alt={INAUGURAL_MOMENTS[0].title}
                  fill
                  priority
                  sizes="(max-width: 1360px) 100vw, 1360px"
                  className="object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent group-hover:opacity-95 transition-opacity" />

                {/* Bottom Typography: Pinned to bottom edge */}
                <div className="relative z-10 space-y-1 max-w-3xl mt-auto">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight group-hover:text-emerald-300 transition-colors">
                    {INAUGURAL_MOMENTS[0].title}
                  </h3>

                  {/* Description hidden by default, expands on hover */}
                  <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-out overflow-hidden">
                    <div className="min-h-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed pt-1">
                        {INAUGURAL_MOMENTS[0].subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/50 text-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>

              {/* 4 Companion Moments Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {INAUGURAL_MOMENTS.slice(1, 5).map((moment, idx) => (
                  <div
                    key={moment.id}
                    onClick={() => setSelectedModalIndex(idx + 1)}
                    className="group relative h-[300px] sm:h-[340px] rounded-3xl overflow-hidden border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer bg-slate-950 flex flex-col justify-end p-4 sm:p-5 pb-3.5 sm:pb-4"
                  >
                    <Image
                      src={moment.image}
                      alt={moment.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent group-hover:opacity-95 transition-opacity" />

                    {/* Bottom Typography: Pinned to bottom edge */}
                    <div className="relative z-10 space-y-1 mt-auto">
                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors tracking-tight leading-snug">
                        {moment.title}
                      </h4>

                      {/* Description hidden by default, expands on hover */}
                      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-out overflow-hidden">
                        <div className="min-h-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-xs text-slate-300 font-normal leading-relaxed pt-1">
                            {moment.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Secondary Row of 4 Additional Archival Moments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {INAUGURAL_MOMENTS.slice(5, 9).map((moment, idx) => (
                  <div
                    key={moment.id}
                    onClick={() => setSelectedModalIndex(idx + 5)}
                    className="group relative h-[250px] sm:h-[270px] rounded-3xl overflow-hidden border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer bg-slate-950 flex flex-col justify-end p-4 pb-3"
                  >
                    <Image
                      src={moment.image}
                      alt={moment.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent group-hover:opacity-95 transition-opacity" />

                    <div className="relative z-10 space-y-1 mt-auto">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors tracking-tight leading-snug">
                        {moment.title}
                      </h4>

                      {/* Description hidden by default, expands on hover */}
                      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-out overflow-hidden">
                        <div className="min-h-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-[11px] text-slate-300 font-normal leading-relaxed pt-1">
                            {moment.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/50 text-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
      </div>

      {/* ── High-Resolution Lightbox Modal ──────────────────────────── */}
      {modalMoment && selectedModalIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedModalIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <span className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 font-mono text-xs border border-white/15">
                Archival Record &bull; {String(selectedModalIndex + 1).padStart(2, '0')} /{' '}
                {String(INAUGURAL_MOMENTS.length).padStart(2, '0')}
              </span>

              <button
                onClick={() => setSelectedModalIndex(null)}
                aria-label="Close photo modal"
                className="pointer-events-auto w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center transition-colors shadow-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Frame with Prev/Next Overlays */}
            <div className="relative h-[60vh] sm:h-[72vh] w-full bg-black flex items-center justify-center">
              <Image
                src={modalMoment.image}
                alt={modalMoment.title}
                fill
                className="object-contain"
                priority
              />

              {/* Prev Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedModalIndex(
                    (selectedModalIndex - 1 + INAUGURAL_MOMENTS.length) % INAUGURAL_MOMENTS.length
                  );
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 hover:bg-black/95 text-white border border-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedModalIndex((selectedModalIndex + 1) % INAUGURAL_MOMENTS.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 hover:bg-black/95 text-white border border-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Footer Caption */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
              <div className="space-y-1 max-w-2xl">
                <h4 className="text-base sm:text-lg font-bold text-white">
                  {modalMoment.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {modalMoment.subtitle}
                </p>
              </div>

              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline shrink-0">
                Use &larr; &rarr; keys or Esc to close
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default InaugurationMomentsSection;

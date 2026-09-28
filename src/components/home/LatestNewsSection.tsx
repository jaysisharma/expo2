'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

interface NewsCardItem {
  id: string;
  tag: string;
  date: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

const newsItems: NewsCardItem[] = [
  {
    id: 'announces-partners',
    tag: 'ANNOUNCEMENT',
    date: '16 DEC 2026',
    title: 'Himalayan Green Energy Expo 2027 Announces Key Partners',
    description:
      'The organizing committee of HIGEX 2027 unveiled its key partners, marking a significant milestone towards the expo.',
    image: '/images/press_meet.jpeg',
    href: '/news/official-press-meet-announcement-himalayan-green-energy-expo-2027',
  },
  {
    id: 'new-innovations',
    tag: 'EXPO UPDATE',
    date: '08 DEC 2026',
    title: 'New Innovations to be Showcased at the 2027 Expo',
    description:
      'HIGEX 2027 will feature the latest technologies and solutions in hydropower, solar, wind, energy storage and more.',
    image: '/images/dam_reservoir_himalaya.jpg',
    href: '/news/nepal-crosses-3200mw-installed-capacity-record',
  },
  {
    id: 'registration-open',
    tag: 'REGISTRATION',
    date: '01 DEC 2026',
    title: 'Registration Now Open for Himalayan Green Energy Expo 2027',
    description:
      'Secure your participation at HIGEX 2027 and be part of Nepal\'s largest clean-energy exhibition, conference and networking platform.',
    image: '/images/why-participate/delegates-networking.jpg',
    href: '/register',
  },
  {
    id: 'trilateral-power-trade',
    tag: 'POLICY & MARKET',
    date: '18 NOV 2026',
    title: 'Historic Trilateral Power Agreement Signed for Regional Export',
    description:
      'Marking a transformative era in South Asian regional integration, Nepal officially commences commercial transmission to regional neighbors.',
    image: '/images/hydro_transmission.jpg',
    href: '/news/trilateral-power-trade-nepal-india-bangladesh',
  },
  {
    id: 'green-hydrogen-framework',
    tag: 'TECHNOLOGY',
    date: '04 NOV 2026',
    title: 'National Green Hydrogen & Pumped Storage Policy Approved',
    description:
      'Nepal introduces pioneering concessions for green hydrogen electrolyzers and pumped storage facilities to accelerate clean energy.',
    image: '/images/why-participate/machinery-pavilion.jpg',
    href: '/news/nepal-green-hydrogen-storage-policy-framework',
  },
  {
    id: 'international-delegations',
    tag: 'GLOBAL REACH',
    date: '20 OCT 2026',
    title: 'Trade Delegations from 15+ Nations Confirm Expo Participation',
    description:
      'High-level governmental, technical and financial delegations from India, China, Europe and South Asia finalize participation in HIGEX 2027.',
    image: '/images/why-participate/b2b-contracts.jpg',
    href: '/news/ippan-expo-announcement',
  },
];

export function LatestNewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = 4; // 4 pagination dots as shown in design
  const maxIndex = newsItems.length - 3;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  return (
    <section className="w-full bg-[#FAFCFB] relative py-16 sm:py-24 overflow-hidden border-b border-slate-200/80">
      {/* Background Mountain Ridge Silhouette with Soft Fading Contours */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-10 left-0 right-0 h-96 opacity-15">
          <Image
            src="/images/nepal_machhapuchhre.jpg"
            alt="Himalayan Background"
            fill
            className="object-cover object-top mix-blend-luminosity"
          />
        </div>
        {/* Soft gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-[#FAFCFB]/90 to-[#FAFCFB]" />
        {/* Subtle topographical contour vector overlay */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[radial-gradient(#16A34A_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <ScrollReveal direction="up" distance={20} duration={0.6}>
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
            <div>
              {/* Eyebrow with green accent line */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider">
                  NEWS &amp; EVENTS
                </span>
                <div className="w-14 h-0.5 bg-[#16A34A]/40 rounded-full" />
              </div>

              {/* Main Heading with green highlight */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mt-2.5">
                Latest News and <span className="text-[#16A34A]">Events</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mt-3 leading-relaxed">
                Stay updated with the latest announcements, milestones and activities related to
                Himalayan Green Energy Expo 2027.
              </p>
            </div>

            {/* View All News Button */}
            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold shadow-2xs hover:shadow-xs transition-all shrink-0 self-start md:self-end group"
            >
              <span>View All News</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Cards Carousel Window */}
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / 3)}%)`,
              }}
            >
              {newsItems.map((item) => (
                <div
                  key={item.id}
                  className="w-full sm:w-1/2 lg:w-1/3 shrink-0 px-3 pb-2"
                >
                  <article className="h-full bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col group">
                    {/* Card Top Image */}
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Card Body */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Tag & Date Row */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                            {item.tag}
                          </span>
                          <span className="text-xs font-mono text-slate-400 font-medium">
                            {item.date}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#16A34A] transition-colors leading-snug line-clamp-2">
                          <Link href={item.href}>{item.title}</Link>
                        </h3>
                      </div>

                      {/* Description & Action Button Row */}
                      <div className="mt-4 flex items-end justify-between gap-3 pt-1">
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed flex-1">
                          {item.description}
                        </p>

                        <Link
                          href={item.href}
                          aria-label={`Read article: ${item.title}`}
                          className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 group-hover:bg-[#16A34A] group-hover:text-white flex items-center justify-center transition-all shrink-0"
                        >
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Pagination & Navigation Controls */}
          <div className="flex items-center justify-center gap-4 mt-8 sm:mt-10">
            {/* Prev Arrow */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous news slide"
              className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(Math.min(idx, maxIndex))}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 transition-all rounded-full cursor-pointer ${
                    currentIndex === idx
                      ? 'w-6 bg-[#16A34A]'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next news slide"
              className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

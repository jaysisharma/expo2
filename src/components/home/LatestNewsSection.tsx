'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Newspaper, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

interface NewsCardItem {
  id: string;
  tag: string;
  date: string;
  title: string;
  description: string;
  image: string;
  href: string;
  isExternal?: boolean;
}

export function LatestNewsSection() {
  const [news, setNews] = useState<NewsCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadNews() {
      try {
        const res = await fetch('/api/admin/data?t=' + Date.now(), { cache: 'no-store' });
        const json = await res.json();
        const rawArticles =
          json.success && Array.isArray(json.data?.news) ? json.data.news : [];

        let localArticles: any[] = [];
        try {
          const stored = localStorage.getItem('expo_custom_news');
          if (stored) localArticles = JSON.parse(stored);
        } catch {}

        const seen = new Set<string>();
        const combinedRaw = [...rawArticles, ...localArticles];
        const formatted: NewsCardItem[] = [];

        for (const item of combinedRaw) {
          const key = item.id || item.slug || item.title;
          if (!key || seen.has(key)) continue;
          seen.add(key);

          const href =
            item.sourceUrl || (item.slug ? `/news/${item.slug}` : '/news');
          const isExternal = Boolean(item.sourceUrl);

          formatted.push({
            id: item.id || item.slug || String(Math.random()),
            tag: item.category || item.sourceName || 'PRESS DISPATCH',
            date: item.date || 'RECENT',
            title: item.title,
            description:
              item.summary ||
              (Array.isArray(item.content) ? item.content[0] : '') ||
              '',
            image: item.image || '/images/press_meet.webp',
            href,
            isExternal,
          });
        }

        if (isMounted) {
          setNews(formatted);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setNews([]);
          setIsLoading(false);
        }
      }
    }

    loadNews();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalSlides = Math.max(1, news.length);
  const maxIndex = Math.max(0, news.length - 3);

  const handlePrev = () => {
    if (news.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const handleNext = () => {
    if (news.length <= 1) return;
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  // If loading and no items yet, don't flash empty state
  if (!isLoading && news.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#FAFCFB] relative py-16 sm:py-24 overflow-hidden border-b border-slate-200/80">
      {/* Background Mountain Ridge Silhouette with Soft Fading Contours */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-10 left-0 right-0 h-96 opacity-15">
          <Image
            src="/images/nepal_machhapuchhre.webp"
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
              className={`flex transition-transform duration-500 ease-out ${
                news.length <= 3 ? 'justify-start' : ''
              }`}
              style={{
                transform: news.length > 3 ? `translateX(-${currentIndex * (100 / 3)}%)` : undefined,
              }}
            >
              {news.map((item) => {
                const CardWrapper = item.isExternal ? 'a' : Link;
                const linkProps = item.isExternal
                  ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
                  : { href: item.href };

                return (
                  <div
                    key={item.id}
                    className="w-full sm:w-1/2 lg:w-1/3 shrink-0 px-3 pb-2"
                  >
                    <article className="h-full bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col group">
                      {/* Card Top Image */}
                      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-800">
                            <Newspaper className="w-10 h-10 opacity-40" />
                          </div>
                        )}
                        {item.isExternal && (
                          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 group-hover:bg-[#16A34A] transition-all">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Date & Indicator Row */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-mono text-emerald-800 font-semibold flex items-center gap-1.5 truncate max-w-[170px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                              <span className="truncate">{item.tag}</span>
                            </span>
                            <span className="text-xs font-mono text-slate-400 font-medium shrink-0">
                              {item.date}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#16A34A] transition-colors leading-snug line-clamp-2">
                            <CardWrapper {...(linkProps as any)}>
                              {item.title}
                            </CardWrapper>
                          </h3>
                        </div>

                        {/* Description & Action Button Row */}
                        <div className="mt-4 flex items-end justify-between gap-3 pt-1">
                          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed flex-1">
                            {item.description}
                          </p>

                          <CardWrapper
                            {...(linkProps as any)}
                            aria-label={`Read article: ${item.title}`}
                            className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 group-hover:bg-[#16A34A] group-hover:text-white flex items-center justify-center transition-all shrink-0"
                          >
                            {item.isExternal ? (
                              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            ) : (
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            )}
                          </CardWrapper>
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Pagination & Navigation Controls (Only if > 3 items) */}
          {news.length > 3 && (
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
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}

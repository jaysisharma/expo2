'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

export interface CurrentPartner {
  id: string;
  name: string;
  category: string;
  logo: string;
  url?: string;
  order: number;
  active: boolean;
  addedAt: string;
}

export function CurrentPartnersStrip() {
  const [partners, setPartners] = useState<CurrentPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadPartners() {
      try {
        const res = await fetch('/api/partners/current?t=' + Date.now(), {
          cache: 'no-store',
        });
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.partners)) {
          setPartners(json.partners);
        }
      } catch (err) {
        console.warn('Could not load 2027 edition partners:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadPartners();
    return () => {
      isMounted = false;
    };
  }, []);

  // DO NOT RENDER ANYTHING IF THERE ARE NO CURRENT PARTNERS
  if (isLoading || !partners || partners.length === 0) {
    return null;
  }

  const sorted = sortByTier(partners);
  // Scroll only once there are 5+ partners; below that, show them statically.
  const shouldScroll = sorted.length >= 5;
  // Repeat the set so one half always overflows the viewport, then double for a seamless -50% loop.
  const half = Array.from({ length: Math.max(1, Math.ceil(8 / sorted.length)) }, () => sorted).flat();
  const track = [...half, ...half];

  return (
    <section
      id="current-partners-strip"
      className="w-full bg-[var(--c-bg)] border-y border-black/[0.08] dark:border-white/[0.1] py-8 sm:py-10 font-sans select-none overflow-hidden relative transition-colors duration-300"
    >
      <ScrollReveal direction="up" distance={25} duration={0.7}>
        {/* Top Header Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-[#007A5E] uppercase tracking-wider font-mono">
                  5TH EDITION PARTNERS
                </span>
                <div className="w-12 h-0.5 bg-[#007A5E]/40 rounded-full" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Supporting HIGEX 2027, the 5th Edition
              </h2>
            </div>

            <Link
              href="/sponsors"
              className="group inline-flex items-center gap-2 text-xs font-bold text-[#007A5E] hover:text-[#005B46] dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
            >
              <span>BECOME A PARTNER</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {shouldScroll ? (
          <>
            {/* Side Fade Gradient Overlays */}
            <div className="pointer-events-none absolute left-0 top-16 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[var(--c-bg)] to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-16 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[var(--c-bg)] to-transparent z-10" />

            {/* Infinite Moving Strip — scrolls right, opposite to the previous partners strip */}
            <div className="flex whitespace-nowrap overflow-hidden py-2">
              <div
                className="flex items-center gap-8 sm:gap-14 flex-shrink-0 animate-[marquee_30s_linear_infinite] [animation-direction:reverse]"
                style={{ willChange: 'transform' }}
              >
                {track.map((item, idx) => (
                  <PartnerTile key={`${item.id}-${idx}`} item={item} />
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Fewer than 5 partners: static, aligned with the header */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-wrap items-center gap-6 sm:gap-8 py-2">
            {sorted.map((item) => (
              <PartnerTile key={item.id} item={item} />
            ))}
          </div>
        )}
      </ScrollReveal>
    </section>
  );
}

const TIER_ORDER = ['title', 'powered', 'diamond', 'platinum', 'gold', 'silver', 'association'];

function tierRank(category: string) {
  const c = (category || '').toLowerCase();
  const i = TIER_ORDER.findIndex((t) => c.includes(t));
  return i === -1 ? TIER_ORDER.length : i;
}

function sortByTier(partners: CurrentPartner[]) {
  return [...partners].sort((a, b) => tierRank(a.category) - tierRank(b.category) || a.order - b.order);
}

function PartnerTile({ item }: { item: CurrentPartner }) {
  const cls =
    'h-28 sm:h-32 w-40 sm:w-48 lg:w-56 relative flex flex-col items-center justify-between flex-shrink-0 bg-white/90 dark:bg-white/10 rounded-xl px-4 py-3 border border-black/5 dark:border-white/10 opacity-90 hover:opacity-100 transition-all duration-200 group';
  const content = (
    <>
      <div className="relative w-full flex-1 min-h-0">
        <Image
          src={item.logo || '/images/logo.webp'}
          alt={item.name}
          fill
          unoptimized={item.logo?.startsWith('data:')}
          sizes="(max-width: 768px) 160px, 220px"
          className="object-contain group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="w-full text-center mt-2 leading-tight">
        <span className="block truncate text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#007A5E] dark:group-hover:text-emerald-400 transition-colors">
          {item.name}
        </span>
        {item.category && (
          <span className="block truncate text-[9.5px] font-bold uppercase tracking-[0.14em] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
            {item.category}
          </span>
        )}
      </div>
    </>
  );
  return item.url ? (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className={cls} title={item.name}>
      {content}
    </a>
  ) : (
    <div className={cls} title={item.name}>
      {content}
    </div>
  );
}

export default CurrentPartnersStrip;

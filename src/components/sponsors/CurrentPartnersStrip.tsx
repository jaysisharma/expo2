'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
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

  // Double array for seamless infinite marquee loop
  const marqueePartners = partners.length >= 4 ? [...partners, ...partners] : partners;

  return (
    <section
      id="current-partners-strip"
      className="w-full bg-[var(--c-bg)] border-y border-black/[0.08] dark:border-white/[0.1] py-10 sm:py-14 font-sans select-none overflow-hidden relative transition-colors duration-300"
    >
      <ScrollReveal direction="up" distance={25} duration={0.7}>
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider font-mono bg-emerald-500/15 text-[#007A5E] dark:text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-3 h-3 text-[#00E599]" />
                  2027 EDITION PARTNERS
                </span>
                <div className="w-12 h-0.5 bg-[#007A5E]/40 rounded-full" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Official Partners &amp; Sponsors for the 5th Edition
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
                Pioneering renewable energy institutions accelerating Nepal&apos;s clean energy future.
              </p>
            </div>

            <Link
              href="/sponsors"
              className="group inline-flex items-center gap-2 text-xs font-bold text-[#007A5E] hover:text-[#005B46] dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors shrink-0"
            >
              <span>PARTNERSHIP PROSPECTUS</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Ambient Gradient Overlays for Marquee Fade */}
        <div className="pointer-events-none absolute left-0 top-24 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[var(--c-bg)] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-24 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[var(--c-bg)] to-transparent z-10" />

        {/* Dynamic Display: Marquee if 4+ partners, clean centered grid if fewer */}
        {partners.length >= 4 ? (
          <div className="flex whitespace-nowrap overflow-hidden py-3">
            <div
              className="flex items-center gap-6 sm:gap-10 flex-shrink-0 animate-[marquee_28s_linear_infinite]"
              style={{ willChange: 'transform' }}
            >
              {marqueePartners.map((item, idx) => (
                <PartnerCard key={`${item.id}-${idx}`} item={item} />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 py-3">
            {partners.map((item) => (
              <PartnerCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </ScrollReveal>
    </section>
  );
}

function PartnerCard({ item }: { item: CurrentPartner }) {
  const cat = (item.category || '').toLowerCase();
  const isTitle = cat.includes('title');
  const isPlatinum = cat.includes('platinum');
  const isGold = cat.includes('gold');
  const isSilver = cat.includes('silver');
  const isDiamond = cat.includes('diamond');
  const isAssociation = cat.includes('association');
  const isPowered = cat.includes('powered');

  let badgeClasses =
    'bg-emerald-500/15 text-[#007A5E] dark:text-emerald-400 border-emerald-500/30';
  let cardBorder =
    'border-emerald-500/25 dark:border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_4px_20px_rgba(0,163,122,0.06)]';

  if (isTitle) {
    badgeClasses =
      'bg-amber-400/20 text-amber-800 dark:text-amber-300 border-amber-400/40 font-extrabold';
    cardBorder =
      'border-amber-400/50 dark:border-amber-400/50 hover:border-amber-400 shadow-[0_8px_25px_rgba(245,158,11,0.12)]';
  } else if (isPlatinum) {
    badgeClasses =
      'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 font-bold';
    cardBorder =
      'border-slate-300 dark:border-slate-600 hover:border-slate-400 shadow-[0_8px_25px_rgba(100,116,139,0.12)]';
  } else if (isDiamond) {
    badgeClasses =
      'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-400/40 font-bold';
    cardBorder =
      'border-cyan-400/40 dark:border-cyan-400/50 hover:border-cyan-400 shadow-[0_8px_25px_rgba(6,182,212,0.1)]';
  } else if (isGold) {
    badgeClasses =
      'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold';
    cardBorder =
      'border-amber-500/40 dark:border-amber-500/40 hover:border-amber-500 shadow-[0_8px_25px_rgba(245,158,11,0.08)]';
  } else if (isSilver) {
    badgeClasses =
      'bg-zinc-200/70 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 font-bold';
    cardBorder =
      'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400';
  } else if (isAssociation) {
    badgeClasses =
      'bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-400/40 font-bold';
    cardBorder =
      'border-sky-400/40 dark:border-sky-400/50 hover:border-sky-400 shadow-[0_8px_25px_rgba(14,165,233,0.1)]';
  } else if (isPowered) {
    badgeClasses =
      'bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-400/40 font-bold';
    cardBorder =
      'border-purple-400/40 dark:border-purple-400/50 hover:border-purple-400 shadow-[0_8px_25px_rgba(168,85,247,0.1)]';
  }

  const content = (
    <div className="flex flex-col items-center justify-between w-full h-full gap-2.5">
      {/* Tier Badge */}
      <div className="w-full flex items-center justify-center shrink-0">
        <span
          className={`inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider font-mono px-3 py-1 rounded-full border text-center truncate max-w-full leading-normal ${badgeClasses}`}
        >
          {item.category || 'Official Partner'}
        </span>
      </div>

      {/* Partner Logo */}
      <div className="relative w-full h-16 sm:h-20 my-auto flex items-center justify-center shrink-0">
        <Image
          src={item.logo || '/images/logo.webp'}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 180px, 240px"
          className="object-contain group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Partner Name */}
      <div className="w-full text-center shrink-0">
        <span className="block text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
          {item.name}
        </span>
      </div>
    </div>
  );

  const wrapperClasses = `h-40 sm:h-44 w-52 sm:w-60 lg:w-64 relative flex flex-col items-center justify-between flex-shrink-0 bg-white/95 dark:bg-slate-900/90 rounded-2xl p-4 border ${cardBorder} shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group`;

  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={wrapperClasses}
        title={`${item.name} · ${item.category}`}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={wrapperClasses} title={`${item.name} · ${item.category}`}>
      {content}
    </div>
  );
}

export default CurrentPartnersStrip;

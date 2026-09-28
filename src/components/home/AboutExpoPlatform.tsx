'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Leaf } from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

export function AboutExpoPlatform() {
  return (
    <section
      id="about-the-expo"
      className="relative w-full bg-white text-slate-900 py-16 sm:py-24 border-t border-slate-100 overflow-hidden"
    >
      {/* ── Background Mountain Wash (Bottom Left Himalayan Peaks & Pines fading softly) ── */}
      <div className="absolute -bottom-8 -left-12 w-[340px] sm:w-[480px] lg:w-[580px] h-[320px] sm:h-[400px] pointer-events-none select-none z-0 opacity-40">
        <Image
          src="/images/nepal_machhapuchhre.webp"
          alt="Himalayan Mountains"
          fill
          className="object-cover object-bottom mix-blend-multiply"
        />
        {/* Soft edge fade masks */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/50 to-white" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-white" />
      </div>

      {/* ── Subtle Topographic Contour Lines Overlay on the Right ── */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-3/4 sm:w-1/2 h-full pointer-events-none select-none overflow-hidden opacity-[0.08]"
      >
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 800 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50,100 C200,80 320,180 480,140 C640,100 720,200 850,150"
            stroke="#16A34A"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path
            d="M50,180 C220,140 350,250 510,210 C670,170 750,270 850,220"
            stroke="#16A34A"
            strokeWidth="1.5"
          />
          <path
            d="M50,270 C240,220 380,330 540,290 C700,250 780,350 850,300"
            stroke="#16A34A"
            strokeWidth="1.5"
          />
          <path
            d="M50,370 C270,310 420,420 580,380 C740,340 800,430 850,390"
            stroke="#16A34A"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <path
            d="M50,470 C290,410 450,510 610,470 C770,430 820,510 850,480"
            stroke="#16A34A"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <ScrollReveal direction="up" distance={25} duration={0.6}>
          {/* Top Row: Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* ── LEFT COLUMN: Text Content & CTAs ── */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider">
                  ABOUT THE EXPO
                </span>
                <div className="w-12 h-0.5 bg-[#16A34A]/40 rounded-full" />
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.18] mt-3">
                A Regional Platform<br />
                for a Cleaner, Stronger<br />
                <span className="text-[#16A34A]">Himalayan</span> Future
              </h2>

              {/* Four Descriptive Paragraphs */}
              <div className="space-y-4 text-xs sm:text-[14px] leading-relaxed text-slate-600 mt-6 font-normal">
                <p>
                  Himalayan Green Energy Expo is an international platform focused on Nepal&apos;s evolving clean-energy landscape, bringing together hydropower, renewable energy, green technologies, investment, innovation, and sustainable infrastructure under one roof.
                </p>
                <p>
                  Building on the experience of previous editions, and in light of recent climate-driven disruptions to hydropower infrastructure, the 2027 edition places renewed emphasis on climate-resilient energy development.
                </p>
                <p>
                  The Expo connects industry leaders, investors, policymakers, technology providers, developers, and energy professionals to explore emerging opportunities, showcase resilient solutions, and strengthen partnerships across the sector.
                </p>
                <p>
                  The Expo represents a step toward positioning Nepal as a regional hub for clean-energy dialogue, investment, and innovation while supporting the country&apos;s transition toward an energy future that is sustainable, integrated, and built to last.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-7">
                {/* Primary Button */}
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#063B2C] hover:bg-[#04281E] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all duration-200 group"
                >
                  <span>Learn More About the Expo</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Media Collage Composition ── */}
            <div className="lg:col-span-6 relative w-full pt-4 sm:pt-6">

              {/* Main Image: Hydro Dam with Turquoise Reservoir */}
              <div className="relative w-full h-[260px] sm:h-[340px] lg:h-[380px] rounded-3xl sm:rounded-[32px] overflow-hidden shadow-xl border border-slate-100 group">
                <Image
                  src="/images/dam_reservoir_himalaya.webp"
                  alt="Himalayan Hydro Dam & Turquoise Reservoir"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Floating Badge (Top Right of Main Image) */}
              <div className="absolute top-4 sm:top-6 right-3 sm:right-5 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl border border-slate-100 flex items-center gap-3 max-w-[270px] sm:max-w-[290px]">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-100/80 flex items-center justify-center shrink-0">
                  <Leaf className="w-5 h-5 text-[#16A34A]" />
                </div>
                <div className="leading-tight">
                  <div className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider">
                    INTERNATIONAL PLATFORM
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Hydropower &bull; Renewable Energy<br />
                    Green Technology &bull; Investment
                  </div>
                </div>
              </div>

              {/* Bottom Overlapping Group: Solar Panel Image + Dark Green Theme Card */}
              <div className="relative -mt-16 sm:-mt-24 flex items-end justify-between gap-4 z-20">
                {/* Floating Dark Green Theme Card */}
                <div className="relative flex-1 max-w-[280px] sm:max-w-[340px] bg-[#063B2C] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-emerald-800/40 overflow-hidden">
                  {/* Subtle concentric wave watermark inside theme card */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 100% 100%, #16A34A 1px, transparent 1px), radial-gradient(circle at 0% 0%, #16A34A 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />

                  <div className="relative z-10">
                    {/* Eyebrow */}
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <span className="text-[10px] sm:text-[11px] font-mono font-semibold tracking-widest text-emerald-300 uppercase">
                        THEME
                      </span>
                      <div className="w-10 h-0.5 bg-emerald-500/40 rounded-full" />
                    </div>

                    {/* Quote */}
                    <blockquote className="text-xl sm:text-2xl lg:text-[26px] font-serif text-white font-normal tracking-wide leading-snug">
                      &ldquo;Resilient Energy,<br />
                      Prosperous Nepal&rdquo;
                    </blockquote>
                  </div>
                </div>

                {/* Secondary Overlapping Image: Solar Panels at Sunrise */}
                <div className="relative w-44 sm:w-60 lg:w-64 h-32 sm:h-44 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 border-white shrink-0 group">
                  <Image
                    src="/images/sectors/solar_energy_show.webp"
                    alt="Solar Panels in the Himalayas"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="250px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
              </div>

            </div>

          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

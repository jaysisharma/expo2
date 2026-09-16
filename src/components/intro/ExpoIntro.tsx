"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ExpoIntro() {
  return (
    <section id="intro" className="relative py-28 sm:py-36 bg-hydro-wash text-slate-900 px-4 sm:px-6 lg:px-12 border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Label */}
        <div className="flex items-center gap-2 text-xs font-technical text-hydro-primary tracking-widest uppercase mb-6 font-bold">
          <span className="w-2 h-2 rounded-full bg-hydro-primary" />
          03 / THE EXPOSITION
        </div>

        {/* 60% Image / 40% Editorial Magazine Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Editorial Copy Column (40%) */}
          <div className="lg:col-span-5 space-y-8">
            <h2 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-slate-900 leading-[0.92]">
              GREEN ENERGY <br />
              FOR <br />
              <span className="text-[#19A974]">PROSPERITY.</span>
            </h2>

            <div className="space-y-4 text-base sm:text-lg text-slate-700 font-normal leading-relaxed">
              <p>
                <strong>Himalayan Green Energy Expo 2027</strong> is Nepal&apos;s landmark international exhibition and business platform connecting green energy, clean technology, investment, and sustainable development.
              </p>
              <p className="text-sm sm:text-base text-slate-600">
                Clean energy is not only about reducing carbon emissions; it is about creating economic opportunities, employment, industrial growth, and energy security for people and nations.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href="/files/hydroproposal-13-2-2024.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-md bg-[#087EA4] text-white font-mono text-xs font-bold tracking-wider hover:bg-[#061A2A] transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
              >
                <span>DOWNLOAD EVENT PROPOSAL (PDF)</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                href="/register"
                className="px-6 py-3.5 rounded-md bg-white text-slate-900 font-technical text-xs font-bold tracking-wider border border-slate-300 hover:border-[#19A974] transition-colors text-center"
              >
                <span>REGISTER DELEGATION</span>
              </Link>
            </div>

            {/* Strategic 4 Pillars */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="font-technical text-[10px] text-slate-500 uppercase block font-bold">
                  PILLAR 01
                </span>
                <span className="text-slate-900 font-bold">ENERGY</span>
              </div>
              <div>
                <span className="font-technical text-[10px] text-slate-500 uppercase block font-bold">
                  PILLAR 02
                </span>
                <span className="text-slate-900 font-bold">TECHNOLOGY</span>
              </div>
              <div>
                <span className="font-technical text-[10px] text-slate-500 uppercase block font-bold">
                  PILLAR 03
                </span>
                <span className="text-slate-900 font-bold">INVESTMENT</span>
              </div>
              <div>
                <span className="font-technical text-[10px] text-slate-500 uppercase block font-bold">
                  PILLAR 04
                </span>
                <span className="text-slate-900 font-bold">PROSPERITY</span>
              </div>
            </div>
          </div>

          {/* Right Cinematic Editorial Image Column (60%) */}
          <div className="lg:col-span-7 relative h-[480px] sm:h-[620px] rounded-lg overflow-hidden shadow-sm border border-slate-200 group">
            <Image
              src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1800&q=88"
              alt="Himalayan Mountain Hydropower Reservoir"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
            />

            {/* Overlapping Editorial Badge */}
            <div className="absolute bottom-8 left-8 right-8 sm:right-auto sm:max-w-md p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 shadow-xl">
              <span className="text-[10px] font-technical text-hydro-primary tracking-widest uppercase block mb-1 font-bold">
                NEPAL // ENERGY LANDSCAPE
              </span>
              <h3 className="font-display font-bold text-xl text-slate-900">
                Harnessing High-Head Himalayan Kinetic Energy
              </h3>
              <p className="text-xs text-slate-600 mt-2 font-normal leading-relaxed">
                6,000+ rivers descending from 8,000m glacial heights provide uninterrupted clean baseload potential for the South Asian regional grid.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

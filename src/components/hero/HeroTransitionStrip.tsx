'use client';

import React from 'react';

export function HeroTransitionStrip() {
  const tickerItems = [
    { text: '5TH MILESTONE EDITION', highlight: 'text-[#38BDF8]' },
    { text: 'HIMALAYAN GREEN ENERGY EXPO', highlight: 'text-white' },
    { text: '“GREEN ENERGY FOR PROSPERITY”', highlight: 'text-[#25C176]' },
    { text: 'KATHMANDU, NEPAL · 16–18 JAN 2027', highlight: 'text-white' },
    { text: '150+ EXHIBITORS · 300+ STALLS', highlight: 'text-[#38BDF8]' },
    { text: 'HYDRO · SOLAR · STORAGE · EV · GREEN HYDROGEN · GRID', highlight: 'text-[#25C176]' },
    { text: '10,000+ DELEGATES · 20+ NATIONS', highlight: 'text-white' },
  ];

  return (
    <div className="w-full bg-[#05111F] text-white py-4 border-y border-white/10 overflow-hidden shadow-2xl select-none font-sans">
      <div className="flex whitespace-nowrap overflow-hidden">
        <div
          className="flex items-center gap-8 sm:gap-12 flex-shrink-0 animate-[marquee_28s_linear_infinite]"
          style={{ willChange: 'transform' }}
        >
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <div key={idx} className="flex items-center gap-8 sm:gap-12">
              <span className={`text-xs sm:text-sm font-bold tracking-widest uppercase font-mono ${item.highlight}`}>
                {item.text}
              </span>
              <span className="text-[#25C176] text-xs font-normal">
                ✦
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

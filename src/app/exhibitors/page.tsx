import React from "react";
import ExhibitorDirectory from "@/components/exhibitors/ExhibitorDirectory";
import Link from "next/link";

export default function ExhibitorsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB] text-slate-900 flex flex-col font-sans">
      {/* Header Banner — matching site-wide emerald theme */}
      <div className="bg-[#04281E] text-white pt-28 sm:pt-32 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20 relative overflow-hidden">
        {/* Subtle Ambient Light Glow */}
        <div
          aria-hidden="true"
          className="absolute -top-24 right-1/4 w-[500px] h-[300px] bg-gradient-to-b from-[#12B981]/15 to-transparent blur-3xl pointer-events-none rounded-full"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-300/70 font-mono mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#34D399]">Exhibitors</span>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              EXHIBITOR DIRECTORY
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-4xl">
              Explore the HIGEX 2027 Exhibitor Ecosystem
            </h1>
            <p className="mt-3 text-sm sm:text-base text-emerald-100/80 max-w-3xl leading-relaxed">
              Discover 100+ expected exhibitors across hydropower, renewable energy, power &amp; electricals, investment &amp; finance, transmission &amp; distribution, engineering &amp; construction, digital &amp; smart energy, government &amp; institutions, and knowledge &amp; innovation
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ExhibitorDirectory />
        </div>
      </main>
    </div>
  );
}

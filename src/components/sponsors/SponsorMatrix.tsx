"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { sponsorsData } from "@/data/sponsors";
import { ArrowRight, ExternalLink } from "lucide-react";

export default function SponsorMatrix() {
  return (
    <section className="relative py-16 sm:py-24 bg-[#F8FAFB] text-[#061A2A] px-4 sm:px-6 lg:px-12 border-b border-slate-200 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#087EA4] tracking-widest uppercase mb-3 font-bold px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              OFFICIAL PATRONS, SPONSORS & PARTNERS
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl text-[#061A2A] tracking-tight leading-[1.05]">
              BACKED BY <br />
              <span className="text-[#087EA4]">GOVERNMENT &</span>{" "}
              <span className="text-[#059669]">INDUSTRY LEADERS.</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/contact?type=Sponsorship"
              className="px-6 py-3.5 rounded-full bg-[#10B981] hover:bg-[#059669] text-slate-950 hover:text-white font-mono text-xs font-black tracking-wider transition-all flex items-center gap-2 shadow-lg hover:scale-105"
            >
              <span>BECOME A 2027 SPONSOR</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Sponsor Tier Categories */}
        <div className="space-y-10">
          {sponsorsData.map((category, cIdx) => (
            <div
              key={cIdx}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-sans font-bold text-xl text-[#061A2A]">
                    {category.tier}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal">
                    {category.description}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-[#087EA4] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-md bg-[#F4F8F7] border border-slate-200">
                  TIER // 0{cIdx + 1}
                </span>
              </div>

              {/* Sponsor Grid Logos */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {category.sponsors.map((sponsor, sIdx) => (
                  <a
                    key={sIdx}
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-5 rounded-2xl bg-[#F8FAFB] hover:bg-white border border-slate-200 hover:border-[#10B981] hover:shadow-md transition-all duration-300 flex flex-col items-center justify-between text-center min-h-[170px]"
                  >
                    {/* Logo container */}
                    <div className="relative w-full h-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-2 mb-2 group-hover:scale-105 transition-transform overflow-hidden shadow-xs">
                      {sponsor.logo.startsWith("http") || sponsor.logo.startsWith("/") ? (
                        <Image
                          src={sponsor.logo}
                          alt={sponsor.name}
                          fill
                          className="object-contain p-1.5"
                        />
                      ) : (
                        <span className="font-sans font-black text-xl text-[#087EA4]">
                          {sponsor.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <span className="font-sans font-bold text-xs text-[#061A2A] group-hover:text-[#087EA4] transition-colors line-clamp-2 leading-tight">
                        {sponsor.name}
                      </span>

                      <span className="block font-mono text-[9px] text-[#059669] uppercase tracking-wider font-semibold">
                        {sponsor.type}
                      </span>
                    </div>

                    <div className="pt-2 text-[10px] font-mono text-slate-400 group-hover:text-[#087EA4] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Visit Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ShieldCheck, Building2, Globe2 } from "lucide-react";

export default function SponsorsShowcaseSection() {
  const globalTechPartners = [
    { name: "Voith Hydro", origin: "Germany", role: "Turbine & Generator OEM" },
    { name: "Andritz Hydro", origin: "Austria", role: "Electromechanical Systems" },
    { name: "Hitachi Energy", origin: "Japan / Switzerland", role: "High-Voltage Switchgear" },
    { name: "GE Vernova", origin: "United States", role: "Power Generation & Grid" },
    { name: "BHEL", origin: "India", role: "Heavy Electrical Equipment" },
    { name: "Flovel Energy", origin: "India", role: "Small & Medium Hydro" },
    { name: "Toshiba Energy", origin: "Japan", role: "Turbine Controls" },
    { name: "Harbin Electric", origin: "China", role: "Hydropower Machinery" },
  ];

  const financialPartners = [
    { name: "Nabil Bank", type: "Hydropower Consortium Lead" },
    { name: "Global IME Bank", type: "Infrastructure Syndication" },
    { name: "NIC Asia Bank", type: "Renewable Energy Financing" },
    { name: "Everest Bank", type: "Project Financing Syndicate" },
    { name: "Standard Chartered", type: "Cross-Border Trade Finance" },
    { name: "Himalayan Bank", type: "Commercial PPA Escrow" },
  ];

  return (
    <section
      id="sponsors-showcase"
      className="relative w-full py-16 sm:py-24 bg-[#FFFFFF] text-[#061A2A] font-sans border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-slate-100 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F8F7] border border-slate-200 text-xs font-mono font-semibold text-[#087EA4] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#19A974] animate-pulse" />
              <span>INDUSTRY SHOWCASE</span>
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl text-[#061A2A] tracking-tight leading-tight">
              GLOBAL OEMs, UTILITIES & <br />
              <span className="text-[#087EA4]">FINANCIAL</span>{" "}
              <span className="text-[#19A974]">SYNDICATES.</span>
            </h2>
          </div>

          <div className="space-y-3 max-w-md">
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Over 150+ technology manufacturers, engineering contractors, commercial banks, and multilateral partners convening across 5,000+ sqm of exhibition space.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/exhibitors"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#087EA4] hover:text-[#061A2A] transition-colors uppercase tracking-wider"
              >
                <span>VIEW DIRECTORY</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sponsors"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#19A974] hover:text-[#061A2A] transition-colors uppercase tracking-wider"
              >
                <span>BECOME A SPONSOR</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* 01: Global Technology Partners Matrix */}
        <div className="space-y-4 mb-12">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
            GLOBAL TECHNOLOGY & TURBINE OEMs
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {globalTechPartners.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-[#F4F8F7] hover:border-[#087EA4]/40 hover:bg-white hover:shadow-sm transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className="text-[10px] font-mono font-bold text-[#087EA4] uppercase tracking-wider">
                    {item.origin}
                  </div>
                  <div className="font-sans font-bold text-base text-[#061A2A] pt-1">
                    {item.name}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-normal pt-2 border-t border-slate-200/60 mt-3 truncate">
                  {item.role}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 02: Commercial Banking & Financing Syndicates */}
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
            COMMERCIAL BANKING & FINANCIAL SYNDICATES
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {financialPartners.map((bank, idx) => (
              <motion.div
                key={bank.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#19A974]/40 hover:shadow-xs transition-all text-center space-y-1"
              >
                <div className="font-sans font-bold text-sm text-[#061A2A]">
                  {bank.name}
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate">
                  {bank.type}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

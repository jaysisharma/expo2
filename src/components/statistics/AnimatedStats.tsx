"use client";

import React from "react";
import { motion } from "framer-motion";
import { Landmark, TrendingUp, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function AnimatedStats() {
  return (
    <section className="relative py-20 sm:py-28 bg-[#FFFFFF] px-4 sm:px-6 lg:px-12 border-b border-slate-200 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#087EA4] tracking-widest uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#43D69A]" />
              02 / SCALE & IMPACT
            </div>
            <h2 className="font-bold text-3xl sm:text-5xl md:text-6xl text-[#061A2A] tracking-tight leading-tight">
              The Scale of <br />
              <span className="text-[#087EA4]">The Exposition.</span>
            </h2>
          </div>

          <div className="lg:col-span-4 lg:border-l border-slate-200 lg:pl-8">
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Nepal&apos;s largest confluence of energy developers, turbine manufacturers, multilateral finance institutions, and trilateral power trading delegates.
            </p>
            <div className="mt-4">
              <Link
                href="/exhibitors"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#087EA4] hover:text-[#072B42] transition-colors"
              >
                <span>EXPLORE PARTICIPATING ENTITIES</span>
                <ArrowUpRight className="w-4 h-4 text-[#19BFE8]" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Primary Hero Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 pb-16 border-b border-slate-200">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="space-y-2"
          >
            <span className="text-xs text-[#8CA0A8] tracking-widest block font-bold">
              METRIC // 01
            </span>
            <div className="font-sans font-black text-6xl sm:text-7xl lg:text-8xl text-[#061A2A] tracking-tight">
              100<span className="text-[#087EA4]">+</span>
            </div>
            <div className="text-xs font-bold text-[#061A2A] uppercase tracking-wider">
              GLOBAL EXHIBITING ENTERPRISES
            </div>
            <p className="text-xs text-slate-600 font-normal pt-1 leading-relaxed">
              Turbine OEMs, GIS switchgear giants, tunneling TBMs, and EPC contractors.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-2 lg:border-l border-slate-200 lg:pl-8"
          >
            <span className="text-xs text-[#8CA0A8] tracking-widest block font-bold">
              METRIC // 02
            </span>
            <div className="font-sans font-black text-6xl sm:text-7xl lg:text-8xl text-[#087EA4] tracking-tight">
              10K<span className="text-[#19BFE8]">+</span>
            </div>
            <div className="text-xs font-bold text-[#061A2A] uppercase tracking-wider">
              TRADE VISITORS & BUYERS
            </div>
            <p className="text-xs text-slate-600 font-normal pt-1 leading-relaxed">
              Independent power producers, engineers, bankers, and procurement heads.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-2 lg:border-l border-slate-200 lg:pl-8"
          >
            <span className="text-xs text-[#8CA0A8] tracking-widest block font-bold">
              METRIC // 03
            </span>
            <div className="font-sans font-black text-6xl sm:text-7xl lg:text-8xl text-[#061A2A] tracking-tight">
              20<span className="text-[#19A974]">+</span>
            </div>
            <div className="text-xs font-bold text-[#061A2A] uppercase tracking-wider">
              PARTICIPATING NATIONS
            </div>
            <p className="text-xs text-slate-600 font-normal pt-1 leading-relaxed">
              Official delegations from Europe, East Asia, South Asia, and the Americas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-2 lg:border-l border-slate-200 lg:pl-8"
          >
            <span className="text-xs text-[#8CA0A8] tracking-widest block font-bold">
              METRIC // 04
            </span>
            <div className="font-sans font-black text-6xl sm:text-7xl lg:text-8xl text-[#19A974] tracking-tight">
              50<span className="text-[#43D69A]">+</span>
            </div>
            <div className="text-xs font-bold text-[#061A2A] uppercase tracking-wider">
              KEYNOTE & TECHNICAL FACULTY
            </div>
            <p className="text-xs text-slate-600 font-normal pt-1 leading-relaxed">
              Ministers, utility chiefs, DFI directors, and leading hydraulic researchers.
            </p>
          </motion.div>
        </div>

        {/* Secondary Macro Pipeline Data Strip */}
        <div className="pt-12 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-6 rounded-lg bg-[#F4F8F7] border border-slate-200 shadow-sm">
            <div className="p-3.5 rounded-md bg-[#087EA4]/10 text-[#087EA4] border border-[#087EA4]/20 shrink-0">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8CA0A8] uppercase tracking-widest block">
                CAPITAL ALLOCATION
              </span>
              <div className="font-sans font-black text-3xl sm:text-4xl text-[#061A2A]">
                $15+ BILLION
              </div>
              <p className="text-xs text-slate-600 mt-1 font-normal">
                Bankable private hydro concessions seeking senior debt syndication and equity partners.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-6 rounded-lg bg-[#F4F8F7] border border-slate-200 shadow-sm">
            <div className="p-3.5 rounded-md bg-[#19A974]/10 text-[#19A974] border border-[#19A974]/20 shrink-0">
              <Landmark className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8CA0A8] uppercase tracking-widest block">
                SOVEREIGN ENERGY ROADMAP
              </span>
              <div className="font-sans font-black text-3xl sm:text-4xl text-[#061A2A]">
                28,000 MW BY 2035
              </div>
              <p className="text-xs text-slate-600 mt-1 font-normal">
                National capacity masterplan with 15,000 MW dedicated for trilateral regional clean power export.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

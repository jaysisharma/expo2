"use client";

import React from "react";
import Link from "next/link";
import { Exhibitor } from "@/lib/types";
import { ArrowUpRight, MapPin, Sparkles } from "lucide-react";

interface ExhibitorCardProps {
  exhibitor: Exhibitor;
  onLocateBooth?: (boothNumber: string) => void;
}

export default function ExhibitorCard({ exhibitor, onLocateBooth }: ExhibitorCardProps) {
  return (
    <div className="group relative rounded-2xl bg-white border border-slate-200 hover:border-[#005C42] p-6 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md">
      {/* Top Details & Booth Badge */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold">
              {exhibitor.countryCode} · {exhibitor.country}
            </span>
            {exhibitor.featured && (
              <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                <Sparkles className="w-3 h-3 text-emerald-600" /> FEATURED
              </span>
            )}
          </div>

          <button
            onClick={() => onLocateBooth && onLocateBooth(exhibitor.boothNumber)}
            className="flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-[#005C42] hover:text-white transition-colors cursor-pointer"
            title="Locate booth on floor plan"
          >
            <MapPin className="w-3 h-3" />
            <span>{exhibitor.boothNumber}</span>
          </button>
        </div>

        {/* Company Name & Tagline */}
        <Link href={`/exhibitors/${exhibitor.slug}`} className="block group-hover:text-[#005C42] transition-colors">
          <h3 className="font-bold text-xl text-slate-900 tracking-tight">
            {exhibitor.name}
          </h3>
        </Link>

        <span className="inline-block mt-1 font-mono text-xs text-emerald-800 font-semibold">
          {exhibitor.category}
        </span>

        <p className="mt-3 text-xs text-slate-600 font-normal line-clamp-3 leading-relaxed">
          {exhibitor.description}
        </p>

        {/* Highlight Products list */}
        {exhibitor.products && exhibitor.products.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase block mb-1 font-bold">
              FLAGSHIP PRODUCT
            </span>
            <p className="text-xs text-slate-800 font-medium line-clamp-1">
              {exhibitor.products[0].title}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Action Links */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <Link
          href={`/exhibitors/${exhibitor.slug}`}
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#005C42] hover:text-[#007A5E] transition-colors"
        >
          <span>VIEW FULL PROFILE</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>

        <span className="text-[10px] font-mono text-slate-500 font-medium">
          {exhibitor.hall.split("-")[0]}
        </span>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Booth } from "@/lib/types";
import { formatCurrencyUSD, formatCurrencyNPR } from "@/lib/utils";
import {
  X,
  CheckCircle2,
  Clock,
  Ban,
  ArrowRight,
  Zap,
  Maximize,
  MapPin,
  Building,
  Phone,
  Tag,
  Sparkles,
  Ticket,
  Globe,
} from "lucide-react";

interface BoothDetailModalProps {
  booth: Booth | null;
  onClose: () => void;
}

export default function BoothDetailModal({ booth, onClose }: BoothDetailModalProps) {
  if (!booth) return null;

  const isAvailable = booth.status === "Available";
  const isReserved = booth.status === "Reserved";
  const isBooked = booth.status === "Booked";

  const defaultInclusions = [
    "1 Reception Counter",
    "2 Visitor Chairs",
    "3 LED Spotlights",
    "1 Power Socket (5A)",
    "Needle Punch Carpet",
    "Fascia Name Board",
    "Octanorm Aluminium Wall Panels",
    "Daily Stall Cleaning & Wi-Fi",
  ];

  const displayInclusions = booth.inclusions && booth.inclusions.length > 0 ? booth.inclusions : defaultInclusions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#061A2A]/70 backdrop-blur-sm font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#FFFFFF] border border-slate-200 rounded-2xl p-6 sm:p-8 text-[#061A2A] shadow-2xl space-y-5"
      >
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-[#F4F8F7] border border-slate-200 text-[#061A2A] hover:text-[#087EA4] hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Status Header Badge */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 border shadow-sm ${
              isAvailable
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : isReserved
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-rose-50 text-rose-800 border-rose-300"
            }`}
          >
            {isAvailable && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            {isReserved && <Clock className="w-3.5 h-3.5" />}
            {isBooked && <Ban className="w-3.5 h-3.5" />}
            {booth.status}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {booth.hall || "Main Exhibition Arena"}
          </span>
        </div>

        {/* Booth Title & Orientation */}
        <div>
          <h3 className="font-sans font-black text-2xl sm:text-3xl text-[#061A2A] tracking-tight flex items-center gap-2">
            <span>STALL {booth.number}</span>
            {booth.orientation && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                {booth.orientation}
              </span>
            )}
          </h3>
          {booth.description && (
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              {booth.description}
            </p>
          )}
        </div>

        {/* If Booked, display Exhibitor information */}
        {isBooked && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-[#087EA4] uppercase tracking-widest block">
              OFFICIAL OCCUPANT
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#087EA4] shrink-0" />
                <span className="font-sans font-bold text-base text-[#061A2A]">
                  {booth.exhibitorName || "Confirmed International Exhibitor"}
                </span>
                {booth.exhibitorCountry && (
                  <span className="text-xs text-slate-500 font-normal">· {booth.exhibitorCountry}</span>
                )}
              </div>
            </div>
            {booth.exhibitorWebsite && (
              <a
                href={booth.exhibitorWebsite}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#087EA4] hover:underline font-bold"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Visit Company Website</span>
              </a>
            )}
          </div>
        )}

        {/* Booth Specifications Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
              <Maximize className="w-3 h-3 text-[#087EA4]" /> AREA & DIMENSIONS
            </span>
            <div className="font-black text-lg text-[#061A2A] mt-0.5">
              {booth.sizeSqM} m²
            </div>
            <span className="text-[11px] text-slate-600 font-mono">{booth.dimensions}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
              <MapPin className="w-3 h-3 text-[#087EA4]" /> CATEGORY
            </span>
            <div className="font-bold text-sm text-[#061A2A] mt-0.5 truncate">
              {booth.type}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {booth.orientation || "Standard Layout"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
              <Zap className="w-3 h-3 text-emerald-600" /> POWER SUPPLY
            </span>
            <div className="font-bold text-xs text-[#061A2A] mt-0.5">
              {booth.powerIncluded || "5 kW 3-Phase Included"}
            </div>
            <span className="text-[10px] text-slate-500">Included in package</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-semibold">
              INDICATIVE INVESTMENT
            </span>
            <div className="font-black text-lg text-emerald-600 mt-0.5">
              {formatCurrencyUSD(booth.priceUSD)}
            </div>
            <span className="text-[10px] text-slate-600 font-bold">
              {formatCurrencyNPR(booth.priceNPR)}
            </span>
          </div>
        </div>

        {/* Included Amenities & Deliverables */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5 text-pink-500" />
            <span>Included Stall Deliverables & Amenities</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {displayInclusions.map((item) => (
              <span
                key={item}
                className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-[11px] font-medium flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Recommended Industry */}
        {booth.suitableFor && (
          <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-xs space-y-1">
            <span className="font-bold text-sky-900 flex items-center gap-1 text-[10px] uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-sky-600" /> Recommended For:
            </span>
            <p className="text-slate-700 font-medium text-[11px]">{booth.suitableFor}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-200">
          {isAvailable ? (
            <Link
              href={`/book-stall?stalls=${booth.number}`}
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-[#087EA4] hover:bg-[#072B42] text-white text-xs font-bold tracking-wider text-center shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span>PROCEED TO BOOK STALL {booth.number}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : isReserved ? (
            <div className="w-full py-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs text-center font-bold">
              THIS STALL IS PROVISIONALLY RESERVED. CONTACT SECRETARIAT FOR WAITLIST.
            </div>
          ) : (
            <div className="w-full py-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs text-center font-bold">
              THIS STALL IS FULLY OCCUPIED & CONFIRMED.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SPONSORSHIP_DETAILS, SPACE_DETAILS, EXPO_EVENT_META } from "@/data/officialTariffsData";
import {
  Award,
  Check,
  Building,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Zap,
  Info,
  Layers,
  FileDown,
  Ticket,
} from "lucide-react";

export default function OfficialTariffsSection() {
  const [currency, setCurrency] = useState<"NPR" | "USD">("NPR");

  return (
    <section className="space-y-12">
      {/* ── Section Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-[#15803D] uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#15803D]" />
            <span>OFFICIAL 2027 PACKAGES & COMMERCIAL TARIFFS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Sponsorship & Space Details
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
            “{EXPO_EVENT_META.theme}” — {EXPO_EVENT_META.datesEnglish} ({EXPO_EVENT_META.datesNepali}) at {EXPO_EVENT_META.venue}
          </p>
        </div>

        {/* Currency Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setCurrency("NPR")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              currency === "NPR"
                ? "bg-[#218A59] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Nepalese (NRs)
          </button>
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              currency === "USD"
                ? "bg-[#218A59] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            US Dollar ($)
          </button>
        </div>
      </div>

      {/* ── 01: SPONSORSHIP DETAILS TABLE ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#218A59]" />
            <span>Sponsorship Packages & Privileges</span>
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Swipe table horizontally on mobile →
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 font-bold">Sponsorship Tier</th>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">
                  {currency === "NPR" ? "Amount in NRs" : "Amount in US $"}
                </th>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">Bare Space</th>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">Promotional Display Area</th>
                <th className="py-3.5 px-3 font-bold text-center whitespace-nowrap" title="Inauguration Invitation Pass">
                  Inauguration Pass
                </th>
                <th className="py-3.5 px-3 font-bold text-center whitespace-nowrap" title="Gala Dinner Pass">
                  Gala Dinner Pass
                </th>
                <th className="py-3.5 px-3 font-bold text-center whitespace-nowrap" title="Exhibitor Pass">
                  Exhibitor Pass
                </th>
                <th className="py-3.5 px-3 font-bold text-center whitespace-nowrap" title="Normal Pass">
                  Normal Pass
                </th>
                <th className="py-3.5 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {SPONSORSHIP_DETAILS.map((tier, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-emerald-50/40 transition-colors ${
                    tier.featured ? "bg-emerald-50/20 font-semibold" : ""
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {tier.tier}
                      </span>
                      {tier.slots && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                          {tier.slots} Slot
                        </span>
                      )}
                      {tier.featured && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#15803D] text-white font-bold uppercase tracking-wide">
                          FLAGSHIP
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {currency === "NPR" ? (
                      <span className="text-[#15803D] text-sm">NRs {tier.amountNPR}</span>
                    ) : (
                      <span className="text-[#234679] text-sm">${tier.amountUSD}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                    {tier.bareSpace}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                    {tier.promotionalDisplayArea}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                    {tier.inaugurationPass}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-700 bg-emerald-50/30">
                    {tier.galaDinnerPass}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-800">
                    {tier.exhibitorPass}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                    {tier.normalPass}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Link
                      href={`/contact?subject=Sponsorship%20Inquiry%20${encodeURIComponent(
                        tier.tier
                      )}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#218A59] text-white font-mono text-[11px] font-bold transition-all shadow-xs"
                    >
                      <span>Inquire</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 02: SPACE DETAILS (BLOCK A, B, C) ── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#218A59]" />
            <span>Exhibition Space Details & Rates</span>
          </h3>
          <Link
            href="/floor-plan"
            className="text-xs font-mono text-[#218A59] hover:underline font-bold flex items-center gap-1"
          >
            <span>View Hall Floor Plan</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SPACE_DETAILS.map((space, sIdx) => (
            <div
              key={sIdx}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#218A59]/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#218A59] uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200">
                    {space.category}
                  </span>
                  <span className="text-[11px] font-mono font-medium text-slate-500">
                    {space.spaceType}
                  </span>
                </div>

                <h4 className="text-xl font-black text-slate-900 font-display">
                  {space.size}
                </h4>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-mono">Official Rate:</span>
                    <span className="text-lg font-mono font-black text-[#15803D]">
                      {currency === "NPR" ? `NRs ${space.rateNPR}` : `US $${space.rateUSD}`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono text-right">
                    {currency === "NPR" ? `Equiv. US $${space.rateUSD}` : `Equiv. NRs ${space.rateNPR}`}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#218A59] shrink-0" />
                    <span>
                      {space.spaceType === "Octonorm Stall"
                        ? "Octanorm shell scheme with fascia board, 1 table, 2 chairs & 15A power"
                        : "Raw bare space for custom pavilion build"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/book-stall?block=${encodeURIComponent(space.category)}`}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#218A59] text-white font-mono text-xs font-bold text-center block transition-all shadow-xs"
                >
                  Book {space.category} Stall →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 03: OFFICIAL NOTES & CONDITIONS ── */}
      <div className="p-6 sm:p-7 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-900">
          <Info className="w-4 h-4 text-amber-700" />
          <span>IMPORTANT TARIFF NOTES & VAT REGULATIONS</span>
        </div>
        <ul className="space-y-1.5 text-xs sm:text-sm text-amber-900/90 pl-1 list-disc list-inside font-medium">
          {EXPO_EVENT_META.notes.map((note, nIdx) => (
            <li key={nIdx} className="leading-relaxed">
              {note}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

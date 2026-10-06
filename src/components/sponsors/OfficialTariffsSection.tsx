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
  Crown,
  Utensils,
  Clock,
} from "lucide-react";

export default function OfficialTariffsSection() {
  const [currency, setCurrency] = useState<"NPR" | "USD">("NPR");

  return (
    <section className="space-y-12">
      {/* ── Section Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold text-[#007A5E] uppercase tracking-wider font-mono">
              OFFICIAL 2027 PACKAGES &amp; COMMERCIAL TARIFFS
            </span>
            <div className="w-12 h-0.5 bg-[#007A5E]/40 rounded-full" />
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

      {/* ── 00: APEX TITLE SPONSOR FLAGSHIP SPOTLIGHT ── */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400 bg-linear-to-br from-amber-50/90 via-white to-emerald-50/50 p-6 sm:p-8 shadow-md">
        {/* Glow backdrop decoration */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-amber-500 to-amber-600 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-xs">
                  <Crown className="w-3.5 h-3.5 fill-amber-200" />
                  <span>Apex Flagship Partnership · 1 Exclusive Slot Only</span>
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 font-bold border border-amber-300">
                  Highest Sovereign Presence
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display tracking-tight flex items-center gap-2.5">
                <span>TITLE SPONSOR</span>
                <span className="text-slate-400 font-normal text-lg hidden sm:inline">|</span>
                <span className="text-base sm:text-lg font-medium text-emerald-800">
                  Himalayan Green Energy Expo 2027
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 max-w-3xl leading-relaxed">
                The apex commercial and diplomatic co-branding partner of the 5th Edition. Maximum exposure across all main plenary backdrops, delegate credentials, sovereign inauguration ceremonies, and VIP ministerial networking plenaries.
              </p>
            </div>

            {/* Price Box & Quick Action */}
            <div className="p-4 rounded-2xl bg-white border border-amber-300/80 shadow-xs flex flex-col items-start lg:items-end gap-2 shrink-0">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                Official Tariff
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-950">
                {currency === "NPR" ? "NRs 50,00,000/-" : "USD $35,000.00"}
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {currency === "NPR" ? "Equiv. USD $35,000 (+ 13% VAT)" : "Equiv. NRs 50,00,000 (+ 13% VAT)"}
              </span>
              <div className="flex items-center gap-2 pt-1 w-full sm:w-auto flex-wrap">
                <Link
                  href="/book-stall?tier=title-sponsor"
                  className="px-4 py-2 rounded-xl bg-[#218A59] hover:bg-[#186a43] text-white font-mono text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>Reserve Title Sponsorship</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/book-stall?tier=title-sponsor&hold=true"
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-xs font-bold transition-colors flex items-center gap-1"
                  title="Claim 72-hour free hold on Title Sponsorship"
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>72h Free Hold ⏱</span>
                </Link>
                <Link
                  href="/contact?subject=Title%20Sponsorship%20Inquiry%20HGEE2027"
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs font-semibold transition-colors"
                >
                  Direct Inquiry
                </Link>
              </div>
            </div>
          </div>

          {/* Core Privileges Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-2xl bg-white/90 border border-amber-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-900 uppercase block">
                🏢 Bare Space
              </span>
              <div className="font-mono font-extrabold text-base text-slate-900">
                72 m²
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                2 Bare Space Stalls (6M × 6M × 2 · Central A1 &amp; A2)
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/90 border border-amber-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">
                🍽️ Networking Dinner
              </span>
              <div className="font-mono font-extrabold text-base text-emerald-700">
                25 Passes
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                VIP Networking at Royal Tulip Kathmandu
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/90 border border-amber-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-800 uppercase block">
                🏛️ Inauguration Invitation Pass
              </span>
              <div className="font-mono font-extrabold text-base text-slate-900">
                50 VIP Passes
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Sovereign Head of State Inauguration Seating
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/90 border border-amber-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-800 uppercase block">
                🪪 Exhibitor Pass
              </span>
              <div className="font-mono font-extrabold text-base text-slate-900">
                20 Badges
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Official Badges with Executive VIP Lounge Access
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/90 border border-amber-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-800 uppercase block">
                🎟️ Normal Pass
              </span>
              <div className="font-mono font-extrabold text-base text-slate-900">
                500 Passes
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Complimentary Client &amp; Stakeholder Invitations
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/90 border border-amber-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-800 uppercase block">
                📢 Promotional Display Area
              </span>
              <div className="font-mono font-extrabold text-base text-slate-900">
                5 Areas
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                6FT X 4FT X 5 High-Traffic Venue Signage Areas
              </p>
            </div>
          </div>

          {/* High-level Branding Privileges Banner */}
          <div className="p-3.5 rounded-xl bg-amber-100/70 border border-amber-300/70 flex items-start sm:items-center gap-2.5 text-xs text-amber-950 font-medium">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
            <div className="leading-relaxed">
              <strong>Apex Sovereign &amp; Ministerial Co-Branding:</strong> Exclusive title prefix on all event documentation, summit backdrop stage co-branding, delegate kit bags &amp; lanyard cords, national television broadcast media walls, and an <strong>Inaugural Plenary Keynote Address slot</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* ── 01: SPONSORSHIP DETAILS TABLE ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#218A59]" />
            <span>Sponsorship Packages &amp; Privileges Comparison</span>
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Swipe table horizontally on mobile →
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 font-bold">SPONSORSHIP</th>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">
                  {currency === "NPR" ? "AMOUNT IN NRs" : "AMOUNT IN US $"}
                </th>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">BARE SPACE</th>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">PROMOTIONAL DISPLAY AREA</th>
                <th className="py-3.5 px-3 font-bold text-center whitespace-nowrap" title="Inauguration Invitation Pass">
                  INAUGURATION INVITATION PASS
                </th>
                <th className="py-3.5 px-3 font-bold text-center whitespace-nowrap" title="Networking Dinner Pass">
                  NETWORKING DINNER PASS
                </th>
                <th className="py-3.5 px-3 font-bold text-center whitespace-nowrap" title="Exhibitor Pass">
                  EXHIBITOR PASS
                </th>
                <th className="py-3.5 px-3 font-bold text-center whitespace-nowrap" title="Normal Pass">
                  NORMAL PASS
                </th>
                <th className="py-3.5 px-4 font-bold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {SPONSORSHIP_DETAILS.map((tier, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    tier.featured
                      ? "bg-linear-to-r from-amber-50/70 via-amber-50/30 to-emerald-50/40 font-semibold border-l-4 border-l-amber-500"
                      : "hover:bg-emerald-50/40"
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {tier.featured && (
                        <Crown className="w-4 h-4 text-amber-600 fill-amber-400 shrink-0" />
                      )}
                      <span className={`text-sm ${tier.featured ? "font-bold text-amber-950 font-display" : "font-bold text-slate-900"}`}>
                        {tier.tier}
                      </span>
                      {tier.slots && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                          tier.featured
                            ? "bg-amber-100 text-amber-950 border-amber-300"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {tier.slots} Slot
                        </span>
                      )}
                      {tier.featured && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-linear-to-r from-amber-500 to-amber-600 text-white font-bold uppercase tracking-wider shadow-2xs">
                          👑 APEX FLAGSHIP
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {currency === "NPR" ? (
                      <span className={tier.featured ? "text-amber-950 font-mono text-sm font-extrabold" : "text-[#15803D] text-sm"}>
                        NRs {tier.amountNPR}
                      </span>
                    ) : (
                      <span className={tier.featured ? "text-amber-950 font-mono text-sm font-extrabold" : "text-[#234679] text-sm"}>
                        ${tier.amountUSD}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                    {tier.bareSpace}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                    {tier.promotionalDisplayArea}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                    {tier.inaugurationInvitationPass ?? tier.inaugurationPass}
                  </td>
                  <td className={`py-3.5 px-3 text-center font-mono font-bold ${
                    tier.featured ? "text-amber-900 bg-amber-100/50" : "text-emerald-700 bg-emerald-50/30"
                  }`}>
                    {(tier.networkingDinnerPass ?? tier.galaDinnerPass) ? (tier.networkingDinnerPass ?? tier.galaDinnerPass) : "—"}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-800">
                    {tier.exhibitorPass}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                    {tier.normalPass}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/book-stall?tier=${encodeURIComponent(
                          tier.tier.toLowerCase().replace(/\s+/g, "-")
                        )}&hold=true`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-all shadow-2xs"
                        title="Claim 72-Hour Free Hold (Zero Cost)"
                      >
                        <Clock className="w-3 h-3 text-emerald-700" />
                        <span>72h Free Hold</span>
                      </Link>
                      <Link
                        href={`/contact?subject=Sponsorship%20Inquiry%20${encodeURIComponent(
                          tier.tier
                        )}`}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all shadow-xs ${
                          tier.featured
                            ? "bg-amber-600 hover:bg-amber-700 text-white"
                            : "bg-slate-900 hover:bg-[#218A59] text-white"
                        }`}
                      >
                        <span>Inquire</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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

                <h4 className="text-xl font-bold text-slate-900 font-display">
                  {space.size}
                </h4>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-mono">Official Rate:</span>
                    <span className="text-lg font-mono font-bold text-[#15803D]">
                      {currency === "NPR" ? `NRs ${space.rateNPR}` : `US $${space.rateUSD}`}
                    </span>
                  </div>
                  {space.perSqMtr && space.perSqMtr !== "-" && (
                    <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>Per Sq. Mtr:</span>
                      <span className="font-semibold text-slate-700">
                        {currency === "NPR"
                          ? `NRs ${space.perSqMtr.split("|")[0].trim()}`
                          : space.perSqMtr.split("|")[1]?.trim() || space.perSqMtr}
                      </span>
                    </div>
                  )}
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

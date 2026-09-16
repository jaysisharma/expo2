import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import SpeakerGrid from "@/components/speakers/SpeakerGrid";
import Link from "next/link";
import { Building2, ExternalLink } from "lucide-react";
import { eventSolutionTeam } from "@/data/eventSolutionTeam";

export const metadata: Metadata = {
  title: "Leadership & Committee | Himalayan Green Energy Expo 2027",
  description:
    "Official Executive Committee Members of IPPAN and Event Solution Leadership steering the Himalayan Green Energy Expo.",
};

export default function SpeakersPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* =========================================================================
          01: HEADER (GREEN THEME)
         ========================================================================= */}
      <div className="bg-[#04281E] text-white pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-300/70 font-mono mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#34D399]">Leadership & Organizers</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Leadership & Organizers
              </h1>
              <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-2xl font-normal">
                Independent Power Producers&apos; Association, Nepal (IPPAN) Executive Committee and Event Solution Leadership steering the Himalayan Green Energy Expo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="https://ippan.org.np"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/60 border border-emerald-500/30 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>IPPAN Portal ↗</span>
              </a>
              <a
                href="https://eventsolutionnepal.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-slate-950 text-xs font-black flex items-center gap-2 transition-colors shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Event Solution Portal ↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02: COMMITTEE MEMBERS & EVENT SOLUTION GRIDS
         ========================================================================= */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* SECTION 1: IPPAN EXECUTIVE COMMITTEE */}
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-mono font-bold text-[#087EA4] uppercase tracking-wider block mb-1">
                CO-ORGANIZER LEADERSHIP
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#061A2A]">
                IPPAN Executive Committee Members
              </h2>
            </div>
            <SpeakerGrid />
          </div>

          {/* SECTION 2: EVENT SOLUTION TEAM */}
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#19A974] uppercase tracking-wider block mb-1">
                  EXHIBITION MANAGEMENT & OPERATIONS
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#061A2A]">
                  Event Solution Team
                </h2>
              </div>
              <a
                href="https://eventsolutionnepal.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono font-bold text-[#19A974] hover:text-[#061A2A] transition-colors flex items-center gap-1"
              >
                <span>Visit eventsolutionnepal.com.np</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4.5">
              {eventSolutionTeam.map((member) => (
                <div
                  key={member.id}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 hover:border-[#19A974] hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden bg-white">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      unoptimized
                      className={`object-cover object-top ${
                        member.id === "vinesh-chordia" ? "translate-y-[10px]" : "translate-y-[60px]"
                      } scale-105 group-hover:scale-110 transition-transform duration-300 ease-out`}
                    />
                  </div>

                  <div className="pt-2 pb-0.5 px-0.5 text-center space-y-0.5">
                    <h3 className="font-sans font-bold text-xs sm:text-sm text-[#061A2A] group-hover:text-[#19A974] transition-colors leading-snug line-clamp-1">
                      {member.name}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-mono font-medium text-[#19A974] line-clamp-1">
                      {member.position}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { conferenceSessionsData } from "@/data/conference";
import { speakersData } from "@/data/speakers";
import {
  Clock,
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles,
  Users,
  Mic2,
  Building,
  Check,
} from "lucide-react";

export default function ConferencePage() {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [selectedHall, setSelectedHall] = useState<string>("ALL");

  const days = [
    { day: 1, label: "Day 01", date: "Jan 16, 2027", theme: "Policy Plenary & Cross-Border Power" },
    { day: 2, label: "Day 02", date: "Jan 17, 2027", theme: "Turbine Tech, 400kV Grids & Tunneling" },
    { day: 3, label: "Day 03", date: "Jan 18, 2027", theme: "Project Financing, ESG & Innovation" },
  ];

  const filteredSessions = conferenceSessionsData.filter((s) => {
    const matchesDay = s.day === activeDay;
    const matchesHall =
      selectedHall === "ALL" ||
      s.hall.toLowerCase().includes(selectedHall.toLowerCase());
    return matchesDay && matchesHall;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* =========================================================================
          01: CLEAN HEADER BANNER (GREEN THEME)
         ========================================================================= */}
      <div className="bg-[#04281E] text-white pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-300/70 font-mono mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#34D399]">Conference</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Conference & Summit
              </h1>
              <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-xl">
                Bhrikutimandap Exhibition Complex, Kathmandu · 16–18 January 2027
              </p>

              {/* Quick Metrics */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-100/80">
                <span className="px-2.5 py-1 rounded bg-emerald-900/60 border border-emerald-500/30">
                  3 Days
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-900/60 border border-emerald-500/30">
                  3 Stages
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-900/60 border border-emerald-500/30">
                  40+ Keynotes
                </span>
                <span className="px-2.5 py-1 rounded bg-[#10B981]/25 text-[#34D399] border border-[#10B981]/50 font-bold">
                  1,200+ Delegates
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-slate-950 text-xs font-black flex items-center gap-2 transition-colors shadow-md"
              >
                <span>Register Delegate Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02: TIMETABLE & PROGRAM SCHEDULE (CRISP EVENT MATRIX)
         ========================================================================= */}
      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Day & Stage Filter Bar */}
          <div className="space-y-4">
            {/* Day Selector */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-xl">
                {days.map((d) => (
                  <button
                    key={d.day}
                    onClick={() => setActiveDay(d.day)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeDay === d.day
                        ? "bg-[#087EA4] text-white shadow-xs"
                        : "text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    <span>{d.label}</span>
                    <span className="text-[10px] font-normal opacity-85 ml-1.5">
                      ({d.date.split(",")[0]})
                    </span>
                  </button>
                ))}
              </div>

              {/* Stage Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium hidden sm:inline">Stage:</span>
                <button
                  onClick={() => setSelectedHall("ALL")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    selectedHall === "ALL"
                      ? "bg-slate-900 text-white font-bold"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  All Stages
                </button>
                <button
                  onClick={() => setSelectedHall("Main Plenary")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    selectedHall === "Main Plenary"
                      ? "bg-slate-900 text-white font-bold"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Himalayan Plenary
                </button>
                <button
                  onClick={() => setSelectedHall("Annapurna")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    selectedHall === "Annapurna"
                      ? "bg-slate-900 text-white font-bold"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Technical Hall
                </button>
              </div>
            </div>

            {/* Active Day Theme Indicator */}
            <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#19A974]" />
              <span className="font-bold text-slate-900">
                {days.find((d) => d.day === activeDay)?.theme}
              </span>
            </div>
          </div>

          {/* Schedule Sessions Table (Clean Rows, No Blog Clutter) */}
          <div className="space-y-3">
            {filteredSessions.map((session) => {
              const sessionSpeakers = speakersData.filter((sp) =>
                session.speakerIds.includes(sp.id)
              );

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-[#087EA4]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  {/* Left: Time & Stage */}
                  <div className="md:w-52 shrink-0 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-900">
                      <Clock className="w-4 h-4 text-[#087EA4]" />
                      <span>
                        {session.startTime} – {session.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{session.hall.split("(")[0]}</span>
                    </div>

                    <span className="inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-sky-50 text-[#087EA4] border border-sky-100">
                      {session.sessionType}
                    </span>
                  </div>

                  {/* Center: Session Title & Speakers Chips */}
                  <div className="flex-grow space-y-2.5">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {session.title}
                    </h3>

                    {/* Compact Speakers Lineup */}
                    {sessionSpeakers.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {sessionSpeakers.map((sp) => (
                          <div
                            key={sp.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
                          >
                            <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0">
                              <Image
                                src={sp.photo}
                                alt={sp.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span>{sp.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Quick Action Link */}
                  <div className="shrink-0 self-start md:self-center">
                    <Link
                      href={`/conference/${session.slug}`}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#087EA4] text-slate-800 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>Agenda</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =========================================================================
              03: KEYNOTE FACULTY & SPEAKERS GRID
             ========================================================================= */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Featured Speakers & Dignitaries
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Key policymakers, utility heads, and international technology leaders.
                </p>
              </div>

              <Link
                href="/speakers"
                className="text-xs font-semibold text-[#087EA4] hover:underline flex items-center gap-1"
              >
                <span>All 40+ Speakers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {speakersData.slice(0, 4).map((speaker) => (
                <Link
                  key={speaker.id}
                  href={`/speakers/${speaker.slug}`}
                  className="group bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-[#087EA4] transition-all text-center flex flex-col items-center"
                >
                  <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 bg-slate-100 border-2 border-slate-100 group-hover:border-[#087EA4] transition-colors">
                    <Image
                      src={speaker.photo}
                      alt={speaker.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#087EA4] transition-colors line-clamp-1">
                    {speaker.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {speaker.title}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono line-clamp-1 mt-0.5">
                    {speaker.organization}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* =========================================================================
              04: DELEGATE PASS REGISTRATION BANNER
             ========================================================================= */}
          <div className="bg-[#061A2A] text-white p-8 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">
                Register as a Conference Delegate
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Full 3-day access to all keynote plenaries, technical masterclasses, networking luncheons, and conference proceedings.
              </p>
            </div>

            <Link
              href="/register"
              className="px-6 py-3 rounded-lg bg-[#19A974] hover:bg-[#158f62] text-white text-xs font-semibold tracking-wide transition-colors shrink-0 flex items-center gap-2"
            >
              <span>REGISTER DELEGATE PASS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

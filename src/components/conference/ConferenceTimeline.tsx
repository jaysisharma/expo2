"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { conferenceSessionsData } from "@/data/conference";
import { speakersData } from "@/data/speakers";
import { Clock, MapPin, Calendar, Check, ArrowRight, Bookmark, BookmarkCheck } from "lucide-react";

export default function ConferenceTimeline({ limit }: { limit?: number }) {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedTrack, setSelectedTrack] = useState<string>("ALL");
  const [savedSessions, setSavedSessions] = useState<string[]>([]);

  const tracks = [
    "ALL",
    "Keynote Plenary",
    "Cross-Border Trade",
    "Engineering & Turbines",
    "Project Finance & ESG",
    "Tunneling & Civil",
    "Green Hydrogen & Storage",
  ];

  const daysInfo = [
    { day: 1, label: "Day 1", date: "April 16, 2026", theme: "Inaugural Plenary & Regional Trade" },
    { day: 2, label: "Day 2", date: "April 17, 2026", theme: "Turbine Tech, 400kV Grids & TBMs" },
    { day: 3, label: "Day 3", date: "April 18, 2026", theme: "Project Finance, ESG & CleanTech" },
  ];

  const filteredSessions = conferenceSessionsData.filter((s) => {
    const matchesDay = s.day === selectedDay;
    const matchesTrack = selectedTrack === "ALL" || s.track === selectedTrack;
    return matchesDay && matchesTrack;
  });

  const displayedSessions = limit
    ? filteredSessions.slice(0, limit)
    : filteredSessions;

  const toggleSave = (id: string) => {
    setSavedSessions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full font-sans">
      {/* Day Tabs Selection Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl">
          {daysInfo.map((d) => (
            <button
              key={d.day}
              onClick={() => setSelectedDay(d.day)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left flex flex-col ${
                selectedDay === d.day
                  ? "bg-[#087EA4] text-white shadow-xs font-bold"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span>{d.label} · {d.date}</span>
              <span className="text-[10px] opacity-85 font-normal line-clamp-1">{d.theme}</span>
            </button>
          ))}
        </div>

        {/* Track Filter Select or Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {tracks.map((trk) => (
            <button
              key={trk}
              onClick={() => setSelectedTrack(trk)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedTrack === trk
                  ? "bg-[#061A2A] text-white shadow-xs font-bold"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {trk}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Sessions List */}
      <div className="space-y-4 sm:space-y-6">
        {displayedSessions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-sm text-slate-500">
              No sessions found for this filter combination.
            </p>
            <button
              onClick={() => {
                setSelectedTrack("ALL");
              }}
              className="mt-3 text-xs font-semibold text-[#087EA4] hover:underline"
            >
              Reset Track Filter
            </button>
          </div>
        ) : (
          displayedSessions.map((session) => {
            const isSaved = savedSessions.includes(session.id);
            const sessionSpeakers = speakersData.filter((sp) =>
              session.speakerIds.includes(sp.id)
            );

            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-[#087EA4]/40 hover:shadow-sm transition-all p-6 sm:p-8"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left Column: Time & Hall Details */}
                  <div className="lg:w-60 shrink-0 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-900">
                      <Clock className="w-4 h-4 text-[#087EA4]" />
                      <span>
                        {session.startTime} – {session.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#087EA4] shrink-0" />
                      <span>{session.hall.split("(")[0]}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-sky-50 text-[#087EA4] border border-sky-100">
                        {session.sessionType}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {session.track}
                      </span>
                    </div>
                  </div>

                  {/* Center Column: Title, Description & Takeaways */}
                  <div className="flex-grow space-y-3">
                    <Link
                      href={`/conference/${session.slug}`}
                      className="group/title inline-block"
                    >
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover/title:text-[#087EA4] transition-colors leading-snug">
                        {session.title}
                      </h3>
                    </Link>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {session.description}
                    </p>

                    {/* Key Takeaways */}
                    {session.keyTakeaways && session.keyTakeaways.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-mono">
                          Key Focus Areas:
                        </span>
                        <div className="space-y-1">
                          {session.keyTakeaways.map((takeaway, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 text-xs text-slate-600"
                            >
                              <span className="text-[#19A974] font-bold shrink-0 mt-0.5">✦</span>
                              <span>{takeaway}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Speakers Avatars */}
                    {sessionSpeakers.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
                        <span className="text-xs font-semibold text-slate-700">
                          Featured Speakers:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {sessionSpeakers.map((sp) => (
                            <Link
                              key={sp.id}
                              href={`/speakers/${sp.slug}`}
                              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-800 transition-colors"
                            >
                              <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0">
                                <Image
                                  src={sp.photo}
                                  alt={sp.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <span className="font-medium">{sp.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="shrink-0 flex lg:flex-col items-center gap-2 self-start pt-1">
                    <Link
                      href={`/conference/${session.slug}`}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#087EA4] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => toggleSave(session.id)}
                      className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                        isSaved
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                      title={isSaved ? "Saved to agenda" : "Save to my agenda"}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { conferenceSessionsData } from "@/data/conference";
import { speakersData } from "@/data/speakers";
import { ArrowLeft, ArrowRight, Clock, MapPin, Calendar, Check, Users } from "lucide-react";

export async function generateStaticParams() {
  return conferenceSessionsData.map((s) => ({
    slug: s.slug,
  }));
}

export default async function SingleSessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = conferenceSessionsData.find((s) => s.slug === slug);

  if (!session) {
    notFound();
  }

  const sessionSpeakers = speakersData.filter((sp) =>
    session.speakerIds.includes(sp.id)
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* =========================================================================
          01: SIMPLE HEADER WITH BACKGROUND COLOR (GREEN THEME)
         ========================================================================= */}
      <div className="bg-[#04281E] text-white pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-300/70 font-mono mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/conference" className="hover:text-white transition-colors">
              Conference
            </Link>
            <span>/</span>
            <span className="text-[#34D399] truncate max-w-xs">{session.track}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#10B981]/25 text-[#34D399] border border-[#10B981]/50">
              Day 0{session.day} · {session.date}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-900/60 text-white border border-emerald-500/30">
              {session.track}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-800/40 text-emerald-200 border border-emerald-500/30">
              {session.sessionType}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {session.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-mono">
              <Clock className="w-4 h-4 text-[#19BFE8]" />
              <span>{session.startTime} – {session.endTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#19A974]" />
              <span>{session.hall}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02: MAIN SESSION DETAILS
         ========================================================================= */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Description & Outcomes */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h2 className="text-lg font-bold text-slate-900">
                  Session Overview
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {session.description}
                </p>
              </div>

              {session.keyTakeaways && session.keyTakeaways.length > 0 && (
                <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Key Outcomes & Focus Areas
                  </h3>
                  <div className="space-y-2.5">
                    {session.keyTakeaways.map((takeaway, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                        <Check className="w-4 h-4 text-[#19A974] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Speakers & Registration */}
            <div className="lg:col-span-5 space-y-6">
              {sessionSpeakers.length > 0 && (
                <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Session Panelists & Speakers
                  </h3>

                  <div className="space-y-3">
                    {sessionSpeakers.map((speaker) => (
                      <Link
                        key={speaker.id}
                        href={`/speakers/${speaker.slug}`}
                        className="group p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-3.5"
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-200">
                          <Image
                            src={speaker.photo}
                            alt={speaker.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#087EA4] transition-colors line-clamp-1">
                            {speaker.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {speaker.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono line-clamp-1">
                            {speaker.organization}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Box */}
              <div className="p-6 rounded-2xl bg-[#061A2A] text-white space-y-3">
                <h4 className="font-bold text-sm text-white">
                  Join This Session
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Access this plenary and all parallel workshops with an official Delegate Pass.
                </p>
                <div className="pt-2">
                  <Link
                    href="/register"
                    className="w-full py-2.5 rounded-xl bg-[#19A974] hover:bg-[#158f62] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <span>Register Delegate Pass</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

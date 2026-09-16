import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { speakersData } from "@/data/speakers";
import { conferenceSessionsData } from "@/data/conference";
import { ArrowLeft, ArrowRight, Building, Globe, Sparkles, Clock, MapPin } from "lucide-react";

export async function generateStaticParams() {
  return speakersData.map((sp) => ({
    slug: sp.slug,
  }));
}

export default async function SingleSpeakerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const speaker = speakersData.find((s) => s.slug === slug);

  if (!speaker) {
    notFound();
  }

  const speakingSessions = conferenceSessionsData.filter((sess) =>
    speaker.sessionIds.includes(sess.id)
  );

  return (
    <div className="pt-10 sm:pt-14 pb-24 bg-hydro-light text-slate-900 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Link
            href="/speakers"
            className="inline-flex items-center gap-2 font-technical text-xs text-slate-600 hover:text-hydro-primary transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO ALL SPEAKERS</span>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-md mb-12 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200 shadow-md">
            <Image
              src={speaker.photo}
              alt={speaker.name}
              fill
              className="object-cover object-top"
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-technical text-xs px-3 py-1 rounded bg-hydro-water text-hydro-deep font-bold border border-hydro-sky">
                {speaker.category}
              </span>
              {speaker.featured && (
                <span className="flex items-center gap-1 font-technical text-xs px-3 py-1 rounded bg-hydro-wash text-slate-800 border border-slate-200 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-hydro-primary" /> KEYNOTE FACULTY
                </span>
              )}
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
              {speaker.name}
            </h1>

            <div className="text-sm sm:text-base text-slate-700 font-normal">
              {speaker.title}
            </div>

            <div className="flex items-center gap-2 text-xs font-technical text-hydro-primary font-bold">
              <Building className="w-4 h-4" />
              <span>{speaker.organization}</span>
            </div>
          </div>
        </div>

        {/* Bio & Assigned Conference Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Biography (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-2xl text-slate-900">
                Executive Biography
              </h3>
              <p className="text-sm text-slate-600 font-normal leading-relaxed">
                {speaker.bio}
              </p>
            </div>
          </div>

          {/* Sessions Addressed (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-xl text-slate-900">
                Conference Sessions
              </h3>

              <div className="space-y-3">
                {speakingSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/conference/${session.slug}`}
                    className="group p-5 rounded-2xl bg-hydro-wash border border-slate-200 hover:border-hydro-primary transition-all block space-y-2 shadow-sm"
                  >
                    <span className="text-[10px] font-technical text-hydro-primary uppercase font-bold block">
                      DAY 0{session.day} · {session.startTime}
                    </span>
                    <h4 className="font-display font-bold text-base text-slate-900 group-hover:text-hydro-primary transition-colors leading-snug">
                      {session.title}
                    </h4>
                    <span className="text-xs text-slate-500 block">
                      {session.hall}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

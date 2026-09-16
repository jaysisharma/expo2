import React from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export const metadata = {
  title: "Visit Green Energy Expo Nepal 2026 | Visitor & Delegate Guide",
  description:
    "Everything you need to plan your visit to Himalayan Green Energy Expo 2026 in Kathmandu—free trade passes, conference delegate privileges, visa on arrival, and partner hotel discounts.",
};

export default function VisitPage() {
  return (
    <div className="pt-10 sm:pt-14 pb-20 bg-hydro-light text-slate-900 min-h-screen">
      {/* Header */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-12 border-b border-slate-200 overflow-hidden bg-white">
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hydro-wash border border-slate-200 text-xs font-technical text-hydro-primary uppercase mb-4 font-bold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-hydro-primary" />
            DELEGATE & VISITOR PORTAL
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-slate-900 tracking-tight">
            YOUR VISIT. <br />
            <span className="text-hydro-primary">SIMPLIFIED.</span>
          </h1>
          <p className="mt-6 text-base sm:text-xl text-slate-600 font-normal max-w-3xl leading-relaxed">
            Join 10,000+ engineers, energy developers, institutional investors, and technology leaders in Kathmandu. Register in advance for complimentary QR access.
          </p>
        </div>
      </section>

      {/* 5-Step Visitor Journey */}
      <section className="py-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-technical text-xs text-hydro-primary tracking-widest uppercase font-bold">
            VISITOR JOURNEY
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mt-1">
            5 Simple Steps to Attend
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            {
              num: "01",
              title: "ONLINE REGISTRATION",
              desc: "Register in under 2 minutes to generate your official delegate QR badge.",
            },
            {
              num: "02",
              title: "VISA & TRAVEL",
              desc: "Receive official IPPAN visa invitation letters for hassle-free Visa-on-Arrival at KTM.",
            },
            {
              num: "03",
              title: "HOTEL DEALS",
              desc: "Book official 5-star partner hotels in Kathmandu at negotiated corporate rates.",
            },
            {
              num: "04",
              title: "EXPLORE EXHIBITION",
              desc: "Access 100+ global booths across heavy turbines, civil TBMs, and smart grid automation.",
            },
            {
              num: "05",
              title: "ATTEND SESSIONS",
              desc: "Participate in 20+ keynote tracks, high-level investment plenaries, and B2B rooms.",
            },
          ].map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="font-display font-black text-3xl text-hydro-primary block mb-3">
                  {step.num}
                </span>
                <h3 className="font-display font-bold text-sm text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 font-normal leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Visitor Registration Box */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-md text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-hydro-wash border border-slate-200 text-hydro-primary flex items-center justify-center mx-auto shadow-sm">
            <UserPlus className="w-6 h-6" />
          </div>

          <h3 className="font-display font-black text-3xl sm:text-4xl text-slate-900">
            Register for Free Trade Pass Now
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-xl mx-auto">
            Free online pre-registration grants instant entrance to exhibition halls, live technology demo arenas, and the official event directory.
          </p>

          <div>
            <Link
              href="/register"
              className="px-8 py-4 rounded-xl bg-hydro-primary hover:bg-hydro-deep text-white font-technical text-xs font-bold tracking-widest shadow-sm inline-flex items-center gap-2 transition-colors"
            >
              <span>CLAIM YOUR DELEGATE BADGE →</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

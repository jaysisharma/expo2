import React from "react";
import ExhibitorDirectory from "@/components/exhibitors/ExhibitorDirectory";
import Link from "next/link";
import { ArrowRight, MapPin, Store } from "lucide-react";

export default function ExhibitorsPage() {
  return (
    <div className="pt-10 sm:pt-14 pb-24 bg-hydro-light text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-technical text-hydro-primary uppercase mb-3 shadow-sm font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-hydro-primary" />
              GLOBAL DIRECTORY
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight">
              EXHIBITOR <span className="text-hydro-primary">DIRECTORY.</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 font-normal max-w-xl">
              Discover 100+ leading clean energy technology providers, turbine manufacturers, solar OEMs, EPC contractors, and institutional financiers participating at Himalayan Green Energy Expo 2026.
            </p>
          </div>

          <Link
            href="/floor-plan"
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-hydro-deep font-technical text-xs font-bold tracking-wider border border-slate-300 shadow-sm transition-all flex items-center gap-2"
          >
            <span>LOCATE ON FLOOR PLAN</span>
            <MapPin className="w-4 h-4 text-hydro-primary" />
          </Link>
        </div>

        {/* Directory */}
        <ExhibitorDirectory />
      </div>
    </div>
  );
}

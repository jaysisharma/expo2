"use client";

import React from "react";
import { BarChart3, TrendingUp } from "lucide-react";

interface OccupancyData {
  hallName: string;
  total: number;
  booked: number;
  reserved: number;
  available: number;
  color: string;
}

export function HallOccupancyChart({ data }: { data: OccupancyData[] }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 space-y-5">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-[#218A59] border border-emerald-200">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wider">
            Stall Occupancy by Zone
          </h4>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase">
          Live Status
        </span>
      </div>

      <div className="space-y-4">
        {data.map((hall) => {
          const bookedPct = Math.round((hall.booked / hall.total) * 100) || 0;
          const reservedPct = Math.round((hall.reserved / hall.total) * 100) || 0;
          const availablePct = 100 - bookedPct - reservedPct;

          return (
            <div key={hall.hallName} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-800 truncate font-semibold font-sans">{hall.hallName}</span>
                <span className="font-mono text-slate-500 text-[11px]">
                  <strong className="text-slate-900 font-bold">{hall.booked + hall.reserved}</strong> / {hall.total} ({bookedPct + reservedPct}%)
                </span>
              </div>

              {/* Progress Bar with Green & Blue brand gradients */}
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  style={{ width: `${bookedPct}%` }}
                  className="h-full bg-gradient-to-r from-[#5B9F35] to-[#218A59]"
                  title={`Booked: ${hall.booked}`}
                />
                <div
                  style={{ width: `${reservedPct}%` }}
                  className="h-full bg-gradient-to-r from-[#234679] to-[#4A7EC7]"
                  title={`Reserved: ${hall.reserved}`}
                />
                <div
                  style={{ width: `${availablePct}%` }}
                  className="h-full bg-transparent"
                  title={`Available: ${hall.available}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend with public face colors */}
      <div className="flex items-center gap-5 pt-1 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#218A59]" />
          <span className="font-semibold text-slate-700">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#234679]" />
          <span className="font-semibold text-slate-700">Reserved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span className="font-semibold text-slate-700">Available</span>
        </div>
      </div>
    </div>
  );
}

export function RegistrationTrendChart({
  days = ["Aug 26", "Aug 27", "Aug 28", "Aug 29", "Aug 30", "Aug 31", "Sep 01"],
  counts = [14, 28, 45, 62, 89, 110, 142],
}: {
  days?: string[];
  counts?: number[];
}) {
  const max = Math.max(...counts, 150);

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 space-y-5">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-[#234679] border border-blue-200">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wider">
            Delegate Registrations
          </h4>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase">
          +32% this week
        </span>
      </div>

      <div className="h-44 flex items-end justify-between gap-2.5 pt-2 px-1">
        {days.map((day, idx) => {
          const count = counts[idx] || 0;
          const heightPct = Math.round((count / max) * 100);

          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[10px] font-mono font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {count}
              </span>
              <div className="w-full max-w-[32px] h-32 bg-slate-100 rounded-t-xl overflow-hidden flex items-end">
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full bg-gradient-to-t from-[#234679] to-[#6FA0E8] group-hover:from-[#5B9F35] group-hover:to-[#218A59] transition-all rounded-t-xl shadow-xs"
                />
              </div>
              <span className="text-[10px] font-mono font-medium text-slate-500">{day.split(" ")[1]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

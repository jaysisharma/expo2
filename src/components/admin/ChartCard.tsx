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
    <div className="p-6 rounded-2xl bg-white dark:bg-[#0A1220]/90 border border-black/[0.08] dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 space-y-5 backdrop-blur-md">
      <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.05] dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#218A59]/10 dark:bg-[#25C176]/15 text-[#218A59] dark:text-[#25C176] border border-[#218A59]/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h4 className="font-display font-bold text-xs sm:text-sm text-gray-900 dark:text-white uppercase tracking-wider">
            Stall Occupancy by Zone
          </h4>
        </div>
        <span className="text-[10px] font-mono font-bold text-[#218A59] dark:text-[#25C176] bg-[#218A59]/10 border border-[#218A59]/20 px-2.5 py-0.5 rounded-full uppercase">
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
                <span className="text-gray-800 dark:text-slate-200 truncate font-semibold font-sans">{hall.hallName}</span>
                <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                  <strong className="text-gray-900 dark:text-white font-bold">{hall.booked + hall.reserved}</strong> / {hall.total} ({bookedPct + reservedPct}%)
                </span>
              </div>

              {/* Progress Bar with Green & Blue brand gradients */}
              <div className="w-full h-2.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden flex">
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
      <div className="flex items-center gap-5 pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#218A59]" />
          <span className="font-semibold text-gray-700 dark:text-slate-300">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#234679] dark:bg-[#4A7EC7]" />
          <span className="font-semibold text-gray-700 dark:text-slate-300">Reserved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-black/15 dark:bg-white/20" />
          <span className="font-semibold text-gray-700 dark:text-slate-300">Available</span>
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
    <div className="p-6 rounded-2xl bg-white dark:bg-[#0A1220]/90 border border-black/[0.08] dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 space-y-5 backdrop-blur-md">
      <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.05] dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#234679]/10 dark:bg-[#4A7EC7]/15 text-[#234679] dark:text-[#6FA0E8] border border-[#234679]/20">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h4 className="font-display font-bold text-xs sm:text-sm text-gray-900 dark:text-white uppercase tracking-wider">
            Delegate Registrations
          </h4>
        </div>
        <span className="text-[10px] font-mono font-bold text-[#218A59] dark:text-[#25C176] bg-[#218A59]/10 border border-[#218A59]/20 px-2.5 py-0.5 rounded-full uppercase">
          +32% this week
        </span>
      </div>

      <div className="h-44 flex items-end justify-between gap-2.5 pt-2 px-1">
        {days.map((day, idx) => {
          const count = counts[idx] || 0;
          const heightPct = Math.round((count / max) * 100);

          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[10px] font-mono font-bold text-[#218A59] dark:text-[#25C176] opacity-0 group-hover:opacity-100 transition-opacity">
                {count}
              </span>
              <div className="w-full max-w-[32px] h-32 bg-black/[0.03] dark:bg-white/[0.05] rounded-t-xl overflow-hidden flex items-end">
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full bg-gradient-to-t from-[#234679] to-[#6FA0E8] group-hover:from-[#5B9F35] group-hover:to-[#218A59] transition-all rounded-t-xl shadow-sm"
                />
              </div>
              <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400">{day.split(" ")[1]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

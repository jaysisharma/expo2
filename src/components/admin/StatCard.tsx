import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  color?: "emerald" | "sky" | "amber" | "purple" | "rose" | "teal";
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  changeType = "positive",
}: StatCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#218A59]/50 hover:shadow-lg transition-all duration-300 shadow-xs select-none flex flex-col justify-between space-y-3 group">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold text-[#234679] tracking-wider uppercase block">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight group-hover:text-[#218A59] transition-colors">
            {value}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-50 text-[#218A59] border border-emerald-200 group-hover:scale-105 transition-transform shadow-xs">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || change) && (
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
          {subtitle && <span className="text-slate-500 font-sans truncate">{subtitle}</span>}
          {change && (
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded-full text-[10px] ${
                changeType === "positive"
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                  : changeType === "negative"
                  ? "text-rose-700 bg-rose-50 border border-rose-200"
                  : "text-slate-700 bg-slate-100 border border-slate-200"
              }`}
            >
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

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
    <div className="p-5 rounded-2xl bg-white dark:bg-[#0A1220]/90 border border-black/[0.08] dark:border-white/10 hover:border-[#218A59]/40 dark:hover:border-[#25C176]/40 hover:shadow-lg transition-all duration-300 shadow-sm backdrop-blur-md select-none flex flex-col justify-between space-y-3 group">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold text-[#234679] dark:text-[#6FA0E8] tracking-wider uppercase block">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight group-hover:text-[#218A59] dark:group-hover:text-[#25C176] transition-colors">
            {value}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#218A59]/10 dark:bg-[#25C176]/15 text-[#218A59] dark:text-[#25C176] border border-[#218A59]/20 group-hover:scale-105 transition-transform shadow-xs">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || change) && (
        <div className="flex items-center justify-between pt-2.5 border-t border-black/[0.05] dark:border-white/[0.08] text-xs">
          {subtitle && <span className="text-slate-500 dark:text-slate-400 font-sans truncate">{subtitle}</span>}
          {change && (
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded-full text-[10px] ${
                changeType === "positive"
                  ? "text-[#218A59] dark:text-[#25C176] bg-[#218A59]/10 border border-[#218A59]/20"
                  : changeType === "negative"
                  ? "text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20"
                  : "text-slate-600 dark:text-slate-300 bg-black/5 dark:bg-white/10"
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

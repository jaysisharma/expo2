import React from "react";
import { MousePointer, Sliders } from "lucide-react";

interface SidebarTabSwitcherProps {
  currentTab: "tools" | "inspector";
  onTabChange: (tab: "tools" | "inspector") => void;
  selectedCount: number;
}

export function SidebarTabSwitcher({
  currentTab,
  onTabChange,
  selectedCount,
}: SidebarTabSwitcherProps) {
  return (
    <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#090D14] p-1 gap-1 shrink-0">
      <button
        onClick={() => onTabChange("tools")}
        className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
          currentTab === "tools"
            ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs border border-slate-200/80 dark:border-slate-700"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
      >
        <MousePointer className={`w-3.5 h-3.5 ${currentTab === "tools" ? "text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-400"}`} />
        <span>Drawing Tools</span>
      </button>
      <button
        onClick={() => onTabChange("inspector")}
        className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
          currentTab === "inspector"
            ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs border border-slate-200/80 dark:border-slate-700"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
      >
        <Sliders className={`w-3.5 h-3.5 ${currentTab === "inspector" ? "text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-400"}`} />
        <span>
          Inspector {selectedCount > 0 && `(${selectedCount})`}
        </span>
      </button>
    </div>
  );
}

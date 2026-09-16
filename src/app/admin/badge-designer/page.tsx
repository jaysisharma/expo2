"use client";

import React, { useState } from "react";
import AdminBadgeDesigner from "@/components/booking/AdminBadgeDesigner";
import { ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

export default function AdminBadgeDesignerPage() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 text-xs font-medium shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-mono text-[10px] font-bold uppercase">
              Badge Studio
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              ID Card & QR Code Placement Designer
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Drag and customize official delegate, trade visitor, and exhibitor identification card templates with 1px precision nudge.
          </p>
        </div>
      </div>

      {/* Embedded Designer */}
      <div className="w-full">
        <AdminBadgeDesigner
          onSaved={() => {
            notify("Badge template layout successfully saved to server database");
          }}
        />
      </div>
    </div>
  );
}

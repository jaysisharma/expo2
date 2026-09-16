"use client";

import React, { useState } from "react";
import AdminBadgeDesigner from "@/components/booking/AdminBadgeDesigner";
import { CheckCircle2 } from "lucide-react";

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
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-mono text-[10px] font-bold uppercase">
              Badge Designer
            </span>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
              Attendee & Exhibitor Badge Designer
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Customize visitor and exhibitor badges and preview QR codes.
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

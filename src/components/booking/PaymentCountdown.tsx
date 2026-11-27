"use client";

import React, { useEffect, useState } from "react";
import { Timer } from "lucide-react";

type Props = {
  /** ISO time the payment window ends */
  dueBy: string;
  onExpire?: () => void;
};

function remainingMs(dueBy: string) {
  return Math.max(0, Date.parse(dueBy) - Date.now());
}

/** mm:ss countdown for the "Book" payment window. */
export default function PaymentCountdown({ dueBy, onExpire }: Props) {
  const [left, setLeft] = useState(() => remainingMs(dueBy));

  useEffect(() => {
    setLeft(remainingMs(dueBy));
    const id = window.setInterval(() => {
      const ms = remainingMs(dueBy);
      setLeft(ms);
      if (ms <= 0) {
        window.clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => window.clearInterval(id);
    // onExpire is intentionally not a dependency: restarting the interval on every render isn't wanted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueBy]);

  const totalSeconds = Math.ceil(left / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  const urgent = totalSeconds <= 120;

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`${mm} minutes ${ss} seconds left to complete payment`}
      className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl border font-mono ${
        urgent ? "bg-rose-50 border-rose-300 text-rose-800" : "bg-amber-50 border-amber-300 text-amber-900"
      }`}
    >
      <Timer className={`w-5 h-5 shrink-0 ${urgent ? "text-rose-600" : "text-amber-700"}`} />
      <div className="text-left leading-tight">
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Stall held for</div>
        <div className="text-2xl font-bold tabular-nums">
          {mm}:{ss}
        </div>
      </div>
    </div>
  );
}

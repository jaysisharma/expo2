"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { getConsent, setConsent, OPEN_COOKIE_SETTINGS_EVENT } from "@/lib/consent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getConsent()) setVisible(true);
    const reopen = () => setVisible(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  if (!visible) return null;

  const choose = (value: "accepted" | "declined") => {
    setConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:left-4 sm:bottom-4 sm:max-w-md z-[90] rounded-2xl bg-[#04281E] text-white border border-emerald-500/30 shadow-2xl p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <Cookie className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed">
            We use essential cookies to run this site. With your permission we also use an analytics cookie to
            understand which channels (e.g. Facebook, Google) bring visitors to the Expo. See our{" "}
            <Link href="/cookie-policy" className="underline text-[#34D399] hover:text-white">
              Cookie Policy
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="underline text-[#34D399] hover:text-white">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => choose("accepted")}
              className="px-4 py-2 rounded-lg bg-[#007A5E] hover:bg-[#005C42] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Accept analytics
            </button>
            <button
              onClick={() => choose("declined")}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Essential only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { openCookieSettings } from "@/lib/consent";

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="px-4 py-2 rounded-lg bg-[#007A5E] hover:bg-[#005C42] text-white text-xs font-bold transition-colors cursor-pointer"
    >
      Change cookie settings
    </button>
  );
}

"use client";

import { useEffect } from "react";
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE_DAYS,
  decodeAttribution,
  detectAttribution,
  encodeAttribution,
  type Attribution,
} from "@/lib/attribution";
import { CONSENT_CHANGE_EVENT, getConsent, type ConsentValue } from "@/lib/consent";

const SESSION_KEY = "hhe_visit_tracked";

// Per page-load fallback for visitors who haven't allowed storage
let trackedThisLoad = false;

function readCookie(name: string) {
  return document.cookie
    .split(/;\s*/)
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function saveAttributionCookie(detected: Omit<Attribution, "firstSeenAt">) {
  const existing = decodeAttribution(readCookie(ATTRIBUTION_COOKIE));
  // Keep the last non-direct source: a later direct visit shouldn't erase "came from Facebook".
  if (existing && detected.source === "direct") return;
  const attribution: Attribution = { ...detected, firstSeenAt: new Date().toISOString() };
  document.cookie = `${ATTRIBUTION_COOKIE}=${encodeAttribution(attribution)}; path=/; max-age=${
    ATTRIBUTION_MAX_AGE_DAYS * 24 * 60 * 60
  }; SameSite=Lax`;
}

function clearAttributionCookie() {
  document.cookie = `${ATTRIBUTION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Detects which social network / link brought the visitor in.
 * - Always logs one anonymous visit (source, landing page, device; no cookie or ID).
 * - Only with analytics consent: stores the source in a cookie so registrations
 *   and bookings can be tagged with it, and dedupes visits per browser session.
 */
export default function TrafficSourceTracker() {
  useEffect(() => {
    let detected: Omit<Attribution, "firstSeenAt">;
    try {
      detected = detectAttribution(window.location.href, document.referrer, window.location.hostname);
    } catch {
      return;
    }

    const consent = getConsent();
    if (consent === "accepted") saveAttributionCookie(detected);

    const onConsentChange = (e: Event) => {
      const value = (e as CustomEvent<ConsentValue>).detail;
      if (value === "accepted") saveAttributionCookie(detected);
      else clearAttributionCookie();
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsentChange);

    try {
      let alreadyTracked = trackedThisLoad;
      if (consent === "accepted") {
        alreadyTracked = alreadyTracked || !!sessionStorage.getItem(SESSION_KEY);
        sessionStorage.setItem(SESSION_KEY, "1");
      }
      if (!alreadyTracked) {
        trackedThisLoad = true;
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(detected),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Tracking must never break the page
    }

    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onConsentChange);
  }, []);

  return null;
}

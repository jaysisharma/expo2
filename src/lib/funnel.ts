"use client";

// Funnel events: where visitors start a form, submit it, and how payments end.
// Anonymous (no cookie / ID); each step is sent at most once per page load.
import { decodeAttribution, detectAttribution, ATTRIBUTION_COOKIE } from "./attribution";

export type FunnelFlow = "registration" | "stall_booking" | "dinner" | "ev_rally" | "contact" | "payment";
export type FunnelStep = "start" | "submit" | "success" | "failed";

const sent = new Set<string>();

function currentSource() {
  try {
    const raw = document.cookie
      .split(/;\s*/)
      .find((c) => c.startsWith(`${ATTRIBUTION_COOKIE}=`))
      ?.slice(ATTRIBUTION_COOKIE.length + 1);
    const saved = decodeAttribution(raw);
    if (saved) return saved.source;
    return detectAttribution(window.location.href, document.referrer, window.location.hostname).source;
  } catch {
    return "direct";
  }
}

export function trackFunnel(flow: FunnelFlow, step: FunnelStep) {
  const key = `${flow}:${step}`;
  if (typeof window === "undefined" || sent.has(key)) return;
  sent.add(key);
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "funnel", flow, step, source: currentSource(), page: window.location.pathname }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Tracking must never break the page
  }
}

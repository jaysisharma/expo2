// Turns raw visit / crawler / funnel / sign-up records into the TrafficSummary used by
// the admin Traffic page, the AI suggestions and the weekly email report.
import type { TrafficSummary } from "./trafficInsights";

export const FUNNEL_LABELS: Record<string, string> = {
  registration: "Visitor registration",
  stall_booking: "Stall / sponsor booking",
  dinner: "Networking dinner",
  ev_rally: "EV Rally",
  contact: "Contact form",
};

export function countBy<T>(items: T[], keyFn: (item: T) => string) {
  const counts: Record<string, number> = {};
  items.forEach((item) => {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

export interface TrafficRecords {
  days: number;
  visits: any[];
  registrations: any[];
  inquiries: any[];
  crawlers: any[];
  funnelEvents: any[];
}

/** Keep only records created in the last `days` days. */
export function withinDays<T>(items: T[], days: number, dateOf: (item: T) => string | undefined) {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter((x) => {
    const iso = dateOf(x);
    return !!iso && new Date(iso).getTime() >= since;
  });
}

export function buildTrafficSummary({ days, visits, registrations, inquiries, crawlers, funnelEvents }: TrafficRecords): TrafficSummary {
  const v = countBy(visits, (x) => x.source || "direct");
  // Records created before tracking existed have no trafficSource — leave them out
  const r = countBy(registrations.filter((x) => x.trafficSource), (x) => x.trafficSource);
  const i = countBy(inquiries.filter((x) => x.trafficSource), (x) => x.trafficSource);
  const sources = Array.from(new Set([...Object.keys(v), ...Object.keys(r), ...Object.keys(i)]))
    .map((source) => ({ source, visits: v[source] || 0, registrations: r[source] || 0, inquiries: i[source] || 0 }))
    .sort((a, b) => b.visits - a.visits || b.registrations - a.registrations);

  const campaigns = Object.entries(countBy(visits.filter((x) => x.campaign), (x) => `${x.campaign}|${x.source}`))
    .map(([k, count]) => {
      const [campaign, source] = k.split("|");
      return { campaign, source, visits: count };
    })
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 15);

  const landingPages = Object.entries(countBy(visits, (x) => x.landingPage || "/"))
    .map(([page, count]) => ({ page, visits: count }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10);

  const crawlerTotals: Record<string, { category: string; bot: string; hits: number }> = {};
  crawlers.forEach((c) => {
    const key = `${c.category || "other"}|${c.bot}`;
    crawlerTotals[key] = crawlerTotals[key] || { category: c.category || "other", bot: c.bot, hits: 0 };
    crawlerTotals[key].hits += c.hits || 0;
  });

  const isTracked = (x: any) => x.trafficSource && x.trafficSource !== "admin";

  return {
    days,
    totalVisits: visits.length,
    socialVisits: visits.filter((x) => x.medium === "social").length,
    trackedSignups: registrations.filter(isTracked).length + inquiries.filter(isTracked).length,
    sources,
    campaigns,
    landingPages,
    devices: countBy(visits, (x) => x.device || "unknown"),
    countries: countBy(visits, (x) => x.country || "unknown"),
    crawlers: Object.values(crawlerTotals).sort((a, b) => b.hits - a.hits),
    funnel: Object.keys(FUNNEL_LABELS).map((flow) => ({
      flow,
      started: funnelEvents.filter((e) => e.flow === flow && e.step === "start").length,
      submitted: funnelEvents.filter((e) => e.flow === flow && e.step === "submit").length,
    })),
    payments: {
      success: funnelEvents.filter((e) => e.flow === "payment" && e.step === "success").length,
      failed: funnelEvents.filter((e) => e.flow === "payment" && e.step === "failed").length,
    },
  };
}

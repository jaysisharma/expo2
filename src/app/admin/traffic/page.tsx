"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Share2,
  RefreshCw,
  Link2,
  Copy,
  CheckCircle2,
  Bot,
  Sparkles,
  Lightbulb,
  Mail,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";
import { sourceLabel } from "@/lib/attribution";
import { CRAWLER_CATEGORY_LABELS, type CrawlerCategory } from "@/lib/crawlers";
import { ruleBasedInsights, type Insight } from "@/lib/trafficInsights";
import { buildTrafficSummary, FUNNEL_LABELS, withinDays } from "@/lib/trafficSummary";
import ShortLinksPanel from "@/components/admin/ShortLinksPanel";

const RANGES = [7, 30, 90] as const;
const CRAWLER_FILES = ["/llms.txt", "/llms-full.txt", "/robots.txt", "/sitemap.xml"];
const TABS = [
  ["overview", "Overview"],
  ["sources", "Sources & pages"],
  ["crawlers", "Crawlers"],
  ["links", "Share links"],
] as const;
type Tab = (typeof TABS)[number][0];

const MEDIUMS: { key: string; label: string; color: string }[] = [
  { key: "direct", label: "Direct", color: "bg-slate-400" },
  { key: "search", label: "Search", color: "bg-[#218A59]" },
  { key: "referral", label: "Other websites", color: "bg-[#234679]" },
  { key: "social", label: "Social", color: "bg-sky-500" },
  { key: "email", label: "Email", color: "bg-amber-500" },
];

const countryNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();
const countryName = (code: string) => {
  if (!code || code === "unknown") return "Unknown";
  try {
    return countryNames?.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
};

// Local calendar day (the admin's timezone) for a visit timestamp
const dayKey = (d: Date) => d.toLocaleDateString("en-CA");

function Card({ title, icon, action, children, className = "" }: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function BarList({ rows, empty }: { rows: { label: React.ReactNode; value: number; key: string }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0) return <p className="p-6 text-center text-xs text-slate-500">{empty}</p>;
  return (
    <ul className="p-4 space-y-2.5 text-xs">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="text-slate-700 truncate">{r.label}</span>
            <span className="font-mono text-slate-600">{r.value.toLocaleString()}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-[#218A59]" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function AdminTrafficPage() {
  const [days, setDays] = useState<number>(30);
  const [tab, setTab] = useState<Tab>("overview");
  const [visits, setVisits] = useState<any[]>([]);
  const [previousVisits, setPreviousVisits] = useState<number | null>(null);
  const [crawlers, setCrawlers] = useState<any[]>([]);
  const [funnelEvents, setFunnelEvents] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<Insight[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);

  // UTM link builder
  const [linkPath, setLinkPath] = useState("/register");
  const [linkSource, setLinkSource] = useState("facebook");
  const [linkCampaign, setLinkCampaign] = useState("");
  const [copied, setCopied] = useState(false);
  const [reportStatus, setReportStatus] = useState<string | null>(null);

  const sendReportNow = async () => {
    setShowReportMenu(false);
    if (!confirm("Email the weekly report to the report recipients now?")) return;
    setReportStatus("Sending…");
    try {
      const res = await fetch("/api/cron/weekly-report?send=1");
      const json = await res.json();
      setReportStatus(json.success ? `Report sent to ${json.sentTo.join(", ")}` : json.message || "Could not send report");
    } catch {
      setReportStatus("Could not send report");
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      // Twice the range, so the previous period can be compared with this one
      const [trackRes, dataRes] = await Promise.all([
        fetch(`/api/track?days=${Math.min(days * 2, 365)}`),
        fetch("/api/admin/data"),
      ]);
      const trackJson = await trackRes.json();
      const dataJson = await dataRes.json();
      if (!trackJson.success) setLoadError(true);
      const all = trackJson.visits || [];
      const current = withinDays(all, days, (v: any) => v.ts);
      setVisits(current);
      setPreviousVisits(days * 2 <= 365 ? all.length - current.length : null);
      // Crawler stats are daily documents; same day boundary as /api/track
      const sinceDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
      setCrawlers((trackJson.crawlers || []).filter((c: any) => !c.date || c.date >= sinceDate));
      setFunnelEvents(withinDays(trackJson.funnel || [], days, (e: any) => e.ts));
      setAiInsights(null);
      if (dataJson.success) {
        setRegistrations(withinDays(dataJson.data.registrations || [], days, (r: any) => r.registeredAt));
        setInquiries(withinDays(dataJson.data.inquiries || [], days, (i: any) => i.submittedAt));
      }
    } catch (e) {
      console.warn("Failed to load traffic data", e);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const summary = useMemo(
    () => buildTrafficSummary({ days, visits, registrations, inquiries, crawlers, funnelEvents }),
    [days, visits, registrations, inquiries, crawlers, funnelEvents]
  );

  const sourceRows = summary.sources.map((x) => ({ ...x, key: x.source }));
  const campaignRows = summary.campaigns.map((c) => ({ ...c, count: c.visits }));
  const funnelRows = summary.funnel || [];
  const payments = summary.payments || { success: 0, failed: 0 };
  const crawlerByCategory = useMemo(() => {
    const groups: Record<string, { hits: number; bots: Record<string, number> }> = {};
    summary.crawlers.forEach((c) => {
      groups[c.category] = groups[c.category] || { hits: 0, bots: {} };
      groups[c.category].hits += c.hits;
      groups[c.category].bots[c.bot] = (groups[c.category].bots[c.bot] || 0) + c.hits;
    });
    return Object.entries(groups).sort((a, b) => b[1].hits - a[1].hits);
  }, [summary]);
  const totalCrawlerHits = summary.crawlers.reduce((n, c) => n + c.hits, 0);
  // How often bots fetched the files written for them (robots.txt, sitemap, llms.txt)
  const crawlerFileRows = useMemo(
    () =>
      CRAWLER_FILES.map((file) => {
        let all = 0;
        let ai = 0;
        crawlers.forEach((c) => {
          const n = Number(c.paths?.[file]) || 0;
          all += n;
          if (c.category === "ai") ai += n;
        });
        return { file, all, ai };
      }),
    [crawlers]
  );

  const ruleInsights = useMemo(() => ruleBasedInsights(summary), [summary]);
  const shownInsights = aiInsights || ruleInsights;

  const askAi = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/admin/traffic-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      const json = await res.json();
      if (json.success) setAiInsights(json.insights);
      else setAiError(json.message || "AI suggestions unavailable");
    } catch {
      setAiError("AI suggestions unavailable");
    } finally {
      setAiLoading(false);
    }
  };

  // Visits per day across the range (empty days included)
  const daily = useMemo(() => {
    const counts: Record<string, number> = {};
    visits.forEach((v) => {
      if (v.ts) counts[dayKey(new Date(v.ts))] = (counts[dayKey(new Date(v.ts))] || 0) + 1;
    });
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(Date.now() - (days - 1 - i) * 86400000);
      return { day: dayKey(d), date: d, count: counts[dayKey(d)] || 0 };
    });
  }, [visits, days]);
  const maxDaily = Math.max(1, ...daily.map((d) => d.count));

  const mediumCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    visits.forEach((v) => {
      const m = MEDIUMS.some((x) => x.key === v.medium) ? v.medium : v.medium ? "referral" : "direct";
      counts[m] = (counts[m] || 0) + 1;
    });
    return counts;
  }, [visits]);

  const topSource = sourceRows.find((r) => r.key !== "direct");
  const mobileShare = visits.length ? Math.round(((summary.devices?.mobile || 0) / visits.length) * 100) : 0;
  const change =
    previousVisits && previousVisits > 0 ? Math.round(((visits.length - previousVisits) / previousVisits) * 100) : null;

  const builtLink = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams({ utm_source: linkSource.trim().toLowerCase() || "social" });
    if (linkCampaign.trim()) params.set("utm_campaign", linkCampaign.trim().toLowerCase().replace(/\s+/g, "-"));
    const path = linkPath.startsWith("/") ? linkPath : `/${linkPath}`;
    return `${origin}${path}?${params.toString()}`;
  }, [linkPath, linkSource, linkCampaign]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(builtLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const kpis = [
    {
      label: "Visits",
      value: visits.length.toLocaleString(),
      sub:
        change === null ? (
          `last ${days} days`
        ) : (
          <span className={`inline-flex items-center gap-0.5 font-semibold ${change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}% vs previous {days} days
          </span>
        ),
    },
    {
      label: "Top source",
      value: topSource ? sourceLabel(topSource.key) : "—",
      sub: topSource ? `${topSource.visits.toLocaleString()} visits (excl. direct)` : "Excluding direct visits",
    },
    { label: "On mobile", value: `${mobileShare}%`, sub: `${(summary.devices?.mobile || 0).toLocaleString()} mobile visits` },
    {
      label: "Tracked sign-ups",
      value: String(summary.trackedSignups || 0),
      sub: "Registrations + inquiries with a known source",
    },
  ];

  return (
    <div className="space-y-5 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">Analytics</span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Website Traffic</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Where visitors come from, and which channels bring registrations and bookings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setDays(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  days === r ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {r} days
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowReportMenu((v) => !v)}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer"
              aria-haspopup="menu"
              aria-expanded={showReportMenu}
            >
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>Weekly report</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {showReportMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowReportMenu(false)} />
                <div role="menu" className="absolute right-0 mt-1.5 z-40 w-48 p-1 rounded-xl bg-white border border-slate-200 shadow-xl text-xs">
                  <a
                    role="menuitem"
                    href="/api/cron/weekly-report?preview=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowReportMenu(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
                  >
                    Preview in browser
                  </a>
                  <button
                    role="menuitem"
                    onClick={sendReportNow}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    Email it now…
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-xs cursor-pointer"
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {reportStatus && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs">{reportStatus}</div>
      )}
      {loadError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          Could not load visit data. Check the connection and press refresh.
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{k.label}</span>
            <span className="block text-2xl font-bold text-slate-900 mt-1 truncate">{isLoading && !visits.length ? "—" : k.value}</span>
            <span className="block text-[11px] text-slate-500 mt-0.5">{k.sub}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto scrollbar-none">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer ${
              tab === key ? "border-[#218A59] text-slate-900 font-semibold" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-5">
          <Card title="Visits per day" icon={<BarChart3 className="w-4 h-4 text-[#218A59]" />}>
            <div className="p-4">
              <div className="h-36 flex items-end gap-[2px]" role="img" aria-label={`Visits per day over the last ${days} days`}>
                {daily.map((d) => (
                  <div key={d.day} className="flex-1 h-full flex items-end group relative">
                    <div
                      className="w-full rounded-t bg-[#218A59]/80 group-hover:bg-[#218A59] transition-colors"
                      style={{ height: `${d.count ? Math.max(4, (d.count / maxDaily) * 100) : 0}%` }}
                    />
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 z-10">
                      {d.date.toLocaleDateString([], { day: "numeric", month: "short" })}: {d.count}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-slate-400 font-mono">
                <span>{daily[0]?.date.toLocaleDateString([], { day: "numeric", month: "short" })}</span>
                <span>Today</span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card
              title="How people arrive"
              icon={<Share2 className="w-4 h-4 text-[#218A59]" />}
              action={
                <button onClick={() => setTab("sources")} className="text-[11px] text-[#218A59] hover:underline cursor-pointer">
                  All sources →
                </button>
              }
            >
              <div className="p-4 space-y-3">
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                  {MEDIUMS.map((m) => (
                    <div
                      key={m.key}
                      className={m.color}
                      style={{ width: `${visits.length ? ((mediumCounts[m.key] || 0) / visits.length) * 100 : 0}%` }}
                    />
                  ))}
                </div>
                <ul className="space-y-1.5 text-xs">
                  {MEDIUMS.filter((m) => mediumCounts[m.key]).map((m) => (
                    <li key={m.key} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-700">
                        <span className={`w-2 h-2 rounded-full ${m.color}`} />
                        {m.label}
                      </span>
                      <span className="font-mono text-slate-600">
                        {mediumCounts[m.key].toLocaleString()}{" "}
                        <span className="text-slate-400">({Math.round((mediumCounts[m.key] / visits.length) * 100)}%)</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Top sources</span>
                  <ul className="mt-1.5 space-y-1 text-xs">
                    {sourceRows
                      .filter((r) => r.key !== "direct")
                      .slice(0, 5)
                      .map((r) => (
                        <li key={r.key} className="flex items-center justify-between">
                          <span className="text-slate-700 truncate">{sourceLabel(r.key)}</span>
                          <span className="font-mono text-slate-600">{r.visits}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </Card>

            <Card title="Countries">
              <BarList
                rows={Object.entries(summary.countries || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 7)
                  .map(([code, n]) => ({ key: code, label: countryName(code), value: n }))}
                empty="No visits yet."
              />
            </Card>

            <Card title="Devices">
              <BarList
                rows={Object.entries(summary.devices || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(([device, n]) => ({ key: device, label: device.charAt(0).toUpperCase() + device.slice(1), value: n }))}
                empty="No visits yet."
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card
              title="Form completion"
              action={
                <span className="text-[11px] text-slate-500">
                  Payments: <span className="font-mono text-emerald-700">{payments.success} ok</span> ·{" "}
                  <span className="font-mono text-rose-700">{payments.failed} failed</span>
                </span>
              }
            >
              <ul className="p-4 space-y-3 text-xs">
                {funnelRows.map((row) => {
                  const pct = row.started ? Math.min(100, Math.round((row.submitted / row.started) * 100)) : 0;
                  return (
                    <li key={row.flow}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-700">{FUNNEL_LABELS[row.flow]}</span>
                        <span className="font-mono text-slate-600">
                          {row.submitted}/{row.started} {row.started ? <span className="text-slate-400">({pct}%)</span> : null}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-[#234679]" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="px-4 pb-3 text-[11px] text-slate-400">Submitted out of started, per form.</p>
            </Card>

            <Card
              title={aiInsights ? "AI suggestions" : "Suggestions"}
              icon={aiInsights ? <Sparkles className="w-4 h-4 text-violet-600" /> : <Lightbulb className="w-4 h-4 text-amber-500" />}
              action={
                <button
                  onClick={askAi}
                  disabled={aiLoading || visits.length === 0}
                  className="px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Sparkles className={`w-3 h-3 ${aiLoading ? "animate-pulse" : ""}`} />
                  <span>{aiLoading ? "Analysing…" : aiInsights ? "Ask AI again" : "Ask AI"}</span>
                </button>
              }
            >
              {aiError && <p className="px-4 pt-3 text-xs text-rose-600">{aiError}. Showing built-in suggestions.</p>}
              <ul className="divide-y divide-slate-100">
                {shownInsights.map((ins, i) => (
                  <li key={`${ins.title}-${i}`} className="px-4 py-3 flex gap-3">
                    <span
                      className={`mt-0.5 h-fit px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        ins.priority === "high"
                          ? "bg-rose-50 text-rose-700"
                          : ins.priority === "medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {ins.priority}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900">{ins.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{ins.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {tab === "sources" && (
        <div className="space-y-5">
          <Card title="By source" icon={<Share2 className="w-4 h-4 text-[#218A59]" />}>
            {sourceRows.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500">
                {isLoading ? "Loading…" : "No visits recorded yet in this period."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[10px] font-mono text-slate-500 uppercase bg-slate-50/70">
                      <th className="px-4 py-2">Source</th>
                      <th className="px-4 py-2 w-1/2">Visits</th>
                      <th className="px-4 py-2 text-right">Registrations</th>
                      <th className="px-4 py-2 text-right">Inquiries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sourceRows.map((row) => (
                      <tr key={row.key} className="border-t border-slate-100">
                        <td className="px-4 py-2.5 font-semibold text-slate-800 whitespace-nowrap">{sourceLabel(row.key)}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#218A59]"
                                style={{ width: `${(row.visits / Math.max(1, sourceRows[0].visits)) * 100}%` }}
                              />
                            </div>
                            <span className="w-12 text-right font-mono text-slate-700">{row.visits.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-700">{row.registrations}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-700">{row.inquiries}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card title="Top landing pages">
              <BarList
                rows={summary.landingPages.map((l) => ({
                  key: l.page,
                  label: <span className="font-mono">{l.page}</span>,
                  value: l.visits,
                }))}
                empty="No data yet."
              />
            </Card>
            <Card title="Campaigns (utm_campaign)">
              {campaignRows.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-500">
                  No tagged campaigns yet.{" "}
                  <button onClick={() => setTab("links")} className="text-[#218A59] hover:underline cursor-pointer">
                    Make a trackable link
                  </button>{" "}
                  when you share posts.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 text-xs">
                  {campaignRows.map((c) => (
                    <li key={`${c.campaign}-${c.source}`} className="px-4 py-2.5 flex items-center justify-between gap-3">
                      <span className="min-w-0">
                        <span className="font-semibold text-slate-800 block truncate">{c.campaign}</span>
                        <span className="text-[10px] text-slate-500">{sourceLabel(c.source)}</span>
                      </span>
                      <span className="font-mono text-slate-700">{c.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}

      {tab === "crawlers" && (
        <Card
          title="Web crawlers"
          icon={<Bot className="w-4 h-4 text-[#218A59]" />}
          action={<span className="text-[11px] font-mono text-slate-500">{totalCrawlerHits.toLocaleString()} page fetches</span>}
        >
          {crawlerByCategory.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-500">No crawler visits recorded in this period.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-100">
              {crawlerByCategory.map(([category, g]) => (
                <div key={category} className="bg-white p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {CRAWLER_CATEGORY_LABELS[category as CrawlerCategory] || category}
                    </span>
                    <span className="text-xs font-mono text-slate-600">{g.hits.toLocaleString()}</span>
                  </div>
                  <ul className="space-y-1">
                    {Object.entries(g.bots)
                      .sort((a, b) => b[1] - a[1])
                      .map(([bot, hits]) => (
                        <li key={bot} className="flex items-center justify-between text-[11px] text-slate-600">
                          <span className="truncate">{bot}</span>
                          <span className="font-mono">{hits.toLocaleString()}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          <div className="px-4 py-3 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-800">Files fetched by crawlers</span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {crawlerFileRows.map((r) => (
                <li key={r.file} className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
                  <span className="font-mono truncate">{r.file}</span>
                  <span className="font-mono whitespace-nowrap">
                    {r.all.toLocaleString()} <span className="text-slate-400">({r.ai.toLocaleString()} AI)</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {tab === "links" && (
        <div className="space-y-5">
          <Card title="Trackable link builder" icon={<Link2 className="w-4 h-4 text-[#218A59]" />}>
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-500">
                Instagram, WhatsApp and TikTok often hide where a visitor came from. Share these tagged links in posts, bios
                and messages so every visit is attributed correctly.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="text-[11px] font-semibold text-slate-600 space-y-1">
                  <span>Page</span>
                  <input
                    value={linkPath}
                    onChange={(e) => setLinkPath(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#218A59]"
                    placeholder="/register"
                  />
                </label>
                <label className="text-[11px] font-semibold text-slate-600 space-y-1">
                  <span>Source</span>
                  <select
                    value={linkSource}
                    onChange={(e) => setLinkSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#218A59]"
                  >
                    {["facebook", "instagram", "linkedin", "twitter", "youtube", "tiktok", "whatsapp", "viber", "email", "qr"].map((s) => (
                      <option key={s} value={s}>
                        {s === "qr" ? "QR code / print" : sourceLabel(s)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-[11px] font-semibold text-slate-600 space-y-1">
                  <span>Campaign (optional)</span>
                  <input
                    value={linkCampaign}
                    onChange={(e) => setLinkCampaign(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#218A59]"
                    placeholder="gala-dinner-launch"
                  />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 truncate">
                  {builtLink}
                </code>
                <button
                  onClick={copyLink}
                  className="px-3.5 py-2 rounded-lg bg-[#218A59] hover:bg-[#1b7349] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </Card>

          <ShortLinksPanel
            path={linkPath.startsWith("/") ? linkPath : `/${linkPath}`}
            source={linkSource}
            campaign={linkCampaign.trim().toLowerCase().replace(/\s+/g, "-")}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Share2, RefreshCw, Link2, Copy, CheckCircle2, Bot, Sparkles, Lightbulb, Mail } from "lucide-react";
import { sourceLabel } from "@/lib/attribution";
import { CRAWLER_CATEGORY_LABELS, type CrawlerCategory } from "@/lib/crawlers";
import { ruleBasedInsights, type Insight } from "@/lib/trafficInsights";
import { buildTrafficSummary, FUNNEL_LABELS, withinDays } from "@/lib/trafficSummary";
import ShortLinksPanel from "@/components/admin/ShortLinksPanel";

const RANGES = [7, 30, 90] as const;

export default function AdminTrafficPage() {
  const [days, setDays] = useState<number>(30);
  const [visits, setVisits] = useState<any[]>([]);
  const [crawlers, setCrawlers] = useState<any[]>([]);
  const [funnelEvents, setFunnelEvents] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<Insight[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // UTM link builder
  const [linkPath, setLinkPath] = useState("/register");
  const [linkSource, setLinkSource] = useState("facebook");
  const [linkCampaign, setLinkCampaign] = useState("");
  const [copied, setCopied] = useState(false);
  const [reportStatus, setReportStatus] = useState<string | null>(null);

  const sendReportNow = async () => {
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
      const [trackRes, dataRes] = await Promise.all([
        fetch(`/api/track?days=${days}`),
        fetch("/api/admin/data"),
      ]);
      const trackJson = await trackRes.json();
      const dataJson = await dataRes.json();
      if (!trackJson.success) setLoadError(true);
      setVisits(trackJson.visits || []);
      setCrawlers(trackJson.crawlers || []);
      setFunnelEvents(trackJson.funnel || []);
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

  // Display shapes derived from the shared summary
  const sourceRows = summary.sources.map((x) => ({ ...x, key: x.source }));
  const campaignRows = summary.campaigns.map((c) => ({ ...c, count: c.visits }));
  const landingRows = summary.landingPages.map((l) => [l.page, l.visits] as const);
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

  const socialVisits = summary.socialVisits || 0;
  const maxVisits = Math.max(1, ...sourceRows.map((r) => r.visits));
  const topSource = sourceRows.find((r) => r.key !== "direct");
  const trackedConversions = summary.trackedSignups || 0;

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

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#218A59] border border-emerald-200 font-mono text-[10px] font-bold uppercase">
              Analytics
            </span>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
              Traffic Sources
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Which social networks and links bring visitors, registrations and bookings to the website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-xs">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setDays(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  days === r ? "bg-[#218A59] text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
          <a
            href="/api/cron/weekly-report?preview=1"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[#218A59]" />
            <span>Preview weekly report</span>
          </a>
          <button
            onClick={sendReportNow}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            Email report now
          </button>
          <button
            onClick={fetchData}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#218A59] ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {reportStatus && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs">{reportStatus}</div>
      )}

      {loadError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          Could not load visit data from Firestore. Check the connection and try Refresh.
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block font-mono font-bold">VISITS</span>
          <span className="text-2xl font-bold text-slate-900">{visits.length.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Sessions, last {days} days</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
          <span className="text-[11px] text-emerald-800 block font-mono font-bold">TOP SOURCE</span>
          <span className="text-2xl font-bold text-emerald-900 truncate block">
            {topSource ? sourceLabel(topSource.key) : "—"}
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">
            {topSource ? `${topSource.visits.toLocaleString()} visits` : "Excluding direct"}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 shadow-xs">
          <span className="text-[11px] text-sky-800 block font-mono font-bold">FROM SOCIAL</span>
          <span className="text-2xl font-bold text-sky-900">
            {visits.length ? Math.round((socialVisits / visits.length) * 100) : 0}%
          </span>
          <span className="text-[10px] text-sky-600 block mt-0.5">{socialVisits.toLocaleString()} social visits</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs">
          <span className="text-[11px] text-amber-800 block font-mono font-bold">TRACKED SIGN-UPS</span>
          <span className="text-2xl font-bold text-amber-900">{trackedConversions}</span>
          <span className="text-[10px] text-amber-600 block mt-0.5">Registrations + inquiries with a source</span>
        </div>
      </div>

      {/* Suggestions */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {aiInsights ? <Sparkles className="w-4 h-4 text-violet-600" /> : <Lightbulb className="w-4 h-4 text-amber-500" />}
            <h2 className="text-sm font-bold text-slate-900">{aiInsights ? "AI suggestions" : "Suggestions"}</h2>
          </div>
          <button
            onClick={askAi}
            disabled={aiLoading || visits.length === 0}
            className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? "animate-pulse" : ""}`} />
            <span>{aiLoading ? "Analysing…" : aiInsights ? "Ask AI again" : "Ask AI for suggestions"}</span>
          </button>
        </div>
        {aiError && <p className="px-4 pt-3 text-xs text-rose-600">{aiError}. Showing built-in suggestions.</p>}
        <ul className="divide-y divide-slate-100">
          {shownInsights.map((ins, i) => (
            <li key={`${ins.title}-${i}`} className="px-4 py-3 flex gap-3">
              <span
                className={`mt-0.5 h-fit px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  ins.priority === "high"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : ins.priority === "medium"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-slate-50 text-slate-600 border-slate-200"
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
      </div>

      {/* Sources table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-[#218A59]" />
          <h2 className="text-sm font-bold text-slate-900">By source</h2>
        </div>
        {sourceRows.length === 0 ? (
          <p className="p-6 text-center text-xs text-slate-500">
            {isLoading ? "Loading…" : "No visits recorded yet in this period."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] font-mono font-bold text-slate-500 uppercase">
                  <th className="px-4 py-2">Source</th>
                  <th className="px-4 py-2 w-1/2">Visits</th>
                  <th className="px-4 py-2 text-right">Registrations</th>
                  <th className="px-4 py-2 text-right">Inquiries / Bookings</th>
                </tr>
              </thead>
              <tbody>
                {sourceRows.map((row) => (
                  <tr key={row.key} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 font-semibold text-slate-800 whitespace-nowrap">{sourceLabel(row.key)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#218A59]"
                            style={{ width: `${(row.visits / maxVisits) * 100}%` }}
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
      </div>

      {/* Funnel */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900">Form funnel</h2>
          <span className="text-[11px] text-slate-500">
            Payments: <span className="font-mono text-emerald-700">{payments.success} succeeded</span> ·{" "}
            <span className="font-mono text-rose-700">{payments.failed} failed</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] font-mono font-bold text-slate-500 uppercase">
                <th className="px-4 py-2">Form</th>
                <th className="px-4 py-2 text-right">Started</th>
                <th className="px-4 py-2 text-right">Submitted</th>
                <th className="px-4 py-2 w-1/3">Completion</th>
              </tr>
            </thead>
            <tbody>
              {funnelRows.map((row) => {
                const pct = row.started ? Math.min(100, Math.round((row.submitted / row.started) * 100)) : 0;
                return (
                  <tr key={row.flow} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 font-semibold text-slate-800 whitespace-nowrap">{FUNNEL_LABELS[row.flow]}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">{row.started}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">{row.submitted}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-[#218A59]" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-10 text-right font-mono text-slate-700">{row.started ? `${pct}%` : "—"}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaigns */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Campaigns (utm_campaign)</h2>
          </div>
          {campaignRows.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-500">
              No tagged campaigns yet. Use the link builder below when you share posts.
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
        </div>

        {/* Landing pages */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Top landing pages</h2>
          </div>
          {landingRows.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-500">No data yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-xs">
              {landingRows.map(([page, count]) => (
                <li key={page} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <span className="font-mono text-slate-700 truncate">{page}</span>
                  <span className="font-mono text-slate-700">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Crawlers */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#218A59]" />
            <h2 className="text-sm font-bold text-slate-900">Web crawlers</h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">{totalCrawlerHits.toLocaleString()} page fetches</span>
        </div>
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
      </div>

      {/* UTM link builder */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-[#218A59]" />
          <h2 className="text-sm font-bold text-slate-900">Trackable link builder</h2>
        </div>
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
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#218A59]"
              placeholder="/register"
            />
          </label>
          <label className="text-[11px] font-semibold text-slate-600 space-y-1">
            <span>Source</span>
            <select
              value={linkSource}
              onChange={(e) => setLinkSource(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#218A59]"
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
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#218A59]"
              placeholder="gala-dinner-launch"
            />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 truncate">
            {builtLink}
          </code>
          <button
            onClick={copyLink}
            className="px-3.5 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b7349] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      <ShortLinksPanel
        path={linkPath.startsWith("/") ? linkPath : `/${linkPath}`}
        source={linkSource}
        campaign={linkCampaign.trim().toLowerCase().replace(/\s+/g, "-")}
      />
    </div>
  );
}

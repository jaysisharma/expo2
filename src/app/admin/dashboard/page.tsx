"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Store,
  Users,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  ChevronRight,
  MapPin,
  CalendarDays,
  Award,
  Check,
  ShieldCheck,
  Newspaper,
  Layers,
  Settings,
  Building2,
  Plus,
  Mail,
  BarChart3,
  AlertCircle,
  FileSpreadsheet,
  Wallet,
} from "lucide-react";
import { exhibitorsData } from "@/data/exhibitors";
import { conferenceSessionsData } from "@/data/conference";
import { sponsorsData } from "@/data/sponsors";
import { formatCurrencyNPR } from "@/lib/utils";
import { EVENT } from "@/lib/site";
import {
  STATUS_STYLES,
  mergeBoothOverrides,
  resolveBooths,
  summarizeInventory,
} from "@/lib/stallInventory";

type ActivityKind = "registration" | "inquiry" | "booking";
type ActivityTab = "all" | ActivityKind;

interface ActivityItem {
  kind: ActivityKind;
  id: string;
  at: string;
  raw: any;
}

const timeAgo = (iso: string) => {
  const t = new Date(iso).getTime();
  if (!t) return "";
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "short" });
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [floorPlanElements, setFloorPlanElements] = useState<any[]>([]);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [sheetConnected, setSheetConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activityTab, setActivityTab] = useState<ActivityTab>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [adminRes, floorRes] = await Promise.all([
        fetch("/api/admin/data?t=" + Date.now(), { cache: "no-store" }),
        fetch("/api/floor-plan/save?t=" + Date.now(), { cache: "no-store" }).catch(() => null),
      ]);
      const json = await adminRes.json();
      if (json.success) {
        setData(json.data);
        setLastRefreshed(new Date());
      }
      if (floorRes && floorRes.ok) {
        const floorJson = await floorRes.json();
        if (Array.isArray(floorJson?.data?.elements) && floorJson.data.elements.length > 0) {
          setFloorPlanElements(floorJson.data.elements);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch admin data", err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(true);
    fetch("/api/members", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMemberCount(Array.isArray(d?.members) ? d.members.length : null))
      .catch(() => {});
    fetch("/api/stalls/sync-sheet")
      .then((r) => r.json())
      .then((d) => setSheetConnected(Boolean(d?.configured)))
      .catch(() => setSheetConnected(null));
  }, [fetchDashboardData]);

  // Auto-refresh every 20s
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => fetchDashboardData(false), 20000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchDashboardData]);

  // Stalls: same inventory and prices as the Stalls page
  const primePct = data?.settings?.primeStallSurchargePercent ?? 25;
  const booths = useMemo(
    () => mergeBoothOverrides(floorPlanElements, data?.boothOverrides),
    [floorPlanElements, data?.boothOverrides]
  );
  const stalls = useMemo(
    () => summarizeInventory(booths, resolveBooths(booths, floorPlanElements, data?.boothOverrides, primePct)),
    [booths, floorPlanElements, data?.boothOverrides, primePct]
  );

  const registrations = useMemo(() => data?.registrations || [], [data?.registrations]);
  const inquiries = useMemo(() => data?.inquiries || [], [data?.inquiries]);
  const stallBookings = useMemo(() => data?.stallBookings || [], [data?.stallBookings]);
  const checkedInCount = registrations.filter((r: any) => r.checkedIn).length;
  const checkInRate = registrations.length ? Math.round((checkedInCount / registrations.length) * 100) : 0;
  const newInquiries = inquiries.filter((i: any) => i.status === "New").length;
  const pendingPayments = stallBookings.filter((b: any) => /pending|initiated/i.test(`${b.paymentStatus || b.status || ""}`)).length;
  const sponsorCount = (Array.isArray(data?.sponsors) && data.sponsors.length ? data.sponsors : sponsorsData).reduce(
    (acc: number, cat: any) => acc + (cat.sponsors?.length || 0),
    0
  );

  const daysToEvent = Math.ceil((new Date(EVENT.startDate).getTime() - Date.now()) / 86400000);

  // Newest first across registrations, inquiries and online stall bookings
  const activity: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [
      ...registrations.map((r: any) => ({ kind: "registration" as const, id: r.id, at: r.registeredAt || r.updatedAt || "", raw: r })),
      ...inquiries.map((i: any) => ({ kind: "inquiry" as const, id: i.id, at: i.submittedAt || "", raw: i })),
      ...stallBookings.map((b: any) => ({ kind: "booking" as const, id: b.id, at: b.createdAt || b.updatedAt || "", raw: b })),
    ];
    return items.sort((a, b) => (b.at || "").localeCompare(a.at || ""));
  }, [registrations, inquiries, stallBookings]);
  const visibleActivity = activity.filter((a) => activityTab === "all" || a.kind === activityTab).slice(0, 8);

  const handleToggleCheckin = async (regId: string, currentCheckedIn: boolean) => {
    setActionInProgress(regId);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_registration", payload: { id: regId, checkedIn: !currentCheckedIn } }),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev: any) =>
          prev
            ? {
                ...prev,
                registrations: prev.registrations.map((r: any) =>
                  r.id === regId ? { ...r, checkedIn: !currentCheckedIn } : r
                ),
              }
            : prev
        );
        notify(`${!currentCheckedIn ? "Checked in" : "Check-in removed"}`);
      }
    } catch {
      notify("Failed to update check-in");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleUpdateInquiry = async (inquiryId: string, newStatus: string) => {
    setActionInProgress(inquiryId);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_inquiry", payload: { id: inquiryId, status: newStatus } }),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev: any) =>
          prev
            ? { ...prev, inquiries: prev.inquiries.map((i: any) => (i.id === inquiryId ? { ...i, status: newStatus } : i)) }
            : prev
        );
        notify(`Inquiry marked ${newStatus}`);
      }
    } catch {
      notify("Failed to update inquiry");
    } finally {
      setActionInProgress(null);
    }
  };

  const attention = [
    newInquiries > 0 && {
      key: "inquiries",
      href: "/admin/inquiries",
      icon: MessageSquare,
      text: `${newInquiries} new ${newInquiries === 1 ? "inquiry" : "inquiries"} waiting for a reply`,
    },
    pendingPayments > 0 && {
      key: "payments",
      href: "/admin/stalls",
      icon: Wallet,
      text: `${pendingPayments} online stall ${pendingPayments === 1 ? "payment is" : "payments are"} still pending`,
    },
    stalls.reserved > 0 && {
      key: "reserved",
      href: "/admin/stalls",
      icon: Clock,
      text: `${stalls.reserved} reserved ${stalls.reserved === 1 ? "stall" : "stalls"} not yet confirmed`,
    },
    sheetConnected === false && {
      key: "sheet",
      href: "/admin/stalls",
      icon: FileSpreadsheet,
      text: "Google Sheet is not connected",
    },
  ].filter(Boolean) as { key: string; href: string; icon: React.ElementType; text: string }[];

  const kpis = [
    {
      label: "Stall occupancy",
      value: `${stalls.occupancyPct}%`,
      sub: `${stalls.booked + stalls.reserved} of ${stalls.total} stalls taken`,
      href: "/admin/stalls",
      icon: Store,
      bar: (
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden flex">
          <div className={STATUS_STYLES.Booked.bar} style={{ width: `${(stalls.booked / (stalls.total || 1)) * 100}%` }} />
          <div className={STATUS_STYLES.Reserved.bar} style={{ width: `${(stalls.reserved / (stalls.total || 1)) * 100}%` }} />
        </div>
      ),
    },
    {
      label: "Booked value",
      value: formatCurrencyNPR(stalls.bookedValueNPR),
      sub: `+ ${formatCurrencyNPR(stalls.reservedValueNPR)} reserved · before VAT`,
      href: "/admin/stalls",
      icon: Wallet,
    },
    {
      label: "Registrations",
      value: String(registrations.length),
      sub: registrations.length ? `${checkedInCount} checked in (${checkInRate}%)` : "No registrations yet",
      href: "/admin/registrations",
      icon: Users,
    },
    {
      label: "Inquiries",
      value: String(inquiries.length),
      sub: newInquiries ? `${newInquiries} new` : inquiries.length ? "All handled" : "No inquiries yet",
      href: "/admin/inquiries",
      icon: MessageSquare,
      alert: newInquiries > 0,
    },
  ];

  return (
    <div className="space-y-5 font-sans">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            {daysToEvent > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CalendarDays className="w-3 h-3" />
                {daysToEvent} days to the expo
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {data?.settings?.eventDates || "17–19 January 2027"} · {data?.settings?.venue || "Bhrikutimandap, Kathmandu"}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-1.5 cursor-pointer"
            title="Refresh automatically every 20 seconds"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
            <span>{autoRefresh ? "Live" : "Paused"}</span>
          </button>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 cursor-pointer disabled:opacity-50"
            title="Refresh now"
            aria-label="Refresh now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Needs attention */}
      {attention.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-900 shrink-0">
            <AlertCircle className="w-4 h-4" />
            Needs attention
          </span>
          <div className="flex flex-wrap gap-2">
            {attention.map(({ key, href, icon: Icon, text }) => (
              <Link
                key={key}
                href={href}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-amber-200 hover:border-amber-400 text-[11px] font-medium text-amber-950 transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-amber-600" />
                {text}
                <ChevronRight className="w-3 h-3 text-amber-500" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(({ label, value, sub, href, icon: Icon, bar, alert }) => (
          <Link
            key={label}
            href={href}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{label}</span>
              <Icon className="w-4 h-4 text-slate-300 group-hover:text-[#218A59] transition-colors" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">{isLoading && !data ? "—" : value}</div>
            {bar && <div className="mt-2">{bar}</div>}
            <div className={`mt-1.5 text-[11px] ${alert ? "text-rose-600 font-semibold" : "text-slate-500"}`}>{sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: stalls by block + activity */}
        <div className="lg:col-span-8 space-y-5">
          <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-slate-900">Stalls by block</h2>
              <Link href="/admin/stalls" className="text-xs text-[#218A59] hover:underline flex items-center gap-1 font-medium">
                Manage stalls <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {stalls.blocks.map((b) => (
                <div key={b.block}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">{b.block}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {b.booked} booked · {b.reserved} reserved · {b.available} open
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
                    <div className={STATUS_STYLES.Booked.bar} style={{ width: `${(b.booked / b.total) * 100}%` }} />
                    <div className={STATUS_STYLES.Reserved.bar} style={{ width: `${(b.reserved / b.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-[11px] text-slate-500">
              {(["Booked", "Reserved", "Available"] as const).map((st) => (
                <span key={st} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${STATUS_STYLES[st].dot}`} /> {st}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <h2 className="font-semibold text-sm text-slate-900">Recent activity</h2>
              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 self-start">
                {(
                  [
                    ["all", "All"],
                    ["registration", "Registrations"],
                    ["inquiry", "Inquiries"],
                    ["booking", "Stall orders"],
                  ] as const
                ).map(([tab, label]) => (
                  <button
                    key={tab}
                    onClick={() => setActivityTab(tab)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      activityTab === tab ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {visibleActivity.length === 0 && (
                <div className="py-10 text-center text-slate-400">Nothing here yet.</div>
              )}
              {visibleActivity.map(({ kind, id, at, raw }) => (
                <div key={`${kind}-${id}`} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        kind === "registration"
                          ? "bg-blue-50 text-[#234679]"
                          : kind === "inquiry"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {kind === "registration" ? (
                        <Users className="w-4 h-4" />
                      ) : kind === "inquiry" ? (
                        <MessageSquare className="w-4 h-4" />
                      ) : (
                        <Store className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {kind === "registration"
                          ? raw.name
                          : kind === "inquiry"
                          ? raw.company || raw.name
                          : raw.companyName || raw.contactPerson || raw.name || "Stall order"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {kind === "registration"
                          ? `${raw.passType?.replace(/\(Free\)/, "").trim() || "Visitor"} · ${raw.organization || "Independent"}`
                          : kind === "inquiry"
                          ? `${raw.subject || "Inquiry"}${raw.stallInterest ? ` · Stall ${raw.stallInterest}` : ""}`
                          : `Stall ${[].concat(raw.stalls || raw.stallNumbers || raw.boothNumber || []).join(", ") || "—"} · ${
                              raw.paymentStatus || raw.status || "Pending"
                            }`}
                        {at ? ` · ${timeAgo(at)}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {kind === "registration" && (
                      <button
                        onClick={() => handleToggleCheckin(raw.id, raw.checkedIn)}
                        disabled={actionInProgress === raw.id}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1 cursor-pointer transition-colors ${
                          raw.checkedIn
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {actionInProgress === raw.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : raw.checkedIn ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3 text-slate-400" />
                        )}
                        {raw.checkedIn ? "Checked in" : "Check in"}
                      </button>
                    )}
                    {kind === "inquiry" && (
                      <>
                        {raw.status === "New" && (
                          <button
                            onClick={() => handleUpdateInquiry(raw.id, "In Progress")}
                            disabled={actionInProgress === raw.id}
                            className="px-2 py-1 rounded-lg text-[11px] font-medium bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                          >
                            Start
                          </button>
                        )}
                        {raw.status === "In Progress" && (
                          <button
                            onClick={() => handleUpdateInquiry(raw.id, "Resolved")}
                            disabled={actionInProgress === raw.id}
                            className="px-2 py-1 rounded-lg text-[11px] font-medium bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                          >
                            Resolve
                          </button>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                            raw.status === "New"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : raw.status === "In Progress"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {raw.status}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-end gap-4 text-[11px] font-medium">
              <Link href="/admin/registrations" className="text-slate-600 hover:text-slate-900">
                All registrations →
              </Link>
              <Link href="/admin/inquiries" className="text-slate-600 hover:text-slate-900">
                All inquiries →
              </Link>
            </div>
          </section>
        </div>

        {/* Right: quick actions, content, event */}
        <div className="lg:col-span-4 space-y-5">
          <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5">
            <h2 className="font-semibold text-sm text-slate-900 mb-3">Quick actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/admin/stalls", icon: Plus, label: "Book a stall" },
                { href: "/admin/news", icon: Newspaper, label: "Post news" },
                { href: "/admin/bulk-email", icon: Mail, label: "Send email" },
                { href: "/admin/traffic", icon: BarChart3, label: "Site traffic" },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="p-3 rounded-lg border border-slate-200 hover:border-[#218A59] hover:bg-emerald-50/40 text-xs font-medium text-slate-800 flex items-center gap-2 transition-colors"
                >
                  <Icon className="w-4 h-4 text-[#218A59]" />
                  {label}
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5">
            <h2 className="font-semibold text-sm text-slate-900 mb-1">Website content</h2>
            <div className="divide-y divide-slate-100">
              {[
                { href: "/admin/speakers", icon: ShieldCheck, label: "Organization members", count: memberCount ?? "…" },
                { href: "/admin/news", icon: Newspaper, label: "News & announcements", count: data?.news?.length ?? "…" },
                { href: "/admin/sponsors", icon: Award, label: "Sponsors & partners", count: sponsorCount },
                { href: "/admin/exhibitors", icon: Building2, label: "Exhibitors", count: exhibitorsData.length },
                { href: "/admin/conference", icon: CalendarDays, label: "Conference sessions", count: conferenceSessionsData.length },
                { href: "/admin/badge-designer", icon: Layers, label: "Badge designer", count: "" },
              ].map(({ href, icon: Icon, label, count }) => (
                <Link key={label} href={href} className="py-2.5 flex items-center justify-between group">
                  <span className="flex items-center gap-2.5 text-xs font-medium text-slate-700 group-hover:text-[#218A59]">
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#218A59]" />
                    {label}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                    {count}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-slate-900">Event</h2>
              <Link href="/admin/settings" className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1">
                <Settings className="w-3 h-3" /> Settings
              </Link>
            </div>
            <p className="font-medium text-slate-800">
              {data?.settings?.eventName || "Himalayan Green Energy Expo 2027"}
            </p>
            <p className="text-slate-600 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
              {data?.settings?.eventDates || "17–19 January 2027"}
            </p>
            <p className="text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {data?.settings?.venue || "Bhrikutimandap, Kathmandu"}
            </p>
            <p className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Exchange rate</span>
              <span className="font-mono text-slate-700">1 USD = {data?.settings?.currencyRateUSD_NPR || 134.5} NPR</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

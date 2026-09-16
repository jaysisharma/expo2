"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Store,
  Users,
  Building2,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  DollarSign,
  TrendingUp,
  MapPin,
  CalendarDays,
  Award,
  Search,
  Check,
  AlertCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { boothsData } from "@/data/booths";
import { exhibitorsData } from "@/data/exhibitors";
import { speakersData } from "@/data/speakers";
import { conferenceSessionsData } from "@/data/conference";
import { sponsorsData } from "@/data/sponsors";
import { formatCurrencyUSD, formatCurrencyNPR, formatNumber } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activityTab, setActivityTab] = useState<"all" | "registrations" | "inquiries">("all");
  const [activitySearch, setActivitySearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch("/api/admin/data?t=" + Date.now(), {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        if (json.metrics) {
          setMetrics(json.metrics);
        }
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.warn("Failed to fetch live admin data", err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Dynamic Auto-Refresh interval (15s)
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchDashboardData(false);
    }, 15000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchDashboardData]);

  // Merged Booths calculation
  const mergedBooths = useMemo(() => {
    return boothsData.map((b) => {
      const override = data?.boothOverrides?.[b.number];
      return override ? { ...b, ...override } : b;
    });
  }, [data?.boothOverrides]);

  const bookedCount = mergedBooths.filter((b) => b.status === "Booked").length;
  const reservedCount = mergedBooths.filter((b) => b.status === "Reserved").length;
  const availableCount = mergedBooths.filter((b) => b.status === "Available").length;
  const totalStalls = mergedBooths.length || 1;
  const bookedPct = Math.round((bookedCount / totalStalls) * 100);
  const reservedPct = Math.round((reservedCount / totalStalls) * 100);
  const occupancyPct = Math.min(100, bookedPct + reservedPct);

  // Financial calculations
  const exchangeRate = data?.settings?.currencyRateUSD_NPR || 134.5;
  const bookedRevenueUSD = mergedBooths
    .filter((b) => b.status === "Booked")
    .reduce((sum, b) => sum + (b.priceUSD || 2500), 0);
  const reservedRevenueUSD = mergedBooths
    .filter((b) => b.status === "Reserved")
    .reduce((sum, b) => sum + (b.priceUSD || 2500), 0);
  const totalPotentialUSD = mergedBooths.reduce((sum, b) => sum + (b.priceUSD || 2500), 0);

  // Registrations & Inquiries
  const registrations = useMemo(() => data?.registrations || [], [data?.registrations]);
  const inquiries = useMemo(() => data?.inquiries || [], [data?.inquiries]);
  const checkedInCount = registrations.filter((r: any) => r.checkedIn).length;
  const checkInRate = registrations.length ? Math.round((checkedInCount / registrations.length) * 100) : 0;
  const pendingInquiries = inquiries.filter((i: any) => i.status === "New").length;

  // Hall specific calculations
  const hallA = useMemo(() => {
    const booths = mergedBooths.filter((b) => b.hall?.includes("Hall A") || b.number.startsWith("A"));
    const booked = booths.filter((b) => b.status === "Booked").length;
    const reserved = booths.filter((b) => b.status === "Reserved").length;
    return {
      total: booths.length,
      booked,
      reserved,
      available: booths.filter((b) => b.status === "Available").length,
      pct: Math.round(((booked + reserved) / (booths.length || 1)) * 100),
    };
  }, [mergedBooths]);

  const hallB = useMemo(() => {
    const booths = mergedBooths.filter((b) => b.hall?.includes("Hall B") || b.number.startsWith("B"));
    const booked = booths.filter((b) => b.status === "Booked").length;
    const reserved = booths.filter((b) => b.status === "Reserved").length;
    return {
      total: booths.length,
      booked,
      reserved,
      available: booths.filter((b) => b.status === "Available").length,
      pct: Math.round(((booked + reserved) / (booths.length || 1)) * 100),
    };
  }, [mergedBooths]);

  const outdoor = useMemo(() => {
    const booths = mergedBooths.filter((b) => b.hall?.includes("Outdoor") || b.number.startsWith("OUT"));
    const booked = booths.filter((b) => b.status === "Booked").length;
    const reserved = booths.filter((b) => b.status === "Reserved").length;
    return {
      total: booths.length,
      booked,
      reserved,
      available: booths.filter((b) => b.status === "Available").length,
      pct: Math.round(((booked + reserved) / (booths.length || 1)) * 100),
    };
  }, [mergedBooths]);

  // Quick Action: Toggle Check-in Directly from Dashboard
  const handleToggleCheckin = async (regId: string, currentStatus: boolean) => {
    setActionInProgress(regId);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_checkin",
          payload: { regId, checkedIn: !currentStatus },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            registrations: prev.registrations.map((r: any) =>
              r.id === regId ? { ...r, checkedIn: !currentStatus } : r
            ),
          };
        });
        notify(`Check-in updated for ${regId}`);
      }
    } catch (e) {
      notify("Failed to update check-in status");
    } finally {
      setActionInProgress(null);
    }
  };

  // Quick Action: Update Inquiry Status Directly from Dashboard
  const handleUpdateInquiry = async (inquiryId: string, newStatus: string) => {
    setActionInProgress(inquiryId);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_inquiry_status",
          payload: { inquiryId, status: newStatus },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            inquiries: prev.inquiries.map((i: any) =>
              i.id === inquiryId ? { ...i, status: newStatus } : i
            ),
          };
        });
        notify(`Inquiry ${inquiryId} marked as ${newStatus}`);
      }
    } catch (e) {
      notify("Failed to update inquiry status");
    } finally {
      setActionInProgress(null);
    }
  };

  // Filtered Activity Items
  const filteredRegistrations = useMemo(() => {
    const q = activitySearch.toLowerCase().trim();
    if (!q) return registrations;
    return registrations.filter(
      (r: any) =>
        r.name?.toLowerCase().includes(q) ||
        r.organization?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q) ||
        r.passType?.toLowerCase().includes(q)
    );
  }, [registrations, activitySearch]);

  const filteredInquiries = useMemo(() => {
    const q = activitySearch.toLowerCase().trim();
    if (!q) return inquiries;
    return inquiries.filter(
      (i: any) =>
        i.company?.toLowerCase().includes(q) ||
        i.name?.toLowerCase().includes(q) ||
        i.subject?.toLowerCase().includes(q) ||
        i.id?.toLowerCase().includes(q)
    );
  }, [inquiries, activitySearch]);

  return (
    <div className="max-w-7xl mx-auto space-y-7 font-sans transition-colors duration-300">
      {/* Dynamic Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#0A1220] border border-[#218A59]/40 text-white text-xs font-mono font-medium shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-[#25C176]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-black/[0.08] dark:border-white/10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#218A59]/10 text-[#218A59] dark:bg-[#25C176]/15 dark:text-[#25C176] border border-[#218A59]/20 font-mono text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#218A59] dark:bg-[#25C176] animate-pulse" />
            <span>ORGANIZER COMMAND CENTER · REAL-TIME</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-gray-900 dark:text-white tracking-tight">
            EXPO <span className="text-[#234679] dark:text-[#6FA0E8]">EXECUTIVE</span>{" "}
            <span className="text-[#218A59] dark:text-[#25C176]">DASHBOARD</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans">
            {data?.settings?.eventName || "Himalayan Green Energy Expo Nepal 2027"} · {data?.settings?.venue || "Bhrikutimandap Exhibition Complex, Kathmandu"}
          </p>
        </div>

        {/* Live Controls: Auto-sync toggle & Manual refresh */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? "Auto-refresh is ON (Every 15s)" : "Auto-refresh is PAUSED"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
              autoRefresh
                ? "bg-[#218A59]/10 text-[#218A59] dark:bg-[#25C176]/15 dark:text-[#25C176] border-[#218A59]/30"
                : "bg-black/[0.03] dark:bg-white/[0.06] text-slate-500 border-black/10 dark:border-white/10"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-[#25C176] animate-ping" : "bg-slate-400"}`} />
            <span>{autoRefresh ? "LIVE 15s" : "PAUSED"}</span>
          </button>

          <button
            onClick={() => fetchDashboardData(true)}
            title="Force sync live metrics"
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.06] dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs text-gray-700 dark:text-slate-300 transition-colors font-mono font-bold cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#218A59] dark:text-[#25C176]" : ""}`} />
            <span>SYNC DATA</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Interactive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Stall Allocation & Space */}
        <Link
          href="/admin/stalls"
          className="p-5 rounded-2xl bg-white dark:bg-[#0A1220]/90 border border-black/[0.08] dark:border-white/10 hover:border-[#218A59]/40 hover:shadow-lg transition-all duration-300 group block shadow-sm backdrop-blur-md relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#234679] dark:text-[#6FA0E8] uppercase tracking-wider">
              Stall Allocation
            </span>
            <div className="p-2 rounded-xl bg-[#218A59]/10 text-[#218A59] dark:bg-[#25C176]/15 dark:text-[#25C176]">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight group-hover:text-[#218A59] dark:group-hover:text-[#25C176] transition-colors">
              {occupancyPct}%
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              ({bookedCount + reservedCount}/{totalStalls})
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
            <span>{bookedCount} booked · {reservedCount} reserved</span>
            <span className="text-[#218A59] dark:text-[#25C176] font-bold">{availableCount} open</span>
          </div>
        </Link>

        {/* Card 2: Estimated Revenue (Dynamic USD & NPR) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0A1220]/90 border border-black/[0.08] dark:border-white/10 shadow-sm backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#234679] dark:text-[#6FA0E8] uppercase tracking-wider">
              Confirmed Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#25C176]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight">
              {formatCurrencyUSD(bookedRevenueUSD)}
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
              ≈ {formatCurrencyNPR(bookedRevenueUSD * exchangeRate)}
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
            <span>Potential: {formatCurrencyUSD(totalPotentialUSD)}</span>
            <span className="text-amber-500 font-bold">+{formatCurrencyUSD(reservedRevenueUSD)} res</span>
          </div>
        </div>

        {/* Card 3: Delegates & Visitors (Check-in rate) */}
        <Link
          href="/admin/registrations"
          className="p-5 rounded-2xl bg-white dark:bg-[#0A1220]/90 border border-black/[0.08] dark:border-white/10 hover:border-[#234679]/40 hover:shadow-lg transition-all duration-300 group block shadow-sm backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#234679] dark:text-[#6FA0E8] uppercase tracking-wider">
              Delegates & Visitors
            </span>
            <div className="p-2 rounded-xl bg-[#234679]/10 text-[#234679] dark:bg-[#4A7EC7]/15 dark:text-[#6FA0E8]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight group-hover:text-[#234679] dark:group-hover:text-[#6FA0E8] transition-colors">
              {registrations.length}
            </span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {checkInRate}% checked-in
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
            <span>{checkedInCount} verified badges issued</span>
            <span className="text-slate-400">{registrations.length - checkedInCount} pending</span>
          </div>
        </Link>

        {/* Card 4: Inquiries & Leads (Status breakdown) */}
        <Link
          href="/admin/inquiries"
          className="p-5 rounded-2xl bg-white dark:bg-[#0A1220]/90 border border-black/[0.08] dark:border-white/10 hover:border-amber-500/40 hover:shadow-lg transition-all duration-300 group block shadow-sm backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#234679] dark:text-[#6FA0E8] uppercase tracking-wider">
              Inquiries & Leads
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight group-hover:text-amber-500 transition-colors">
              {inquiries.length}
            </span>
            {pendingInquiries > 0 && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                {pendingInquiries} new
              </span>
            )}
          </div>
          <div className="text-[11px] font-mono mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
            {pendingInquiries > 0 ? (
              <span className="text-rose-500 font-bold">{pendingInquiries} require response</span>
            ) : (
              <span className="text-[#218A59] dark:text-[#25C176] font-bold">All inquiries addressed</span>
            )}
            <span className="text-slate-400">{inquiries.filter((i: any) => i.status === "Resolved").length} resolved</span>
          </div>
        </Link>
      </div>

      {/* Secondary Fast Metric Row: Exhibitors, Sessions, Sponsors, IPPAN Leadership */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/admin/exhibitors"
          className="p-3.5 rounded-xl bg-white/70 dark:bg-[#0A1220]/70 border border-black/[0.06] dark:border-white/10 hover:border-[#218A59]/40 transition-colors flex items-center justify-between"
        >
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
              Exhibitor OEMs
            </div>
            <div className="text-lg font-display font-black text-gray-900 dark:text-white">
              {exhibitorsData.length}
            </div>
          </div>
          <Building2 className="w-4 h-4 text-[#218A59] opacity-75" />
        </Link>

        <Link
          href="/admin/conference"
          className="p-3.5 rounded-xl bg-white/70 dark:bg-[#0A1220]/70 border border-black/[0.06] dark:border-white/10 hover:border-[#234679]/40 transition-colors flex items-center justify-between"
        >
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
              Conference Agenda
            </div>
            <div className="text-lg font-display font-black text-gray-900 dark:text-white">
              {conferenceSessionsData.length} Sessions
            </div>
          </div>
          <CalendarDays className="w-4 h-4 text-[#234679] opacity-75" />
        </Link>

        <Link
          href="/admin/sponsors"
          className="p-3.5 rounded-xl bg-white/70 dark:bg-[#0A1220]/70 border border-black/[0.06] dark:border-white/10 hover:border-amber-500/40 transition-colors flex items-center justify-between"
        >
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
              Sponsor Patrons
            </div>
            <div className="text-lg font-display font-black text-gray-900 dark:text-white">
              {sponsorsData.reduce((acc, cat) => acc + (cat.sponsors?.length || 0), 0)} Partners
            </div>
          </div>
          <Award className="w-4 h-4 text-amber-500 opacity-75" />
        </Link>

        <Link
          href="/admin/speakers"
          className="p-3.5 rounded-xl bg-white/70 dark:bg-[#0A1220]/70 border border-black/[0.06] dark:border-white/10 hover:border-purple-500/40 transition-colors flex items-center justify-between"
        >
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
              IPPAN Leadership
            </div>
            <div className="text-lg font-display font-black text-gray-900 dark:text-white">
              {speakersData.length} Members
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-purple-500 opacity-75" />
        </Link>
      </div>

      {/* Floor & Hall Breakdown Cards */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0A1220]/90 border border-black/[0.08] dark:border-white/10 shadow-sm space-y-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#218A59] dark:text-[#25C176]" />
            <div className="font-display font-bold text-xs sm:text-sm text-gray-900 dark:text-white tracking-wider uppercase">
              Exhibition Hall Floor Status & Zone Utilization
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono font-bold">
            <Link
              href="/admin/stalls"
              className="text-[#218A59] dark:text-[#25C176] hover:underline flex items-center gap-1 uppercase"
            >
              <span>Manage Stalls</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/admin/floor-plan"
              className="text-[#234679] dark:text-[#6FA0E8] hover:underline flex items-center gap-1 uppercase"
            >
              <span>Floor Studio</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Overall Occupancy: {bookedCount + reservedCount} of {totalStalls} Stalls</span>
            <span className="font-bold text-gray-900 dark:text-white">{occupancyPct}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden flex">
            <div
              style={{ width: `${bookedPct}%` }}
              className="h-full bg-gradient-to-r from-[#5B9F35] to-[#218A59]"
              title={`Booked: ${bookedCount}`}
            />
            <div
              style={{ width: `${reservedPct}%` }}
              className="h-full bg-gradient-to-r from-[#234679] to-[#4A7EC7]"
              title={`Reserved: ${reservedCount}`}
            />
          </div>
        </div>

        {/* Hall-by-Hall Live Progress Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Hall A */}
          <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs font-sans">
              <span className="font-bold text-gray-900 dark:text-white">Hall A: Turbines & OEM</span>
              <span className="font-mono text-[11px] font-bold text-[#218A59] dark:text-[#25C176]">{hallA.pct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                style={{ width: `${hallA.pct}%` }}
                className="h-full bg-[#218A59]"
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex justify-between">
              <span>{hallA.booked} booked · {hallA.reserved} reserved</span>
              <span>{hallA.available} open</span>
            </div>
          </div>

          {/* Hall B */}
          <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs font-sans">
              <span className="font-bold text-gray-900 dark:text-white">Hall B: Electrical & Grid</span>
              <span className="font-mono text-[11px] font-bold text-[#234679] dark:text-[#6FA0E8]">{hallB.pct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                style={{ width: `${hallB.pct}%` }}
                className="h-full bg-[#234679] dark:bg-[#4A7EC7]"
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex justify-between">
              <span>{hallB.booked} booked · {hallB.reserved} reserved</span>
              <span>{hallB.available} open</span>
            </div>
          </div>

          {/* Outdoor Area */}
          <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs font-sans">
              <span className="font-bold text-gray-900 dark:text-white">Outdoor Heavy Pavilion</span>
              <span className="font-mono text-[11px] font-bold text-amber-500">{outdoor.pct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                style={{ width: `${outdoor.pct}%` }}
                className="h-full bg-amber-500"
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex justify-between">
              <span>{outdoor.booked} booked · {outdoor.reserved} reserved</span>
              <span>{outdoor.available} open</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity & Interactive Stream */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0A1220]/90 border border-black/[0.08] dark:border-white/10 shadow-sm space-y-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-black/[0.06] dark:border-white/10">
          <div className="space-y-0.5">
            <div className="font-display font-bold text-xs sm:text-sm text-gray-900 dark:text-white tracking-wider uppercase">
              Live Activity Stream & Quick Actions
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive check-in and inquiry disposition without leaving the command center
            </p>
          </div>

          {/* Search + Segmented Tabs */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter activity..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="pl-8 pr-2.5 py-1 text-xs rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#218A59] w-36 sm:w-44"
              />
            </div>

            <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-xl shrink-0">
              <button
                onClick={() => setActivityTab("all")}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activityTab === "all"
                    ? "bg-gradient-to-r from-[#5B9F35] to-[#218A59] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => setActivityTab("registrations")}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activityTab === "registrations"
                    ? "bg-gradient-to-r from-[#5B9F35] to-[#218A59] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                ATTENDEES ({filteredRegistrations.length})
              </button>
              <button
                onClick={() => setActivityTab("inquiries")}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activityTab === "inquiries"
                    ? "bg-gradient-to-r from-[#5B9F35] to-[#218A59] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                INQUIRIES ({filteredInquiries.length})
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Activity List */}
        <div className="divide-y divide-black/[0.05] dark:divide-white/[0.06] text-xs">
          {/* Registrations items */}
          {(activityTab === "all" || activityTab === "registrations") &&
            filteredRegistrations.slice(0, activityTab === "registrations" ? 10 : 4).map((reg: any) => (
              <div
                key={reg.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors px-2 rounded-xl"
              >
                <div className="truncate flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white truncate font-sans">
                      {reg.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-[#6FA0E8] font-bold">
                      {reg.passType}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                    {reg.organization || "Independent"} · {reg.country || "Nepal"}
                  </span>
                </div>

                {/* Inline check-in trigger */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">
                    {reg.id}
                  </span>
                  <button
                    onClick={() => handleToggleCheckin(reg.id, reg.checkedIn)}
                    disabled={actionInProgress === reg.id}
                    title="Click to toggle check-in verification"
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                      reg.checkedIn
                        ? "text-[#218A59] dark:text-[#25C176] bg-[#218A59]/10 border-[#218A59]/30 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30"
                        : "text-slate-600 dark:text-slate-300 bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/10 hover:bg-[#218A59]/15 hover:text-[#218A59] hover:border-[#218A59]/30"
                    }`}
                  >
                    {actionInProgress === reg.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : reg.checkedIn ? (
                      <Check className="w-3 h-3 text-[#25C176]" />
                    ) : (
                      <Clock className="w-3 h-3 text-slate-400" />
                    )}
                    <span>{reg.checkedIn ? "CHECKED IN" : "MARK CHECK-IN"}</span>
                  </button>
                </div>
              </div>
            ))}

          {/* Inquiries items */}
          {(activityTab === "all" || activityTab === "inquiries") &&
            filteredInquiries.slice(0, activityTab === "inquiries" ? 10 : 3).map((inq: any) => (
              <div
                key={inq.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors px-2 rounded-xl"
              >
                <div className="truncate flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white truncate font-sans">
                      {inq.company || inq.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#234679] dark:text-[#6FA0E8] font-bold">
                      INQUIRY
                    </span>
                    {inq.stallInterest && (
                      <span className="text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded">
                        Stall {inq.stallInterest}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {inq.subject}
                  </p>
                </div>

                {/* Inline inquiry disposition buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                    {inq.id}
                  </span>

                  {inq.status === "New" && (
                    <button
                      onClick={() => handleUpdateInquiry(inq.id, "In Progress")}
                      disabled={actionInProgress === inq.id}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
                    >
                      START REVIEW
                    </button>
                  )}

                  {inq.status === "In Progress" && (
                    <button
                      onClick={() => handleUpdateInquiry(inq.id, "Resolved")}
                      disabled={actionInProgress === inq.id}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#218A59]/15 text-[#218A59] dark:text-[#25C176] border border-[#218A59]/30 hover:bg-[#218A59]/25 transition-colors cursor-pointer"
                    >
                      RESOLVE
                    </button>
                  )}

                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      inq.status === "New"
                        ? "text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20"
                        : inq.status === "In Progress"
                        ? "text-amber-500 bg-amber-500/10 border border-amber-500/20"
                        : "text-[#218A59] dark:text-[#25C176] bg-[#218A59]/10 border border-[#218A59]/20"
                    }`}
                  >
                    {inq.status}
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* Footer info & links */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono border-t border-black/[0.06] dark:border-white/10 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25C176]" />
            <span>Sync: {lastRefreshed.toLocaleTimeString()}</span>
          </div>

          <div className="flex items-center gap-5 font-bold uppercase">
            <Link
              href="/admin/registrations"
              className="hover:text-[#218A59] dark:hover:text-[#25C176] transition-colors"
            >
              ALL ATTENDEES →
            </Link>
            <Link
              href="/admin/inquiries"
              className="hover:text-[#218A59] dark:hover:text-[#25C176] transition-colors"
            >
              CRM INQUIRIES →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


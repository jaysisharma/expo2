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
  DollarSign,
  MapPin,
  CalendarDays,
  Award,
  Search,
  Check,
  ShieldCheck,
  Newspaper,
  Layers,
  Settings,
} from "lucide-react";
import { boothsData } from "@/data/booths";
import { exhibitorsData } from "@/data/exhibitors";
import { speakersData } from "@/data/speakers";
import { conferenceSessionsData } from "@/data/conference";
import { sponsorsData } from "@/data/sponsors";
import { formatCurrencyUSD, formatCurrencyNPR } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activityTab, setActivityTab] = useState<"all" | "registrations" | "inquiries">("all");
  const [activitySearch, setActivitySearch] = useState("");
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
      const res = await fetch("/api/admin/data?t=" + Date.now(), {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.warn("Failed to fetch admin data", err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Auto-refresh interval (20s)
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchDashboardData(false);
    }, 20000);
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

  // Registrations & Inquiries
  const registrations = useMemo(() => data?.registrations || [], [data?.registrations]);
  const inquiries = useMemo(() => data?.inquiries || [], [data?.inquiries]);
  const checkedInCount = registrations.filter((r: any) => r.checkedIn).length;
  const checkInRate = registrations.length
    ? Math.round((checkedInCount / registrations.length) * 100)
    : 0;
  const pendingInquiries = inquiries.filter((i: any) => i.status === "New").length;
  const totalNews = data?.news?.length ?? 0;

  // Hall specific calculations
  const hallA = useMemo(() => {
    const booths = mergedBooths.filter(
      (b) => b.hall?.includes("A") || b.number.startsWith("A")
    );
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
    const booths = mergedBooths.filter(
      (b) => b.hall?.includes("B") || b.number.startsWith("B")
    );
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

  const hallC = useMemo(() => {
    const booths = mergedBooths.filter(
      (b) => b.hall?.includes("C") || b.number.startsWith("C")
    );
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
    const booths = mergedBooths.filter(
      (b) =>
        b.hall?.includes("Outdoor") ||
        b.hall?.includes("Special") ||
        b.number.startsWith("H") ||
        b.number.startsWith("F") ||
        b.number.startsWith("OUT")
    );
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

  // Handle live toggle check-in
  const handleToggleCheckin = async (regId: string, currentCheckedIn: boolean) => {
    setActionInProgress(regId);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_registration",
          payload: { id: regId, checkedIn: !currentCheckedIn },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            registrations: prev.registrations.map((r: any) =>
              r.id === regId ? { ...r, checkedIn: !currentCheckedIn } : r
            ),
          };
        });
        notify(`Registration ${regId} ${!currentCheckedIn ? "Checked In" : "Unmarked"}`);
      }
    } catch {
      notify("Failed to update status");
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle live update inquiry
  const handleUpdateInquiry = async (inquiryId: string, newStatus: string) => {
    setActionInProgress(inquiryId);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_inquiry",
          payload: { id: inquiryId, status: newStatus },
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
        notify(`Inquiry updated to ${newStatus}`);
      }
    } catch {
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
    <div className="space-y-6 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time overview of stalls, registrations, finances, and inquiries.
          </p>
        </div>

        {/* Clean Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
              autoRefresh
                ? "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                : "bg-white text-slate-400 border-slate-200 hover:text-slate-600"
            }`}
            title="Toggle automatic 20s data refresh"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
              }`}
            />
            <span>{autoRefresh ? "Auto-refresh: On" : "Auto-refresh: Off"}</span>
          </button>

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isLoading}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Key Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Stall Occupancy */}
        <Link
          href="/admin/stalls"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all group block"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium text-[11px] uppercase tracking-wider text-slate-500 font-mono">
              Stall Occupancy
            </span>
            <Store className="w-4 h-4 text-slate-400 group-hover:text-[#218A59] transition-colors" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {occupancyPct}%
            </span>
            <span className="text-xs font-medium text-slate-500 font-mono">
              {bookedCount + reservedCount} / {totalStalls}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2.5 overflow-hidden flex">
            <div style={{ width: `${bookedPct}%` }} className="bg-[#218A59]" />
            <div style={{ width: `${reservedPct}%` }} className="bg-amber-400" />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{bookedCount} booked</span>
            <span className="text-[#218A59] font-medium">{availableCount} available</span>
          </div>
        </Link>

        {/* Card 2: Confirmed Revenue */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium text-[11px] uppercase tracking-wider text-slate-500 font-mono">
              Confirmed Revenue
            </span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {formatCurrencyUSD(bookedRevenueUSD)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
            <div style={{ width: `${bookedPct}%` }} className="bg-emerald-600 h-full" />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>≈ {formatCurrencyNPR(bookedRevenueUSD * exchangeRate)}</span>
            <span className="text-amber-600 font-medium">+{formatCurrencyUSD(reservedRevenueUSD)} res</span>
          </div>
        </div>

        {/* Card 3: Registered Attendees */}
        <Link
          href="/admin/registrations"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all group block"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium text-[11px] uppercase tracking-wider text-slate-500 font-mono">
              Registered Attendees
            </span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-[#234679] transition-colors" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {registrations.length}
            </span>
            <span className="text-xs font-medium text-emerald-600 font-mono">
              {checkInRate}% checked-in
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
            <div style={{ width: `${checkInRate}%` }} className="bg-[#234679] h-full" />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{checkedInCount} verified badges</span>
            <span>{registrations.length - checkedInCount} pending</span>
          </div>
        </Link>

        {/* Card 4: Inquiries & Leads */}
        <Link
          href="/admin/inquiries"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all group block"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium text-[11px] uppercase tracking-wider text-slate-500 font-mono">
              Inquiries & Leads
            </span>
            <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {inquiries.length}
            </span>
            {pendingInquiries > 0 ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {pendingInquiries} new
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-600">
                All resolved
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
            <div
              style={{
                width: `${inquiries.length ? Math.round(((inquiries.length - pendingInquiries) / inquiries.length) * 100) : 100}%`,
              }}
              className="bg-amber-500 h-full"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{inquiries.filter((i: any) => i.status === "Resolved").length} resolved</span>
            <span className="text-slate-400 font-mono text-[10px]">Response desk</span>
          </div>
        </Link>
      </div>

      {/* Main 2-Column Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Venue Space + Recent Activity */}
        <div className="lg:col-span-7 space-y-5">
          {/* Hall & Space Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#218A59]" />
                <h3 className="font-semibold text-sm text-slate-900">
                  Hall & Venue Allocation
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Link
                  href="/admin/floor-plan"
                  className="text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
                >
                  <span>Floor Plan</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <Link
                  href="/admin/stalls"
                  className="text-[#218A59] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Hall Rows */}
            <div className="mt-4 space-y-3.5">
              {/* Hall A */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">
                    Hall A · Turbines & Heavy OEM
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-slate-600">
                    {hallA.booked + hallA.reserved} / {hallA.total} stalls ({hallA.pct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div style={{ width: `${hallA.pct}%` }} className="bg-[#218A59] h-full" />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{hallA.booked} booked · {hallA.reserved} reserved</span>
                  <span className="text-[#218A59] font-medium">{hallA.available} open</span>
                </div>
              </div>

              {/* Hall B */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">
                    Hall B · Electrical, Grid & Storage
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-slate-600">
                    {hallB.booked + hallB.reserved} / {hallB.total} stalls ({hallB.pct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div style={{ width: `${hallB.pct}%` }} className="bg-[#234679] h-full" />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{hallB.booked} booked · {hallB.reserved} reserved</span>
                  <span className="text-[#234679] font-medium">{hallB.available} open</span>
                </div>
              </div>

              {/* Hall C / Block C */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">
                    Block C · Bare Space Pavilion
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-slate-600">
                    {hallC.booked + hallC.reserved} / {hallC.total} stalls ({hallC.pct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div style={{ width: `${hallC.pct}%` }} className="bg-cyan-600 h-full" />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{hallC.booked} booked · {hallC.reserved} reserved</span>
                  <span className="text-cyan-600 font-medium">{hallC.available} open</span>
                </div>
              </div>

              {/* Outdoor */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">
                    Outdoor & Special · Hydro & Food Arena
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-slate-600">
                    {outdoor.booked + outdoor.reserved} / {outdoor.total} stalls ({outdoor.pct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div style={{ width: `${outdoor.pct}%` }} className="bg-amber-500 h-full" />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{outdoor.booked} booked · {outdoor.reserved} reserved</span>
                  <span className="text-amber-600 font-medium">{outdoor.available} open</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-600" />
                <h3 className="font-semibold text-sm text-slate-900">
                  Recent Activity
                </h3>
              </div>

              {/* Segmented Filter & Search */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="pl-7 pr-2 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59] focus:bg-white w-28 sm:w-36"
                  />
                </div>

                <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200">
                  <button
                    onClick={() => setActivityTab("all")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      activityTab === "all"
                        ? "bg-white text-slate-900 shadow-xs font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActivityTab("registrations")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      activityTab === "registrations"
                        ? "bg-white text-slate-900 shadow-xs font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Attendees
                  </button>
                  <button
                    onClick={() => setActivityTab("inquiries")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      activityTab === "inquiries"
                        ? "bg-white text-slate-900 shadow-xs font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Inquiries
                  </button>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 text-xs mt-1">
              {/* Attendee rows */}
              {(activityTab === "all" || activityTab === "registrations") &&
                filteredRegistrations.slice(0, activityTab === "registrations" ? 8 : 4).map((reg: any) => (
                  <div
                    key={reg.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors px-1 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 truncate">
                          {reg.name}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 shrink-0">
                          {reg.passType?.replace(/\(Free\)/, "").trim() || "Visitor"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {reg.organization || "Independent"} · {reg.country || "Nepal"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleCheckin(reg.id, reg.checkedIn)}
                        disabled={actionInProgress === reg.id}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
                          reg.checkedIn
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                        title="Toggle attendee check-in status"
                      >
                        {actionInProgress === reg.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : reg.checkedIn ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{reg.checkedIn ? "Checked In" : "Check In"}</span>
                      </button>
                    </div>
                  </div>
                ))}

              {/* Inquiry rows */}
              {(activityTab === "all" || activityTab === "inquiries") &&
                filteredInquiries.slice(0, activityTab === "inquiries" ? 8 : 3).map((inq: any) => (
                  <div
                    key={inq.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors px-1 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 truncate">
                          {inq.company || inq.name}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 shrink-0">
                          Inquiry
                        </span>
                        {inq.stallInterest && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-mono">
                            Stall {inq.stallInterest}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {inq.subject}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {inq.status === "New" && (
                        <button
                          onClick={() => handleUpdateInquiry(inq.id, "In Progress")}
                          disabled={actionInProgress === inq.id}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                        >
                          Review
                        </button>
                      )}
                      {inq.status === "In Progress" && (
                        <button
                          onClick={() => handleUpdateInquiry(inq.id, "Resolved")}
                          disabled={actionInProgress === inq.id}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                          inq.status === "New"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : inq.status === "In Progress"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {inq.status}
                      </span>
                    </div>
                  </div>
                ))}

              {filteredRegistrations.length === 0 && filteredInquiries.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No activity found matching your criteria.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] text-slate-400">
                Synced at {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <div className="flex items-center gap-4 text-[11px] font-medium">
                <Link
                  href="/admin/registrations"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  All Attendees →
                </Link>
                <Link
                  href="/admin/inquiries"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  All Inquiries →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Quick Directory & Event Info */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick Management Directory */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5">
            <h3 className="font-semibold text-sm text-slate-900 pb-3 border-b border-slate-100">
              Content & Modules
            </h3>
            <div className="divide-y divide-slate-100">
              <Link
                href="/admin/exhibitors"
                className="py-2.5 flex items-center justify-between hover:text-[#218A59] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-[#218A59]/10 group-hover:text-[#218A59] transition-colors">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-800 group-hover:text-[#218A59]">
                    Exhibitors Directory
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <span>{exhibitorsData.length}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </Link>

              <Link
                href="/admin/conference"
                className="py-2.5 flex items-center justify-between hover:text-[#234679] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-[#234679]/10 group-hover:text-[#234679] transition-colors">
                    <CalendarDays className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-800 group-hover:text-[#234679]">
                    Conference Sessions
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <span>{conferenceSessionsData.length}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </Link>

              <Link
                href="/admin/sponsors"
                className="py-2.5 flex items-center justify-between hover:text-amber-600 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-800 group-hover:text-amber-600">
                    Sponsors & Partners
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <span>{sponsorsData.reduce((acc, cat) => acc + (cat.sponsors?.length || 0), 0)}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </Link>

              <Link
                href="/admin/speakers"
                className="py-2.5 flex items-center justify-between hover:text-purple-600 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-800 group-hover:text-purple-600">
                    Organization Members (IPPAN & Team)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <span>{speakersData.length}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </Link>

              <Link
                href="/admin/news"
                className="py-2.5 flex items-center justify-between hover:text-[#218A59] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-[#218A59]/10 group-hover:text-[#218A59] transition-colors">
                    <Newspaper className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-800 group-hover:text-[#218A59]">
                    News & Announcements
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <span>{totalNews}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </Link>

              <Link
                href="/admin/badge-designer"
                className="py-2.5 flex items-center justify-between hover:text-slate-900 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900 transition-colors">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-800 group-hover:text-slate-900">
                    Badge Designer
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <span>2 templates</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </Link>
            </div>
          </div>

          {/* Event Metadata & Settings Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-900">Event Details</span>
              <Link
                href="/admin/settings"
                className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
              >
                <Settings className="w-3 h-3" />
                <span>Settings</span>
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Event Name
                </span>
                <span className="font-medium text-slate-800">
                  {data?.settings?.eventName || "Himalayan Green Energy Expo Nepal 2027"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Dates & Schedule
                </span>
                <span className="font-medium text-slate-800">
                  {data?.settings?.eventDates || "Magh 3 – 5 · 17–19 Jan 2027"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Venue Location
                </span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{data?.settings?.venue || "BHRIKUTIMANDAP · KATHMANDU, NEPAL"}</span>
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Forex Peg</span>
                <span className="font-mono font-medium text-slate-700">
                  1 USD = {exchangeRate} NPR
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

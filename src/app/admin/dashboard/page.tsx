"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { boothsData } from "@/data/booths";
import { exhibitorsData } from "@/data/exhibitors";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activityTab, setActivityTab] = useState<"all" | "registrations" | "inquiries">("all");

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/data");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.warn("Failed to fetch admin data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const mergedBooths = boothsData.map((b) => {
    const override = data?.boothOverrides?.[b.number];
    return override ? { ...b, ...override } : b;
  });

  const bookedCount = mergedBooths.filter((b) => b.status === "Booked").length;
  const reservedCount = mergedBooths.filter((b) => b.status === "Reserved").length;
  const availableCount = mergedBooths.filter((b) => b.status === "Available").length;
  const totalStalls = mergedBooths.length || 1;
  const bookedPct = Math.round((bookedCount / totalStalls) * 100);
  const reservedPct = Math.round((reservedCount / totalStalls) * 100);

  const registrations = data?.registrations || [];
  const inquiries = data?.inquiries || [];
  const checkedInCount = registrations.filter((r: any) => r.checkedIn).length;
  const pendingInquiries = inquiries.filter((i: any) => i.status === "New").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans transition-colors duration-300">
      {/* Dashboard Section Header matching Public Face Hero */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-black/[0.08] dark:border-white/10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#218A59]/10 text-[#218A59] dark:bg-[#25C176]/15 dark:text-[#25C176] border border-[#218A59]/20 font-mono text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#218A59] dark:bg-[#25C176] animate-pulse" />
            <span>ORGANIZER COMMAND CENTER</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-gray-900 dark:text-white tracking-tight">
            EXPO <span className="text-[#234679] dark:text-[#6FA0E8]">EXECUTIVE</span>{" "}
            <span className="text-[#218A59] dark:text-[#25C176]">DASHBOARD</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans">
            Himalayan Green Energy Expo · Bhrikutimandap Exhibition Complex, Kathmandu
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            title="Refresh Live Metrics"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.06] dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs text-gray-700 dark:text-slate-300 transition-colors font-mono font-bold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#218A59] dark:text-[#25C176]" : ""}`} />
            <span>SYNC DATA</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards with Public Face Fonts & Gradients */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Stall Bookings */}
        <Link
          href="/admin/stalls"
          className="p-5 rounded-2xl bg-white dark:bg-[#0A1220]/90 border border-black/[0.08] dark:border-white/10 hover:border-[#218A59]/40 hover:shadow-lg transition-all duration-300 group block shadow-sm backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#234679] dark:text-[#6FA0E8] uppercase tracking-wider">
              Stall Allocation
            </span>
            <div className="p-2 rounded-xl bg-[#218A59]/10 text-[#218A59] dark:bg-[#25C176]/15 dark:text-[#25C176]">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight mt-3 group-hover:text-[#218A59] dark:group-hover:text-[#25C176] transition-colors">
            {bookedPct}%
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
            {bookedCount} booked · {availableCount} open
          </div>
        </Link>

        {/* Attendees */}
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
          <div className="text-2xl sm:text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight mt-3 group-hover:text-[#234679] dark:group-hover:text-[#6FA0E8] transition-colors">
            {registrations.length}
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
            {checkedInCount} verified check-ins
          </div>
        </Link>

        {/* Exhibitors */}
        <Link
          href="/admin/exhibitors"
          className="p-5 rounded-2xl bg-white dark:bg-[#0A1220]/90 border border-black/[0.08] dark:border-white/10 hover:border-[#218A59]/40 hover:shadow-lg transition-all duration-300 group block shadow-sm backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#234679] dark:text-[#6FA0E8] uppercase tracking-wider">
              Exhibitor OEMs
            </span>
            <div className="p-2 rounded-xl bg-[#218A59]/10 text-[#218A59] dark:bg-[#25C176]/15 dark:text-[#25C176]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight mt-3 group-hover:text-[#218A59] dark:group-hover:text-[#25C176] transition-colors">
            {exhibitorsData.length}
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
            12 partner nations
          </div>
        </Link>

        {/* Inquiries */}
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
          <div className="text-2xl sm:text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight mt-3 group-hover:text-amber-500 transition-colors">
            {inquiries.length}
          </div>
          <div className="text-[11px] font-mono mt-1 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
            {pendingInquiries > 0 ? (
              <span className="text-amber-500 font-bold">{pendingInquiries} new to review</span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">All inquiries resolved</span>
            )}
          </div>
        </Link>
      </div>

      {/* Exhibition Floor Status Overview */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0A1220]/90 border border-black/[0.08] dark:border-white/10 shadow-sm space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#218A59] dark:text-[#25C176]" />
            <div className="font-display font-bold text-xs sm:text-sm text-gray-900 dark:text-white tracking-wider uppercase">
              Exhibition Hall Floor Allocation
            </div>
          </div>
          <Link
            href="/admin/stalls"
            className="text-xs font-mono font-bold text-[#218A59] dark:text-[#25C176] hover:underline flex items-center gap-1 transition-colors uppercase"
          >
            <span>Manage Stalls</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Brand Gradient Progress Bar */}
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

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono pt-1">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#218A59]" />
              <span className="font-semibold text-gray-800 dark:text-slate-200">Booked ({bookedCount})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#234679] dark:bg-[#4A7EC7]" />
              <span className="font-semibold text-gray-800 dark:text-slate-200">Reserved ({reservedCount})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-black/15 dark:bg-white/20" />
              <span>Available ({availableCount})</span>
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            Total {mergedBooths.length} Stalls
          </span>
        </div>
      </div>

      {/* Activity Feed matching Public Face styling */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0A1220]/90 border border-black/[0.08] dark:border-white/10 shadow-sm space-y-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-black/[0.06] dark:border-white/10">
          <div className="font-display font-bold text-xs sm:text-sm text-gray-900 dark:text-white tracking-wider uppercase">
            Recent Activity & Incoming Leads
          </div>

          {/* Clean Segmented Tabs */}
          <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-xl">
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
              ATTENDEES
            </button>
            <button
              onClick={() => setActivityTab("inquiries")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activityTab === "inquiries"
                  ? "bg-gradient-to-r from-[#5B9F35] to-[#218A59] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              INQUIRIES
            </button>
          </div>
        </div>

        {/* Activity Items List */}
        <div className="divide-y divide-black/[0.05] dark:divide-white/[0.06] text-xs">
          {/* Registrations */}
          {(activityTab === "all" || activityTab === "registrations") &&
            registrations.slice(0, activityTab === "registrations" ? 8 : 4).map((reg: any) => (
              <div
                key={reg.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors px-2 rounded-xl"
              >
                <div className="truncate">
                  <span className="font-semibold text-gray-900 dark:text-white block truncate font-sans">
                    {reg.name}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {reg.organization} · {reg.passType}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">
                    {reg.id}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      reg.checkedIn
                        ? "text-[#218A59] dark:text-[#25C176] bg-[#218A59]/10 border border-[#218A59]/20"
                        : "text-slate-500 dark:text-slate-400 bg-black/5 dark:bg-white/10"
                    }`}
                  >
                    {reg.checkedIn ? "Checked In" : "Pending"}
                  </span>
                </div>
              </div>
            ))}

          {/* Inquiries */}
          {(activityTab === "all" || activityTab === "inquiries") &&
            inquiries.slice(0, activityTab === "inquiries" ? 8 : 3).map((inq: any) => (
              <div
                key={inq.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors px-2 rounded-xl"
              >
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white truncate font-sans">
                      {inq.company || inq.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#234679] dark:text-[#6FA0E8] font-bold">
                      INQUIRY
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {inq.subject}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
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

        {/* Footer links */}
        <div className="pt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono border-t border-black/[0.06] dark:border-white/10">
          <Link
            href="/admin/registrations"
            className="hover:text-[#218A59] dark:hover:text-[#25C176] transition-colors font-bold uppercase"
          >
            VIEW ALL ATTENDEES →
          </Link>
          <Link
            href="/admin/inquiries"
            className="hover:text-[#218A59] dark:hover:text-[#25C176] transition-colors font-bold uppercase"
          >
            OPEN INQUIRIES CRM →
          </Link>
        </div>
      </div>
    </div>
  );
}

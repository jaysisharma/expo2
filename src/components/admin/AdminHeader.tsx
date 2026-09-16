"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Bell,
  Search,
  Plus,
  Store,
  Users,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useAdminAuth } from "./AdminAuthContext";

export default function AdminHeader({
  onOpenMobileMenu,
  onGlobalSearch,
}: {
  onOpenMobileMenu: () => void;
  onGlobalSearch?: (query: string) => void;
  title?: string;
}) {
  const { user } = useAdminAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [liveSettings, setLiveSettings] = useState<any>(null);
  const [dynamicNotifications, setDynamicNotifications] = useState<
    Array<{ id: string; title: string; desc: string; time: string; link?: string }>
  >([]);

  React.useEffect(() => {
    async function loadHeaderData() {
      try {
        const res = await fetch("/api/admin/data");
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.settings) {
            setLiveSettings(json.data.settings);
          }
          const notifs: Array<{ id: string; title: string; desc: string; time: string; link?: string }> = [];

          // New inquiries
          const newInqs = (json.data.inquiries || []).filter((i: any) => i.status === "New");
          newInqs.slice(0, 3).forEach((i: any) => {
            notifs.push({
              id: `inq-${i.id}`,
              title: `New Inquiry: ${i.company || i.name}`,
              desc: i.subject || "General inquiry received",
              time: "Action Needed",
              link: "/admin/inquiries",
            });
          });

          // Recent registrations
          const recentRegs = (json.data.registrations || []).slice(0, 3);
          recentRegs.forEach((r: any) => {
            notifs.push({
              id: `reg-${r.id}`,
              title: `${r.passType || "Visitor"}: ${r.name}`,
              desc: `${r.organization || "Independent"} · ${r.country || "Nepal"}`,
              time: r.checkedIn ? "Checked In" : "Registered",
              link: "/admin/registrations",
            });
          });

          // Recent booked booths
          const overrides = json.data.boothOverrides || {};
          Object.keys(overrides)
            .filter((k) => overrides[k].status === "Booked")
            .slice(0, 2)
            .forEach((k) => {
              notifs.push({
                id: `booth-${k}`,
                title: `Stall ${k} Confirmed`,
                desc: overrides[k].exhibitorName ? `Exhibitor: ${overrides[k].exhibitorName}` : "Booked",
                time: "Allocated",
                link: "/admin/stalls",
              });
            });

          setDynamicNotifications(notifs);
        }
      } catch (e) {}
    }

    loadHeaderData();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onGlobalSearch) {
      onGlobalSearch(e.target.value);
    }
  };

  const notifications = dynamicNotifications.length > 0 ? dynamicNotifications : [
    {
      id: "1",
      title: "New Stall Inquiry: Siemens Energy",
      desc: "Requested 36m² Island Stall A-105.",
      time: "15m ago",
      link: "/admin/inquiries",
    },
    {
      id: "2",
      title: "VIP Delegate Registered: NEA",
      desc: "Sunita Adhikari registered as VIP.",
      time: "1h ago",
      link: "/admin/registrations",
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between font-sans transition-colors duration-200 shadow-xs">
      {/* Top subtle glow line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#5B9F35] via-[#25C176] to-[#234679]" />

      {/* Left Area: Mobile toggle & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors cursor-pointer"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder="Search stalls, attendees, sponsors..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#218A59] focus:ring-1 focus:ring-[#218A59]/30 transition-all font-sans font-medium"
          />
        </div>
      </div>

      {/* Right Area: Event Dates & Actions */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Confirmed Date Badge */}
        <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#218A59]/10 text-[#218A59] border border-[#218A59]/20 font-mono text-[11px] font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#218A59] animate-pulse" />
          <span>{liveSettings?.eventDates?.toUpperCase() || "MAGH 2 - 4 · 16–18 JAN 2027"}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#218A59] ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 space-y-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-display font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Live Notifications
                </span>
                <span className="text-[10px] font-mono font-bold text-[#218A59]">
                  {notifications.length} Updates
                </span>
              </div>
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link || "/admin/dashboard"}
                    onClick={() => setShowNotifications(false)}
                    className="block p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 space-y-1 transition-colors"
                  >
                    <div className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                      <span className="truncate">{n.title}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shrink-0 ml-1">
                        {n.time}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">
                      {n.desc}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#5B9F35] to-[#218A59] hover:brightness-105 text-white text-xs font-bold tracking-wide shadow-md shadow-[#218A59]/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">QUICK ACTION</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 space-y-1 z-50">
              <Link
                href="/admin/stalls"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Reserve Stall</span>
              </Link>
              <Link
                href="/admin/registrations"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                <Users className="w-4 h-4 text-sky-600" />
                <span>Register Delegate</span>
              </Link>
              <Link
                href="/admin/badge-designer"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Print QR Badges</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

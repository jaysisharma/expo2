"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Users,
  Building2,
  CalendarDays,
  Newspaper,
  Award,
  MessageSquareQuote,
  Sliders,
  Compass,
  Settings,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAdminAuth } from "./AdminAuthContext";

interface NavLinkItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface NavGroup {
  group: string;
  items: NavLinkItem[];
}

export default function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  const navGroups: NavGroup[] = [
    {
      group: "Overview",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      group: "Exhibition",
      items: [
        { label: "Stalls & Booths", href: "/admin/stalls", icon: Store },
        { label: "Floor Plan Map", href: "/admin/floor-plan", icon: Compass },
        { label: "Badge Designer", href: "/admin/badge-designer", icon: Sliders },
      ],
    },
    {
      group: "Participants",
      items: [
        { label: "Registrations", href: "/admin/registrations", icon: Users },
        { label: "Exhibitors", href: "/admin/exhibitors", icon: Building2 },
        { label: "Committee & Team", href: "/admin/speakers", icon: Users },
        { label: "Conference Schedule", href: "/admin/conference", icon: CalendarDays },
        { label: "Sponsors & Partners", href: "/admin/sponsors", icon: Award },
      ],
    },
    {
      group: "Communication",
      items: [
        { label: "News & Articles", href: "/admin/news", icon: Newspaper },
        { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquareQuote },
      ],
    },
    {
      group: "System",
      items: [
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const handleLinkClick = () => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar in Crisp Light Theme */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 text-slate-700 font-sans transition-all duration-300 select-none shadow-sm ${
          isCollapsed ? "w-16" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Luminous Top Gradient Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#5B9F35] via-[#25C176] to-[#234679]" />

        {/* Brand Header */}
        <div className="h-16 px-3.5 flex items-center justify-between border-b border-slate-100">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2.5 overflow-hidden group"
            onClick={handleLinkClick}
          >
            <div className="relative w-8 h-8 shrink-0 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Image
                src="/images/logo.png"
                alt="Expo Logo"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-display font-black text-xs text-slate-900 tracking-tight uppercase">
                  Expo Admin
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[#218A59] tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#218A59] animate-pulse" />
                  Kathmandu 2027
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-mono font-bold text-[#234679] uppercase tracking-wider">
                  {group.group}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    title={isCollapsed ? item.label : undefined}
                    className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-[#5B9F35] to-[#218A59] text-white shadow-md shadow-[#218A59]/20 font-bold"
                        : "text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 font-medium"
                    } ${isCollapsed ? "justify-center" : "justify-between"}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-[#234679] group-hover:text-[#218A59]"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate font-sans tracking-normal">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          <Link
            href="/"
            target="_blank"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold text-[#218A59] hover:bg-[#218A59]/10 transition-colors ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
            title="Public Website"
          >
            <div className="flex items-center gap-2 truncate">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              {!isCollapsed && <span className="truncate uppercase tracking-wider">Public Site ↗</span>}
            </div>
          </Link>

          <div
            className={`flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5B9F35] to-[#218A59] text-white text-xs font-bold font-display flex items-center justify-center shrink-0 shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs text-slate-900 font-bold truncate font-sans">
                    {user?.name || "Admin"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 truncate">
                    Expo Team
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

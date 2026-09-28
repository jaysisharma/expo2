"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/AdminAuthContext";
import { AdminThemeProvider } from "@/components/admin/AdminThemeContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on /admin/login or /admin/register, never block or redirect
  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/register";

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && !isAuthPage) {
      const target = pathname === "/admin" ? "/admin/dashboard" : (pathname || "/admin/dashboard");
      router.replace(`/admin/login?from=${encodeURIComponent(target)}`);
    }
  }, [isLoading, isAuthenticated, isAuthPage, pathname, router]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  // If still verifying authentication (with max fallback)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#218A59] border-t-transparent animate-spin" />
        <span className="text-xs text-slate-600 font-mono font-medium">Verifying organizer access...</span>
      </div>
    );
  }

  // If not authenticated, show blank or transition while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#218A59] border-t-transparent animate-spin" />
        <span className="text-xs text-slate-500 font-mono">Redirecting to login...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 transition-colors duration-200 relative overflow-x-hidden">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 relative z-10 ${
          isCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        <AdminHeader onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminThemeProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </AdminThemeProvider>
    </AdminAuthProvider>
  );
}

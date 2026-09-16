"use client";

import React, { useState, useEffect } from "react";
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

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#218A59] dark:border-[#25C176] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-x-hidden">
      {/* Subtle ambient lighting orbs in dark mode */}
      <div className="hidden dark:block absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#218A59]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden dark:block absolute bottom-1/3 left-10 w-[450px] h-[450px] bg-[#234679]/10 rounded-full blur-3xl pointer-events-none" />

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

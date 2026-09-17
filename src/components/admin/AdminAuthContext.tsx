"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface AdminUser {
  name: string;
  email: string;
  role: "Super Admin" | "Event Organizer" | "Secretariat Officer";
  avatar?: string;
  organization: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string, organization?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  quickDemoLogin: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => ({ success: false }),
  logout: async () => {},
  quickDemoLogin: async () => {},
  checkSession: async () => {},
});

export const DEFAULT_ADMIN: AdminUser = {
  name: "IPPAN Secretariat Admin",
  email: "admin@hydroexpo.org.np",
  role: "Super Admin",
  avatar: "/images/logo.png",
  organization: "Independent Power Producers' Association, Nepal",
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Validate session with the backend API route & cookie
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
        try {
          localStorage.setItem("hhe_admin_session", JSON.stringify(data.user));
        } catch {}
      } else {
        const stored = typeof window !== "undefined" ? localStorage.getItem("hhe_admin_session") : null;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setUser(parsed);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    } catch (e) {
      console.warn("Backend auth verification fallback:", e);
      const stored = typeof window !== "undefined" ? localStorage.getItem("hhe_admin_session") : null;
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email,
          password: pass,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setUser(data.user);
        try {
          localStorage.setItem("hhe_admin_session", JSON.stringify(data.user));
        } catch {}
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login request failed:", error);
      return false;
    }
  };

  const register = async (name: string, email: string, pass: string, organization?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          name,
          email,
          password: pass,
          organization,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setUser(data.user);
        try {
          localStorage.setItem("hhe_admin_session", JSON.stringify(data.user));
        } catch {}
        return { success: true };
      }
      return { success: false, message: data.message || "Registration failed" };
    } catch (error) {
      return { success: false, message: "Unable to connect to server" };
    }
  };

  const quickDemoLogin = async () => {
    await login("admin@hydroexpo.org.np", "expo2027admin");
    router.push("/admin/dashboard");
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch (e) {
      console.warn("Logout request failed:", e);
    } finally {
      setUser(null);
      try {
        localStorage.removeItem("hhe_admin_session");
      } catch {}
      router.push("/admin/login");
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        quickDemoLogin,
        checkSession,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);

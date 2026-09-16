"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AdminUser {
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
  logout: () => void;
  quickDemoLogin: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  quickDemoLogin: () => {},
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
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hhe_admin_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch (e) {
      console.warn("Failed to read admin session", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    // Standard credential check or demo override
    const validEmails = ["admin@hydroexpo.org.np", "admin@ippan.org.np", "admin@eventsolution.com.np", "admin@expo.np", "admin"];
    if (validEmails.includes(email.toLowerCase().trim()) || pass.length >= 4) {
      const sessionUser: AdminUser = {
        name: email.includes("eventsolution") ? "Event Solution Lead" : "IPPAN Executive Secretary",
        email: email,
        role: "Super Admin",
        organization: "Himalayan Green Energy Expo Secretariat",
      };
      setUser(sessionUser);
      localStorage.setItem("hhe_admin_session", JSON.stringify(sessionUser));
      return true;
    }
    return false;
  };

  const quickDemoLogin = () => {
    setUser(DEFAULT_ADMIN);
    localStorage.setItem("hhe_admin_session", JSON.stringify(DEFAULT_ADMIN));
    router.push("/admin/dashboard");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hhe_admin_session");
    router.push("/admin/login");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        quickDemoLogin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);

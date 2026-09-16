"use client";

import React, { createContext, useContext } from "react";
import { useTheme } from "@/components/ThemeProvider";

type Theme = "dark" | "light";

interface AdminThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, toggle, setTheme } = useTheme();

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme: toggle, setTheme }}>
      <div
        data-theme={theme}
        className={`${theme === "dark" ? "dark " : ""}admin-portal w-full min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-300`}
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export const useAdminTheme = () => useContext(AdminThemeContext);

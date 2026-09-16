'use client';

import { useEffect, useState, createContext, useContext } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggle: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  const applyTheme = (targetTheme: Theme) => {
    setTheme(targetTheme);
    document.documentElement.setAttribute('data-theme', targetTheme);
    document.documentElement.classList.toggle('dark', targetTheme === 'dark');
    try {
      localStorage.setItem('theme', targetTheme);
    } catch (e) {}
  };

  // On mount: read from localStorage or OS preference safely
  useEffect(() => {
    let initial: Theme = 'light';
    try {
      const stored = localStorage.getItem('theme') as Theme | null;
      if (stored === 'light' || stored === 'dark') {
        initial = stored;
      } else if (typeof window !== 'undefined' && window.matchMedia) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        initial = prefersDark ? 'dark' : 'light';
      }
    } catch (e) {
      // Fallback for sandboxed iframes or private browsing
      initial = 'light';
    }
    applyTheme(initial);
  }, []);

  const toggle = () => {
    applyTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme: applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

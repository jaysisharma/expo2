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

  // On mount: read from localStorage, default to 'light'
  useEffect(() => {
    let initial: Theme = 'light';
    try {
      const stored = localStorage.getItem('theme') as Theme | null;
      if (stored === 'dark') {
        initial = 'dark';
      } else {
        initial = 'light';
      }
    } catch (e) {
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

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {}, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme: "dark", toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: "dark" as Theme, toggleTheme: () => {} };
  return ctx;
}

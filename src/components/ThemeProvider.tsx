"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "minimal" | "dark-academia" | "cottagecore";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("minimal");

  useEffect(() => {
    // Only run on client
    const savedTheme = localStorage.getItem("yuniverse-theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Fix issue 2: Remove ALL existing theme classes to prevent stacking and mismatches
    document.documentElement.classList.remove("minimal", "dark-academia", "cottagecore");
    
    // Apply only the newly selected theme class
    document.documentElement.classList.add(theme);

    // Also update data-theme for safety/compatibility
    document.documentElement.setAttribute("data-theme", theme);
    
    localStorage.setItem("yuniverse-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, defaultTheme = "system" }: { children: React.ReactNode, defaultTheme?: Theme }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme || defaultTheme;
    setThemeState(savedTheme);
  }, [defaultTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let activeTheme: "dark" | "light" = "light";

    if (theme === "system") {
      activeTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      activeTheme = theme as "dark" | "light";
    }

    setResolvedTheme(activeTheme);
    root.classList.add(activeTheme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Handle system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const activeTheme = mediaQuery.matches ? "dark" : "light";
      setResolvedTheme(activeTheme);
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(activeTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

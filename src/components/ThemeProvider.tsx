"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

/**
 * ThemeProvider
 *
 * - controls Tailwind dark class on <html>
 * - dynamically loads the PrimeReact theme CSS by adding/updating a <link id="primereact-theme" ...>
 *
 * Note: pick theme names you like; here we use lara-light-blue and lara-dark-blue as examples.
 */
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize theme synchronously to avoid mount mismatches
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved as Theme;
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    }
    return "light";
  });

  useEffect(() => {
    // apply Tailwind dark class to root element
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // persist selection
    localStorage.setItem("theme", theme);

    // Manage PrimeReact theme css link
    const themeLinkId = "primereact-theme";
    const existing = document.getElementById(
      themeLinkId
    ) as HTMLLinkElement | null;

    // Choose the PrimeReact theme files you want:
    const themeMap: Record<Theme, string> = {
      light:
        "https://unpkg.com/primereact/resources/themes/lara-light-blue/theme.css",
      dark: "https://unpkg.com/primereact/resources/themes/lara-dark-blue/theme.css",
    };

    const href = themeMap[theme];

    if (existing) {
      if (existing.getAttribute("href") !== href) {
        existing.setAttribute("href", href);
      }
    } else {
      const link = document.createElement("link");
      link.id = themeLinkId;
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggle = () => setThemeState((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
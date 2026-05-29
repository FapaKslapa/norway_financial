"use client";

import { useServerInsertedHTML } from "next/navigation";
import type * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

export const ACCENTS = [
  {
    id: "blue",
    name: "Apple Blue",
    primary: "#007aff",
    hover: "#0066d6",
    light: "#3395ff",
  },
  {
    id: "green",
    name: "Emerald Green",
    primary: "#34c759",
    hover: "#28a745",
    light: "#5cd67d",
  },
  {
    id: "purple",
    name: "Royal Purple",
    primary: "#af52de",
    hover: "#9333ea",
    light: "#c084fc",
  },
  {
    id: "orange",
    name: "Sunset Orange",
    primary: "#ff9500",
    hover: "#e07b00",
    light: "#ffb033",
  },
  {
    id: "red",
    name: "Crimson Red",
    primary: "#ff3b30",
    hover: "#d62828",
    light: "#ff6659",
  },
];

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  accent: string;
  setAccent: (accent: string) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      if (savedTheme) return savedTheme;
      if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        return "light";
      }
    }
    return "dark";
  });
  const [accent, setAccent] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme-accent") || "blue";
    }
    return "blue";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.style.colorScheme = "dark";
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const selectedAccent = ACCENTS.find((a) => a.id === accent) || ACCENTS[0];
    root.style.setProperty("--color-blue-500", selectedAccent.primary);
    root.style.setProperty("--color-blue-600", selectedAccent.hover);
    root.style.setProperty("--color-blue-400", selectedAccent.light);
    root.style.setProperty("--apple-blue", selectedAccent.primary);
    localStorage.setItem("theme-accent", accent);
  }, [accent]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme, accent, setAccent }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

export function ThemeScript() {
  useServerInsertedHTML(() => {
    return (
      <script
        id="theme-initializer"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: inline blocking script to prevent theme flashing
        dangerouslySetInnerHTML={{
          __html: `
            try {
              var theme = localStorage.getItem('theme');
              var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              var activeTheme = theme || systemTheme;
              if (activeTheme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
                document.documentElement.style.colorScheme = 'dark';
              } else {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';
              }
              
              var accent = localStorage.getItem('theme-accent') || 'blue';
              var primaryColor = '#007aff';
              var hoverColor = '#0066d6';
              var lightColor = '#3395ff';
              if (accent === 'green') {
                primaryColor = '#34c759'; hoverColor = '#28a745'; lightColor = '#5cd67d';
              } else if (accent === 'purple') {
                primaryColor = '#af52de'; hoverColor = '#9333ea'; lightColor = '#c084fc';
              } else if (accent === 'orange') {
                primaryColor = '#ff9500'; hoverColor = '#e07b00'; lightColor = '#ffb033';
              } else if (accent === 'red') {
                primaryColor = '#ff3b30'; hoverColor = '#d62828'; lightColor = '#ff6659';
              }
              document.documentElement.style.setProperty('--color-blue-500', primaryColor);
              document.documentElement.style.setProperty('--color-blue-600', hoverColor);
              document.documentElement.style.setProperty('--color-blue-400', lightColor);
              document.documentElement.style.setProperty('--apple-blue', primaryColor);
            } catch (e) {}
          `,
        }}
      />
    );
  });
  return null;
}

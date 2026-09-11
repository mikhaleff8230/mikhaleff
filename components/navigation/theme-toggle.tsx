"use client";

import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "mikhaleff-theme";

export function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme}
      aria-label="Switch between dark and light mode" title="Switch color theme">
      <Sun className="theme-toggle__sun" aria-hidden="true" />
      <Moon className="theme-toggle__moon" aria-hidden="true" />
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({ className = "", variant = "default", iconOnly = false }: { className?: string; variant?: "default" | "sidebar"; iconOnly?: boolean }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const initial = getInitialTheme();
      setTheme(initial);
      document.documentElement.classList.toggle("dark", initial === "dark");
      setMounted(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem("theme", next);
  }

  const styles =
    variant === "sidebar"
      ? "border-sidebar-border bg-white/5 text-sidebar-foreground hover:bg-white/10 focus-visible:ring-offset-sidebar"
      : "border-border bg-surface text-foreground hover:bg-surface-alt focus-visible:ring-offset-background";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode malam"}
      className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${styles} ${className}`}
    >
      {mounted && theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
      {!iconOnly ? <span>{mounted && theme === "dark" ? "Mode terang" : "Mode malam"}</span> : null}
    </button>
  );
}

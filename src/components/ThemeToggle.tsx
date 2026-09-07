"use client";

import { useLocale } from "@/components/LocaleProvider";

const COOKIE_NAME = "thepodium_theme";

// Ported from ThePodium_v5.html's toggleTheme()/applyTheme(). The cookie
// (not localStorage) is the source of truth, because layout.tsx reads it
// server-side to render the correct data-theme attribute in the initial
// HTML -- that's what avoids a flash of the wrong theme AND a hydration
// mismatch, without any client-only init script. The direct DOM mutation
// here is just for an instant toggle; no React re-render needed for it.
export function ThemeToggle() {
  const { t } = useLocale();

  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={t("switchTheme")}
      className="rounded-md border border-border px-2.5 py-1.5 text-sm text-text-muted"
    >
      <span className="theme-icon-light">☾</span>
      <span className="theme-icon-dark">☀</span>
    </button>
  );
}

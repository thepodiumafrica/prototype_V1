"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { translate, type DictKey, type Locale } from "@/lib/i18n/dictionary";
import { LOCALE_COOKIE } from "@/lib/i18n/cookie";
import { createClient } from "@/lib/supabase/client";

interface LocaleContextValue {
  locale: Locale;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

// Client-side counterpart to lib/i18n/locale.ts's getT(), for "use client"
// pages/components that can't call next/headers cookies() themselves.
// `locale` comes down from layout.tsx (a Server Component, itself reading
// the same cookie ThemeToggle uses the sibling of) so first paint is
// already correct -- toggling then updates local state immediately (so
// client-only text flips without delay) and calls router.refresh() so
// every Server Component on the page re-renders in the new language too.
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(locale);
  // React-recommended "adjust state during render" pattern (in place of a
  // useEffect) to resync when the server re-renders this with a new
  // `locale` prop -- e.g. router.refresh() after toggleLocale, or the
  // cookie changing in another tab.
  const [prevLocale, setPrevLocale] = useState(locale);
  if (locale !== prevLocale) {
    setPrevLocale(locale);
    setCurrent(locale);
  }

  const toggleLocale = useCallback(() => {
    const next: Locale = current === "en" ? "fr" : "en";
    setCurrent(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();

    // Best-effort, not awaited: the toggle itself must stay instant
    // regardless of network latency. If the visitor is signed in, this
    // also saves the choice to profiles.preferred_language so it follows
    // them to a browser/device that doesn't have this cookie yet -- see
    // proxy.ts for where that gets read back on a fresh device.
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .update({ preferred_language: next })
        .eq("id", user.id)
        .then(({ error }) => {
          if (error) console.error("preferred_language sync failed:", error.message);
        });
    });
  }, [current, router]);

  const t = useCallback(
    (key: DictKey, vars?: Record<string, string | number>) =>
      translate(current, key, vars),
    [current],
  );

  return (
    <LocaleContext.Provider value={{ locale: current, t, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale() must be used inside <LocaleProvider>");
  return ctx;
}

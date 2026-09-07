// Ported exactly from ThePodium_v5.html's ago()/fmtDate()/wc()/readTime().

import { GREETINGS } from "@/lib/constants";
import { translate, type Locale } from "@/lib/i18n/dictionary";

// Ported exactly from ThePodium_v5.html's todayGreeting(): the same
// greeting for everyone on a given UTC day, rotating through the list.
// The greeting word itself and the language name it's labelled with are
// deliberately left untranslated -- these are real African-language
// greetings shown in their own language, not English UI text.
export function todayGreeting(): [string, string] {
  return GREETINGS[Math.floor(Date.now() / 86400000) % GREETINGS.length];
}

export function ago(d: string, locale: Locale = "en"): string {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return translate(locale, "justNow");
  if (s < 3600) return translate(locale, "minAgo", { n: Math.floor(s / 60) });
  if (s < 86400) return translate(locale, "hourAgo", { n: Math.floor(s / 3600) });
  return translate(locale, "dayAgo", { n: Math.floor(s / 86400) });
}

export function fmtDate(d: string, locale: Locale = "en"): string {
  return new Date(d).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function wc(t: string): number {
  return t.trim().split(/\s+/).filter(Boolean).length;
}

export function readTime(t: string, locale: Locale = "en"): string {
  return translate(locale, "readTimeMin", { n: Math.max(1, Math.ceil(wc(t) / 200)) });
}

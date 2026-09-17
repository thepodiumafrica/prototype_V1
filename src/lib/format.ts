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

// Bare "en" alone doesn't give the day-month-year order this app has always
// used (that's US-style m/d/y) -- en-GB does. Any locale not listed here
// still works correctly, formatted under its own language code directly.
const LOCALE_TAG: Record<string, string> = { en: "en-GB", fr: "fr-FR" };
const localeFor = (locale: Locale) => LOCALE_TAG[locale] || locale;

// Single shared helper for every relative-time display, so date formatting
// can't drift out of sync with the language toggle -- ported exactly from
// ThePodium_v5.html's ago(), which settled on this Intl.RelativeTimeFormat
// config after live testing: numeric:"always" gives a plain, predictable
// count ("3 hr ago" / "il y a 3 h") -- numeric:"auto" was rejected because it
// substitutes CLDR's special day words ("yesterday", French's "avant-hier")
// inconsistently between languages. "just now" is its own case, using
// numeric:"auto" so 0 seconds reads as a word ("now"/"maintenant").
export function ago(d: string, locale: Locale = "en"): string {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  const tag = localeFor(locale);
  if (s < 60) {
    return new Intl.RelativeTimeFormat(tag, { numeric: "auto", style: "short" }).format(0, "second");
  }
  const rtf = new Intl.RelativeTimeFormat(tag, { numeric: "always", style: "short" });
  if (s < 3600) return rtf.format(-Math.floor(s / 60), "minute");
  if (s < 86400) return rtf.format(-Math.floor(s / 3600), "hour");
  return rtf.format(-Math.floor(s / 86400), "day");
}

export function fmtDate(d: string, locale: Locale = "en"): string {
  return new Intl.DateTimeFormat(localeFor(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
}

export function wc(t: string): number {
  return t.trim().split(/\s+/).filter(Boolean).length;
}

export function readTime(t: string, locale: Locale = "en"): string {
  return translate(locale, "readTimeMin", { n: Math.max(1, Math.ceil(wc(t) / 200)) });
}

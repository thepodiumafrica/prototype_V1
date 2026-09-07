import { cookies } from "next/headers";
import { translate, type DictKey, type Locale } from "@/lib/i18n/dictionary";
import { LOCALE_COOKIE } from "@/lib/i18n/cookie";

// Mirrors ThePodium_v5.html's STATE.lang persistence (there: localStorage,
// alongside STATE.theme). Here it's a cookie -- same reasoning as
// ThemeToggle's cookie: most of this app's pages are Server Components,
// so the language has to be readable server-side (via next/headers
// cookies()) to render the right text in the initial HTML, not just
// after client hydration.
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return cookieStore.get(LOCALE_COOKIE)?.value === "fr" ? "fr" : "en";
}

/** For Server Components: `const { t, locale } = await getT();` */
export async function getT() {
  const locale = await getLocale();
  const t = (key: DictKey, vars?: Record<string, string | number>) =>
    translate(locale, key, vars);
  return { locale, t };
}

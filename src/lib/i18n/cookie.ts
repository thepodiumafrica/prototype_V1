// Split out from locale.ts because that file imports next/headers
// (server-only) -- this constant needs to be importable from client
// components (LocaleProvider, LanguageToggle) too.
export const LOCALE_COOKIE = "thepodium_lang";

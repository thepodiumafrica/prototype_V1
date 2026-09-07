"use client";

import { useLocale } from "@/components/LocaleProvider";

// Ported from ThePodium_v5.html's language button in renderNav(): shows
// the language you'd switch TO ("FR" while in English, "EN" while in
// French), not the current one.
export function LanguageToggle() {
  const { locale, toggleLocale, t } = useLocale();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      title={t("switchLanguage")}
      className="rounded-md border border-border px-2.5 py-1.5 text-sm font-bold tracking-wide text-text-muted"
    >
      {locale === "en" ? "FR" : "EN"}
    </button>
  );
}

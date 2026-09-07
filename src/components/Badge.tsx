import type { UserType } from "@/lib/constants";
import { LANGS } from "@/lib/constants";
import { translate, type DictKey, type Locale } from "@/lib/i18n/dictionary";

const base =
  "inline-flex items-center rounded-[3px] border px-1.5 py-0.5 text-[10px] font-bold";

const TYPE_LABEL_KEY: Record<UserType, DictKey> = {
  news_agency: "typeNewsAgency",
  reader: "typeReader",
  blogger: "typeBlogger",
};

// Ported from ThePodium_v5.html's typeBadge().
export function TypeBadge({ type, locale = "en" }: { type: UserType; locale?: Locale }) {
  const cls =
    type === "news_agency"
      ? "text-blue bg-blue-tint border-blue-border"
      : type === "reader"
        ? "text-green bg-green-tint border-green-border"
        : "text-amber-dim bg-accent-tint border-accent-border";
  return (
    <span className={`${base} ${cls} uppercase tracking-wide`}>
      {translate(locale, TYPE_LABEL_KEY[type])}
    </span>
  );
}

// Ported from ThePodium_v5.html's badge-verified.
export function VerifiedBadge({ locale = "en" }: { locale?: Locale }) {
  return (
    <span className={`${base} text-amber bg-amber-faint border-accent-border`}>
      ✓ {translate(locale, "verified")}
    </span>
  );
}

// Ported from ThePodium_v5.html's badge-founding.
export function FoundingBadge({ locale = "en" }: { locale?: Locale }) {
  return (
    <span className={`${base} text-terra bg-terra-tint border-terra-border`}>
      ⭐ {translate(locale, "founding")}
    </span>
  );
}

const TRUST_LABEL_KEY: DictKey[] = [
  "trustNew", // index 0 is never used (levels run 1-5) but keeps indices aligned
  "trustNew",
  "trustRising",
  "trustEstablished",
  "trustTrusted",
  "trustFeatured",
];

// Ported from ThePodium_v5.html's trustBadge()/trust-N classes.
export function TrustBadge({ level, locale = "en" }: { level: number; locale?: Locale }) {
  const cls =
    level >= 5
      ? "text-terra bg-terra-tint border-terra-border"
      : level === 4
        ? "text-amber-dim bg-accent-tint border-accent-border"
        : level === 3
          ? "text-green bg-green-tint border-green-border"
          : level === 2
            ? "text-blue bg-blue-tint border-blue-border"
            : "text-gray-text bg-gray-tint border-gray-border";
  return (
    <span className={`${base} ${cls}`}>
      {translate(locale, "trustLevelLabel", {
        n: level,
        label: translate(locale, TRUST_LABEL_KEY[level] ?? "trustNew"),
      })}
    </span>
  );
}

// Ported from ThePodium_v5.html's locationBadge().
export function LocationBadge({
  africanIdentity,
  countryOrigin,
  countryResidence,
  locale = "en",
}: {
  africanIdentity: string | null;
  countryOrigin: string | null;
  countryResidence: string | null;
  locale?: Locale;
}) {
  if (africanIdentity === "diaspora") {
    return (
      <span className={`${base} text-blue bg-blue-tint border-blue-border`}>
        {translate(locale, "diasporaLabel")} · {countryResidence ?? ""}
      </span>
    );
  }
  if (africanIdentity === "continent") {
    return (
      <span className={`${base} text-green bg-green-tint border-green-border`}>
        🌍 {countryOrigin ?? translate(locale, "africaFallback")}
      </span>
    );
  }
  return null;
}

// Ported from ThePodium_v5.html's langBadge().
export function LangBadge({ lang }: { lang: string | null }) {
  if (!lang || lang === "en") return null;
  const l = LANGS.find((x) => x.id === lang);
  if (!l) return null;
  return (
    <span className={`${base} text-purple bg-purple-tint border-purple-border`}>
      {l.l}
    </span>
  );
}

const STATUS_KEY: Record<string, DictKey> = {
  published: "statusPublished",
  archived: "statusArchived",
  draft: "statusDraft",
};

// Ported from ThePodium_v5.html's badge-draft/badge-published/badge-archived.
export function StatusBadge({ status, locale = "en" }: { status: string; locale?: Locale }) {
  const cls =
    status === "published"
      ? "text-green bg-green-tint border-green-border"
      : status === "archived"
        ? "text-text-dim bg-elevated border-border"
        : "text-amber-dim bg-amber-faint border-accent-border";
  return (
    <span className={`${base} ${cls}`}>
      {translate(locale, STATUS_KEY[status] ?? "statusDraft")}
    </span>
  );
}

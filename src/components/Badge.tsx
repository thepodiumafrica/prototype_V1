import type { UserType } from "@/lib/constants";
import { TYPE_LABEL, TRUST_LABELS } from "@/lib/constants";

const base =
  "inline-flex items-center rounded-[3px] border px-1.5 py-0.5 text-[10px] font-bold";

// Ported from ThePodium_v5.html's typeBadge().
export function TypeBadge({ type }: { type: UserType }) {
  const cls =
    type === "news_agency"
      ? "text-blue bg-blue-tint border-blue-border"
      : type === "reader"
        ? "text-green bg-green-tint border-green-border"
        : "text-amber-dim bg-accent-tint border-accent-border";
  return (
    <span className={`${base} ${cls} uppercase tracking-wide`}>
      {TYPE_LABEL[type]}
    </span>
  );
}

// Ported from ThePodium_v5.html's badge-verified.
export function VerifiedBadge() {
  return (
    <span className={`${base} text-amber bg-amber-faint border-accent-border`}>
      ✓ VERIFIED
    </span>
  );
}

// Ported from ThePodium_v5.html's badge-founding.
export function FoundingBadge() {
  return (
    <span className={`${base} text-terra bg-terra-tint border-terra-border`}>
      ⭐ Founding
    </span>
  );
}

// Ported from ThePodium_v5.html's trustBadge()/trust-N classes.
export function TrustBadge({ level }: { level: number }) {
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
      Lvl {level} · {TRUST_LABELS[level]}
    </span>
  );
}

// Ported from ThePodium_v5.html's locationBadge().
export function LocationBadge({
  africanIdentity,
  countryOrigin,
  countryResidence,
}: {
  africanIdentity: string | null;
  countryOrigin: string | null;
  countryResidence: string | null;
}) {
  if (africanIdentity === "diaspora") {
    return (
      <span className={`${base} text-blue bg-blue-tint border-blue-border`}>
        DIASPORA · {countryResidence ?? ""}
      </span>
    );
  }
  if (africanIdentity === "continent") {
    return (
      <span className={`${base} text-green bg-green-tint border-green-border`}>
        🌍 {countryOrigin ?? "Africa"}
      </span>
    );
  }
  return null;
}

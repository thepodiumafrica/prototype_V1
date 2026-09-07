"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  AFRICAN_COUNTRIES,
  DIASPORA_COUNTRIES,
  INTERESTS,
  INTEREST_KEY,
} from "@/lib/constants";
import { useLocale } from "@/components/LocaleProvider";
import { countryLabel } from "@/lib/i18n/data-labels";
import type { DictKey } from "@/lib/i18n/dictionary";

type Identity = "continent" | "diaspora" | "ally";

const IDENTITY_OPTIONS: {
  id: Identity;
  icon: string;
  labelKey: DictKey;
  subKey: DictKey;
}[] = [
  {
    id: "continent",
    icon: "🌍",
    labelKey: "identityContinentLabel",
    subKey: "identityContinentSub",
  },
  {
    id: "diaspora",
    icon: "✈️",
    labelKey: "identityDiasporaLabel",
    subKey: "identityDiasporaSub",
  },
  {
    id: "ally",
    icon: "🤝",
    labelKey: "identityAllyLabel",
    subKey: "identityAllySub",
  },
];

export function OnboardingFlow({ userId }: { userId: string }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identity, setIdentity] = useState<Identity>("continent");
  const [countryOrigin, setCountryOrigin] = useState("");
  const [countryResidence, setCountryResidence] = useState("");
  const [interests, setInterests] = useState<Set<string>>(new Set());

  async function selectIdentity(id: Identity) {
    setIdentity(id);
    await supabase
      .from("profiles")
      .update({ african_identity: id })
      .eq("id", userId);
    setStep(2);
  }

  async function continueRoots() {
    await supabase
      .from("profiles")
      .update({
        country_origin: countryOrigin || null,
        country_residence: identity === "diaspora" ? countryResidence || null : null,
      })
      .eq("id", userId);
    setStep(3);
  }

  function toggleInterest(i: string) {
    setInterests((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  async function finish() {
    await supabase
      .from("profiles")
      .update({ interests: Array.from(interests) })
      .eq("id", userId);
    // Matches the prototype: onboarding ends by landing on your feed.
    router.push("/feed");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-7 text-center">
        {step === 1 && (
          <>
            <div className="mb-4 text-4xl">🌍</div>
            <h1 className="font-serif text-xl font-bold text-text">
              {t("onboardingWelcome")}
            </h1>
            <p className="mt-2 mb-6 text-sm leading-relaxed text-text-muted">
              {t("onboardingIntro")}
            </p>
            <div className="flex flex-col gap-2.5">
              {IDENTITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => selectIdentity(opt.id)}
                  className="flex w-full items-center gap-3.5 rounded-lg border border-border bg-elevated px-4 py-3.5 text-left transition-colors hover:border-amber hover:bg-amber-faint"
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold text-text">
                      {t(opt.labelKey)}
                    </span>
                    <span className="block text-xs text-text-muted">
                      {t(opt.subKey)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="mt-5 text-xs text-text-muted underline"
            >
              {t("skipForNow")}
            </button>
          </>
        )}

        {step === 2 && (
          <div className="text-left">
            <div className="mb-5 text-[11px] font-semibold tracking-wide text-text-muted">
              {t("step2of3")}
            </div>
            <h1 className="font-serif text-lg font-bold text-text">
              {t("whereAreYouFrom")}
            </h1>
            <p className="mt-2 mb-5 text-sm leading-relaxed text-text-muted">
              {t("rootsIntro")}
            </p>

            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              {t("countryOfOriginLabel")}
            </label>
            <select
              value={countryOrigin}
              onChange={(e) => setCountryOrigin(e.target.value)}
              className="mb-4 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text"
            >
              <option value="">{t("selectCountryEllipsis")}</option>
              {AFRICAN_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {countryLabel(c, locale)}
                </option>
              ))}
            </select>

            {identity === "diaspora" && (
              <>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  {t("countryOfResidenceLabel")}
                </label>
                <select
                  value={countryResidence}
                  onChange={(e) => setCountryResidence(e.target.value)}
                  className="mb-4 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text"
                >
                  <option value="">{t("selectCountryEllipsis")}</option>
                  {DIASPORA_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {countryLabel(c, locale)}
                    </option>
                  ))}
                </select>
              </>
            )}

            <div className="mt-2 flex gap-2.5">
              <button
                onClick={continueRoots}
                className="rounded-md bg-amber px-4 py-2 text-sm font-semibold text-on-primary"
              >
                {t("continueAction")}
              </button>
              <button
                onClick={() => setStep(3)}
                className="rounded-md px-4 py-2 text-sm font-semibold text-text-muted"
              >
                {t("skipAction")}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-left">
            <div className="mb-5 text-[11px] font-semibold tracking-wide text-text-muted">
              {t("step3of3")}
            </div>
            <h1 className="font-serif text-lg font-bold text-text">
              {t("whatDoYouWantToRead")}
            </h1>
            <p className="mt-2 mb-5 text-sm leading-relaxed text-text-muted">
              {t("selectInterestsIntro")}
            </p>

            <div className="mb-6 flex flex-wrap gap-1.5">
              {INTERESTS.map((i) => {
                const selected = interests.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleInterest(i)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                      selected
                        ? "border-amber bg-amber-faint text-amber"
                        : "border-border text-text-muted"
                    }`}
                  >
                    {t(INTEREST_KEY[i])}
                  </button>
                );
              })}
            </div>

            <button
              onClick={finish}
              className="rounded-md bg-amber px-4 py-2 text-sm font-semibold text-on-primary"
            >
              {t("finish")}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

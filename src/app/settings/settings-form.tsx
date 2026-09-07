"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AFRICAN_COUNTRIES, EXPERTISE, INTERESTS, INTEREST_KEY } from "@/lib/constants";
import { useLocale } from "@/components/LocaleProvider";
import { countryLabel, expertiseLabel } from "@/lib/i18n/data-labels";
import type { DictKey } from "@/lib/i18n/dictionary";

type Identity = "continent" | "diaspora" | "ally";

type Profile = {
  username: string;
  bio: string | null;
  profession: string | null;
  industry: string | null;
  linkedin_url: string | null;
  african_identity: string | null;
  country_origin: string | null;
  expertise: string[] | null;
  interests: string[] | null;
};

const IDENTITIES: Array<{ value: Identity; labelKey: DictKey }> = [
  { value: "continent", labelKey: "continent" },
  { value: "diaspora", labelKey: "diaspora" },
  { value: "ally", labelKey: "identityAlly" },
];

export function SettingsForm({ profile }: { profile: Profile }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [bio, setBio] = useState(profile.bio ?? "");
  const [profession, setProfession] = useState(profile.profession ?? "");
  const [industry, setIndustry] = useState(profile.industry ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url ?? "");
  const [identity, setIdentity] = useState<Identity>(
    (profile.african_identity as Identity) ?? "continent",
  );
  const [countryOrigin, setCountryOrigin] = useState(
    profile.country_origin ?? "",
  );
  const [expertise, setExpertise] = useState<string[]>(
    profile.expertise ?? [],
  );
  const [interests, setInterests] = useState<string[]>(
    profile.interests ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function toggleExpertise(ex: string) {
    setExpertise((cur) => {
      if (cur.includes(ex)) return cur.filter((x) => x !== ex);
      if (cur.length >= 5) return cur;
      return [...cur, ex];
    });
  }

  function toggleInterest(i: string) {
    setInterests((cur) =>
      cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        bio,
        profession,
        industry,
        linkedin_url: linkedinUrl,
        african_identity: identity,
        country_origin: countryOrigin,
        expertise,
        interests,
      })
      .eq("username", profile.username);

    setPending(false);

    if (updateError) return setError(updateError.message);

    router.push(`/profile/${profile.username}`);
    router.refresh();
  }

  return (
    <>
      <div className="mb-4">
        <button
          type="button"
          onClick={() => router.push(`/profile/${profile.username}`)}
          className="text-sm text-text-muted"
        >
          {t("back")}
        </button>
      </div>
      <h1 className="mb-5 font-serif text-2xl font-semibold text-text">
        {t("editProfileHeading")}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6"
      >
        <Field label={t("bioLabel")}>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
          />
        </Field>

        <Field label={t("professionLabel")}>
          <input
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder={t("professionPlaceholder")}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
          />
        </Field>

        <Field label={t("industryLabel")}>
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder={t("industryPlaceholder")}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
          />
        </Field>

        <Field label={t("linkedinLabel")}>
          <input
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="linkedin.com/in/yourname"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
          />
        </Field>

        <Field label={t("identityLabel")}>
          <div className="flex gap-2">
            {IDENTITIES.map((id) => (
              <button
                key={id.value}
                type="button"
                onClick={() => setIdentity(id.value)}
                className={`flex-1 rounded-md border px-1 py-1.5 text-[11px] font-medium ${
                  identity === id.value
                    ? "border-amber bg-amber-faint text-amber"
                    : "border-border text-text-muted"
                }`}
              >
                {t(id.labelKey)}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t("countryOfOriginLabel")}>
          <select
            value={countryOrigin}
            onChange={(e) => setCountryOrigin(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
          >
            <option value="">{t("selectEllipsis")}</option>
            {AFRICAN_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {countryLabel(c, locale)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("expertiseLabel")}>
          <div className="flex flex-wrap gap-1.5">
            {EXPERTISE.map((ex) => {
              const selected = expertise.includes(ex);
              return (
                <button
                  key={ex}
                  type="button"
                  onClick={() => toggleExpertise(ex)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                    selected
                      ? "border-amber bg-amber-faint text-amber"
                      : "border-border text-text-muted"
                  }`}
                >
                  {expertiseLabel(ex, locale)}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label={t("interestsLabel")}>
          <div className="flex flex-wrap gap-1.5">
            {INTERESTS.map((i) => {
              const selected = interests.includes(i);
              return (
                <button
                  key={i}
                  type="button"
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
        </Field>

        {error && (
          <div className="rounded-md border border-red-border bg-red-tint px-3 py-2 text-sm text-red">
            {error}
          </div>
        )}

        <div className="mt-1 flex gap-2.5">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-amber px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50"
          >
            {pending ? t("savingEllipsis") : t("save")}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/profile/${profile.username}`)}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text"
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

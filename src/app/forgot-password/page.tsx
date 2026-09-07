"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/LocaleProvider";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setPending(false);

    // Show the same confirmation either way -- otherwise this becomes a
    // way to check which emails have an account.
    if (resetError) {
      console.error("resetPasswordForEmail failed:", resetError.message);
    }
    setSent(true);
  }

  if (sent) {
    const [before, after] = t("checkEmailResetBody").split("{email}");
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-serif text-2xl font-semibold text-text">
          {t("checkEmailHeading")}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
          {before}
          <strong>{email}</strong>
          {after}
        </p>
        <Link href="/login" className="mt-6 text-sm font-semibold text-amber">
          {t("backToSignIn")}
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 font-serif text-xl font-semibold text-text">
          {t("resetPasswordHeading")}
        </h1>
        <p className="mb-5 text-sm text-text-muted">
          {t("resetPasswordSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              {t("emailLabel")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-border bg-red-tint px-3 py-2 text-sm text-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-amber px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50"
          >
            {pending ? t("sendingResetLink") : t("sendResetLink")}
          </button>

          <Link
            href="/login"
            className="text-center text-sm font-semibold text-text-muted hover:text-text"
          >
            {t("backToSignIn")}
          </Link>
        </form>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validatePassword } from "@/lib/validate-password";
import { useLocale } from "@/components/LocaleProvider";

function ResetPasswordForm() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const linkError = searchParams.get("error_description");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The reset link Supabase emails redirects here as either an error
    // (expired/already-used link, handled above via linkError) or a
    // one-time code the client library exchanges for a "recovery" session
    // automatically on load, which fires PASSWORD_RECOVERY once that's done.
    if (linkError) return;

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    // If this effect re-runs after the exchange already happened (e.g.
    // fast refresh), the event won't fire again -- fall back to checking
    // for a live session.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, [linkError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const passwordError = validatePassword(password);
    if (passwordError) return setError(t(passwordError));
    if (password !== confirmPassword) return setError(t("passwordsDontMatch"));

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) return setError(updateError.message);
    setDone(true);
  }

  if (linkError) {
    const [before, after] = t("linkExpiredBody").split("{error}");
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-serif text-2xl font-semibold text-text">
          {t("linkExpiredHeading")}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
          {before}
          {linkError}
          {after}
        </p>
        <Link href="/forgot-password" className="mt-6 text-sm font-semibold text-amber">
          {t("requestNewLink")}
        </Link>
      </main>
    );
  }

  if (done) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-serif text-2xl font-semibold text-text">
          {t("passwordUpdatedHeading")}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
          {t("passwordUpdatedBody")}
        </p>
        <button
          onClick={() => {
            router.push("/feed");
            router.refresh();
          }}
          className="mt-6 rounded-md bg-amber px-4 py-2 text-sm font-semibold text-on-primary"
        >
          {t("continueToPodium")}
        </button>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24 text-center text-sm text-text-muted">
        {t("verifyingLink")}
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 font-serif text-xl font-semibold text-text">
          {t("chooseNewPasswordHeading")}
        </h1>
        <p className="mb-5 text-sm text-text-muted">
          {t("newPasswordHint")}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              {t("newPasswordLabel")}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              {t("confirmPasswordLabel")}
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {pending ? t("updatingPassword") : t("updatePassword")}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

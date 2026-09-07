"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/LocaleProvider";

export default function LoginPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setPending(false);

    if (signInError) return setError(signInError.message);

    // Matches the prototype: signing in lands you on your feed.
    router.push("/feed");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-5 flex gap-1 rounded-lg bg-elevated p-1">
          <span className="flex-1 rounded-md bg-bg px-3 py-2 text-center text-sm font-semibold text-text">
            {t("signin")}
          </span>
          <Link
            href="/signup"
            className="flex-1 rounded-md px-3 py-2 text-center text-sm font-semibold text-text-muted"
          >
            {t("createAccount")}
          </Link>
        </div>

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

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                {t("passwordLabel")}
              </label>
              <Link href="/forgot-password" className="text-[11px] text-text-muted hover:text-text">
                {t("forgotPassword")}
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {pending ? t("signingIn") : t("signin")}
          </button>
        </form>
      </div>
    </main>
  );
}

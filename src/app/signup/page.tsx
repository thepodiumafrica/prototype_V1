"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validatePassword, validateUsername, validateAge } from "@/lib/validate-password";
import { USER_TYPES, type UserType } from "@/lib/constants";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [userType, setUserType] = useState<UserType>("reader");
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const usernameError = validateUsername(username);
    if (usernameError) return setError(usernameError);

    const passwordError = validatePassword(password);
    if (passwordError) return setError(passwordError);

    const ageError = validateAge(dateOfBirth);
    if (ageError) return setError(ageError);

    setPending(true);
    const supabase = createClient();

    const { data: existing } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      setPending(false);
      return setError("Username already taken");
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, user_type: userType, date_of_birth: dateOfBirth },
      },
    });

    setPending(false);

    if (signUpError) {
      // A rejection raised inside handle_new_user() (duplicate username,
      // bad user_type, failing the age gate) reaches the client as an
      // opaque transport error with no usable message text -- a known
      // rough edge of how Supabase Auth surfaces trigger failures, not
      // specific to any one check. The client-side validation above
      // already catches the normal cases before ever calling signUp(),
      // so this fallback only matters if that's somehow bypassed.
      const msg = signUpError.message?.trim();
      const isOpaque = !msg || msg === "{}";
      return setError(
        isOpaque
          ? "We couldn't create your account. Please double-check your details and try again."
          : msg,
      );
    }

    if (data.session) {
      router.push("/onboarding");
    } else {
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-serif text-2xl font-semibold text-text">
          Check your email
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
          We sent a confirmation link to <strong>{email}</strong>. Click it to
          finish creating your account.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-5 flex gap-1 rounded-lg bg-elevated p-1">
          <Link
            href="/login"
            className="flex-1 rounded-md px-3 py-2 text-center text-sm font-semibold text-text-muted"
          >
            Sign In
          </Link>
          <span className="flex-1 rounded-md bg-bg px-3 py-2 text-center text-sm font-semibold text-text">
            Create Account
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
            />
          </Field>

          <Field label="Username">
            <input
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              placeholder="Min 10 chars · 1 uppercase · 1 symbol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
            />
          </Field>

          <Field label="Date of Birth">
            <input
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
            />
            <p className="mt-1 text-[11px] text-text-dim">
              You must be at least 13 years old to join.
            </p>
          </Field>

          <Field label="Account Type">
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as UserType)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
            >
              {USER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

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
            {pending ? "Creating account…" : "Create Account"}
          </button>
        </form>
      </div>
    </main>
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

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { username: string; user_type: string } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, user_type")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <div className="flex h-[5px] w-full" aria-hidden="true">
        <div className="flex-[3]" style={{ background: "#C99A3C" }} />
        <div className="flex-[1]" style={{ background: "#2A1E12" }} />
        <div className="flex-[2]" style={{ background: "#C05A2E" }} />
        <div className="flex-[1]" style={{ background: "#55754A" }} />
        <div className="flex-[2]" style={{ background: "#2F4A6B" }} />
        <div className="flex-[1]" style={{ background: "#2A1E12" }} />
        <div className="flex-[3]" style={{ background: "#C99A3C" }} />
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="relative mb-10 px-9 py-4">
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2"
            style={{ borderColor: "var(--amber)" }}
          />
          <span
            aria-hidden="true"
            className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2"
            style={{ borderColor: "var(--amber)" }}
          />
          <span className="text-sm font-extrabold tracking-[0.14em] text-text">
            THE PODIUM
          </span>
        </div>

        {profile ? (
          <>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Welcome back, @{profile.username}
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-text-muted">
              Signed in as a{" "}
              {profile.user_type.replace("_", " ")}. The feed, articles, and
              forum are still under construction.
            </p>
            <form action={signOut} className="mt-6">
              <button
                type="submit"
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text"
              >
                Sign Out
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Coming soon
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-text-muted">
              Voices of the continent and the diaspora — a place to inform,
              share, and take control of the African narrative.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/login"
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-amber px-4 py-2 text-sm font-semibold text-on-primary"
              >
                Create Account
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

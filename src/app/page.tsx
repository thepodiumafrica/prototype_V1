import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";

export default async function Home() {
  const { t } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Matches the prototype: signed-in users land on their feed, not a
  // marketing placeholder.
  if (user) redirect("/feed");

  return (
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

      <h1 className="font-serif text-3xl font-semibold tracking-tight text-text sm:text-4xl">
        {t("homeComingSoon")}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-text-muted">
        {t("homeTagline")}
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/login"
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text"
        >
          {t("signin")}
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-amber px-4 py-2 text-sm font-semibold text-on-primary"
        >
          {t("createAccount")}
        </Link>
      </div>
    </main>
  );
}

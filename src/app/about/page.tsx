import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import type { DictKey } from "@/lib/i18n/dictionary";

// Ported verbatim from ThePodium_v5.html's renderAbout() -- this is the
// platform's mission statement, not something to paraphrase (its French
// translation aims for the same fluency, not a literal word-for-word
// rendering -- see dictionary.ts's aboutMission1-4). Paragraphs alternate
// Fraunces italic / Outfit normal styling exactly as coded there, and the
// closing paragraph is emphasized (text, not text-muted).
const MISSION_KEYS: DictKey[] = [
  "aboutMission1",
  "aboutMission2",
  "aboutMission3",
  "aboutMission4",
];

// The subset of renderAbout()'s offerings grid this page shows.
const OFFERINGS: [string, DictKey, DictKey][] = [
  ["✦", "articles", "aboutOfferArticlesSub"],
  ["◌", "forum", "aboutOfferForumSub"],
  ["▲", "groups", "aboutOfferGroupsSub"],
  ["◎", "spaces", "aboutOfferSpacesSub"],
  ["⬡", "partnerships", "aboutOfferPartnershipsSub"],
  ["◈", "resources", "aboutOfferResourcesSub"],
];

export default async function AboutPage() {
  const { t } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto w-full max-w-[680px] px-5 py-12">
      <div className="mb-8 text-center">
        <div className="mb-2.5 flex justify-center">
          <span className="relative inline-flex px-[30px] py-3.5">
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 h-5 w-5 border-l-[2.5px] border-t-[2.5px]"
              style={{ borderColor: "var(--amber)" }}
            />
            <span
              aria-hidden="true"
              className="absolute bottom-0 right-0 h-5 w-5 border-b-[2.5px] border-r-[2.5px]"
              style={{ borderColor: "var(--amber)" }}
            />
            <span className="text-xl font-extrabold tracking-[0.14em] text-text">
              THE PODIUM
            </span>
          </span>
        </div>
        <p className="text-xs tracking-wide text-text-dim">{t("aboutEyebrow")}</p>
      </div>

      {MISSION_KEYS.map((key, i) => (
        <p
          key={key}
          className={`mb-[22px] text-base leading-[1.9] ${
            i === 3 ? "text-text" : "text-text-muted"
          } ${i % 2 === 0 ? "font-serif italic" : "font-sans not-italic"}`}
        >
          {t(key)}
        </p>
      ))}

      <div className="my-7 h-px bg-border" />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {OFFERINGS.map(([icon, titleKey, subtitleKey]) => (
          <div
            key={titleKey}
            className="rounded-lg border border-border bg-surface p-3 text-center"
          >
            <div className="mb-1 text-lg text-amber">{icon}</div>
            <div className="mb-0.5 text-xs font-semibold text-text">{t(titleKey)}</div>
            <div className="text-[11px] leading-relaxed text-text-dim">
              {t(subtitleKey)}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        {user ? (
          <Link
            href="/feed"
            className="inline-block rounded-md bg-amber px-4 py-2 text-sm font-semibold text-on-primary"
          >
            {t("goToFeed")}
          </Link>
        ) : (
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link
              href="/signup"
              className="inline-block rounded-md bg-amber px-4 py-2 text-sm font-semibold text-on-primary"
            >
              {t("joinThePodium")}
            </Link>
            <Link
              href="/articles"
              className="inline-block rounded-md border border-border px-4 py-2 text-sm font-semibold text-text"
            >
              {t("browseAsGuest")}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

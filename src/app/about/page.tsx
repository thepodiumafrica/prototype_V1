import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Ported verbatim from ThePodium_v5.html's renderAbout() -- this is the
// platform's mission statement, not something to paraphrase. Paragraphs
// alternate Fraunces italic / Outfit normal styling exactly as coded there,
// and the closing paragraph is emphasized (text, not text-muted).
const MISSION_PARAGRAPHS = [
  `One of the merits of globalisation is the creation of a world where intellectual conversation can be approached with different perspectives of cultural understanding. Africa, however, is often portrayed from a western-dominated ethnocentric perspective leaving little space for its own people to express the realities they face or the origins of African worldviews.`,
  `The Podium is a platform which wishes to bridge this gap and many more. It aims to engage the voices of Africans in the diaspora and within the continent to inform, share, and engage in important conversations. This dialogue has the potential to create innovation, cross-cultural understanding, and a better appreciation of personal provenance.`,
  `Through The Podium's focus on relevant topics such as art, history, economics, scientific innovation, technology, education, and business in the form of thought-provoking, engaging, user-generated content it will be possible to take control of the African narrative.`,
  `Every question has an answer. All information can find an interested audience. Every need has resources that can directly address it. Every conversation has a community ready to engage in it. The Podium, therefore, will create a place of connection and bridge gaps that have too long been in existence.`,
];

// The subset of renderAbout()'s offerings grid this page shows.
const OFFERINGS: [string, string, string][] = [
  ["✦", "Articles", "Long-form analysis"],
  ["◌", "Forum", "Open discussions"],
  ["▲", "Groups", "Topic communities"],
  ["◎", "Spaces", "Networking events"],
  ["⬡", "Partnerships", "Find collaborators"],
  ["◈", "Resources", "Finance & career guides"],
];

export default async function AboutPage() {
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
        <p className="text-xs tracking-wide text-text-dim">Our Mission</p>
      </div>

      {MISSION_PARAGRAPHS.map((p, i) => (
        <p
          key={i}
          className={`mb-[22px] text-base leading-[1.9] ${
            i === 3 ? "text-text" : "text-text-muted"
          } ${i % 2 === 0 ? "font-serif italic" : "font-sans not-italic"}`}
        >
          {p}
        </p>
      ))}

      <div className="my-7 h-px bg-border" />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {OFFERINGS.map(([icon, title, subtitle]) => (
          <div
            key={title}
            className="rounded-lg border border-border bg-surface p-3 text-center"
          >
            <div className="mb-1 text-lg text-amber">{icon}</div>
            <div className="mb-0.5 text-xs font-semibold text-text">{title}</div>
            <div className="text-[11px] leading-relaxed text-text-dim">
              {subtitle}
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
            Go to Your Feed →
          </Link>
        ) : (
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link
              href="/signup"
              className="inline-block rounded-md bg-amber px-4 py-2 text-sm font-semibold text-on-primary"
            >
              Join The Podium
            </Link>
            <Link
              href="/articles"
              className="inline-block rounded-md border border-border px-4 py-2 text-sm font-semibold text-text"
            >
              Browse as Guest
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

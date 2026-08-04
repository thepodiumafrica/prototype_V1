import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FeedToggle } from "@/components/FeedToggle";
import { PostCard, type PostCardPost } from "@/components/PostCard";
import { Proverb } from "@/components/Proverb";
import { todayGreeting } from "@/lib/format";
import { rankFeedPosts } from "@/lib/feed-ranking";
import type { UserType } from "@/lib/constants";

type Row = {
  id: string;
  otype: "Article" | "Forum Post";
  category: string;
  language: string;
  title: string;
  content: string;
  tags: string[];
  nlikes: number;
  ncomments: number;
  views: number;
  disputed: boolean;
  dispute_note: string;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    user_type: UserType;
    verified: boolean;
    african_identity: string | null;
  } | null;
};

// Ported from ThePodium_v5.html's getFeedPosts(): score = followed (+150)
// + 30 per matching interest tag + log1p(nlikes) * 5, highest first, top 12.
// Sidebar widgets from the prototype (Continue Reading, Weekly Digest, Who
// to Follow, Your Groups) are deliberately not included here -- they lean
// on read-history tracking, a digest page, and Groups, none of which are
// built yet (Groups is explicitly deferred). This is the main feed column
// only, matching the brief's one-line description of this feature.
export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode: modeParam } = await searchParams;
  const mode = modeParam === "continent" || modeParam === "diaspora" ? modeParam : "both";

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // The prototype only ever renders the feed for a signed-in user.
  if (!authUser) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, interests")
    .eq("id", authUser.id)
    .single();
  if (!profile) redirect("/login");

  const { data: followRows } = await supabase
    .from("follows")
    .select("following")
    .eq("follower", authUser.id);
  const followedIds = new Set((followRows ?? []).map((f) => f.following));
  const interests = new Set<string>(profile.interests ?? []);

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, otype, category, language, title, content, tags, nlikes, ncomments, views, disputed, dispute_note, created_at, profiles!posts_creator_fkey(id, username, user_type, verified, african_identity)",
    )
    .in("otype", ["Article", "Forum Post"])
    .eq("status", "published")
    .eq("flagged", false)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) console.error("feed query failed:", error);

  const rows = ((data ?? []) as unknown as Row[]).filter((r) => {
    if (!r.profiles) return false;
    if (mode === "continent") return r.profiles.african_identity === "continent";
    if (mode === "diaspora") return r.profiles.african_identity === "diaspora";
    return true;
  });

  const ranked = rankFeedPosts(
    rows.map((r) => ({ ...r, creatorId: r.profiles!.id, createdAt: r.created_at })),
    (r) => r.profiles!.username,
    { followedIds, interests },
  );

  const shown = ranked.slice(0, 12).map(({ post: r, reason }) => ({
    reason,
    post: {
      id: r.id,
      creator: r.profiles!.username,
      creator_type: r.profiles!.user_type,
      creator_verified: r.profiles!.verified,
      otype: r.otype,
      status: "published",
      category: r.category,
      language: r.language,
      title: r.title,
      content: r.content,
      tags: r.tags ?? [],
      nlikes: r.nlikes,
      ncomments: r.ncomments,
      views: r.views,
      disputed: r.disputed,
      dispute_note: r.dispute_note,
      created_at: r.created_at,
    } satisfies PostCardPost,
  }));

  const [greetingWord, greetingLang] = todayGreeting();

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-dim">
            Your Feed
          </div>
          <h1 className="font-serif text-[26px] font-semibold text-text">
            {greetingWord}, @{profile.username}
          </h1>
          <div className="mt-0.5 text-xs text-text-dim">
            &quot;Welcome&quot; in {greetingLang} — a different African
            language greets you each day
          </div>
        </div>
        <FeedToggle active={mode} />
      </div>

      {shown.length === 0 ? (
        <div className="px-5 py-16 text-center text-text-dim">
          <div className="mb-2.5 font-serif text-lg text-text-muted">
            Your feed is empty
          </div>
          <Proverb forKey="feed" />
          <p className="mb-5 text-sm">
            Follow creators and set interests to personalise it.
          </p>
          <Link
            href="/articles"
            className="inline-block rounded-md bg-amber px-4 py-2 text-sm font-semibold text-on-primary"
          >
            Browse Articles →
          </Link>
        </div>
      ) : (
        shown.map(({ post, reason }) => (
          <div key={post.id}>
            {reason && (
              <div className="mb-0.5 pl-0.5 text-[11px] text-text-dim">
                · {reason}
              </div>
            )}
            <PostCard post={post} />
          </div>
        ))
      )}
    </main>
  );
}

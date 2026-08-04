import { createClient } from "@/lib/supabase/server";
import { CategoryBar } from "@/components/CategoryBar";
import { GuestBanner } from "@/components/GuestBanner";
import { PostCard, type PostCardPost } from "@/components/PostCard";
import type { UserType } from "@/lib/constants";

type Row = {
  id: string;
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
    username: string;
    user_type: UserType;
    verified: boolean;
  } | null;
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("posts")
    .select(
      "id, category, language, title, content, tags, nlikes, ncomments, views, disputed, dispute_note, created_at, profiles!posts_creator_fkey(username, user_type, verified)",
    )
    .eq("otype", "Article")
    .eq("status", "published")
    .eq("flagged", false)
    .order("created_at", { ascending: false });

  if (cat && cat !== "all") {
    query = query.or(`category.eq.${cat},tags.cs.{${cat}}`);
  }

  const { data, error } = await query;
  if (error) console.error("articles query failed:", error);
  const rows = (data ?? []) as unknown as Row[];

  const posts: PostCardPost[] = rows
    .filter((r) => r.profiles)
    .map((r) => ({
      id: r.id,
      creator: r.profiles!.username,
      creator_type: r.profiles!.user_type,
      creator_verified: r.profiles!.verified,
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
    }));

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      {!user && <GuestBanner />}
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-bold text-text">Articles</h1>
        <p className="text-sm text-text-muted">{posts.length} published articles</p>
      </div>
      <CategoryBar basePath="/articles" active={cat ?? "all"} />
      {posts.length === 0 ? (
        <p className="text-sm text-text-muted">No articles in this category yet.</p>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </main>
  );
}

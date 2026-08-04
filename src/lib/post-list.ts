import type { SupabaseClient } from "@supabase/supabase-js";
import type { PostCardPost } from "@/components/PostCard";
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

// Shared by /articles and /forum, which differ only in otype and the
// prototype's copy around them.
export async function fetchPublishedPosts(
  supabase: SupabaseClient,
  otype: "Article" | "Forum Post",
  category?: string,
): Promise<PostCardPost[]> {
  let query = supabase
    .from("posts")
    .select(
      "id, category, language, title, content, tags, nlikes, ncomments, views, disputed, dispute_note, created_at, profiles!posts_creator_fkey(username, user_type, verified)",
    )
    .eq("otype", otype)
    .eq("status", "published")
    .eq("flagged", false)
    .order("created_at", { ascending: false });

  // Matches the prototype's filterByCat(): a post matches if it's in the
  // category OR carries it as a tag.
  if (category && category !== "all") {
    query = query.or(`category.eq.${category},tags.cs.{${category}}`);
  }

  const { data, error } = await query;
  if (error) console.error(`${otype} list query failed:`, error);

  return ((data ?? []) as unknown as Row[])
    .filter((r) => r.profiles)
    .map((r) => ({
      id: r.id,
      creator: r.profiles!.username,
      creator_type: r.profiles!.user_type,
      creator_verified: r.profiles!.verified,
      otype,
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
}

// Shared by every page that renders PostCard, to know which of the shown
// posts the signed-in viewer has already bookmarked.
export async function fetchBookmarkedIds(
  supabase: SupabaseClient,
  userId: string | undefined,
): Promise<Set<string>> {
  if (!userId) return new Set();
  const { data, error } = await supabase
    .from("bookmarks")
    .select("post_id")
    .eq("user_id", userId);
  if (error) console.error("bookmarked-ids query failed:", error);
  return new Set((data ?? []).map((b) => b.post_id as string));
}

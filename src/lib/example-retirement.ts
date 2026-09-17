import type { SupabaseClient } from "@supabase/supabase-js";

// Optional, operator-controlled graceful retirement of example content:
// once a category has 3+ real (non-example) published articles, example
// articles in that category stop being shown, so the launch scaffolding
// falls away category by category as real writing arrives instead of all
// at once. Off by default -- see app_settings.auto_retire_examples and
// scripts/toggle-example-retirement.mjs.
const REAL_ARTICLE_THRESHOLD = 3;

// Returns the set of categories where example articles should currently
// be hidden. Empty (and a single cheap query) whenever the setting is
// off, which is the common case.
export async function getRetiredExampleCategories(
  supabase: SupabaseClient,
): Promise<Set<string>> {
  const { data: setting } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "auto_retire_examples")
    .maybeSingle();

  if (setting?.value !== true) return new Set();

  const { data: realArticles, error } = await supabase
    .from("posts")
    .select("category")
    .eq("otype", "Article")
    .eq("status", "published")
    .eq("is_example", false);
  if (error) {
    console.error("example-retirement category count failed:", error);
    return new Set();
  }

  const counts = new Map<string, number>();
  for (const row of realArticles ?? []) {
    counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
  }

  const retired = new Set<string>();
  for (const [category, count] of counts) {
    if (count >= REAL_ARTICLE_THRESHOLD) retired.add(category);
  }
  return retired;
}

// Applied after fetching a page of posts, right before rendering --
// matches this codebase's existing pattern of filtering/ranking in JS
// after a plain Supabase select (see rankFeedPosts) rather than pushing
// this into a view or RLS policy.
export function isRetiredExample(
  post: { otype: string; category: string; is_example?: boolean },
  retiredCategories: Set<string>,
): boolean {
  return (
    !!post.is_example && post.otype === "Article" && retiredCategories.has(post.category)
  );
}

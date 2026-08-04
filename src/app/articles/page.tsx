import { createClient } from "@/lib/supabase/server";
import { CategoryBar } from "@/components/CategoryBar";
import { GuestBanner } from "@/components/GuestBanner";
import { PostCard } from "@/components/PostCard";
import { fetchPublishedPosts } from "@/lib/post-list";

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

  const posts = await fetchPublishedPosts(supabase, "Article", cat);

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      {!user && <GuestBanner />}
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-bold text-text">Articles</h1>
        <p className="text-sm text-text-muted">
          {posts.length} published articles
        </p>
      </div>
      <CategoryBar basePath="/articles" active={cat ?? "all"} />
      {posts.length === 0 ? (
        <p className="text-sm text-text-muted">
          No articles in this category yet.
        </p>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </main>
  );
}

import { createClient } from "@/lib/supabase/server";
import { CategoryBar } from "@/components/CategoryBar";
import { GuestBanner } from "@/components/GuestBanner";
import { PostCard } from "@/components/PostCard";
import { fetchPublishedPosts, fetchBookmarkedIds } from "@/lib/post-list";
import { getT } from "@/lib/i18n/locale";

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const { t, locale } = await getT();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [posts, bookmarkedIds] = await Promise.all([
    fetchPublishedPosts(supabase, "Article", cat),
    fetchBookmarkedIds(supabase, user?.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      {!user && <GuestBanner />}
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-bold text-text">{t("articlesHeading")}</h1>
        <p className="text-sm text-text-muted">
          {t("articlesCountSub", { count: posts.length })}
        </p>
      </div>
      <CategoryBar basePath="/articles" active={cat ?? "all"} />
      {posts.length === 0 ? (
        <p className="text-sm text-text-muted">
          {t("noArticlesInCategory")}
        </p>
      ) : (
        posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            signedIn={!!user}
            bookmarked={bookmarkedIds.has(p.id)}
            locale={locale}
          />
        ))
      )}
    </main>
  );
}

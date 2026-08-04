import { createClient } from "@/lib/supabase/server";
import { CategoryBar } from "@/components/CategoryBar";
import { GuestBanner } from "@/components/GuestBanner";
import { PostCard } from "@/components/PostCard";
import { CreateButton } from "@/components/CreateButton";
import type { PostType } from "@/components/PostFormModal";
import { fetchPublishedPosts, fetchBookmarkedIds } from "@/lib/post-list";
import { can } from "@/lib/perms";
import type { UserType } from "@/lib/constants";

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let viewerType: UserType | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();
    viewerType = (data?.user_type as UserType) ?? null;
  }

  const [posts, bookmarkedIds] = await Promise.all([
    fetchPublishedPosts(supabase, "Forum Post", cat),
    fetchBookmarkedIds(supabase, user?.id),
  ]);

  // Matches openCreateModal()'s types array: only offer the kinds of post
  // this account may actually create, same as the nav's + Create button.
  const availableTypes: PostType[] = [
    can(viewerType, "postArticle") ? "Article" : null,
    can(viewerType, "createForum") ? "Forum Post" : null,
  ].filter((t): t is PostType => t !== null);

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      {!user && <GuestBanner />}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-text">Forum</h1>
          <p className="text-sm text-text-muted">
            The palaver — open conversation under the community tree
          </p>
        </div>
        {can(viewerType, "createForum") && (
          <CreateButton
            availableTypes={availableTypes}
            defaultType="Forum Post"
            label="+ New Post"
          />
        )}
      </div>
      <CategoryBar basePath="/forum" active={cat ?? "all"} />
      {posts.length === 0 ? (
        <p className="text-sm text-text-muted">No posts yet.</p>
      ) : (
        posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            signedIn={!!user}
            bookmarked={bookmarkedIds.has(p.id)}
          />
        ))
      )}
    </main>
  );
}

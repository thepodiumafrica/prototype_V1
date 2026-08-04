import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { computeTrust } from "@/lib/trust";
import { can } from "@/lib/perms";
import type { UserType } from "@/lib/constants";
import { ADINKRA } from "@/lib/constants";
import { Avatar } from "@/components/Avatar";
import {
  TypeBadge,
  VerifiedBadge,
  TrustBadge,
  LocationBadge,
  LangBadge,
  StatusBadge,
} from "@/components/Badge";
import { AdinkraIcon } from "@/components/AdinkraIcon";
import { Tag } from "@/components/Tag";
import { LikeButton } from "@/components/LikeButton";
import { PostActions } from "@/components/PostActions";
import { FollowButton } from "@/components/FollowButton";
import { ViewTracker } from "@/components/ViewTracker";
import { fmtDate, readTime } from "@/lib/format";
import { renderMd } from "@/lib/markdown";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select(
      "id, creator, otype, status, category, language, title, content, tags, nlikes, ncomments, views, disputed, dispute_note, created_at, profiles!posts_creator_fkey(id, username, user_type, verified, african_identity, country_origin, country_residence)",
    )
    .eq("id", id)
    .eq("otype", "Article")
    .maybeSingle();

  if (postError) console.error("article query failed:", postError);

  if (!post || !post.profiles) {
    return (
      <main className="mx-auto w-full max-w-2xl px-5 py-16">
        <p className="text-text-muted">Content not found.</p>
      </main>
    );
  }

  const creator = post.profiles as unknown as {
    id: string;
    username: string;
    user_type: UserType;
    verified: boolean;
    african_identity: string | null;
    country_origin: string | null;
    country_residence: string | null;
  };
  const isOwner = authUser?.id === creator.id;

  let isLiked = false;
  let isFollowing = false;
  let viewerType: UserType | null = null;
  if (authUser) {
    const { data: likeRow } = await supabase
      .from("likes")
      .select("user_id")
      .eq("user_id", authUser.id)
      .eq("post_id", post.id)
      .maybeSingle();
    isLiked = !!likeRow;

    if (!isOwner) {
      const [{ data: followRow }, { data: viewerProfile }] = await Promise.all([
        supabase
          .from("follows")
          .select("follower")
          .eq("follower", authUser.id)
          .eq("following", creator.id)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("user_type")
          .eq("id", authUser.id)
          .single(),
      ]);
      isFollowing = !!followRow;
      viewerType = (viewerProfile?.user_type as UserType) ?? null;
    }
  }

  const trustLevel = await computeTrust(supabase, creator.id);
  const adinkra = ADINKRA[post.category];
  const showFollow =
    authUser &&
    !isOwner &&
    can(creator.user_type, "beFollowed") &&
    can(viewerType, "follow");

  return (
    <main className="mx-auto w-full max-w-[720px] px-5 py-8">
      <ViewTracker postId={post.id} />
      <div className="mb-4">
        <Link href="/articles" className="text-sm text-text-muted">
          ← Back
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center gap-3">
          <Avatar username={creator.username} size={42} />
          <div className="flex-1">
            <div className="mb-0.5 flex flex-wrap items-center gap-2">
              <Link
                href={`/profile/${creator.username}`}
                className="text-sm font-semibold text-text"
              >
                @{creator.username}
              </Link>
              <TypeBadge type={creator.user_type} />
              {creator.verified && <VerifiedBadge />}
              <TrustBadge level={trustLevel} />
              <LocationBadge
                africanIdentity={creator.african_identity}
                countryOrigin={creator.country_origin}
                countryResidence={creator.country_residence}
              />
            </div>
            <div className="text-xs text-text-dim">
              {fmtDate(post.created_at)} · {readTime(post.content)} · 👁 {post.views ?? 0}
            </div>
          </div>
          <div className="flex gap-1.5">
            <LangBadge lang={post.language} />
            {isOwner && <StatusBadge status={post.status} />}
          </div>
        </div>

        {post.disputed && (
          <div className="mb-3.5 rounded-md border border-warn-border bg-warn-tint px-3.5 py-2.5 text-xs text-warn-text">
            ⚠ Some claims in this post are disputed.
            {post.dispute_note && <em> {post.dispute_note}</em>}
          </div>
        )}

        {adinkra && (
          <div className="mb-2 flex items-center gap-2 text-amber-dim">
            <AdinkraIcon category={post.category} size={16} />
            <span className="text-[11px] font-semibold uppercase tracking-wide">
              {post.category} · {adinkra.name}
            </span>
            <span className="text-[11px] italic text-text-dim">
              &quot;{adinkra.proverb}&quot;
            </span>
          </div>
        )}

        <h1 className="mb-3 font-serif text-2xl font-bold leading-snug text-text">
          {post.title}
        </h1>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {post.tags.map((t: string) => (
            <Tag key={t} label={t} />
          ))}
        </div>

        <div
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMd(post.content) }}
        />

        <div className="my-5 h-px bg-border" />

        <div className="flex flex-wrap items-center gap-2.5">
          <LikeButton
            postId={post.id}
            initialLiked={isLiked}
            initialCount={post.nlikes}
            signedIn={!!authUser}
          />
          <span className="text-[13px] text-text-dim">◌ {post.ncomments}</span>
          {showFollow && (
            <div className="ml-auto">
              <FollowButton targetId={creator.id} initialIsFollowing={isFollowing} />
            </div>
          )}
        </div>

        {isOwner && <PostActions postId={post.id} status={post.status} />}
      </div>
    </main>
  );
}

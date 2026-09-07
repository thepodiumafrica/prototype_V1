import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { computeTrust } from "@/lib/trust";
import { can } from "@/lib/perms";
import type { UserType } from "@/lib/constants";
import { INTEREST_KEY } from "@/lib/constants";
import {
  TypeBadge,
  VerifiedBadge,
  FoundingBadge,
  TrustBadge,
  LocationBadge,
} from "@/components/Badge";
import { Avatar } from "@/components/Avatar";
import { FollowButton } from "@/components/FollowButton";
import { CopyReferralButton } from "@/components/CopyReferralButton";
import { PostCard, type PostCardPost } from "@/components/PostCard";
import { Proverb } from "@/components/Proverb";
import { fetchBookmarkedIds } from "@/lib/post-list";
import { getT } from "@/lib/i18n/locale";
import type { DictKey } from "@/lib/i18n/dictionary";
import { countryLabel, expertiseLabel } from "@/lib/i18n/data-labels";

const TABS = ["published", "drafts", "archived", "bookmarks"] as const;
type Tab = (typeof TABS)[number];
const TAB_STATUS: Partial<Record<Tab, string>> = {
  published: "published",
  drafts: "draft",
  archived: "archived",
};
const TAB_LABEL_KEY: Record<Tab, DictKey> = {
  published: "profileTabPublished",
  drafts: "profileTabDrafts",
  archived: "profileTabArchived",
  bookmarks: "profileTabBookmarks",
};
const TAB_EMPTY_KEY: Record<Tab, DictKey> = {
  published: "emptyPublished",
  drafts: "emptyDrafts",
  archived: "emptyArchived",
  bookmarks: "emptyBookmarks",
};

type BookmarkedPostRow = {
  posts: {
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
    status: string;
    creator: string;
    profiles: {
      username: string;
      user_type: UserType;
      verified: boolean;
    } | null;
  } | null;
};

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { username } = await params;
  const { tab: tabParam } = await searchParams;
  const { t, locale } = await getT();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, username, user_type, verified, founding_creator, bio, profession, industry, african_identity, country_origin, country_residence, expertise, interests, referral_code",
    )
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    return (
      <main className="mx-auto w-full max-w-2xl px-5 py-16">
        <p className="text-text-muted">{t("userNotFound")}</p>
      </main>
    );
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const isOwn = authUser?.id === profile.id;
  const tab: Tab =
    isOwn && TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "published";

  let viewerType: UserType | null = null;
  let isFollowing = false;
  if (authUser && !isOwn) {
    const [{ data: viewerProfile }, { data: followRow }] = await Promise.all([
      supabase
        .from("profiles")
        .select("user_type")
        .eq("id", authUser.id)
        .single(),
      supabase
        .from("follows")
        .select("follower")
        .eq("follower", authUser.id)
        .eq("following", profile.id)
        .maybeSingle(),
    ]);
    viewerType = (viewerProfile?.user_type as UserType) ?? null;
    isFollowing = !!followRow;
  }

  const postSelect =
    "id, otype, category, language, title, content, tags, nlikes, ncomments, views, disputed, dispute_note, created_at, status";

  const [
    { count: followerCount },
    { count: followingCount },
    { count: publishedCount },
    { count: draftCount },
    { count: archivedCount },
    { count: bookmarkCount },
    trustLevel,
    bookmarkedIds,
    shownPostsResult,
  ] = await Promise.all([
    supabase
      .from("follows")
      .select("follower", { count: "exact", head: true })
      .eq("following", profile.id),
    supabase
      .from("follows")
      .select("following", { count: "exact", head: true })
      .eq("follower", profile.id),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("creator", profile.id)
      .eq("status", "published")
      .eq("flagged", false)
      .neq("otype", "Comment"),
    isOwn
      ? supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("creator", profile.id)
          .eq("status", "draft")
          .neq("otype", "Comment")
      : Promise.resolve({ count: 0 }),
    isOwn
      ? supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("creator", profile.id)
          .eq("status", "archived")
          .neq("otype", "Comment")
      : Promise.resolve({ count: 0 }),
    isOwn
      ? supabase
          .from("bookmarks")
          .select("post_id", { count: "exact", head: true })
          .eq("user_id", profile.id)
      : Promise.resolve({ count: 0 }),
    computeTrust(supabase, profile.id),
    fetchBookmarkedIds(supabase, authUser?.id),
    tab === "bookmarks"
      ? supabase
          .from("bookmarks")
          .select(
            `posts(${postSelect}, creator, profiles!posts_creator_fkey(username, user_type, verified))`,
          )
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(20)
      : (() => {
          let q = supabase
            .from("posts")
            .select(postSelect)
            .eq("creator", profile.id)
            .eq("status", TAB_STATUS[tab])
            .neq("otype", "Comment");
          if (tab === "published") q = q.eq("flagged", false);
          return q.order("created_at", { ascending: false }).limit(20);
        })(),
  ]);

  if (shownPostsResult.error)
    console.error("profile posts query failed:", shownPostsResult.error);

  // Bookmarked posts can belong to anyone, unlike the other three tabs
  // (which are always the profile owner's own posts) -- so ownership for
  // the owner-only action buttons has to be checked per post here, not
  // assumed from isOwn.
  const bookmarkedPostRows: BookmarkedPostRow[] =
    tab === "bookmarks"
      ? ((shownPostsResult.data ?? []) as unknown as BookmarkedPostRow[]).filter(
          (r) => r.posts && r.posts.profiles,
        )
      : [];
  const postOwnerIds: string[] = bookmarkedPostRows.map((r) => r.posts!.creator);

  const posts: PostCardPost[] =
    tab === "bookmarks"
      ? bookmarkedPostRows.map((r) => {
          const p = r.posts!;
          return {
            id: p.id,
            creator: p.profiles!.username,
            creator_type: p.profiles!.user_type,
            creator_verified: p.profiles!.verified,
            otype: p.otype,
            status: p.status,
            category: p.category,
            language: p.language,
            title: p.title,
            content: p.content,
            tags: p.tags ?? [],
            nlikes: p.nlikes,
            ncomments: p.ncomments,
            views: p.views,
            disputed: p.disputed,
            dispute_note: p.dispute_note,
            created_at: p.created_at,
          };
        })
      : (
          (shownPostsResult.data ?? []) as unknown as {
            id: string;
            otype: string;
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
            status: string;
          }[]
        ).map((p) => ({
          id: p.id,
          creator: profile.username,
          creator_type: profile.user_type as UserType,
          creator_verified: profile.verified,
          otype: p.otype as "Article" | "Forum Post",
          status: p.status,
          category: p.category,
          language: p.language,
          title: p.title,
          content: p.content,
          tags: p.tags ?? [],
          nlikes: p.nlikes,
          ncomments: p.ncomments,
          views: p.views,
          disputed: p.disputed,
          dispute_note: p.dispute_note,
          created_at: p.created_at,
        }));

  const canShowFollow =
    authUser &&
    !isOwn &&
    can(profile.user_type as UserType, "beFollowed") &&
    can(viewerType, "follow");

  const tabCounts: Record<Tab, number> = {
    published: publishedCount ?? 0,
    drafts: draftCount ?? 0,
    archived: archivedCount ?? 0,
    bookmarks: bookmarkCount ?? 0,
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-start gap-4">
          <Avatar username={profile.username} size={60} />
          <div className="flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-xl font-bold text-text">
                @{profile.username}
              </h1>
              <TypeBadge type={profile.user_type as UserType} locale={locale} />
              {profile.verified && <VerifiedBadge locale={locale} />}
              {profile.founding_creator && <FoundingBadge locale={locale} />}
              <TrustBadge level={trustLevel} locale={locale} />
              <LocationBadge
                africanIdentity={profile.african_identity}
                countryOrigin={
                  profile.country_origin ? countryLabel(profile.country_origin, locale) : null
                }
                countryResidence={
                  profile.country_residence
                    ? countryLabel(profile.country_residence, locale)
                    : null
                }
                locale={locale}
              />
            </div>
            <p className="mb-2 text-sm leading-relaxed text-text-muted">
              {profile.bio || t("noBioYet")}
            </p>
            {profile.profession && (
              <p className="mb-2 text-xs text-text-muted/80">
                {profile.profession}
                {profile.industry ? ` · ${profile.industry}` : ""}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-[13px] text-text-muted/80">
              <span>
                <strong className="text-text">{followerCount ?? 0}</strong>{" "}
                {t("followersLabel")}
              </span>
              <span>
                <strong className="text-text">{followingCount ?? 0}</strong>{" "}
                {t("followingLabel")}
              </span>
              <span>
                <strong className="text-text">{publishedCount ?? 0}</strong>{" "}
                {t("publishedLabel")}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canShowFollow && (
              <FollowButton
                targetId={profile.id}
                initialIsFollowing={isFollowing}
              />
            )}
            {isOwn && (
              <Link
                href="/settings"
                className="rounded-md border border-border px-3 py-1.5 text-sm font-semibold text-text"
              >
                {t("editProfileLink")}
              </Link>
            )}
          </div>
        </div>

        {profile.expertise && profile.expertise.length > 0 && (
          <div className="mb-3.5">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted/80">
              {t("expertiseHeading")}
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.expertise.map((ex: string) => (
                <span
                  key={ex}
                  className="rounded-md border border-border bg-elevated px-2.5 py-1 text-xs text-text"
                >
                  {expertiseLabel(ex, locale)}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted/80">
              {t("interestsHeading")}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((i: string) => (
                <span
                  key={i}
                  className="rounded border border-accent-border bg-amber-faint px-1.5 py-0.5 text-[11px] text-amber-dim"
                >
                  #{(INTEREST_KEY as Record<string, DictKey>)[i] ? t((INTEREST_KEY as Record<string, DictKey>)[i]) : i}
                </span>
              ))}
            </div>
          </div>
        )}

        {isOwn && profile.referral_code && (
          <div className="mt-3.5 border-t border-border pt-3.5">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted/80">
              {t("yourReferralCode")}
            </div>
            <div className="flex items-center gap-2.5">
              <code className="rounded-md bg-elevated px-3 py-1.5 font-mono text-sm text-amber">
                {profile.referral_code}
              </code>
              <CopyReferralButton code={profile.referral_code} />
            </div>
          </div>
        )}
      </div>

      {isOwn && (
        <div className="mb-4 mt-5 flex flex-wrap gap-1.5">
          {TABS.map((tb) => (
            <Link
              key={tb}
              href={`/profile/${username}${tb === "published" ? "" : `?tab=${tb}`}`}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold capitalize ${
                tab === tb
                  ? "border-amber bg-amber-faint text-amber"
                  : "border-border text-text-muted"
              }`}
            >
              {t(TAB_LABEL_KEY[tb])} ({tabCounts[tb]})
            </Link>
          ))}
        </div>
      )}

      <div className={isOwn ? "" : "mt-5"}>
        {posts.length === 0 ? (
          <div className="text-sm text-text-muted/80">
            {tab === "drafts" && <Proverb forKey="drafts" />}
            {tab === "bookmarks" && <Proverb forKey="saved" />}
            {t(TAB_EMPTY_KEY[tab])}
          </div>
        ) : (
          posts.map((p, i) => (
            <PostCard
              key={p.id}
              post={p}
              isOwner={
                tab === "bookmarks"
                  ? authUser?.id === postOwnerIds[i]
                  : isOwn
              }
              signedIn={!!authUser}
              bookmarked={
                tab === "bookmarks" ? true : bookmarkedIds.has(p.id)
              }
              locale={locale}
            />
          ))
        )}
      </div>
    </main>
  );
}

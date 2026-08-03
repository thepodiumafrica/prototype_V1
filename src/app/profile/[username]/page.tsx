import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { computeTrust } from "@/lib/trust";
import { can } from "@/lib/perms";
import type { UserType } from "@/lib/constants";
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

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
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
        <p className="text-text-muted">User not found.</p>
      </main>
    );
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const isOwn = authUser?.id === profile.id;

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

  const [
    { count: followerCount },
    { count: followingCount },
    { count: publishedCount },
    trustLevel,
    { data: posts },
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
    computeTrust(supabase, profile.id),
    supabase
      .from("posts")
      .select("id, title, category, created_at")
      .eq("creator", profile.id)
      .eq("status", "published")
      .eq("flagged", false)
      .neq("otype", "Comment")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const canShowFollow =
    authUser &&
    !isOwn &&
    can(profile.user_type as UserType, "beFollowed") &&
    can(viewerType, "follow");

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
              <TypeBadge type={profile.user_type as UserType} />
              {profile.verified && <VerifiedBadge />}
              {profile.founding_creator && <FoundingBadge />}
              <TrustBadge level={trustLevel} />
              <LocationBadge
                africanIdentity={profile.african_identity}
                countryOrigin={profile.country_origin}
                countryResidence={profile.country_residence}
              />
            </div>
            <p className="mb-2 text-sm leading-relaxed text-text-muted">
              {profile.bio || "No bio yet."}
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
                followers
              </span>
              <span>
                <strong className="text-text">{followingCount ?? 0}</strong>{" "}
                following
              </span>
              <span>
                <strong className="text-text">{publishedCount ?? 0}</strong>{" "}
                published
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
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {profile.expertise && profile.expertise.length > 0 && (
          <div className="mb-3.5">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted/80">
              Expertise
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.expertise.map((ex: string) => (
                <span
                  key={ex}
                  className="rounded-md border border-border bg-elevated px-2.5 py-1 text-xs text-text"
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted/80">
              Interests
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((i: string) => (
                <span
                  key={i}
                  className="rounded border border-accent-border bg-amber-faint px-1.5 py-0.5 text-[11px] text-amber-dim"
                >
                  #{i}
                </span>
              ))}
            </div>
          </div>
        )}

        {isOwn && profile.referral_code && (
          <div className="mt-3.5 border-t border-border pt-3.5">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted/80">
              Your Referral Code
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

      <div className="mt-5">
        {!posts || posts.length === 0 ? (
          <p className="text-sm text-text-muted/80">No posts yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {posts.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-border bg-surface p-3.5"
              >
                <div className="mb-1 text-[11px] uppercase tracking-wide text-amber-dim">
                  {p.category}
                </div>
                <div className="font-serif text-sm font-semibold text-text">
                  {p.title}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

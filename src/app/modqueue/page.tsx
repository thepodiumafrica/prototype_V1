import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ModFlagActions } from "@/components/ModFlagActions";
import { ago } from "@/lib/format";

const TABS = ["pending", "resolved", "transparency"] as const;
type Tab = (typeof TABS)[number];

type FlagRow = {
  id: string;
  reason: string;
  notes: string;
  status: string;
  created_at: string;
  reporter_profile: { username: string } | null;
  posts:
    | {
        id: string;
        otype: string;
        content: string;
        profiles: { username: string } | null;
        parent: { id: string; otype: string } | null;
      }
    | null;
};

// Ported from ThePodium_v5.html's renderModQueue(). Access is gated purely
// by profiles.is_mod -- PERMS has no concept of moderation, and neither
// does this page: it shows "Access restricted." to anyone (including
// guests) who isn't a moderator, matching the prototype's
// `!STATE.user?.isMod` check exactly (no redirect to login).
export default async function ModQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "pending";

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let isMod = false;
  if (authUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_mod")
      .eq("id", authUser.id)
      .single();
    isMod = !!profile?.is_mod;
  }

  if (!isMod) {
    return (
      <main className="mx-auto w-full max-w-2xl px-5 py-16">
        <p className="text-text-muted">Access restricted.</p>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("flags")
    .select(
      `id, reason, notes, status, created_at,
       reporter_profile:profiles!flags_reporter_fkey(username),
       posts!flags_entity_id_fkey(id, otype, content, profiles!posts_creator_fkey(username), parent:posts!parent_id(id, otype))`,
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) console.error("mod queue query failed:", error);
  const flags = (data ?? []) as unknown as FlagRow[];

  const pending = flags.filter((f) => f.status === "pending");
  const resolved = flags.filter((f) => f.status !== "pending");
  const confirmedCount = resolved.filter((f) => f.status === "confirmed").length;
  const dismissedCount = resolved.filter((f) => f.status === "dismissed").length;

  // A flagged Comment has no page of its own -- route to the thread/article
  // it lives on instead. Comments can only be flagged at the top level (see
  // CommentItem.tsx), so parent_id always points straight at the root post.
  function targetHref(post: NonNullable<FlagRow["posts"]>) {
    const root = post.otype === "Comment" && post.parent ? post.parent : post;
    return root.otype === "Article" ? `/article/${root.id}` : `/thread/${root.id}`;
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-bold text-text">
          Moderation Queue
        </h1>
        <p className="text-sm text-text-muted">
          {pending.length} pending · {resolved.length} resolved
        </p>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2.5">
        <div className="rounded-lg border border-border bg-surface p-3 text-center">
          <div className="mb-0.5 text-[22px] font-semibold text-text">
            {flags.length}
          </div>
          <div className="text-[11px] text-text-dim">Total flags</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3 text-center">
          <div className="mb-0.5 text-[22px] font-semibold text-red">
            {confirmedCount}
          </div>
          <div className="text-[11px] text-text-dim">Removed</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3 text-center">
          <div className="mb-0.5 text-[22px] font-semibold text-green">
            {dismissedCount}
          </div>
          <div className="text-[11px] text-text-dim">Dismissed</div>
        </div>
      </div>

      <div className="mb-[18px] rounded-md border border-red-border bg-red-tint px-3.5 py-2.5 text-[13px] leading-relaxed text-red">
        ⚠ SLA: Hate speech within 6 hours. All other flags within 24 hours.
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/modqueue${t === "pending" ? "" : `?tab=${t}`}`}
            className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
              tab === t
                ? "border-amber bg-amber-faint text-amber"
                : "border-border text-text-muted"
            }`}
          >
            {t === "pending"
              ? `Pending${pending.length > 0 ? ` (${pending.length})` : ""}`
              : t === "resolved"
                ? "Resolved"
                : "Public Log"}
          </Link>
        ))}
      </div>

      {tab === "pending" && (
        <>
          {pending.length === 0 && (
            <p className="text-green">✓ No pending flags.</p>
          )}
          {pending.map((f) => {
            const post = f.posts;
            const isHateSpeech = f.reason === "Hate speech";
            return (
              <div
                key={f.id}
                className={`mb-3 rounded-[10px] border p-5 ${
                  isHateSpeech ? "border-red-border" : "border-border"
                }`}
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-[3px] border border-red-border bg-red-tint px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red">
                    {f.reason}
                  </span>
                  <div className="text-[11px] text-text-dim">
                    {ago(f.created_at)}
                    {isHateSpeech && (
                      <span className="ml-1 font-semibold text-red">
                        ⚠ URGENT
                      </span>
                    )}
                  </div>
                </div>

                {post && (
                  <div className="mb-2.5 rounded-md bg-elevated px-3.5 py-2.5">
                    <div className="mb-1 text-xs text-text-dim">
                      @{post.profiles?.username ?? "unknown"} · {post.otype}
                    </div>
                    <p className="text-[13px] leading-relaxed text-text-muted">
                      {post.content.replace(/[#>*]/g, "").slice(0, 200)}…
                    </p>
                  </div>
                )}

                <div className="mb-3 text-xs text-text-dim">
                  Reported by @{f.reporter_profile?.username ?? "unknown"}
                  {f.notes && ` · "${f.notes}"`}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {post ? (
                    <ModFlagActions
                      flagId={f.id}
                      postId={post.id}
                      canDispute={f.reason === "Misinformation"}
                    />
                  ) : (
                    <ModFlagActions flagId={f.id} postId="" canDispute={false} />
                  )}
                  {post && (
                    <Link
                      href={targetHref(post)}
                      className="rounded-md border border-transparent px-3 py-1.5 text-xs font-semibold text-text-muted"
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}

      {tab === "resolved" &&
        resolved.map((f) => (
          <div
            key={f.id}
            className="mb-2 flex items-center justify-between rounded-[10px] border border-border p-5"
          >
            <div>
              <span className="mr-2 text-xs text-text-muted">{f.reason}</span>
              <span className="text-[11px] text-text-dim">
                @{f.reporter_profile?.username ?? "unknown"} · {ago(f.created_at)}
              </span>
            </div>
            <span
              className={`text-[11px] font-semibold uppercase ${
                f.status === "confirmed" ? "text-red" : "text-green"
              }`}
            >
              {f.status === "confirmed" ? "Removed" : "Dismissed"}
            </span>
          </div>
        ))}

      {tab === "transparency" && (
        <div className="rounded-[10px] border border-border p-5">
          <div className="mb-1 text-sm font-semibold text-text">
            Public Moderation Log
          </div>
          <p className="mb-[18px] text-[13px] leading-relaxed text-text-muted">
            The Podium publishes moderation statistics to maintain community
            trust.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {(
              [
                ["Total flags received", flags.length],
                ["Reviewed", resolved.length],
                ["Content removed", confirmedCount],
                ["Flags dismissed", dismissedCount],
                ["Avg review time", "< 12 hours"],
                ["Pending", pending.length],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-md bg-elevated px-3.5 py-2.5">
                <div className="mb-0.5 text-xs text-text-dim">{label}</div>
                <div className="text-lg font-semibold text-text">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { can } from "@/lib/perms";
import type { UserType } from "@/lib/constants";
import { CommentItem, type ThreadComment } from "@/components/CommentItem";
import { CommentComposer } from "@/components/CommentComposer";

type Row = {
  id: string;
  parent_id: string;
  content: string;
  created_at: string;
  nlikes: number;
  profiles: { id: string; username: string } | null;
};

// Ported from the comments section of ThePodium_v5.html's
// renderPostDetail(), which is shared between articles and forum threads.
// Threads are one reply level deep, matching the prototype.
export async function CommentThread({
  postId,
  viewerId,
  viewerType,
}: {
  postId: string;
  viewerId: string | null;
  viewerType: UserType | null;
}) {
  const supabase = await createClient();

  // Top-level comments on this post.
  const { data: topRows, error } = await supabase
    .from("posts")
    .select(
      "id, parent_id, content, created_at, nlikes, profiles!posts_creator_fkey(id, username)",
    )
    .eq("otype", "Comment")
    .eq("parent_id", postId)
    .eq("status", "published")
    .eq("flagged", false)
    .order("created_at", { ascending: true });

  if (error) console.error("comments query failed:", error);
  const top = (topRows ?? []) as unknown as Row[];

  // Replies to those comments (one extra round trip, not one per comment).
  let replyRows: Row[] = [];
  if (top.length > 0) {
    const { data, error: replyError } = await supabase
      .from("posts")
      .select(
        "id, parent_id, content, created_at, nlikes, profiles!posts_creator_fkey(id, username)",
      )
      .eq("otype", "Comment")
      .in(
        "parent_id",
        top.map((c) => c.id),
      )
      .eq("status", "published")
      .eq("flagged", false)
      .order("created_at", { ascending: true });
    if (replyError) console.error("replies query failed:", replyError);
    replyRows = (data ?? []) as unknown as Row[];
  }

  // Which of these the viewer has already liked.
  const allIds = [...top, ...replyRows].map((r) => r.id);
  const likedIds = new Set<string>();
  if (viewerId && allIds.length > 0) {
    const { data: likes } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", viewerId)
      .in("post_id", allIds);
    (likes ?? []).forEach((l) => likedIds.add(l.post_id));
  }

  const toComment = (r: Row) => ({
    id: r.id,
    creator: r.profiles?.username ?? "unknown",
    creatorId: r.profiles?.id ?? "",
    content: r.content,
    created_at: r.created_at,
    nlikes: r.nlikes,
    likedByMe: likedIds.has(r.id),
  });

  const comments: ThreadComment[] = top.map((c) => ({
    ...toComment(c),
    replies: replyRows.filter((r) => r.parent_id === c.id).map(toComment),
  }));

  const totalCount = top.length + replyRows.length;
  const canComment = can(viewerType, "comment");

  return (
    <div>
      <h2 className="mb-3.5 text-[15px] font-semibold text-text">
        Comments ({totalCount})
      </h2>

      {comments.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          signedIn={!!viewerId}
          viewerId={viewerId}
          canComment={canComment}
        />
      ))}

      {viewerId && canComment ? (
        <CommentComposer parentId={postId} mode="comment" />
      ) : (
        <p className="mt-3 text-[13px] text-text-dim">
          {viewerId ? (
            "Your account type cannot comment."
          ) : (
            <>
              <Link href="/login" className="text-amber">
                Sign in
              </Link>{" "}
              to join the conversation.
            </>
          )}
        </p>
      )}
    </div>
  );
}

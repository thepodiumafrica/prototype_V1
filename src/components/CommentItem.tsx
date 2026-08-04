"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { CommentLikeButton } from "@/components/CommentLikeButton";
import { CommentComposer } from "@/components/CommentComposer";
import { ago } from "@/lib/format";

export interface ThreadComment {
  id: string;
  creator: string;
  content: string;
  created_at: string;
  nlikes: number;
  likedByMe: boolean;
  replies: Omit<ThreadComment, "replies">[];
}

// Ported from the comment block inside ThePodium_v5.html's
// renderPostDetail(): one comment, its replies (one level only), a like
// heart on each, and a toggleable reply box.
export function CommentItem({
  comment,
  signedIn,
  canComment,
}: {
  comment: ThreadComment;
  signedIn: boolean;
  canComment: boolean;
}) {
  const [showReply, setShowReply] = useState(false);
  const replies = comment.replies;

  return (
    <div className="mb-2 rounded-[10px] border border-border bg-surface p-5">
      <div className="mb-2 flex items-center gap-2">
        <Avatar username={comment.creator} size={28} />
        <Link
          href={`/profile/${comment.creator}`}
          className="text-[13px] font-semibold text-text"
        >
          @{comment.creator}
        </Link>
        <span className="text-[11px] text-text-dim">
          · {ago(comment.created_at)}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-text-muted">
        {comment.content}
      </p>

      <div className="mt-2 flex items-center gap-3.5">
        <CommentLikeButton
          commentId={comment.id}
          initialLiked={comment.likedByMe}
          initialCount={comment.nlikes}
          signedIn={signedIn}
        />
        {signedIn && canComment ? (
          <button
            type="button"
            onClick={() => setShowReply((s) => !s)}
            className="bg-transparent text-xs text-text-dim"
          >
            ↳ Reply{replies.length ? ` (${replies.length})` : ""}
          </button>
        ) : replies.length ? (
          <span className="text-xs text-text-dim">
            ↳ {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </span>
        ) : null}
      </div>

      {replies.length > 0 && (
        <div className="ml-[34px] mt-2 border-l-2 border-border pl-3.5">
          {replies.map((r) => (
            <div key={r.id} className="border-b border-border py-2">
              <div className="mb-1.5 flex items-center gap-[7px]">
                <Avatar username={r.creator} size={22} />
                <Link
                  href={`/profile/${r.creator}`}
                  className="text-xs font-semibold text-text"
                >
                  @{r.creator}
                </Link>
                <span className="text-[10px] text-text-dim">
                  · {ago(r.created_at)}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-text-muted">
                {r.content}
              </p>
              <CommentLikeButton
                commentId={r.id}
                initialLiked={r.likedByMe}
                initialCount={r.nlikes}
                signedIn={signedIn}
                size="reply"
              />
            </div>
          ))}
        </div>
      )}

      {showReply && (
        <CommentComposer
          parentId={comment.id}
          mode="reply"
          replyingTo={comment.creator}
          onDone={() => setShowReply(false)}
        />
      )}
    </div>
  );
}

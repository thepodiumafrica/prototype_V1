import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { TypeBadge, VerifiedBadge, LangBadge, StatusBadge } from "@/components/Badge";
import { Tag } from "@/components/Tag";
import { PostActions } from "@/components/PostActions";
import { ago, readTime } from "@/lib/format";
import type { UserType } from "@/lib/constants";

export interface PostCardPost {
  id: string;
  creator: string; // username
  creator_type: UserType;
  creator_verified: boolean;
  otype: "Article" | "Forum Post";
  status: string;
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
}

// Ported from ThePodium_v5.html's cardHtml() (Article-only: no bookmark
// button, no series/poll badges -- those belong to features not built yet).
export function PostCard({
  post,
  isOwner = false,
}: {
  post: PostCardPost;
  isOwner?: boolean;
}) {
  const isDraft = post.status === "draft";
  const isArc = post.status === "archived";
  const excerpt = post.content
    .replace(/[#>*`[\]()]/g, "")
    .replace(/\n+/g, " ")
    .slice(0, 160);

  const body = (
    <div
      className={`mb-3 rounded-[10px] border p-5 ${
        isDraft
          ? "border-accent-border"
          : isArc
            ? "border-border opacity-60"
            : "border-border hover:border-border-light hover:bg-elevated"
      }`}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <Avatar username={post.creator} size={32} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-semibold text-text">
              @{post.creator}
            </span>
            <TypeBadge type={post.creator_type} />
            {post.creator_verified && <VerifiedBadge />}
          </div>
          <div className="text-[11px] text-text-dim">{ago(post.created_at)}</div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <LangBadge lang={post.language} />
          {isOwner && <StatusBadge status={post.status} />}
        </div>
      </div>

      {post.disputed && (
        <div className="mb-2.5 rounded-md border border-warn-border bg-warn-tint px-3 py-2 text-xs text-warn-text">
          ⚠ Some claims in this post are disputed.
          {post.dispute_note && <em> {post.dispute_note}</em>}
        </div>
      )}

      <h3
        className={`mb-2 font-serif text-[17px] font-semibold leading-snug ${
          isDraft ? "text-text-muted" : "text-text"
        }`}
      >
        {post.title}
      </h3>
      <p className="mb-3 text-[13px] leading-relaxed text-text-muted">
        {excerpt}…
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {post.tags.slice(0, 3).map((t) => (
          <Tag key={t} label={t} />
        ))}
        <div className="ml-auto flex items-center gap-2.5">
          {post.otype === "Article" && post.status === "published" && (
            <span className="text-[11px] text-text-dim">
              {readTime(post.content)}
            </span>
          )}
          {post.status === "published" && (
            <>
              <span className="text-xs text-text-dim">♥ {post.nlikes}</span>
              <span className="text-xs text-text-dim">◌ {post.ncomments}</span>
            </>
          )}
          {post.views > 0 && (
            <span className="text-[11px] text-text-dim">👁 {post.views}</span>
          )}
        </div>
      </div>

      {isOwner && <PostActions postId={post.id} status={post.status} />}
    </div>
  );

  if (isDraft || isArc) return body;

  // Matches the prototype: Articles open the article view, Forum Posts
  // open the thread view.
  const href =
    post.otype === "Article" ? `/article/${post.id}` : `/thread/${post.id}`;
  return <Link href={href}>{body}</Link>;
}

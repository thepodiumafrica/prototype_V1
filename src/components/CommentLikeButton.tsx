"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// The borderless inline heart used on comments and replies, per
// ThePodium_v5.html. Same likes-table plumbing as <LikeButton>, but the
// prototype styles it differently in a thread, so it's its own component
// rather than a variant prop.
export function CommentLikeButton({
  commentId,
  initialLiked,
  initialCount,
  signedIn,
  size = "comment",
}: {
  commentId: string;
  initialLiked: boolean;
  initialCount: number;
  signedIn: boolean;
  size?: "comment" | "reply";
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (!signedIn) return;
    setPending(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setPending(false);

    if (liked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", commentId);
      if (!error) {
        setLiked(false);
        setCount((c) => c - 1);
      }
    } else {
      const { error } = await supabase
        .from("likes")
        .insert({ user_id: user.id, post_id: commentId });
      if (!error) {
        setLiked(true);
        setCount((c) => c + 1);
      }
    }
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending || !signedIn}
      className={`bg-transparent ${size === "reply" ? "mt-1 text-[11px]" : "text-xs"} ${
        liked ? "text-amber" : "text-text-dim"
      }`}
    >
      ♥ {count}
    </button>
  );
}

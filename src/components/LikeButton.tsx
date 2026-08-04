"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Ported from ThePodium_v5.html's toggleLikeBtn(). The likes table is the
// source of truth; posts.nlikes is kept in sync by a database trigger (see
// supabase/migrations/20260803090008_like_and_view_counters.sql) since a
// liker isn't the post's owner and couldn't otherwise update its counter.
export function LikeButton({
  postId,
  initialLiked,
  initialCount,
  signedIn,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  signedIn: boolean;
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
        .eq("post_id", postId);
      if (!error) {
        setLiked(false);
        setCount((c) => c - 1);
      }
    } else {
      const { error } = await supabase
        .from("likes")
        .insert({ user_id: user.id, post_id: postId });
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
      title={signedIn ? undefined : "Sign in to like content"}
      className={`rounded-md border px-4 py-1.5 text-sm font-medium ${
        liked
          ? "border-amber bg-amber-faint text-amber"
          : "border-border text-text-muted"
      }`}
    >
      ♥ {count}
    </button>
  );
}

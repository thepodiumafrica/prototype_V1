"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Ported from ThePodium_v5.html's toggleBookmark(). Bookmarks are a private
// reading list (see the RLS policy on the bookmarks table), so unlike likes
// there's no shared counter to keep in sync -- just a row that exists or
// doesn't for (user_id, post_id).
export function BookmarkButton({
  postId,
  initialBookmarked,
  variant = "icon",
}: {
  postId: string;
  initialBookmarked: boolean;
  variant?: "icon" | "labeled";
}) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, setPending] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    setPending(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setPending(false);

    if (bookmarked) {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", postId);
      if (!error) setBookmarked(false);
    } else {
      const { error } = await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, post_id: postId });
      if (!error) setBookmarked(true);
    }
    setPending(false);
    router.refresh();
  }

  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`rounded-md border px-3 py-1.5 text-xs ${
          bookmarked
            ? "border-amber bg-amber-faint text-amber"
            : "border-border text-text-muted"
        }`}
      >
        {bookmarked ? "🔖 Saved" : "🏷 Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      title={bookmarked ? "Remove bookmark" : "Bookmark"}
      className={`bg-transparent text-sm ${
        bookmarked ? "text-amber" : "text-text-dim"
      }`}
    >
      {bookmarked ? "🔖" : "🏷"}
    </button>
  );
}

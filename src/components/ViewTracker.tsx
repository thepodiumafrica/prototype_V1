"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Ported from ThePodium_v5.html's trackView(): counts a view once per post
// per browser session (STATE.viewedPosts there; sessionStorage here, since
// there's no client-side app state to hold it in a page-based app).
export function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    const key = "thepodium_viewed_posts";
    let viewed: string[] = [];
    try {
      viewed = JSON.parse(sessionStorage.getItem(key) ?? "[]");
    } catch {
      viewed = [];
    }
    if (viewed.includes(postId)) return;

    const supabase = createClient();
    supabase.rpc("increment_post_views", { post_id: postId }).then(({ error }) => {
      // Only remember this as "viewed" if the call actually succeeded --
      // otherwise a transient failure would permanently suppress retries
      // for the rest of the session.
      if (error) return;
      try {
        sessionStorage.setItem(key, JSON.stringify([...viewed, postId]));
      } catch {
        // sessionStorage unavailable -- view just won't be deduped this session
      }
    });
  }, [postId]);

  return null;
}

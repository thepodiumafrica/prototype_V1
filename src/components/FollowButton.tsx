"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Ported from ThePodium_v5.html's toggleFollow(). The actual permission
// enforcement (follow/beFollowed by user_type) lives in the follows table's
// RLS policy -- this only decides whether to show the button at all, and
// surfaces the server's rejection if it somehow gets through anyway.
export function FollowButton({
  targetId,
  initialIsFollowing,
}: {
  targetId: string;
  initialIsFollowing: boolean;
}) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setPending(true);
    setError(null);
    const supabase = createClient();

    if (isFollowing) {
      const { error: delErr } = await supabase
        .from("follows")
        .delete()
        .eq("following", targetId);
      if (delErr) {
        setError(delErr.message);
      } else {
        setIsFollowing(false);
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return setPending(false);

      const { error: insErr } = await supabase
        .from("follows")
        .insert({ follower: user.id, following: targetId });
      if (insErr) {
        setError("Couldn't follow this account.");
      } else {
        setIsFollowing(true);
      }
    }

    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={
          isFollowing
            ? "rounded-md border border-border px-3 py-1.5 text-sm font-semibold text-text disabled:opacity-50"
            : "rounded-md bg-amber px-3 py-1.5 text-sm font-semibold text-on-primary disabled:opacity-50"
        }
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </button>
      {error && <span className="text-xs text-red">{error}</span>}
    </div>
  );
}

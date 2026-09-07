"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/LocaleProvider";

// Ported from ThePodium_v5.html's submitComment() / submitReply(). Both
// insert a Comment row; the only difference is what parent_id points at
// (the post for a comment, the comment for a reply). posts.ncomments is
// maintained by a DB trigger -- see the comment_count migration.
export function CommentComposer({
  parentId,
  mode,
  replyingTo,
  onDone,
}: {
  parentId: string;
  mode: "comment" | "reply";
  replyingTo?: string;
  onDone?: () => void;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const trimmed = text.trim();
    if (!trimmed) return setError(t("writeSomethingFirst"));

    setPending(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPending(false);
      return setError(t("signInRequired"));
    }

    const { error: insertError } = await supabase.from("posts").insert({
      creator: user.id,
      otype: "Comment",
      status: "published",
      parent_id: parentId,
      content: trimmed,
      title: "",
      category: "",
      tags: [],
    });

    setPending(false);
    if (insertError) {
      // 42501 = RLS rejection (the permission matrix says this account
      // type can't comment). Anything else -- e.g. the rate limit --
      // gets its own real message instead of this one being wrong.
      if (insertError.code === "42501") {
        return setError(t("cannotComment"));
      }
      return setError(insertError.message);
    }

    setText("");
    onDone?.();
    router.refresh();
  }

  const isReply = mode === "reply";

  return (
    <div className={isReply ? "ml-[34px] mt-2.5" : "mt-3.5"}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          isReply ? t("replyToUser", { username: replyingTo ?? "" }) : t("writeComment")
        }
        className={`mb-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-text ${
          isReply ? "h-14 text-[13px]" : "h-20 text-sm"
        }`}
      />
      {error && <p className="mb-2 text-xs text-red">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="rounded-md bg-amber px-3 py-1.5 text-xs font-semibold text-on-primary disabled:opacity-50"
      >
        {isReply ? t("reply") : t("comment")}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PostFormModal } from "@/components/PostFormModal";
import { useLocale } from "@/components/LocaleProvider";

// Ported from ThePodium_v5.html's owner-only card/detail actions:
// Edit / Publish / Archive / Restore.
export function PostActions({
  postId,
  status,
}: {
  postId: string;
  status: string;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);

  async function updateStatus(next: string, resetTimestamp: boolean) {
    setPending(true);
    const supabase = createClient();
    const update: Record<string, unknown> = { status: next };
    if (resetTimestamp) update.created_at = new Date().toISOString();
    await supabase.from("posts").update(update).eq("id", postId);
    setPending(false);
    router.refresh();
  }

  return (
    <div
      className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-md border border-border bg-elevated px-2.5 py-1 text-xs font-semibold text-text-muted"
      >
        {t("editAction")}
      </button>
      {status === "draft" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => updateStatus("published", true)}
          className="rounded-md border border-green-border bg-green-tint px-2.5 py-1 text-xs font-semibold text-green disabled:opacity-50"
        >
          {t("publishAction")}
        </button>
      )}
      {status === "published" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => updateStatus("archived", false)}
          className="rounded-md border border-border bg-elevated px-2.5 py-1 text-xs font-semibold text-text-muted disabled:opacity-50"
        >
          {t("archiveAction")}
        </button>
      )}
      {status === "archived" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => updateStatus("published", false)}
          className="rounded-md border border-accent-border bg-amber-faint px-2.5 py-1 text-xs font-semibold text-amber disabled:opacity-50"
        >
          {t("restoreAction")}
        </button>
      )}

      {editing && (
        <PostFormModal
          mode="edit"
          postId={postId}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

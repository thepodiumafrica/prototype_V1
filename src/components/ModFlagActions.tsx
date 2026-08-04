"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/Modal";

// Ported from ThePodium_v5.html's resolveFlag()/markDisputed()/
// confirmDispute(). Both RPCs are mod-only, enforced inside the function
// itself (see supabase/migrations/20260804090002_moderation.sql) -- this
// component just calls them and refreshes the pending list.
export function ModFlagActions({
  flagId,
  postId,
  canDispute,
}: {
  flagId: string;
  postId: string;
  canDispute: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [note, setNote] = useState(
    "Some claims in this article have not been independently verified.",
  );
  const [error, setError] = useState<string | null>(null);

  async function resolve(action: "confirm" | "dismiss") {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("resolve_flag", {
      p_flag_id: flagId,
      p_action: action,
    });
    setPending(false);
    if (rpcError) return setError(rpcError.message);
    router.refresh();
  }

  async function submitDispute() {
    const trimmed = note.trim();
    if (!trimmed) return setError("Write a note for readers");
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("mark_post_disputed", {
      p_post_id: postId,
      p_note: trimmed,
    });
    setPending(false);
    if (rpcError) return setError(rpcError.message);
    setDisputeOpen(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => resolve("confirm")}
        className="rounded-md border border-red-border bg-red-tint px-3 py-1.5 text-xs font-semibold text-red disabled:opacity-50"
      >
        Remove Content
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => resolve("dismiss")}
        className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-text disabled:opacity-50"
      >
        Dismiss
      </button>
      {canDispute && (
        <button
          type="button"
          disabled={pending}
          onClick={() => setDisputeOpen(true)}
          className="rounded-md border border-accent-border bg-amber-faint px-3 py-1.5 text-xs font-semibold text-amber disabled:opacity-50"
        >
          Mark Disputed
        </button>
      )}
      {error && (
        <div className="w-full rounded-md border border-red-border bg-red-tint px-3 py-2 text-sm text-red">
          {error}
        </div>
      )}

      {disputeOpen && (
        <Modal onClose={() => setDisputeOpen(false)}>
          <h2 className="mb-1.5 font-serif text-lg font-bold text-text">
            Mark as Disputed
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-text-muted">
            The post stays visible with a public advisory banner. Write the
            note readers will see.
          </p>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Dispute note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mb-3 h-20 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
          />
          {error && (
            <div className="mb-3 rounded-md border border-red-border bg-red-tint px-3 py-2 text-sm text-red">
              {error}
            </div>
          )}
          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={pending}
              onClick={submitDispute}
              className="rounded-md border border-accent-border bg-amber-faint px-4 py-2 text-sm font-semibold text-amber disabled:opacity-50"
            >
              Apply Dispute Label
            </button>
            <button
              type="button"
              onClick={() => setDisputeOpen(false)}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

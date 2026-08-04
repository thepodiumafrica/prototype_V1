"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/Modal";
import { FLAG_REASONS } from "@/lib/constants";

// Ported from ThePodium_v5.html's openFlagModal()/submitFlag(). Any
// signed-in user may report content -- PERMS has no gate on this, unlike
// like/follow/comment -- so the only server-side check that matters is the
// flags table's own RLS (a report is always attributed to the reporter,
// see supabase/migrations/20260803090004_create_flags_notifications.sql).
export function FlagButton({
  entityId,
  entityCreatorId,
  variant = "ghost",
  alreadyFlaggedStatus,
}: {
  entityId: string;
  entityCreatorId: string;
  /** "ghost" = post detail's "⚑ Flag" button, "icon" = comment's bare "⚑". */
  variant?: "ghost" | "icon";
  /** If set, the viewer already reported this -- show status, no button. */
  alreadyFlaggedStatus?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setReason(null);
    setNotes("");
    setError(null);
  }

  async function submit() {
    if (!reason) return setError("Select a reason");
    setPending(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPending(false);
      return;
    }

    const { error: insertError } = await supabase.from("flags").insert({
      reporter: user.id,
      entity_creator: entityCreatorId,
      entity_type: "post",
      entity_id: entityId,
      reason,
      notes: notes.trim(),
    });

    setPending(false);
    if (insertError) return setError(insertError.message);
    close();
    router.refresh();
  }

  if (alreadyFlaggedStatus) {
    return (
      <span className="text-[11px] text-text-dim">
        ⚑ {alreadyFlaggedStatus}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={
          variant === "icon"
            ? "ml-auto bg-transparent text-[11px] text-text-dim"
            : "rounded-md border border-border bg-transparent px-2.5 py-1 text-xs font-medium text-text-muted"
        }
      >
        ⚑{variant === "ghost" && " Flag"}
      </button>

      {open && (
        <Modal onClose={close}>
          <h2 className="mb-1.5 font-serif text-lg font-bold text-text">
            Report Content
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-text-muted">
            All reports are reviewed by a human moderator within 24 hours.
          </p>

          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Reason
          </label>
          <div className="mb-3.5 grid grid-cols-2 gap-2">
            {FLAG_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`rounded-md border px-2.5 py-2 text-left text-xs font-medium ${
                  reason === r
                    ? "border-red bg-red-tint text-red"
                    : "border-border bg-transparent text-text-muted"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Additional notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any context…"
            className="mb-3 h-[60px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
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
              onClick={submit}
              className="rounded-md border border-red-border bg-red-tint px-4 py-2 text-sm font-semibold text-red disabled:opacity-50"
            >
              Submit Report
            </button>
            <button
              type="button"
              onClick={close}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

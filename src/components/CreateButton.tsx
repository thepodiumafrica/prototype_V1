"use client";

import { useState } from "react";
import { ArticleFormModal } from "@/components/ArticleFormModal";

// Ported from ThePodium_v5.html's nav "+ Create" button / openCreateModal().
// Scoped to Article only for now -- Forum Post isn't offered as a type
// here yet since the Forum feature (where a created forum post would even
// be visible) doesn't exist yet.
export function CreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-amber px-3 py-1.5 text-sm font-semibold text-on-primary"
      >
        + Create
      </button>
      {open && (
        <ArticleFormModal mode="create" onClose={() => setOpen(false)} />
      )}
    </>
  );
}

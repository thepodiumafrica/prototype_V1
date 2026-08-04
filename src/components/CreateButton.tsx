"use client";

import { useState } from "react";
import { PostFormModal, type PostType } from "@/components/PostFormModal";

// Ported from ThePodium_v5.html's nav "+ Create" button / openCreateModal().
// availableTypes comes from the PERMS matrix (postArticle / createForum),
// so a reader only ever gets "Forum Post".
export function CreateButton({
  availableTypes = ["Article", "Forum Post"],
  defaultType,
  label = "+ Create",
}: {
  availableTypes?: PostType[];
  defaultType?: PostType;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-shrink-0 rounded-md bg-amber px-3 py-1.5 text-sm font-semibold text-on-primary"
      >
        {label}
      </button>
      {open && (
        <PostFormModal
          mode="create"
          availableTypes={availableTypes}
          defaultType={defaultType}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

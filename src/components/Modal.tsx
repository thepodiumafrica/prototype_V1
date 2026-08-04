"use client";

import { createPortal } from "react-dom";

// Ported from ThePodium_v5.html's createModal()/closeModal(): a centered
// overlay that closes on backdrop click.
//
// Rendered via a portal to document.body -- this component is sometimes
// mounted deep inside <SiteNav> (e.g. the "+ Create" button), and that nav
// has backdrop-blur. CSS backdrop-filter (like filter/transform) creates a
// new containing block for position:fixed descendants, so without the
// portal this overlay would be sized relative to the 54px nav bar instead
// of the viewport.
export function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-[600px] overflow-y-auto rounded-xl border border-border bg-surface p-6">
        {children}
      </div>
    </div>,
    document.body,
  );
}

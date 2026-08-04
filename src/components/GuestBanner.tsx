import Link from "next/link";

// Ported from ThePodium_v5.html's guestBannerHtml(). Rendered by the caller
// only when there's no signed-in user.
export function GuestBanner() {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-accent-border bg-amber-faint px-4 py-3">
      <div>
        <p className="mb-0.5 text-[13px] font-semibold text-amber">
          Browsing as a guest.
        </p>
        <p className="text-xs text-amber-dim">
          Sign up to comment, follow creators, and join the conversation.
        </p>
      </div>
      <div className="flex flex-shrink-0 gap-2">
        <Link
          href="/login"
          className="rounded-md border border-border px-3 py-1.5 text-sm font-semibold text-text"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-amber px-3 py-1.5 text-sm font-semibold text-on-primary"
        >
          Join Free
        </Link>
      </div>
    </div>
  );
}

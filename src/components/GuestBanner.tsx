import Link from "next/link";
import { getT } from "@/lib/i18n/locale";

// Ported from ThePodium_v5.html's guestBannerHtml(). Rendered by the caller
// only when there's no signed-in user.
export async function GuestBanner() {
  const { t } = await getT();
  return (
    <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-accent-border bg-amber-faint px-4 py-3">
      <div>
        <p className="mb-0.5 text-[13px] font-semibold text-amber">
          {t("guestBannerTitle")}
        </p>
        <p className="text-xs text-amber-dim">
          {t("guestBannerBody")}
        </p>
      </div>
      <div className="flex flex-shrink-0 gap-2">
        <Link
          href="/login"
          className="rounded-md border border-border px-3 py-1.5 text-sm font-semibold text-text"
        >
          {t("signin")}
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-amber px-3 py-1.5 text-sm font-semibold text-on-primary"
        >
          {t("joinFree")}
        </Link>
      </div>
    </div>
  );
}

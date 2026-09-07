"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ago } from "@/lib/format";
import { useLocale } from "@/components/LocaleProvider";
import type { DictKey } from "@/lib/i18n/dictionary";

export interface NotificationRow {
  id: string;
  type: string;
  entity_id: string | null;
  read: boolean;
  created_at: string;
  posts: { otype: string } | null;
  from_user_profile: { username: string } | null;
}

// The stored `text` column (see supabase/migrations/.../sharing_notifications.sql)
// is a fixed English sentence written by the trigger that created the row --
// it can't switch languages after the fact. Rebuilding the sentence here
// from `type` + the actor's username (both already fetched) keeps a single
// translated source of truth instead of a second, DB-side one.
const NOTIF_KEY: Record<string, DictKey> = {
  like: "notifLike",
  follow: "notifFollow",
  comment: "notifComment",
  reply: "notifReply",
};

// Ported from ThePodium_v5.html's toggleNotifs(): opening the panel marks
// every one of the user's notifications read immediately (not just the
// visible slice), and clicking an item with an entity navigates straight
// to the thread it came from -- a "like"/"comment"/"reply" on a Comment
// points at the root post it lives on (the migration normalises this),
// and a "follow" notification (no entity) just closes the panel, matching
// the prototype exactly.
export function NotificationBell({
  userId,
  initialNotifications,
  initialUnreadCount,
}: {
  userId: string;
  initialNotifications: NotificationRow[];
  initialUnreadCount: number;
}) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    const opening = !open;
    setOpen(opening);
    if (opening && unreadCount > 0) {
      setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      const supabase = createClient();
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("for_user", userId)
        .eq("read", false);
      router.refresh();
    }
  }

  function hrefFor(n: NotificationRow): string | null {
    if (!n.entity_id || !n.posts) return null;
    return n.posts.otype === "Article"
      ? `/article/${n.entity_id}`
      : `/thread/${n.entity_id}`;
  }

  function handleItemClick(n: NotificationRow) {
    setOpen(false);
    const href = hrefFor(n);
    if (href) router.push(href);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        title={t("notificationsTitle")}
        className="rounded-md border border-border bg-transparent px-2.5 py-1.5 text-sm text-text"
      >
        🔔
        {unreadCount > 0 && (
          <span className="ml-1 rounded-lg bg-red px-1.5 py-px text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[150] max-h-[380px] w-[310px] overflow-y-auto rounded-[10px] border border-border bg-surface shadow-lg">
          <div className="border-b border-border px-4 py-3 text-[13px] font-semibold text-text">
            {t("notificationsTitle")}
          </div>
          {notifications.length === 0 ? (
            <div className="p-5 text-center text-[13px] text-text-dim">
              {t("noNotificationsYet")}
            </div>
          ) : (
            notifications.map((n) => {
              const key = NOTIF_KEY[n.type];
              const username = n.from_user_profile?.username ?? "";
              return (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`cursor-pointer border-b border-border px-4 py-2.5 last:border-b-0 ${
                    n.read ? "" : "bg-accent-tint"
                  }`}
                >
                  <div className="mb-0.5 text-[13px] text-text">
                    {key ? t(key, { username }) : ""}
                  </div>
                  <div className="text-[11px] text-text-dim">
                    {ago(n.created_at, locale)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

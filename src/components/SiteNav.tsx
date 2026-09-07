import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar } from "@/components/Avatar";
import { CreateButton } from "@/components/CreateButton";
import { NotificationBell, type NotificationRow } from "@/components/NotificationBell";
import type { PostType } from "@/components/PostFormModal";
import { can } from "@/lib/perms";
import type { UserType } from "@/lib/constants";

export async function SiteNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { username: string; user_type: UserType; is_mod: boolean } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, user_type, is_mod")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  // Matches openCreateModal()'s types array: which kinds of post this
  // account may create, straight from the PERMS matrix.
  const availableTypes: PostType[] = profile
    ? ([
        can(profile.user_type, "postArticle") ? "Article" : null,
        can(profile.user_type, "createForum") ? "Forum Post" : null,
      ].filter(Boolean) as PostType[])
    : [];

  let notifications: NotificationRow[] = [];
  let unreadCount = 0;
  if (user) {
    const [{ data: notifRows }, { count }] = await Promise.all([
      supabase
        .from("notifications")
        .select("id, type, text, entity_id, read, created_at, posts:entity_id(otype)")
        .eq("for_user", user.id)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("for_user", user.id)
        .eq("read", false),
    ]);
    notifications = (notifRows ?? []) as unknown as NotificationRow[];
    unreadCount = count ?? 0;
  }

  return (
    <nav className="flex h-[54px] items-center justify-between border-b border-border bg-surface/90 px-5 backdrop-blur">
      <div className="flex items-center gap-1">
        <Link href="/" className="relative inline-flex px-4 py-2">
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 h-3.5 w-3.5 border-l-2 border-t-2"
            style={{ borderColor: "var(--amber)" }}
          />
          <span
            aria-hidden="true"
            className="absolute bottom-0 right-0 h-3.5 w-3.5 border-b-2 border-r-2"
            style={{ borderColor: "var(--amber)" }}
          />
          <span className="text-[13px] font-extrabold tracking-[0.14em] text-text">
            THE PODIUM
          </span>
        </Link>
        {/* Matches the prototype's navPages(): Feed only appears once signed in. */}
        {profile && (
          <Link
            href="/feed"
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-text-muted"
          >
            Feed
          </Link>
        )}
        <Link
          href="/articles"
          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-text-muted"
        >
          Articles
        </Link>
        <Link
          href="/forum"
          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-text-muted"
        >
          Forum
        </Link>
        <Link
          href="/about"
          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-text-muted"
        >
          About
        </Link>
        {/* Matches navPages(): only moderators ever see this link at all. */}
        {profile?.is_mod && (
          <Link
            href="/modqueue"
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-text-muted"
          >
            Mod
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {profile && availableTypes.length > 0 && (
          <CreateButton availableTypes={availableTypes} />
        )}
        {profile && user && (
          <NotificationBell
            userId={user.id}
            initialNotifications={notifications}
            initialUnreadCount={unreadCount}
          />
        )}
        {profile ? (
          <>
            <Link
              href={`/profile/${profile.username}`}
              className="flex items-center gap-1.5 rounded-md px-1.5 py-1"
            >
              <Avatar username={profile.username} size={26} />
              <span className="max-w-[120px] truncate text-xs font-medium text-text-muted">
                @{profile.username}
              </span>
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-text-muted"
              >
                Out
              </button>
            </form>
          </>
        ) : (
          <>
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
              Join
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

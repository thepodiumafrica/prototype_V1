import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar } from "@/components/Avatar";
import { CreateButton } from "@/components/CreateButton";
import { can } from "@/lib/perms";
import type { UserType } from "@/lib/constants";

export async function SiteNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { username: string; user_type: UserType } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, user_type")
      .eq("id", user.id)
      .single();
    profile = data;
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
        <Link
          href="/articles"
          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-text-muted"
        >
          Articles
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {profile && can(profile.user_type, "postArticle") && <CreateButton />}
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

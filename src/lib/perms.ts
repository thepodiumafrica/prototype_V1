import type { UserType } from "@/lib/constants";

// Ported exactly from ThePodium_v5.html's PERMS object. This mirrors the
// database's RLS policies for UI purposes (hiding a button the server would
// reject anyway) -- the RLS policies in supabase/migrations are the actual
// enforcement, not this file.
export const PERMS: Record<
  UserType,
  {
    postArticle: boolean;
    createForum: boolean;
    comment: boolean;
    like: boolean;
    follow: boolean;
    beFollowed: boolean;
  }
> = {
  blogger: {
    postArticle: true,
    createForum: true,
    comment: true,
    like: true,
    follow: true,
    beFollowed: true,
  },
  news_agency: {
    postArticle: true,
    createForum: true,
    comment: false,
    like: true,
    follow: false,
    beFollowed: true,
  },
  reader: {
    postArticle: false,
    createForum: true,
    comment: true,
    like: true,
    follow: true,
    beFollowed: false,
  },
};

export function can(
  userType: UserType | undefined | null,
  action: keyof (typeof PERMS)["blogger"],
): boolean {
  if (!userType) return false;
  return PERMS[userType][action];
}

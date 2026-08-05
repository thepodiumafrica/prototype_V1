-- Sharing & Notifications: ports ThePodium_v5.html's pushNotif() call
-- sites for the features that actually exist so far -- like, follow,
-- comment, reply. The prototype also calls pushNotif() for series
-- subscriptions, expertise endorsements, referral signups, and DMs, but
-- none of those features are built (Series/DMs are explicitly deferred;
-- endorsements and referral capture were never implemented), so those
-- notification types are out of scope here.
--
-- Notifications are created by triggers (SECURITY DEFINER), not by the
-- client directly. Two reasons:
--   1. The recipient of a notification is never the actor -- the same
--      "someone else's row needs updating" situation as the like/comment
--      counters, which already use this pattern.
--   2. The notification TEXT is now always a fixed, server-generated
--      template, never client-supplied. The Section 2 policy this
--      replaces ("Users can create notifications for actions they take")
--      let any signed-in client insert arbitrary text into anyone's
--      notification feed, attributed to themselves -- a real spam/
--      phishing vector on a table whose whole purpose is displaying text
--      to a user. Nothing in the app ever legitimately needs that path,
--      so it's removed outright rather than left dormant.

drop policy if exists "Users can create notifications for actions they take" on public.notifications;

-- entity_id had no FK before (the prototype's notifications can
-- conceptually point at more than just posts), but every notification
-- type built here does point at a post, so this both documents that and
-- lets the read side embed the target post's otype in one query rather
-- than a second round trip. ON DELETE SET NULL: a removed post shouldn't
-- take the notification row down with it, just stop it from linking
-- anywhere.
alter table public.notifications
  add constraint notifications_entity_id_fkey
  foreign key (entity_id) references public.posts (id) on delete set null;

-- Matches toggleLikeBtn()/toggleLike(): "@username liked your post",
-- regardless of whether the liked thing is an Article, Forum Post, or
-- Comment -- the prototype's wording doesn't vary by type either.
create or replace function public.notify_on_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator uuid;
  v_username text;
  v_liked_otype text;
  v_liked_parent_id uuid;
  v_root_id uuid;
begin
  select creator, otype, parent_id into v_creator, v_liked_otype, v_liked_parent_id
  from public.posts where id = new.post_id;
  if v_creator is null or v_creator = new.user_id then
    return new;
  end if;
  select username into v_username from public.profiles where id = new.user_id;

  -- A liked Comment (top-level or reply) has no page of its own; point
  -- the notification at the thread it lives on, same fix as the
  -- moderation queue's "View" link. root_post_of() only walks up one
  -- level, which is enough for a top-level comment's own parent_id
  -- (already the root) but not for a reply, whose parent_id is another
  -- Comment -- so a liked reply needs one extra hop.
  if v_liked_otype = 'Comment' then
    v_root_id := public.root_post_of(v_liked_parent_id);
  else
    v_root_id := new.post_id;
  end if;

  insert into public.notifications (for_user, type, from_user, text, entity_id)
  values (v_creator, 'like', new.user_id, '@' || v_username || ' liked your post', v_root_id);
  return new;
end;
$$;

drop trigger if exists on_like_notify on public.likes;
create trigger on_like_notify
  after insert on public.likes
  for each row execute function public.notify_on_like();

-- Matches toggleFollow(): "@username started following you". No entity
-- to link to, same as the prototype (pushNotif is called with no
-- entityId here, so the notification item isn't clickable-through).
create or replace function public.notify_on_follow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
begin
  select username into v_username from public.profiles where id = new.follower;
  insert into public.notifications (for_user, type, from_user, text)
  values (new.following, 'follow', new.follower, '@' || v_username || ' started following you');
  return new;
end;
$$;

drop trigger if exists on_follow_notify on public.follows;
create trigger on_follow_notify
  after insert on public.follows
  for each row execute function public.notify_on_follow();

-- Matches submitComment()/submitReply(): a top-level comment notifies the
-- post's creator ("commented on your post"); a reply notifies the parent
-- COMMENT's creator ("replied to your comment"), but the notification
-- still points at the root post (submitReply passes postOid, not the
-- comment's own id) since that's the only page that exists to view it on.
create or replace function public.notify_on_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_parent_creator uuid;
  v_parent_otype text;
  v_username text;
  v_root_id uuid;
begin
  if new.otype <> 'Comment' or new.parent_id is null then
    return new;
  end if;

  select creator, otype into v_parent_creator, v_parent_otype
  from public.posts where id = new.parent_id;

  if v_parent_creator is null or v_parent_creator = new.creator then
    return new;
  end if;

  select username into v_username from public.profiles where id = new.creator;
  v_root_id := public.root_post_of(new.parent_id);

  insert into public.notifications (for_user, type, from_user, text, entity_id)
  values (
    v_parent_creator,
    case when v_parent_otype = 'Comment' then 'reply' else 'comment' end,
    new.creator,
    '@' || v_username || (
      case when v_parent_otype = 'Comment'
        then ' replied to your comment'
        else ' commented on your post'
      end
    ),
    v_root_id
  );
  return new;
end;
$$;

drop trigger if exists on_comment_notify on public.posts;
create trigger on_comment_notify
  after insert on public.posts
  for each row execute function public.notify_on_comment();

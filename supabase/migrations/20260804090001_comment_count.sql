-- Keeps posts.ncomments in sync as comments and replies come and go.
--
-- SECURITY DEFINER for the same reason as the like counter: a commenter
-- isn't the post's owner, so the ordinary "auth.uid() = creator" UPDATE
-- policy on posts would block them from touching that post's counter.
-- This does exactly one thing -- adjust ncomments -- and nothing else.
--
-- Matches ThePodium_v5.html: submitComment() increments the parent post's
-- ncomments, and submitReply() increments the ROOT post's ncomments (not
-- the parent comment's). So a reply, whose parent is itself a Comment,
-- has to walk up one level to find the post the count belongs to.
-- Threads are one reply level deep, so a single hop is always enough.

create or replace function public.root_post_of(child_parent_id uuid)
returns uuid
language sql
stable
set search_path = public
as $$
  select case
    when p.otype = 'Comment' then p.parent_id
    else p.id
  end
  from public.posts p
  where p.id = child_parent_id;
$$;

create or replace function public.update_post_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  root_id uuid;
begin
  if TG_OP = 'INSERT' then
    if new.otype <> 'Comment' or new.parent_id is null then
      return new;
    end if;
    root_id := public.root_post_of(new.parent_id);
    if root_id is not null then
      update public.posts set ncomments = ncomments + 1 where id = root_id;
    end if;
    return new;
  elsif TG_OP = 'DELETE' then
    if old.otype <> 'Comment' or old.parent_id is null then
      return old;
    end if;
    root_id := public.root_post_of(old.parent_id);
    if root_id is not null then
      update public.posts set ncomments = greatest(ncomments - 1, 0) where id = root_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists on_comment_change on public.posts;
create trigger on_comment_change
  after insert or delete on public.posts
  for each row execute function public.update_post_comment_count();

-- Two narrowly-scoped counter-maintenance helpers for posts.nlikes and
-- posts.views. Both need to update a post the caller doesn't own (anyone
-- can like or view anyone else's published post), which the posts UPDATE
-- policy ("auth.uid() = creator") would otherwise block -- so both run
-- with elevated privilege, but each does exactly one narrow thing and
-- nothing else.

-- Keeps posts.nlikes in sync with the likes table. Runs as a trigger
-- (SECURITY DEFINER) so a like from someone who isn't the post's owner can
-- still update that post's counter.
create or replace function public.update_post_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set nlikes = nlikes + 1 where id = new.post_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.posts set nlikes = greatest(nlikes - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists on_like_change on public.likes;
create trigger on_like_change
  after insert or delete on public.likes
  for each row execute function public.update_post_like_count();

-- Increments posts.views by 1. Callable by anyone (including anon), since
-- guests can read published articles and their views should still count.
create or replace function public.increment_post_views(post_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts set views = views + 1 where id = post_id;
$$;

grant execute on function public.increment_post_views(uuid) to anon, authenticated;

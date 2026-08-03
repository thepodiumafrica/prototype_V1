-- Implements ThePodium_v5.html's computeTrust(): derives a public 1-5 trust
-- level from a creator's published posts (likes, count) and confirmed flags
-- against them.
--
-- Must be SECURITY DEFINER: the flags table is intentionally private (only
-- the reporter or a moderator may read a given flag -- see
-- 20260803090004_create_flags_notifications.sql). Trust level is meant to
-- be a PUBLIC number on every profile, so this function reads flags with
-- elevated privilege but returns only the derived score, never the
-- underlying rows -- callers can't use it to see who reported whom.

create or replace function public.compute_trust(profile_id uuid)
returns smallint
language sql
stable
security definer
set search_path = public
as $$
  select case
    when t.bad_count > 2 then 1
    when t.likes > 500 and t.post_count > 10 then 4
    when t.likes > 200 and t.post_count > 5 then 3
    when t.post_count >= 2 then 2
    else 1
  end::smallint
  from (
    select
      coalesce(sum(p.nlikes), 0) as likes,
      count(p.id) as post_count,
      (
        select count(*) from public.flags f
        where f.entity_creator = profile_id and f.status = 'confirmed'
      ) as bad_count
    from public.posts p
    where p.creator = profile_id and p.status = 'published'
  ) t;
$$;

grant execute on function public.compute_trust(uuid) to anon, authenticated;

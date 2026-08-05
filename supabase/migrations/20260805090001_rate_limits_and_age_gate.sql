-- Rate limiting --------------------------------------------------------------
--
-- Two BEFORE INSERT triggers, one per table, counting how many rows the
-- same actor has inserted recently and rejecting the insert once they're
-- over a threshold. This runs in Postgres itself regardless of which
-- client makes the request (browser, curl, a modified app) -- the same
-- "server enforces it, not just the UI" principle every RLS policy in
-- this schema already follows.
--
-- Neither function needs SECURITY DEFINER: the count only ever looks at
-- the *same* user's own rows (new.creator / new.reporter, which the
-- INSERT policies already require to equal auth.uid()), and both
-- posts/flags already let a user read their own rows regardless of
-- status, so the check works fine under ordinary RLS.

create or replace function public.enforce_post_rate_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_recent_count integer;
begin
  select count(*) into v_recent_count
  from public.posts
  where creator = new.creator
    and created_at > now() - interval '10 minutes';

  if v_recent_count >= 10 then
    raise exception 'You are posting too quickly. Please wait a few minutes and try again.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_post_rate_limit_trigger on public.posts;
create trigger enforce_post_rate_limit_trigger
  before insert on public.posts
  for each row execute function public.enforce_post_rate_limit();

-- Covers Articles, Forum Posts, and Comments/replies together (they're
-- one table -- see posts.otype), so a comment-spam burst is throttled the
-- same as an article-spam burst. 10 per 10 minutes is generous for a real
-- person, tight for a script; adjust the numbers in this function if you
-- want a different balance.

create or replace function public.enforce_flag_rate_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_recent_count integer;
begin
  select count(*) into v_recent_count
  from public.flags
  where reporter = new.reporter
    and created_at > now() - interval '1 hour';

  if v_recent_count >= 20 then
    raise exception 'You have filed too many reports recently. Please wait a while and try again.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_flag_rate_limit_trigger on public.flags;
create trigger enforce_flag_rate_limit_trigger
  before insert on public.flags
  for each row execute function public.enforce_flag_rate_limit();

-- Sign-up rate limiting is deliberately NOT a trigger like the two above:
-- Postgres has no visibility into the request's IP address, and "too many
-- inserts by this actor" doesn't apply the same way when the actor (the
-- new auth user) doesn't exist yet at the moment you'd want to block the
-- request. The right layer for this is Supabase Auth's own built-in rate
-- limits, which sit in front of every /auth/v1/signup call and do have
-- IP visibility -- see the walkthrough for how to configure it.

-- Age gate ---------------------------------------------------------------
--
-- date_of_birth is submitted at sign-up (see options.data in the signup
-- form) and checked here, inside the SAME transaction that creates the
-- profile row. A submission that fails the check raises an exception,
-- which rolls back the auth.users insert too -- so there's no way to end
-- up with an account that never passed the check, and no way to bypass
-- it by calling the API directly with a fabricated client-side check.
--
-- Deliberately NOT persisted to profiles: that table's SELECT policy is
-- "publicly readable" (auth.uid() is irrelevant, using (true)), so a
-- birthdate column there would be visible to every signed-in and
-- signed-out visitor, not just the account owner. Restricting that would
-- mean reworking column-level grants across every existing read in the
-- app -- out of scope for "add an age gate." The date is validated and
-- then discarded; nothing about a user's age is stored or exposed.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_username text := new.raw_user_meta_data ->> 'username';
  new_dob date;
begin
  begin
    new_dob := (new.raw_user_meta_data ->> 'date_of_birth')::date;
  exception when others then
    new_dob := null;
  end;

  if new_dob is null then
    raise exception 'Date of birth is required.';
  end if;
  if new_dob > current_date - interval '13 years' then
    raise exception 'You must be at least 13 years old to join The Podium.';
  end if;

  insert into public.profiles (id, username, user_type, african_identity, referral_code)
  values (
    new.id,
    new_username,
    new.raw_user_meta_data ->> 'user_type',
    -- Matches the prototype: new accounts default to "continent" until the
    -- onboarding flow's identity step sets the real value (or it's skipped).
    'continent',
    -- Matches the prototype's doSignUp(): first 6 chars of the username,
    -- uppercased, plus a random 4-digit suffix.
    upper(left(new_username, 6)) || floor(random() * 9000 + 1000)::int
  );
  return new;
end;
$$;

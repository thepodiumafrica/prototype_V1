-- Auto-creates a profiles row whenever a new user finishes Supabase Auth
-- sign-up. Reads username/user_type off the signUp() call's `options.data`
-- (Supabase stores this as auth.users.raw_user_meta_data).
--
-- This must be SECURITY DEFINER: it fires during the sign-up transaction,
-- before any user session exists, so the ordinary "auth.uid() = id" insert
-- policy on profiles could never pass on its own. The function runs with
-- elevated privilege specifically to perform this one insert; it does not
-- bypass RLS for anything else.
--
-- If username is missing/duplicate or user_type isn't one of the three
-- allowed values, the insert violates a constraint on profiles, which
-- rolls back the whole sign-up transaction (no orphaned auth user without
-- a profile). Supabase surfaces this to the client as a sign-up error.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_username text := new.raw_user_meta_data ->> 'username';
begin
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

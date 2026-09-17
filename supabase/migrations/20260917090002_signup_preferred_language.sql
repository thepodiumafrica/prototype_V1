-- Carries the interface language a visitor was using at sign-up time into
-- their new profile row, the same way username/user_type/date_of_birth
-- already flow from auth signup metadata into public.profiles -- see
-- 20260803090005_auto_create_profile.sql (original trigger) and
-- 20260805090001_rate_limits_and_age_gate.sql (previous replace, added the
-- age gate). Only this function changes; the trigger binding itself
-- (on auth.users, after insert) is untouched.
--
-- No CHECK constraint on the stored value here, deliberately: which
-- languages are valid is defined once, in the app's I18N dictionary (see
-- src/lib/i18n/dictionary.ts), not duplicated into the database schema --
-- adding a language stays a data change, not a migration.

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

  insert into public.profiles (id, username, user_type, african_identity, referral_code, preferred_language)
  values (
    new.id,
    new_username,
    new.raw_user_meta_data ->> 'user_type',
    -- Matches the prototype: new accounts default to "continent" until the
    -- onboarding flow's identity step sets the real value (or it's skipped).
    'continent',
    -- Matches the prototype's doSignUp(): first 6 chars of the username,
    -- uppercased, plus a random 4-digit suffix.
    upper(left(new_username, 6)) || floor(random() * 9000 + 1000)::int,
    -- Whatever the sign-up form's language toggle was set to; falls back
    -- to the column's own default if the client didn't send one.
    coalesce(new.raw_user_meta_data ->> 'preferred_language', 'en')
  );
  return new;
end;
$$;

-- This trigger runs SECURITY DEFINER (owner privileges), so it can insert
-- preferred_language regardless of the grant below -- that grant is for
-- the *other* write path: an already-signed-in visitor changing their
-- language from the nav toggle, which updates their own row as an
-- ordinary `authenticated` client request.
--
-- 20260804090002_moderation.sql revoked table-level UPDATE on
-- public.profiles for `authenticated` and re-granted it column-by-column,
-- allowlisting only the columns settings-form.tsx/onboarding-flow.tsx
-- actually wrote at the time. preferred_language is a new writable
-- column, so it needs adding to that allowlist too -- GRANT UPDATE (col)
-- is additive, this does not touch the columns granted there already.
grant update (preferred_language) on public.profiles to authenticated;

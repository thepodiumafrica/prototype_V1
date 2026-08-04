-- Moderation actions that require elevated privilege: a moderator resolving
-- someone else's flag has to update rows they don't own (the flagged
-- content, the reported user's violation count), which the ordinary
-- posts/profiles UPDATE policies ("auth.uid() = creator/id") would
-- otherwise block. Both RPCs below check is_mod themselves and touch only
-- the exact columns ThePodium_v5.html's resolveFlag()/confirmDispute()
-- touch -- nothing else on the target row is exposed to a moderator
-- through these functions.

create or replace function public.resolve_flag(p_flag_id uuid, p_action text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_flag record;
begin
  if p_action not in ('confirm', 'dismiss') then
    raise exception 'invalid action';
  end if;

  if not exists (
    select 1 from public.profiles where id = auth.uid() and is_mod = true
  ) then
    raise exception 'not authorized';
  end if;

  select * into v_flag from public.flags where id = p_flag_id;
  if not found then
    raise exception 'flag not found';
  end if;

  if p_action = 'confirm' then
    update public.flags set status = 'confirmed' where id = p_flag_id;
    update public.posts set flagged = true where id = v_flag.entity_id;
    update public.profiles set violations = violations + 1 where id = v_flag.entity_creator;
  else
    update public.flags set status = 'dismissed' where id = p_flag_id;
  end if;
end;
$$;

grant execute on function public.resolve_flag(uuid, text) to authenticated;

-- Matches confirmDispute(): the post stays visible (unlike a removal) but
-- carries a public advisory banner with the moderator's note.
create or replace function public.mark_post_disputed(p_post_id uuid, p_note text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles where id = auth.uid() and is_mod = true
  ) then
    raise exception 'not authorized';
  end if;

  if p_note is null or btrim(p_note) = '' then
    raise exception 'a note is required';
  end if;

  update public.posts set disputed = true, dispute_note = p_note where id = p_post_id;
end;
$$;

grant execute on function public.mark_post_disputed(uuid, text) to authenticated;

-- Close a real gap this feature depends on: "Users can update their own
-- profile" (Section 2) only checks row ownership (auth.uid() = id), not
-- which columns change. Without this, any signed-in user could call the
-- client library directly (bypassing the UI entirely) and set is_mod=true
-- on themselves, or zero out their own violations after a strike --
-- exactly the class of gap RLS exists to close, and it would undermine
-- moderation specifically. verified and founding_creator get the same
-- treatment: neither has a self-service write path anywhere in
-- ThePodium_v5.html either (the "Apply Verified" flow only ever shows a
-- toast -- see submitCreatorApp() -- it never sets verified itself), so
-- locking them down here doesn't remove any working functionality.
--
-- A column-level REVOKE alone doesn't work here: Postgres checks
-- table-level and column-level UPDATE grants independently, so
-- Supabase's default blanket "UPDATE ON TABLE profiles" grant to
-- `authenticated` would still cover every column regardless of what's
-- revoked at the column level. The only correct fix is to revoke the
-- table-level grant entirely and re-grant UPDATE only on the columns
-- something in this app actually writes today (settings-form.tsx,
-- onboarding-flow.tsx): bio, profession, industry, linkedin_url,
-- african_identity, country_origin, country_residence, expertise,
-- interests. Everything else on profiles -- is_mod, violations,
-- verified, founding_creator, username, user_type, referral_code,
-- referred_by, expertise_endorsements, read_history, id, timestamps --
-- becomes read-only to ordinary clients.
--
-- This does NOT affect resolve_flag() above: a SECURITY DEFINER function
-- executes with its owner's privileges (the table owner), which grants
-- to the `authenticated` role don't apply to -- only ordinary client
-- requests running as `authenticated` are affected.
revoke update on public.profiles from authenticated;
grant update (
  bio, profession, industry, linkedin_url,
  african_identity, country_origin, country_residence,
  expertise, interests
) on public.profiles to authenticated;

-- Schema prep for automatic article translation (I18N Stage 3): a reader's
-- preferred interface/reading language, and a cache table for machine
-- translations of published posts. Additive only -- no existing table is
-- recreated or altered beyond one new column, and no existing row's data
-- is touched (the new column backfills every existing profile with the
-- given default, per Postgres's normal ADD COLUMN ... DEFAULT behaviour).

-- profiles.preferred_language ------------------------------------------------
-- Which language a reader wants articles shown in. Separate from
-- posts.language (which records what language a given post/comment was
-- *written* in) -- this is the reader's own preference, read at article
-- render time to decide whether to show the original or a cached
-- translation.
alter table public.profiles
  add column if not exists preferred_language text not null default 'en';

-- post_translations -----------------------------------------------------------
-- One cached machine translation of one post, into one target language.
-- Populated by the server-side translation pipeline (Stage 3) at publish
-- time and on a manual "retranslate" action -- never written to directly
-- by a browser client, and never re-generated just because a reader
-- opened the page (that's the whole point of caching it here instead of
-- calling the translation API on every view).
create table if not exists public.post_translations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  language text not null,
  translated_title text not null default '',
  translated_content text not null default '',
  source_language text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- At most one cached translation per (post, target language) -- this is
  -- what makes "never translate the same post/language twice" enforceable
  -- rather than just a convention: a retranslate is an upsert against this
  -- constraint (insert ... on conflict (post_id, language) do update ...),
  -- not a fresh row every time.
  unique (post_id, language)
);

comment on table public.post_translations is
$$Cached machine translations of posts.title/content, one row per
(post_id, language). source_language records what posts.language was at
translation time, so a later edit to the original can be detected as
having made the cached translation stale.$$;

drop trigger if exists set_post_translations_updated_at on public.post_translations;
create trigger set_post_translations_updated_at
  before update on public.post_translations
  for each row execute function public.set_updated_at();

-- Row Level Security --------------------------------------------------------

alter table public.post_translations enable row level security;

-- A translation is exactly as public as the post it belongs to -- same
-- condition as "Published posts are publicly readable" in
-- 20260803090002_create_posts.sql, re-checked here via a join back to
-- posts so a translation can never leak a draft/flagged post's content
-- through a wider policy than the original has.
create policy "Translations are readable wherever their post is"
  on public.post_translations for select
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_translations.post_id
        and ((p.status = 'published' and p.flagged = false) or auth.uid() = p.creator)
    )
  );

-- Deliberately no insert/update/delete policy: with RLS enabled and no
-- matching policy, every write is denied to the anon/authenticated roles
-- by default. Only the server-side translation pipeline writes this
-- table, using the service-role key, which bypasses RLS entirely -- so no
-- client, however it authenticates, may write a translation directly.

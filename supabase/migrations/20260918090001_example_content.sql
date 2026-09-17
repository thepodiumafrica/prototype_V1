-- Launch-time example content: seed articles, forum posts, comments and
-- profiles (ported verbatim from ThePodium_v5.html's STATE object) that
-- show visitors the shape and ambition of the platform before founding
-- creators publish real pieces, and can be cleanly removed afterwards --
-- see scripts/seed-examples.mjs and scripts/clear-examples.mjs.
--
-- is_example is deliberately NOT added to the column-level UPDATE grant
-- allowlist below (or anywhere else) -- 20260804090002_moderation.sql
-- already revoked table-level UPDATE on profiles from `authenticated` and
-- re-granted it column by column, so leaving is_example out of every such
-- grant means an ordinary signed-in user (including someone logged into
-- an example account with its printed demo password) can never flip it,
-- on their own profile or anyone else's, through the public API.

alter table public.posts
  add column if not exists is_example boolean not null default false,
  add column if not exists example_key text;

-- Unique only among non-null values (Postgres treats NULLs as distinct),
-- so real posts -- which never set this -- never collide with each other.
-- example_key is the prototype's own id for the piece (e.g. "a006", the
-- Lagos startup post-mortem) -- a stable, human-legible handle the seed
-- script upserts on, instead of matching fragile things like title text.
create unique index if not exists posts_example_key_key on public.posts (example_key);

alter table public.profiles
  add column if not exists is_example boolean not null default false;

create index if not exists posts_is_example_idx on public.posts (is_example);
create index if not exists profiles_is_example_idx on public.profiles (is_example);

-- Used by the category-by-category retirement check: "does this category
-- already have 3+ real published articles?" without scanning the whole
-- table.
create index if not exists posts_otype_status_category_idx
  on public.posts (otype, status, category)
  where is_example = false;

comment on column public.posts.is_example is
$$True for seed content shipped at launch (see scripts/seed-examples.mjs).
Shown with a visible "Example" badge everywhere it renders; never counts
toward a real creator''s published stats.$$;

comment on column public.profiles.is_example is
$$True for the small set of sample personas (tech_temi, finance_amara,
culture_kwame, ...) the launch seed script creates as real Supabase Auth
accounts. Always shown with a visible "Example" badge -- never presented
as a real person.$$;

-- app_settings: a tiny generic key/value table for operator-controlled
-- toggles that don't warrant their own column anywhere -- starting with
-- whether example articles should auto-retire category by category (see
-- scripts/toggle-example-retirement.mjs and lib/example-retirement.ts).
-- Publicly readable (every page that lists posts needs to check it, incl.
-- signed-out visitors) but writable only by the service role -- there's
-- no INSERT/UPDATE/DELETE policy below, which is a default deny for
-- everyone except service_role (which bypasses RLS entirely).
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values ('auto_retire_examples', 'false'::jsonb)
on conflict (key) do nothing;

alter table public.app_settings enable row level security;

create policy "Settings are publicly readable"
  on public.app_settings for select
  using (true);

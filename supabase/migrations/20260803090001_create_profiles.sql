-- profiles: one row per user, extending auth.users with public profile data.
-- Passwords are never stored here -- Supabase Auth owns the auth.users table
-- and all credential handling.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  user_type text not null check (user_type in ('blogger', 'news_agency', 'reader')),
  is_mod boolean not null default false,
  verified boolean not null default false,
  bio text not null default '',
  african_identity text check (african_identity in ('continent', 'diaspora', 'ally')),
  country_origin text,
  country_residence text,
  profession text not null default '',
  industry text not null default '',
  years_experience smallint,
  linkedin_url text not null default '',
  expertise text[] not null default '{}',
  expertise_endorsements jsonb not null default '{}'::jsonb,
  interests text[] not null default '{}',
  referral_code text unique,
  referred_by text,
  founding_creator boolean not null default false,
  violations smallint not null default 0,
  read_history uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
$$One row per user. username/user_type are set at signup; african_identity,
country_origin, country_residence and interests are filled during the
3-step onboarding. followers/following live in the follows table, not here.$$;

create index if not exists profiles_user_type_idx on public.profiles (user_type);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Row Level Security --------------------------------------------------------

alter table public.profiles enable row level security;

-- Anyone (including logged-out visitors) can read any profile.
create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

-- A user may only create the profile row that matches their own auth id.
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- A user may only edit their own profile row.
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- A user may only delete their own profile row.
create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

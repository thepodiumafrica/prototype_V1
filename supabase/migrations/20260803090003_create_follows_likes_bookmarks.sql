-- follows, likes, bookmarks: the three "who did what to what" join tables.
-- All use a composite primary key of the two participants, so the same
-- relationship can't be recorded twice.

create table if not exists public.follows (
  follower uuid not null references public.profiles (id) on delete cascade,
  following uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower, following),
  check (follower <> following)
);

create index if not exists follows_following_idx on public.follows (following);

alter table public.follows enable row level security;

-- Follower/following lists are public (shown on profiles).
create policy "Follows are publicly readable"
  on public.follows for select
  using (true);

-- A user may only create a follow row where they are the follower.
create policy "Users can follow as themselves"
  on public.follows for insert
  with check (auth.uid() = follower);

-- A user may only remove a follow row where they are the follower (unfollow).
create policy "Users can unfollow as themselves"
  on public.follows for delete
  using (auth.uid() = follower);

create table if not exists public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index if not exists likes_post_id_idx on public.likes (post_id);

alter table public.likes enable row level security;

-- Like counts and who-liked-what are public.
create policy "Likes are publicly readable"
  on public.likes for select
  using (true);

-- A user may only like content as themselves.
create policy "Users can like as themselves"
  on public.likes for insert
  with check (auth.uid() = user_id);

-- A user may only remove their own like.
create policy "Users can unlike as themselves"
  on public.likes for delete
  using (auth.uid() = user_id);

create table if not exists public.bookmarks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index if not exists bookmarks_post_id_idx on public.bookmarks (post_id);

alter table public.bookmarks enable row level security;

-- Unlike follows/likes, bookmarks are a private reading list: only the
-- owner can see what they've saved.
create policy "Users can view their own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can bookmark as themselves"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

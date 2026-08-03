-- posts: unified table for articles, forum posts, and comments (comments and
-- replies use parent_id + otype = 'Comment'). nlikes/ncomments/views are
-- cached counters, matching the prototype's approach.
--
-- Intentionally omitted vs. the prototype: seriesId and pollOptions. Series
-- and polls are deferred features (brief Section 6) -- not built at launch.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  creator uuid not null references public.profiles (id) on delete cascade,
  otype text not null check (otype in ('Article', 'Forum Post', 'Comment')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  category text not null default '',
  language text not null default 'en',
  tags text[] not null default '{}',
  title text not null default '',
  content text not null default '',
  parent_id uuid references public.posts (id) on delete cascade,
  nlikes integer not null default 0,
  ncomments integer not null default 0,
  views integer not null default 0,
  flagged boolean not null default false,
  disputed boolean not null default false,
  dispute_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.posts is
$$Articles, forum posts, and comments in one table (see otype). parent_id
links a comment to the post/comment it replies to.$$;

create index if not exists posts_creator_idx on public.posts (creator);
create index if not exists posts_status_idx on public.posts (status);
create index if not exists posts_parent_id_idx on public.posts (parent_id);
create index if not exists posts_category_idx on public.posts (category);

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- Row Level Security --------------------------------------------------------

alter table public.posts enable row level security;

-- Anyone can read published, non-flagged posts. A signed-in creator can also
-- read their own posts regardless of status, so they can see their own
-- drafts and archived work.
create policy "Published posts are publicly readable"
  on public.posts for select
  using (
    (status = 'published' and flagged = false)
    or auth.uid() = creator
  );

-- A user may only create posts attributed to themselves.
-- NOTE: this does not yet enforce which user_type may post which otype
-- (e.g. readers can't publish articles) -- that permission matrix is
-- Section 3's job, enforced as an additional policy layer.
create policy "Users can create their own posts"
  on public.posts for insert
  with check (auth.uid() = creator);

-- A user may only edit their own posts.
create policy "Users can update their own posts"
  on public.posts for update
  using (auth.uid() = creator)
  with check (auth.uid() = creator);

-- A user may only delete their own posts.
create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = creator);

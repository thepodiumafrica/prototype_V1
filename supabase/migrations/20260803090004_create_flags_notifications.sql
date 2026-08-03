-- flags: moderation reports. Unlike the other tables, these are NOT public --
-- visible only to the person who filed the report and to moderators, so a
-- flag can't be used to see who reported whom or retaliate.
create table if not exists public.flags (
  id uuid primary key default gen_random_uuid(),
  reporter uuid not null references public.profiles (id) on delete cascade,
  entity_creator uuid not null references public.profiles (id) on delete cascade,
  entity_type text not null default 'post',
  entity_id uuid not null references public.posts (id) on delete cascade,
  reason text not null check (
    reason in (
      'Hate speech', 'Misinformation', 'Spam', 'Harassment',
      'Inappropriate content', 'Copyright violation', 'Other'
    )
  ),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'dismissed')),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists flags_status_idx on public.flags (status);
create index if not exists flags_entity_id_idx on public.flags (entity_id);

alter table public.flags enable row level security;

-- Only the reporter themselves, or a moderator, can see a given flag.
create policy "Reporters and moderators can view flags"
  on public.flags for select
  using (
    auth.uid() = reporter
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_mod = true
    )
  );

-- Any signed-in user can file a flag, attributed to themselves.
create policy "Users can file a flag as themselves"
  on public.flags for insert
  with check (auth.uid() = reporter);

-- Only moderators can resolve (confirm/dismiss) a flag.
create policy "Moderators can resolve flags"
  on public.flags for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_mod = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_mod = true
    )
  );

-- No delete policy: flags can't be deleted by anyone (default-deny), so the
-- moderation trail can't be erased.

-- notifications: in-app alerts. Private to the recipient.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  for_user uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  from_user uuid references public.profiles (id) on delete set null,
  text text not null,
  entity_id uuid,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_for_user_read_idx
  on public.notifications (for_user, read);

alter table public.notifications enable row level security;

-- Only the recipient can see their own notifications.
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = for_user);

-- A notification is created by the user whose action triggered it (the
-- actor), addressed to someone else (the recipient) -- so "own row" here
-- means from_user, not for_user.
create policy "Users can create notifications for actions they take"
  on public.notifications for insert
  with check (auth.uid() = from_user);

-- Only the recipient can mark their own notifications read.
create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = for_user)
  with check (auth.uid() = for_user);

-- Only the recipient can delete their own notifications.
create policy "Users can delete their own notifications"
  on public.notifications for delete
  using (auth.uid() = for_user);

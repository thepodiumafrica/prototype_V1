-- Enforces the prototype's PERMS matrix (blogger / news_agency / reader) as
-- actual Postgres policies, so the rules hold even if the app's UI is
-- bypassed entirely (curl, a modified client, a bug in a form, etc).
--
-- From ThePodium_v5.html:
--   PERMS = {
--     blogger:     { postArticle: true,  createForum: true, comment: true,  follow: true,  beFollowed: true  },
--     news_agency: { postArticle: true,  createForum: true, comment: false, follow: false, beFollowed: true  },
--     reader:      { postArticle: false, createForum: true, comment: true,  follow: true,  beFollowed: false },
--   }
--
-- otype maps to the permission that gates it: Article -> postArticle,
-- Forum Post -> createForum, Comment -> comment.

create or replace function public.can_post_otype(target_otype text, uid uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select case target_otype
    when 'Article' then exists (
      select 1 from public.profiles
      where id = uid and user_type in ('blogger', 'news_agency')
    )
    when 'Forum Post' then exists (
      select 1 from public.profiles where id = uid
    )
    when 'Comment' then exists (
      select 1 from public.profiles
      where id = uid and user_type in ('blogger', 'reader')
    )
    else false
  end;
$$;

comment on function public.can_post_otype is
$$Implements postArticle/createForum/comment from the prototype's PERMS
object: which account types may create which kind of post.$$;

-- Replace the Section 2 baseline policies with ones that also check
-- can_post_otype(), so e.g. a reader's INSERT of otype='Article' is
-- rejected by Postgres itself, not just hidden in the UI.

drop policy if exists "Users can create their own posts" on public.posts;
create policy "Users can create their own posts"
  on public.posts for insert
  with check (
    auth.uid() = creator
    and public.can_post_otype(otype, auth.uid())
  );

drop policy if exists "Users can update their own posts" on public.posts;
create policy "Users can update their own posts"
  on public.posts for update
  using (auth.uid() = creator)
  with check (
    auth.uid() = creator
    and public.can_post_otype(otype, auth.uid())
  );

-- follows: follow (can this user_type follow at all) and beFollowed (can
-- this user_type be followed) both come from PERMS. A news_agency can never
-- be a follower; a reader can never be followed.

drop policy if exists "Users can follow as themselves" on public.follows;
create policy "Users can follow as themselves"
  on public.follows for insert
  with check (
    auth.uid() = follower
    and exists (
      select 1 from public.profiles
      where id = follower and user_type in ('blogger', 'reader')
    )
    and exists (
      select 1 from public.profiles
      where id = following and user_type in ('blogger', 'news_agency')
    )
  );

-- like is true for every user_type in PERMS, so the Section 2 likes
-- policies (any authenticated user may like as themselves) already match
-- the matrix exactly -- nothing to change there.

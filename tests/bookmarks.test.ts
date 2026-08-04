// Integration tests for the Bookmarks feature, run against the REAL linked
// Supabase project (see tests/helpers.ts for why). Bookmarks are a private
// reading list -- the RLS on public.bookmarks already predates this feature
// (added in Section 2), so these tests confirm that privacy rule actually
// holds, that a bookmark can't be attributed to another user, and that the
// joined query the profile page's Saved tab depends on
// (bookmarks -> posts -> profiles) resolves without the ambiguous
// -relationship error that bit the Articles and Feed features earlier.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  anonClient,
  createTestUser,
  deleteTestUser,
  type TestUser,
} from "./helpers";

describe("bookmarks", () => {
  let author: TestUser;
  let saver: TestUser;
  let otherReader: TestUser;
  let postId: string;

  beforeAll(async () => {
    [author, saver, otherReader] = await Promise.all([
      createTestUser("blogger", "bm-author"),
      createTestUser("reader", "bm-saver"),
      createTestUser("reader", "bm-other"),
    ]);

    const { data, error } = await author.client
      .from("posts")
      .insert({
        creator: author.id,
        otype: "Article",
        status: "published",
        category: "culture",
        title: "A bookmarkable article",
        content: "Body of the article.",
        tags: ["culture"],
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(`seed failed: ${error?.message}`);
    postId = data.id;

    const { error: bookmarkErr } = await saver.client
      .from("bookmarks")
      .insert({ user_id: saver.id, post_id: postId });
    if (bookmarkErr) throw new Error(`seed bookmark failed: ${bookmarkErr.message}`);
  });

  afterAll(async () => {
    await Promise.all([author, saver, otherReader].map(deleteTestUser));
  });

  it("a bookmark is visible to the person who saved it", async () => {
    const { data, error } = await saver.client
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", saver.id)
      .eq("post_id", postId)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data?.post_id).toBe(postId);
  });

  it("a bookmark is invisible to everyone else, including the post's own author", async () => {
    const { data: asOther } = await otherReader.client
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", saver.id);
    expect(asOther).toEqual([]);

    const { data: asAuthor } = await author.client
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", saver.id);
    expect(asAuthor).toEqual([]);

    const { data: asAnon } = await anonClient
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", saver.id);
    expect(asAnon).toEqual([]);
  });

  it("a bookmark cannot be attributed to another user", async () => {
    const { error } = await otherReader.client
      .from("bookmarks")
      .insert({ user_id: saver.id, post_id: postId });
    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501");
  });

  it("a user can remove their own bookmark, but not someone else's", async () => {
    const { data: hijacked } = await otherReader.client
      .from("bookmarks")
      .delete()
      .eq("user_id", saver.id)
      .eq("post_id", postId)
      .select();
    expect(hijacked).toEqual([]);

    const { error } = await saver.client
      .from("bookmarks")
      .delete()
      .eq("user_id", saver.id)
      .eq("post_id", postId);
    expect(error).toBeNull();

    const { data: after } = await saver.client
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", saver.id)
      .eq("post_id", postId)
      .maybeSingle();
    expect(after).toBeNull();

    // Re-save it, so the join-query test below has something to find.
    const { error: resaveErr } = await saver.client
      .from("bookmarks")
      .insert({ user_id: saver.id, post_id: postId });
    expect(resaveErr).toBeNull();
  });

  it("the profile Saved tab's join query (bookmarks -> posts -> profiles) resolves for the owner", async () => {
    const { data, error } = await saver.client
      .from("bookmarks")
      .select(
        "posts(id, title, creator, profiles!posts_creator_fkey(username, user_type, verified))",
      )
      .eq("user_id", saver.id)
      .order("created_at", { ascending: false });

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    const row = data?.find((r) => (r.posts as unknown as { id: string })?.id === postId);
    expect(row).toBeDefined();
    const post = row!.posts as unknown as {
      title: string;
      creator: string;
      profiles: { username: string } | null;
    };
    expect(post.title).toBe("A bookmarkable article");
    expect(post.creator).toBe(author.id);
    expect(post.profiles?.username).toBe(author.username);
  });

  it("deleting the bookmarked post cascades the bookmark away", async () => {
    const { data: post } = await author.client
      .from("posts")
      .insert({
        creator: author.id,
        otype: "Article",
        status: "published",
        title: "Will be cascaded",
        content: "…",
      })
      .select("id")
      .single();

    await saver.client
      .from("bookmarks")
      .insert({ user_id: saver.id, post_id: post!.id });

    await author.client.from("posts").delete().eq("id", post!.id);

    const { data: after } = await saver.client
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", saver.id)
      .eq("post_id", post!.id)
      .maybeSingle();
    expect(after).toBeNull();
  });
});

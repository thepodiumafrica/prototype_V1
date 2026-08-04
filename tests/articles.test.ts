// Integration tests for the Articles feature, run against the REAL linked
// Supabase project (see tests/helpers.ts for why). Section 3 already proved
// who may create an Article at all; these cover what's new here: draft
// privacy, edit/archive ownership, and the like/view counter plumbing that
// deliberately runs with elevated privilege.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  admin,
  anonClient,
  createTestUser,
  deleteTestUser,
  type TestUser,
} from "./helpers";

describe("articles", () => {
  let author: TestUser;
  let reader: TestUser;
  let publishedId: string;
  let draftId: string;

  beforeAll(async () => {
    [author, reader] = await Promise.all([
      createTestUser("blogger", "art-author"),
      createTestUser("reader", "art-reader"),
    ]);

    const { data, error } = await author.client
      .from("posts")
      .insert([
        {
          creator: author.id,
          otype: "Article",
          status: "published",
          category: "culture",
          title: "A published article",
          content: "Body of the published article.",
          tags: ["culture"],
        },
        {
          creator: author.id,
          otype: "Article",
          status: "draft",
          category: "culture",
          title: "A private draft",
          content: "Nobody else should see this.",
          // Batch inserts are normalised to a common column set, so an
          // omitted key here would be sent as an explicit null (overriding
          // the column default) and violate the NOT NULL constraint.
          tags: [],
        },
      ])
      .select("id, status");
    if (error || !data) throw new Error(`seed failed: ${error?.message}`);

    publishedId = data.find((p) => p.status === "published")!.id;
    draftId = data.find((p) => p.status === "draft")!.id;
  });

  afterAll(async () => {
    await Promise.all([author, reader].map(deleteTestUser));
  });

  it("a published article is readable by anyone, signed out included", async () => {
    const { data, error } = await anonClient
      .from("posts")
      .select("id, title")
      .eq("id", publishedId)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data?.title).toBe("A published article");
  });

  it("a draft is visible to its author but to nobody else", async () => {
    const { data: asAuthor } = await author.client
      .from("posts")
      .select("id")
      .eq("id", draftId)
      .maybeSingle();
    expect(asAuthor).not.toBeNull();

    const { data: asReader } = await reader.client
      .from("posts")
      .select("id")
      .eq("id", draftId)
      .maybeSingle();
    expect(asReader).toBeNull();

    const { data: asAnon } = await anonClient
      .from("posts")
      .select("id")
      .eq("id", draftId)
      .maybeSingle();
    expect(asAnon).toBeNull();
  });

  it("a user cannot edit someone else's article", async () => {
    // RLS filters non-matching rows rather than erroring, so the proof is
    // that zero rows changed and the title is untouched.
    const { data: updated, error } = await reader.client
      .from("posts")
      .update({ title: "Hijacked!" })
      .eq("id", publishedId)
      .select();
    expect(error).toBeNull();
    expect(updated).toEqual([]);

    const { data } = await anonClient
      .from("posts")
      .select("title")
      .eq("id", publishedId)
      .single();
    expect(data?.title).toBe("A published article");
  });

  it("a user cannot archive someone else's article", async () => {
    const { data: updated } = await reader.client
      .from("posts")
      .update({ status: "archived" })
      .eq("id", publishedId)
      .select();
    expect(updated).toEqual([]);

    const { data } = await anonClient
      .from("posts")
      .select("status")
      .eq("id", publishedId)
      .single();
    expect(data?.status).toBe("published");
  });

  it("the author can archive, and archiving hides it from everyone else", async () => {
    const { error } = await author.client
      .from("posts")
      .update({ status: "archived" })
      .eq("id", publishedId);
    expect(error).toBeNull();

    const { data: asAnon } = await anonClient
      .from("posts")
      .select("id")
      .eq("id", publishedId)
      .maybeSingle();
    expect(asAnon).toBeNull();

    // Restore, so later assertions in this file still have a live article.
    await author.client
      .from("posts")
      .update({ status: "published" })
      .eq("id", publishedId);
  });

  it("liking updates posts.nlikes via the trigger, and unliking reverses it", async () => {
    const countOf = async () => {
      const { data } = await anonClient
        .from("posts")
        .select("nlikes")
        .eq("id", publishedId)
        .single();
      return data?.nlikes ?? 0;
    };

    const before = await countOf();

    const { error: likeErr } = await reader.client
      .from("likes")
      .insert({ user_id: reader.id, post_id: publishedId });
    expect(likeErr).toBeNull();
    expect(await countOf()).toBe(before + 1);

    const { error: unlikeErr } = await reader.client
      .from("likes")
      .delete()
      .eq("user_id", reader.id)
      .eq("post_id", publishedId);
    expect(unlikeErr).toBeNull();
    expect(await countOf()).toBe(before);
  });

  it("a like cannot be attributed to another user", async () => {
    const { error } = await reader.client
      .from("likes")
      .insert({ user_id: author.id, post_id: publishedId });
    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501");
  });

  it("increment_post_views works for anonymous readers", async () => {
    const viewsOf = async () => {
      const { data } = await anonClient
        .from("posts")
        .select("views")
        .eq("id", publishedId)
        .single();
      return data?.views ?? 0;
    };

    const before = await viewsOf();
    const { error } = await anonClient.rpc("increment_post_views", {
      post_id: publishedId,
    });
    expect(error).toBeNull();
    expect(await viewsOf()).toBe(before + 1);
  });

  it("the view counter cannot be used to edit anything else on a post", async () => {
    // increment_post_views is SECURITY DEFINER; confirm the ordinary UPDATE
    // path is still closed to a non-owner despite that function existing.
    const { data: updated } = await reader.client
      .from("posts")
      .update({ views: 9999, title: "Hijacked via views" })
      .eq("id", publishedId)
      .select();
    expect(updated).toEqual([]);

    const { data } = await anonClient
      .from("posts")
      .select("title")
      .eq("id", publishedId)
      .single();
    expect(data?.title).toBe("A published article");
  });

  it("compute_trust reflects published articles by the author", async () => {
    const { data, error } = await anonClient.rpc("compute_trust", {
      profile_id: author.id,
    });
    expect(error).toBeNull();
    expect(typeof data).toBe("number");
    expect(data).toBeGreaterThanOrEqual(1);
  });

  it("deleting the author cascades their articles away", async () => {
    const throwaway = await createTestUser("blogger", "art-cascade");
    const { data: post } = await throwaway.client
      .from("posts")
      .insert({
        creator: throwaway.id,
        otype: "Article",
        status: "published",
        title: "Will be cascaded",
        content: "…",
      })
      .select("id")
      .single();

    await admin.auth.admin.deleteUser(throwaway.id);

    const { data: after } = await anonClient
      .from("posts")
      .select("id")
      .eq("id", post!.id)
      .maybeSingle();
    expect(after).toBeNull();
  });
});

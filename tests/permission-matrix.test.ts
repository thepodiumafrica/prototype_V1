// Integration tests proving the PERMS matrix from ThePodium_v5.html is
// enforced by Postgres itself (row-level security), not just hidden in the
// UI. These run against the REAL linked Supabase project: they create real
// (throwaway) auth users, attempt real inserts as those users, and clean up
// afterwards. There is no local Supabase instance in this environment
// (no Docker), so this is the only way to prove server-side enforcement.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestUser, deleteTestUser, type TestUser } from "./helpers";

describe("permission matrix enforced as RLS (not just UI)", () => {
  let reader: TestUser;
  let blogger: TestUser;
  let newsAgency: TestUser;
  let seedPostId: string;

  beforeAll(async () => {
    [reader, blogger, newsAgency] = await Promise.all([
      createTestUser("reader"),
      createTestUser("blogger"),
      createTestUser("news_agency"),
    ]);

    // A published forum post for the comment tests to attach to.
    const { data: post, error } = await blogger.client
      .from("posts")
      .insert({
        creator: blogger.id,
        otype: "Forum Post",
        status: "published",
        title: "Permission test thread",
        content: "seed post for permission-matrix tests",
      })
      .select("id")
      .single();
    if (error || !post) {
      throw new Error(`Failed to seed test post: ${error?.message}`);
    }
    seedPostId = post.id;
  });

  afterAll(async () => {
    await Promise.all([reader, blogger, newsAgency].map(deleteTestUser));
  });

  it("a reader cannot create an Article (postArticle: false)", async () => {
    const { error } = await reader.client.from("posts").insert({
      creator: reader.id,
      otype: "Article",
      status: "published",
      title: "A reader's article",
      content: "this must be rejected",
    });
    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501");
  });

  it("a news agency cannot create a Comment (comment: false)", async () => {
    const { error } = await newsAgency.client.from("posts").insert({
      creator: newsAgency.id,
      otype: "Comment",
      status: "published",
      parent_id: seedPostId,
      content: "this must be rejected",
    });
    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501");
  });

  it("a blogger CAN create an Article (postArticle: true)", async () => {
    const { error } = await blogger.client.from("posts").insert({
      creator: blogger.id,
      otype: "Article",
      status: "published",
      title: "A blogger's article",
      content: "this should be allowed",
    });
    expect(error).toBeNull();
  });

  it("a reader CAN create a Forum Post (createForum: true)", async () => {
    const { error } = await reader.client.from("posts").insert({
      creator: reader.id,
      otype: "Forum Post",
      status: "published",
      title: "A reader's forum post",
      content: "this should be allowed",
    });
    expect(error).toBeNull();
  });

  it("a reader CAN comment (comment: true)", async () => {
    const { error } = await reader.client.from("posts").insert({
      creator: reader.id,
      otype: "Comment",
      status: "published",
      parent_id: seedPostId,
      content: "a reader's comment",
    });
    expect(error).toBeNull();
  });

  it("a news agency cannot follow anyone (follow: false)", async () => {
    const { error } = await newsAgency.client.from("follows").insert({
      follower: newsAgency.id,
      following: blogger.id,
    });
    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501");
  });

  it("nobody can follow a reader (beFollowed: false)", async () => {
    const { error } = await blogger.client.from("follows").insert({
      follower: blogger.id,
      following: reader.id,
    });
    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501");
  });

  it("a blogger CAN follow a news agency (follow: true, beFollowed: true)", async () => {
    const { error } = await blogger.client.from("follows").insert({
      follower: blogger.id,
      following: newsAgency.id,
    });
    expect(error).toBeNull();
  });
});

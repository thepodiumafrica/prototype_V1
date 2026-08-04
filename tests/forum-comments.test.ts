// Integration tests for the Forum & Comments feature, run against the REAL
// linked Supabase project (see tests/helpers.ts for why). The permission
// matrix (who may create a Forum Post / Comment at all) is already proven
// in permission-matrix.test.ts -- these cover what's new here: the
// comment-count trigger's root_post_of() walk (a reply's count belongs to
// the thread, not the comment it replies to), that the reply path isn't a
// permission loophole, comment ownership, and liking a comment vs. the post.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  anonClient,
  createTestUser,
  deleteTestUser,
  type TestUser,
} from "./helpers";

describe("forum & comments", () => {
  let author: TestUser;
  let commenter: TestUser;
  let newsAgency: TestUser;
  let threadId: string;

  beforeAll(async () => {
    [author, commenter, newsAgency] = await Promise.all([
      createTestUser("blogger", "fc-author"),
      createTestUser("reader", "fc-commenter"),
      createTestUser("news_agency", "fc-news"),
    ]);

    const { data, error } = await author.client
      .from("posts")
      .insert({
        creator: author.id,
        otype: "Forum Post",
        status: "published",
        title: "A forum thread for testing",
        content: "What tools are people actually using?",
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(`seed failed: ${error?.message}`);
    threadId = data.id;
  });

  afterAll(async () => {
    await Promise.all([author, commenter, newsAgency].map(deleteTestUser));
  });

  it("a published forum post is readable by anyone, signed out included", async () => {
    const { data, error } = await anonClient
      .from("posts")
      .select("id, title")
      .eq("id", threadId)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data?.title).toBe("A forum thread for testing");
  });

  it("commenting increments the thread's ncomments via the trigger", async () => {
    const ncommentsOf = async () => {
      const { data } = await anonClient
        .from("posts")
        .select("ncomments")
        .eq("id", threadId)
        .single();
      return data?.ncomments ?? 0;
    };

    const before = await ncommentsOf();

    const { data: comment, error } = await commenter.client
      .from("posts")
      .insert({
        creator: commenter.id,
        otype: "Comment",
        status: "published",
        parent_id: threadId,
        content: "Paystack and Flutterwave for payments.",
      })
      .select("id")
      .single();
    expect(error).toBeNull();
    expect(await ncommentsOf()).toBe(before + 1);

    // A reply's parent_id is the COMMENT, not the thread -- the trigger has
    // to walk up one level. The count still belongs to the thread.
    const { error: replyErr } = await author.client.from("posts").insert({
      creator: author.id,
      otype: "Comment",
      status: "published",
      parent_id: comment!.id,
      content: "Selar is underrated too.",
    });
    expect(replyErr).toBeNull();
    expect(await ncommentsOf()).toBe(before + 2);

    // Deleting either one brings the thread's count back down.
    const { error: delErr } = await commenter.client
      .from("posts")
      .delete()
      .eq("id", comment!.id);
    expect(delErr).toBeNull();
    expect(await ncommentsOf()).toBe(before + 1);
  });

  it("a news agency cannot comment, and cannot reply either (comment: false)", async () => {
    const { error: commentErr } = await newsAgency.client.from("posts").insert({
      creator: newsAgency.id,
      otype: "Comment",
      status: "published",
      parent_id: threadId,
      content: "should be rejected",
    });
    expect(commentErr).not.toBeNull();
    expect(commentErr?.code).toBe("42501");

    const { data: someComment } = await commenter.client
      .from("posts")
      .insert({
        creator: commenter.id,
        otype: "Comment",
        status: "published",
        parent_id: threadId,
        content: "a real comment to try replying to",
      })
      .select("id")
      .single();

    const { error: replyErr } = await newsAgency.client.from("posts").insert({
      creator: newsAgency.id,
      otype: "Comment",
      status: "published",
      parent_id: someComment!.id,
      content: "should also be rejected",
    });
    expect(replyErr).not.toBeNull();
    expect(replyErr?.code).toBe("42501");
  });

  it("a user cannot edit someone else's comment", async () => {
    const { data: comment } = await commenter.client
      .from("posts")
      .insert({
        creator: commenter.id,
        otype: "Comment",
        status: "published",
        parent_id: threadId,
        content: "original text",
      })
      .select("id")
      .single();

    const { data: updated, error } = await author.client
      .from("posts")
      .update({ content: "hijacked!" })
      .eq("id", comment!.id)
      .select();
    expect(error).toBeNull();
    expect(updated).toEqual([]);

    const { data: after } = await anonClient
      .from("posts")
      .select("content")
      .eq("id", comment!.id)
      .single();
    expect(after?.content).toBe("original text");
  });

  it("liking a comment updates the comment's own nlikes, not the thread's", async () => {
    const { data: comment } = await commenter.client
      .from("posts")
      .insert({
        creator: commenter.id,
        otype: "Comment",
        status: "published",
        parent_id: threadId,
        content: "like me",
      })
      .select("id")
      .single();

    const nlikesOf = async (id: string) => {
      const { data } = await anonClient
        .from("posts")
        .select("nlikes")
        .eq("id", id)
        .single();
      return data?.nlikes ?? 0;
    };

    const threadBefore = await nlikesOf(threadId);
    const commentBefore = await nlikesOf(comment!.id);

    const { error } = await author.client
      .from("likes")
      .insert({ user_id: author.id, post_id: comment!.id });
    expect(error).toBeNull();

    expect(await nlikesOf(comment!.id)).toBe(commentBefore + 1);
    expect(await nlikesOf(threadId)).toBe(threadBefore);
  });
});

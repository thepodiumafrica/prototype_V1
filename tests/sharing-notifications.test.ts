// Integration tests for the Sharing & Notifications feature, run against
// the REAL linked Supabase project (see tests/helpers.ts for why). Covers
// every pushNotif() call site ThePodium_v5.html has for features that
// actually exist here -- like, follow, comment, reply -- plus the
// lockdown that replaced the old client-insert path.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  anonClient,
  createTestUser,
  deleteTestUser,
  type TestUser,
} from "./helpers";

async function notificationsFor(user: TestUser) {
  const { data, error } = await user.client
    .from("notifications")
    .select("type, text, from_user, entity_id, read")
    .eq("for_user", user.id);
  expect(error).toBeNull();
  return data ?? [];
}

describe("sharing & notifications", () => {
  let author: TestUser;
  let other: TestUser;
  let commenter: TestUser;
  let postId: string;

  beforeAll(async () => {
    [author, other, commenter] = await Promise.all([
      createTestUser("blogger", "notif-author"),
      createTestUser("reader", "notif-other"),
      createTestUser("reader", "notif-commenter"),
    ]);

    const { data: post, error } = await author.client
      .from("posts")
      .insert({
        creator: author.id,
        otype: "Article",
        status: "published",
        title: "A notification test article",
        content: "Body of the article.",
      })
      .select("id")
      .single();
    if (error || !post) throw new Error(`seed failed: ${error?.message}`);
    postId = post.id;
  });

  afterAll(async () => {
    await Promise.all([author, other, commenter].map(deleteTestUser));
  });

  it("liking someone else's post notifies its creator", async () => {
    const { error } = await other.client
      .from("likes")
      .insert({ user_id: other.id, post_id: postId });
    expect(error).toBeNull();

    const notifs = await notificationsFor(author);
    const likeNotif = notifs.find((n) => n.type === "like");
    expect(likeNotif).toBeDefined();
    expect(likeNotif?.text).toBe(`@${other.username} liked your post`);
    expect(likeNotif?.from_user).toBe(other.id);
    expect(likeNotif?.entity_id).toBe(postId);
    expect(likeNotif?.read).toBe(false);

    // Clean up so later assertions in this file aren't affected by this like.
    await other.client
      .from("likes")
      .delete()
      .eq("user_id", other.id)
      .eq("post_id", postId);
  });

  it("liking your own post does not notify yourself", async () => {
    const before = (await notificationsFor(author)).length;
    const { error } = await author.client
      .from("likes")
      .insert({ user_id: author.id, post_id: postId });
    expect(error).toBeNull();

    const after = await notificationsFor(author);
    expect(after.length).toBe(before);

    await author.client
      .from("likes")
      .delete()
      .eq("user_id", author.id)
      .eq("post_id", postId);
  });

  it("commenting on a post notifies its creator, and points at the post", async () => {
    const { data: comment, error } = await other.client
      .from("posts")
      .insert({
        creator: other.id,
        otype: "Comment",
        status: "published",
        parent_id: postId,
        content: "A top-level comment.",
        title: "",
        category: "",
        tags: [],
      })
      .select("id")
      .single();
    expect(error).toBeNull();

    const notifs = await notificationsFor(author);
    const commentNotif = notifs.find((n) => n.type === "comment");
    expect(commentNotif).toBeDefined();
    expect(commentNotif?.text).toBe(`@${other.username} commented on your post`);
    expect(commentNotif?.entity_id).toBe(postId);

    // Used by the reply test below.
    (globalThis as { __topComment?: string }).__topComment = comment!.id;
  });

  it("commenting on your own post does not notify yourself", async () => {
    const before = (await notificationsFor(author)).length;
    const { error } = await author.client.from("posts").insert({
      creator: author.id,
      otype: "Comment",
      status: "published",
      parent_id: postId,
      content: "The author commenting on their own article.",
      title: "",
      category: "",
      tags: [],
    });
    expect(error).toBeNull();

    const after = await notificationsFor(author);
    expect(after.length).toBe(before);
  });

  it("replying to a comment notifies the comment's author (not the post's), pointing at the root post", async () => {
    const topCommentId = (globalThis as { __topComment?: string }).__topComment;
    if (!topCommentId) throw new Error("top comment not seeded");

    const { error } = await commenter.client.from("posts").insert({
      creator: commenter.id,
      otype: "Comment",
      status: "published",
      parent_id: topCommentId,
      content: "A reply to the top-level comment.",
      title: "",
      category: "",
      tags: [],
    });
    expect(error).toBeNull();

    // "other" wrote the top-level comment, so they get the reply notification.
    const otherNotifs = await notificationsFor(other);
    const replyNotif = otherNotifs.find((n) => n.type === "reply");
    expect(replyNotif).toBeDefined();
    expect(replyNotif?.text).toBe(`@${commenter.username} replied to your comment`);
    // Points at the root article, not the comment's own id.
    expect(replyNotif?.entity_id).toBe(postId);

    // The post's author shouldn't get a second notification for this reply.
    const authorNotifs = await notificationsFor(author);
    expect(authorNotifs.filter((n) => n.type === "reply")).toHaveLength(0);
  });

  it("liking a reply notifies its author and points at the root post, not the reply or the parent comment", async () => {
    const topCommentId = (globalThis as { __topComment?: string }).__topComment;
    const { data: reply, error: replyErr } = await other.client
      .from("posts")
      .insert({
        creator: other.id,
        otype: "Comment",
        status: "published",
        parent_id: topCommentId,
        content: "Another reply, this one gets liked.",
        title: "",
        category: "",
        tags: [],
      })
      .select("id")
      .single();
    expect(replyErr).toBeNull();

    const { error: likeErr } = await author.client
      .from("likes")
      .insert({ user_id: author.id, post_id: reply!.id });
    expect(likeErr).toBeNull();

    const notifs = await notificationsFor(other);
    const likeNotif = notifs.find(
      (n) => n.type === "like" && n.from_user === author.id,
    );
    expect(likeNotif).toBeDefined();
    expect(likeNotif?.entity_id).toBe(postId);
  });

  it("following someone notifies them, with no entity to link to", async () => {
    const { error } = await other.client
      .from("follows")
      .insert({ follower: other.id, following: author.id });
    expect(error).toBeNull();

    const notifs = await notificationsFor(author);
    const followNotif = notifs.find((n) => n.type === "follow");
    expect(followNotif).toBeDefined();
    expect(followNotif?.text).toBe(`@${other.username} started following you`);
    expect(followNotif?.entity_id).toBeNull();
  });

  it("a client can no longer insert a notification directly", async () => {
    const { error } = await other.client.from("notifications").insert({
      for_user: author.id,
      type: "like",
      from_user: other.id,
      text: "This should be rejected.",
    });
    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501");
  });

  it("only the recipient can read their own notifications", async () => {
    const asOther = await other.client
      .from("notifications")
      .select("id")
      .eq("for_user", author.id);
    expect(asOther.data).toEqual([]);

    const asAnon = await anonClient
      .from("notifications")
      .select("id")
      .eq("for_user", author.id);
    expect(asAnon.data).toEqual([]);
  });
});

// Integration tests for the Profiles & Follows feature, run against the
// REAL linked Supabase project (see tests/helpers.ts for why). Section 3
// already proved the postArticle/createForum/comment/follow/beFollowed
// matrix at the posts/follows level -- these tests cover what's new here:
// profile read/write privacy, the follow/unfollow round trip actually
// changing visible state, self-follow being blocked, and the compute_trust
// RPC being callable by anyone despite flags being private.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  anonClient,
  createTestUser,
  deleteTestUser,
  type TestUser,
} from "./helpers";

describe("profiles & follows", () => {
  let reader: TestUser;
  let blogger: TestUser;

  beforeAll(async () => {
    [reader, blogger] = await Promise.all([
      createTestUser("reader", "pf-reader"),
      createTestUser("blogger", "pf-blogger"),
    ]);
  });

  afterAll(async () => {
    await Promise.all([reader, blogger].map(deleteTestUser));
  });

  it("anyone, even signed out, can read a profile", async () => {
    const { data, error } = await anonClient
      .from("profiles")
      .select("username, user_type")
      .eq("id", blogger.id)
      .single();
    expect(error).toBeNull();
    expect(data?.username).toBe(blogger.username);
  });

  it("a user can update their own profile", async () => {
    const { error } = await blogger.client
      .from("profiles")
      .update({ bio: "Updated via test" })
      .eq("id", blogger.id);
    expect(error).toBeNull();

    const { data } = await anonClient
      .from("profiles")
      .select("bio")
      .eq("id", blogger.id)
      .single();
    expect(data?.bio).toBe("Updated via test");
  });

  it("a user cannot update another user's profile", async () => {
    // RLS filters out rows the USING clause doesn't match -- this succeeds
    // with zero rows affected, it doesn't error. The real proof is that
    // blogger's bio is unchanged afterwards.
    const { data: updated, error } = await reader.client
      .from("profiles")
      .update({ bio: "Hijacked!" })
      .eq("id", blogger.id)
      .select();
    expect(error).toBeNull();
    expect(updated).toEqual([]);

    const { data } = await anonClient
      .from("profiles")
      .select("bio")
      .eq("id", blogger.id)
      .single();
    expect(data?.bio).not.toBe("Hijacked!");
  });

  it("follow, then unfollow, changes the follower count", async () => {
    const countFollowers = async () => {
      const { count } = await anonClient
        .from("follows")
        .select("follower", { count: "exact", head: true })
        .eq("following", blogger.id);
      return count ?? 0;
    };

    const before = await countFollowers();

    const { error: followErr } = await reader.client.from("follows").insert({
      follower: reader.id,
      following: blogger.id,
    });
    expect(followErr).toBeNull();
    expect(await countFollowers()).toBe(before + 1);

    const { error: unfollowErr } = await reader.client
      .from("follows")
      .delete()
      .eq("follower", reader.id)
      .eq("following", blogger.id);
    expect(unfollowErr).toBeNull();
    expect(await countFollowers()).toBe(before);
  });

  it("a user cannot follow themselves", async () => {
    const { error } = await blogger.client.from("follows").insert({
      follower: blogger.id,
      following: blogger.id,
    });
    expect(error).not.toBeNull();
    expect(error?.code).toBe("23514"); // check_violation: follower <> following
  });

  it("compute_trust is callable by anyone despite flags being private", async () => {
    const { data, error } = await anonClient.rpc("compute_trust", {
      profile_id: blogger.id,
    });
    expect(error).toBeNull();
    expect(typeof data).toBe("number");
    expect(data).toBeGreaterThanOrEqual(1);
  });
});

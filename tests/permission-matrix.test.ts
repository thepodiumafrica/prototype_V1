// Integration tests proving the PERMS matrix from ThePodium_v5.html is
// enforced by Postgres itself (row-level security), not just hidden in the
// UI. These run against the REAL linked Supabase project: they create real
// (throwaway) auth users, attempt real inserts as those users, and clean up
// afterwards. There is no local Supabase instance in this environment
// (no Docker), so this is the only way to prove server-side enforcement.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceRoleKey) {
  throw new Error(
    "Missing Supabase env vars. These tests run against the real project " +
      "and need NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, " +
      "and SUPABASE_SERVICE_ROLE_KEY set in .env.local.",
  );
}

// Admin client: creates/deletes the throwaway test users. Never used to
// read or write posts/follows -- those calls go through each test user's
// own signed-in client, so RLS is genuinely exercised.
const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const runId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

interface TestUser {
  id: string;
  client: SupabaseClient;
}

async function createTestUser(userType: string): Promise<TestUser> {
  const email = `test-${userType}-${runId}@example.com`;
  const password = "TestPass123!";
  const username = `t_${userType}_${runId}`.slice(0, 24);

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, user_type: userType },
  });
  if (error || !data.user) {
    throw new Error(`Failed to create ${userType} test user: ${error?.message}`);
  }

  // A fresh anon-key client, signed in as this user -- this is what
  // actually exercises RLS as that specific auth.uid().
  const client = createClient(url!, anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    throw new Error(`Failed to sign in ${userType} test user: ${signInError.message}`);
  }

  return { id: data.user.id, client };
}

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
    // Deleting the auth user cascades: profiles -> posts/follows/etc. all
    // clean up automatically via the "on delete cascade" foreign keys.
    for (const u of [reader, blogger, newsAgency]) {
      if (u) await admin.auth.admin.deleteUser(u.id);
    }
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

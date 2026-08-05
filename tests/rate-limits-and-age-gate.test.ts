// Integration tests for rate limiting (posts, flags) and the sign-up age
// gate, run against the REAL linked Supabase project (see
// tests/helpers.ts for why).

import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { admin, createTestUser, deleteTestUser, type TestUser } from "./helpers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const runId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

describe("rate limiting", () => {
  let poster: TestUser;
  let flagger: TestUser;
  let targetPostId: string;

  beforeAll(async () => {
    [poster, flagger] = await Promise.all([
      createTestUser("blogger", "rate-poster"),
      createTestUser("reader", "rate-flagger"),
    ]);

    const { data: post, error } = await poster.client
      .from("posts")
      .insert({
        creator: poster.id,
        otype: "Article",
        status: "published",
        title: "A post that will get flagged repeatedly",
        content: "…",
      })
      .select("id")
      .single();
    if (error || !post) throw new Error(`seed failed: ${error?.message}`);
    targetPostId = post.id;
  });

  afterAll(async () => {
    await Promise.all([poster, flagger].map(deleteTestUser));
  });

  it("blocks the 11th post within 10 minutes, but a different user is unaffected", async () => {
    // The seed post in beforeAll already counts as #1.
    for (let i = 2; i <= 10; i++) {
      const { error } = await poster.client.from("posts").insert({
        creator: poster.id,
        otype: "Forum Post",
        status: "published",
        title: `Rate limit filler #${i}`,
        content: "…",
      });
      expect(error, `post #${i} should succeed`).toBeNull();
    }

    const { error: eleventhError } = await poster.client.from("posts").insert({
      creator: poster.id,
      otype: "Forum Post",
      status: "published",
      title: "This one should be rejected",
      content: "…",
    });
    expect(eleventhError).not.toBeNull();
    expect(eleventhError?.message).toMatch(/posting too quickly/i);

    // A different user, unaffected by poster's count, can still post.
    const { error: otherUserError } = await flagger.client.from("posts").insert({
      creator: flagger.id,
      otype: "Forum Post",
      status: "published",
      title: "A different user's post",
      content: "…",
    });
    expect(otherUserError).toBeNull();
  });

  it("blocks the 21st report within an hour, but a different user is unaffected", async () => {
    for (let i = 1; i <= 20; i++) {
      const { error } = await flagger.client.from("flags").insert({
        reporter: flagger.id,
        entity_creator: poster.id,
        entity_type: "post",
        entity_id: targetPostId,
        reason: "Spam",
        notes: `report #${i}`,
      });
      expect(error, `flag #${i} should succeed`).toBeNull();
    }

    const { error: twentyFirstError } = await flagger.client.from("flags").insert({
      reporter: flagger.id,
      entity_creator: poster.id,
      entity_type: "post",
      entity_id: targetPostId,
      reason: "Spam",
      notes: "report #21",
    });
    expect(twentyFirstError).not.toBeNull();
    expect(twentyFirstError?.message).toMatch(/too many reports/i);

    const { error: otherUserError } = await poster.client.from("flags").insert({
      reporter: poster.id,
      entity_creator: flagger.id,
      entity_type: "post",
      entity_id: targetPostId,
      reason: "Spam",
      notes: "a different reporter",
    });
    expect(otherUserError).toBeNull();
  });
});

describe("age gate", () => {
  const createdUserIds: string[] = [];

  afterAll(async () => {
    await Promise.all(createdUserIds.map((id) => admin.auth.admin.deleteUser(id)));
  });

  async function attemptSignUp(dateOfBirth: string | undefined, label: string) {
    const email = `test-age-${label}-${runId}@example.com`;
    const password = "TestPass123!";
    const username = `t_age_${label}_${runId}`.slice(0, 24);
    const client = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          user_type: "reader",
          ...(dateOfBirth ? { date_of_birth: dateOfBirth } : {}),
        },
      },
    });
    if (data.user) createdUserIds.push(data.user.id);
    return { data, error };
  }

  // Supabase Auth surfaces a handle_new_user() trigger rejection (this
  // one, a duplicate username, a bad user_type -- any of them) as an
  // opaque transport error with no usable message text, a known rough
  // edge of the stack rather than anything specific to this check (the
  // exact same thing already happens for a duplicate username today).
  // So these assert real enforcement -- no session, no profile -- rather
  // than matching message text that isn't reliably there.

  it("rejects sign-up with no date of birth submitted", async () => {
    const { data, error } = await attemptSignUp(undefined, "missing");
    expect(error).not.toBeNull();
    expect(data.user).toBeNull();
  });

  it("rejects sign-up for someone under 13", async () => {
    const twelveYearsAgo = new Date();
    twelveYearsAgo.setFullYear(twelveYearsAgo.getFullYear() - 12);
    const { data, error } = await attemptSignUp(
      twelveYearsAgo.toISOString().slice(0, 10),
      "under13",
    );
    expect(error).not.toBeNull();
    expect(data.user).toBeNull();
  });

  it("allows sign-up for someone old enough, and does not store the birthdate", async () => {
    const { data, error } = await attemptSignUp("1990-01-01", "adult");
    expect(error).toBeNull();
    expect(data.user).not.toBeNull();

    const { data: profile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", data.user!.id)
      .single();
    expect(profile).not.toBeNull();
    expect(profile).not.toHaveProperty("date_of_birth");
  });
});

// Integration test for the one part of the Feed feature that DOES touch
// the live database: the posts+profiles join filtered by african_identity.
// (The ranking math itself is covered by the pure unit tests in
// feed-ranking.test.ts.) This exists because the exact same shape of query
// silently broke in the Articles feature from an ambiguous relationship
// between posts and profiles -- worth confirming this query, as actually
// written in src/app/feed/page.tsx, still resolves correctly.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  anonClient,
  createTestUser,
  deleteTestUser,
  type TestUser,
} from "./helpers";

describe("feed", () => {
  let continentAuthor: TestUser;
  let diasporaAuthor: TestUser;
  let reader: TestUser;

  beforeAll(async () => {
    [continentAuthor, diasporaAuthor, reader] = await Promise.all([
      createTestUser("blogger", "feed-continent"),
      createTestUser("blogger", "feed-diaspora"),
      createTestUser("reader", "feed-reader"),
    ]);

    await Promise.all([
      continentAuthor.client
        .from("profiles")
        .update({ african_identity: "continent" })
        .eq("id", continentAuthor.id),
      diasporaAuthor.client
        .from("profiles")
        .update({ african_identity: "diaspora" })
        .eq("id", diasporaAuthor.id),
    ]);

    await Promise.all([
      continentAuthor.client.from("posts").insert({
        creator: continentAuthor.id,
        otype: "Article",
        status: "published",
        title: "From the continent",
        content: "…",
        tags: ["technology"],
      }),
      diasporaAuthor.client.from("posts").insert({
        creator: diasporaAuthor.id,
        otype: "Forum Post",
        status: "published",
        title: "From the diaspora",
        content: "…",
      }),
    ]);
  });

  afterAll(async () => {
    await Promise.all(
      [continentAuthor, diasporaAuthor, reader].map(deleteTestUser),
    );
  });

  it("the feed query (posts joined with profiles) resolves without an ambiguous-relationship error", async () => {
    const { data, error } = await anonClient
      .from("posts")
      .select(
        "id, otype, tags, nlikes, created_at, profiles!posts_creator_fkey(id, username, african_identity)",
      )
      .in("otype", ["Article", "Forum Post"])
      .eq("status", "published")
      .eq("flagged", false)
      .limit(200);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("filtering by african_identity separates continent and diaspora authors", async () => {
    const { data, error } = await anonClient
      .from("posts")
      .select("id, profiles!posts_creator_fkey(username, african_identity)")
      .eq("status", "published")
      .in("creator", [continentAuthor.id, diasporaAuthor.id]);

    expect(error).toBeNull();
    const byIdentity = new Map(
      (data ?? []).map((r) => [
        (r.profiles as unknown as { username: string; african_identity: string })
          .username,
        (r.profiles as unknown as { african_identity: string }).african_identity,
      ]),
    );
    expect(byIdentity.get(continentAuthor.username)).toBe("continent");
    expect(byIdentity.get(diasporaAuthor.username)).toBe("diaspora");
  });

  it("a reader's follows are queryable for scoring", async () => {
    await reader.client.from("follows").insert({
      follower: reader.id,
      following: continentAuthor.id,
    });

    const { data, error } = await anonClient
      .from("follows")
      .select("following")
      .eq("follower", reader.id);

    expect(error).toBeNull();
    expect((data ?? []).map((f) => f.following)).toContain(continentAuthor.id);
  });
});

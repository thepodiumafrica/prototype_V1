// Unit tests for the feed ranking logic (src/lib/feed-ranking.ts). Unlike
// the other test files, these don't touch the live Supabase project --
// scoring/ranking is pure application code, not something RLS enforces, so
// a fast in-memory test is the right tool here rather than another
// integration test.

import { describe, expect, it } from "vitest";
import { rankFeedPosts, scoreFeedPost, type RankablePost } from "../src/lib/feed-ranking";

function post(overrides: Partial<RankablePost> = {}): RankablePost {
  return {
    id: "post-1",
    creatorId: "creator-1",
    tags: [],
    nlikes: 0,
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("feed ranking", () => {
  it("a followed creator's post outranks a non-followed post with more likes", () => {
    const followedPost = post({ id: "a", creatorId: "friend", nlikes: 5 });
    const popularPost = post({ id: "b", creatorId: "stranger", nlikes: 500 });

    const ranked = rankFeedPosts(
      [popularPost, followedPost],
      () => "someone",
      { followedIds: new Set(["friend"]), interests: new Set() },
    );

    expect(ranked[0].post.id).toBe("a");
    expect(ranked[0].reason).toEqual({ key: "feedReasonFollowing", username: "someone" });
  });

  it("matching interest tags boost score, one bump per matching tag", () => {
    const noMatch = post({ id: "a", tags: ["finance"] });
    const oneMatch = post({ id: "b", tags: ["technology"] });
    const twoMatches = post({ id: "c", tags: ["technology", "ai"] });

    const ranked = rankFeedPosts(
      [noMatch, oneMatch, twoMatches],
      () => "x",
      { followedIds: new Set(), interests: new Set(["technology", "ai"]) },
    );

    expect(ranked.map((r) => r.post.id)).toEqual(["c", "b", "a"]);
    expect(ranked[0].reason).toEqual({ key: "feedReasonInterests" });
  });

  it("being followed always outranks interest matches (150 vs 30-per-tag)", () => {
    const interestOnly = post({
      id: "a",
      creatorId: "stranger",
      tags: ["technology", "ai", "finance"], // 3 matches = 90, still < 150
    });
    const followedOnly = post({ id: "b", creatorId: "friend", tags: [] });

    const ranked = rankFeedPosts(
      [interestOnly, followedOnly],
      () => "x",
      {
        followedIds: new Set(["friend"]),
        interests: new Set(["technology", "ai", "finance"]),
      },
    );

    expect(ranked[0].post.id).toBe("b");
  });

  it('labels a popular, non-followed, non-interest-matching post "Trending" above 300 likes', () => {
    const { reason: reasonAbove } = scoreFeedPost(post({ nlikes: 301 }), {
      followedIds: new Set(),
      interests: new Set(),
      creatorUsername: "x",
    });
    const { reason: reasonAt } = scoreFeedPost(post({ nlikes: 300 }), {
      followedIds: new Set(),
      interests: new Set(),
      creatorUsername: "x",
    });

    expect(reasonAbove).toEqual({ key: "feedReasonTrending" });
    expect(reasonAt).toBeNull(); // 300 is not "over" 300
  });

  it("popularity only breaks ties -- it never outweighs a follow or interest match", () => {
    const veryPopularStranger = post({
      id: "a",
      creatorId: "stranger",
      nlikes: 100000,
    });
    const unpopularFriend = post({ id: "b", creatorId: "friend", nlikes: 0 });

    const ranked = rankFeedPosts(
      [veryPopularStranger, unpopularFriend],
      () => "x",
      { followedIds: new Set(["friend"]), interests: new Set() },
    );

    expect(ranked[0].post.id).toBe("b");
  });

  it("equal scores fall back to newest first", () => {
    const older = post({ id: "a", createdAt: "2026-01-01T00:00:00Z" });
    const newer = post({ id: "b", createdAt: "2026-01-02T00:00:00Z" });

    const ranked = rankFeedPosts([older, newer], () => "x", {
      followedIds: new Set(),
      interests: new Set(),
    });

    expect(ranked.map((r) => r.post.id)).toEqual(["b", "a"]);
  });
});

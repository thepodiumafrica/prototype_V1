// Ported from ThePodium_v5.html's getFeedPosts(): score = followed creator
// (+150) + 30 per matching interest tag + log1p(nlikes) * 5 (a gentle
// popularity boost that doesn't let raw like counts dominate), highest
// first, ties broken by newest first. The "reason" shown above a card
// follows the same priority the prototype uses: followed, then interest
// match, then "Trending" for anything over 300 likes, else none.

export interface RankablePost {
  id: string;
  creatorId: string;
  tags: string[];
  nlikes: number;
  createdAt: string;
}

export interface RankedPost<T extends RankablePost> {
  post: T;
  score: number;
  reason: string | null;
}

export function scoreFeedPost<T extends RankablePost>(
  post: T,
  opts: { followedIds: Set<string>; interests: Set<string>; creatorUsername: string },
): RankedPost<T> {
  const followed = opts.followedIds.has(post.creatorId);
  const interestMatches = post.tags.filter((t) => opts.interests.has(t)).length;
  const score = (followed ? 150 : 0) + interestMatches * 30 + Math.log1p(post.nlikes) * 5;
  const reason = followed
    ? `Following @${opts.creatorUsername}`
    : interestMatches > 0
      ? "In your interests"
      : post.nlikes > 300
        ? "Trending"
        : null;
  return { post, score, reason };
}

export function rankFeedPosts<T extends RankablePost>(
  posts: T[],
  usernameOf: (post: T) => string,
  opts: { followedIds: Set<string>; interests: Set<string> },
): RankedPost<T>[] {
  return posts
    .map((post) =>
      scoreFeedPost(post, { ...opts, creatorUsername: usernameOf(post) }),
    )
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.post.createdAt).getTime() - new Date(a.post.createdAt).getTime(),
    );
}

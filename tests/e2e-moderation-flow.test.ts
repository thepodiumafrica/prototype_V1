// End-to-end test of the full moderation flow, run against the REAL
// linked Supabase project (see tests/helpers.ts for why). Unlike
// moderation.test.ts, which checks each rule in isolation, this walks
// the whole user journey in one sequential story -- report, appear in
// the queue, confirm, get hidden -- using the exact query
// src/app/modqueue/page.tsx runs, so "appears in the moderator queue"
// means what it says rather than a proxy check on the flags table alone.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  admin,
  anonClient,
  createTestUser,
  deleteTestUser,
  makeModerator,
  type TestUser,
} from "./helpers";

const MODQUEUE_SELECT = `id, reason, notes, status, created_at,
       reporter_profile:profiles!flags_reporter_fkey(username),
       posts!flags_entity_id_fkey(id, otype, content, profiles!posts_creator_fkey(username), parent:posts!parent_id(id, otype))`;

describe("end-to-end: report -> queue -> confirm -> hidden", () => {
  let author: TestUser;
  let reporter: TestUser;
  let moderator: TestUser;

  beforeAll(async () => {
    [author, reporter, moderator] = await Promise.all([
      createTestUser("blogger", "e2e-author"),
      createTestUser("reader", "e2e-reporter"),
      createTestUser("blogger", "e2e-moderator"),
    ]);
    await makeModerator(moderator);
  });

  afterAll(async () => {
    await Promise.all([author, reporter, moderator].map(deleteTestUser));
  });

  it("walks the full flow a real user and moderator would follow", async () => {
    // 1. The author publishes an article.
    const { data: post, error: postError } = await author.client
      .from("posts")
      .insert({
        creator: author.id,
        otype: "Article",
        status: "published",
        title: "An article someone will report",
        content: "This article contains a claim that turns out to be spam.",
      })
      .select("id")
      .single();
    expect(postError).toBeNull();
    const postId = post!.id;

    // Sanity check: the public can read it before anything happens.
    const { data: visibleBefore } = await anonClient
      .from("posts")
      .select("id")
      .eq("id", postId)
      .maybeSingle();
    expect(visibleBefore).not.toBeNull();

    // 2. A reader reports it.
    const { data: flag, error: flagError } = await reporter.client
      .from("flags")
      .insert({
        reporter: reporter.id,
        entity_creator: author.id,
        entity_type: "post",
        entity_id: postId,
        reason: "Spam",
        notes: "This reads like a spam post.",
      })
      .select("id")
      .single();
    expect(flagError).toBeNull();
    const flagId = flag!.id;

    // 3. It appears in the moderator's queue -- the exact query the
    // /modqueue page runs, not a simplified stand-in for it.
    const { data: queueBefore, error: queueBeforeError } = await moderator.client
      .from("flags")
      .select(MODQUEUE_SELECT)
      .order("created_at", { ascending: false })
      .limit(500);
    expect(queueBeforeError).toBeNull();

    type QueueRow = {
      id: string;
      reason: string;
      notes: string;
      status: string;
      reporter_profile: { username: string } | null;
      posts: {
        id: string;
        otype: string;
        content: string;
        profiles: { username: string } | null;
      } | null;
    };
    const rows = (queueBefore ?? []) as unknown as QueueRow[];
    const pendingBefore = rows.filter((r) => r.status === "pending");
    const queuedFlag = pendingBefore.find((r) => r.id === flagId);

    expect(queuedFlag).toBeDefined();
    expect(queuedFlag?.reason).toBe("Spam");
    expect(queuedFlag?.notes).toBe("This reads like a spam post.");
    expect(queuedFlag?.reporter_profile?.username).toBe(reporter.username);
    expect(queuedFlag?.posts?.id).toBe(postId);
    expect(queuedFlag?.posts?.otype).toBe("Article");
    expect(queuedFlag?.posts?.profiles?.username).toBe(author.username);

    // A non-moderator (including the reporter themselves) can't act on it.
    const asReporter = await reporter.client.rpc("resolve_flag", {
      p_flag_id: flagId,
      p_action: "confirm",
    });
    expect(asReporter.error).not.toBeNull();

    // 4. The moderator confirms the report -- "Remove Content" in the UI.
    const { error: resolveError } = await moderator.client.rpc("resolve_flag", {
      p_flag_id: flagId,
      p_action: "confirm",
    });
    expect(resolveError).toBeNull();

    // The flag is now resolved, and has moved out of the pending queue.
    const { data: queueAfter } = await moderator.client
      .from("flags")
      .select(MODQUEUE_SELECT)
      .order("created_at", { ascending: false })
      .limit(500);
    const rowsAfter = (queueAfter ?? []) as unknown as QueueRow[];
    expect(rowsAfter.find((r) => r.id === flagId && r.status === "pending")).toBeUndefined();
    const resolvedFlag = rowsAfter.find((r) => r.id === flagId);
    expect(resolvedFlag?.status).toBe("confirmed");

    // 5. The post is hidden: gone from public view, but the author can
    // still see their own (removed) post, and their violation count went up.
    const { data: visibleAfter } = await anonClient
      .from("posts")
      .select("id")
      .eq("id", postId)
      .maybeSingle();
    expect(visibleAfter).toBeNull();

    const { data: authorsOwnView } = await author.client
      .from("posts")
      .select("flagged")
      .eq("id", postId)
      .single();
    expect(authorsOwnView?.flagged).toBe(true);

    const { data: authorProfile } = await admin
      .from("profiles")
      .select("violations")
      .eq("id", author.id)
      .single();
    expect(authorProfile?.violations).toBeGreaterThanOrEqual(1);
  });
});

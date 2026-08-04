// Integration tests for the Moderation feature, run against the REAL
// linked Supabase project (see tests/helpers.ts for why). Covers: filing a
// flag, who may read a flag, the resolve_flag/mark_post_disputed RPCs
// being mod-only and doing exactly what ThePodium_v5.html's
// resolveFlag()/confirmDispute() do, and the profiles column lockdown
// this feature depends on (is_mod/violations can't be self-granted).

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  admin,
  anonClient,
  createTestUser,
  deleteTestUser,
  makeModerator,
  type TestUser,
} from "./helpers";

describe("moderation", () => {
  let author: TestUser;
  let reporter: TestUser;
  let mod: TestUser;
  let other: TestUser;

  let postConfirmId: string;
  let postDismissId: string;
  let postDisputeId: string;
  let flagConfirmId: string;
  let flagDismissId: string;

  beforeAll(async () => {
    [author, reporter, mod, other] = await Promise.all([
      createTestUser("blogger", "mod-author"),
      createTestUser("reader", "mod-reporter"),
      createTestUser("blogger", "mod-mod"),
      createTestUser("reader", "mod-other"),
    ]);
    await makeModerator(mod);

    const [{ data: postConfirm }, { data: postDismiss }, { data: postDispute }] =
      await Promise.all([
        author.client
          .from("posts")
          .insert({
            creator: author.id,
            otype: "Article",
            status: "published",
            title: "Will be removed",
            content: "Content that will be confirmed as a violation.",
          })
          .select("id")
          .single(),
        author.client
          .from("posts")
          .insert({
            creator: author.id,
            otype: "Article",
            status: "published",
            title: "Will be dismissed",
            content: "Content that will survive a dismissed flag.",
          })
          .select("id")
          .single(),
        author.client
          .from("posts")
          .insert({
            creator: author.id,
            otype: "Article",
            status: "published",
            title: "Dispute candidate",
            content: "Content with a contested claim.",
          })
          .select("id")
          .single(),
      ]);
    if (!postConfirm || !postDismiss || !postDispute) {
      throw new Error("seed posts failed");
    }
    postConfirmId = postConfirm.id;
    postDismissId = postDismiss.id;
    postDisputeId = postDispute.id;

    const [{ data: flagConfirm, error: e1 }, { data: flagDismiss, error: e2 }] =
      await Promise.all([
        reporter.client
          .from("flags")
          .insert({
            reporter: reporter.id,
            entity_creator: author.id,
            entity_type: "post",
            entity_id: postConfirmId,
            reason: "Misinformation",
            notes: "This claim looks unverified.",
          })
          .select("id")
          .single(),
        reporter.client
          .from("flags")
          .insert({
            reporter: reporter.id,
            entity_creator: author.id,
            entity_type: "post",
            entity_id: postDismissId,
            reason: "Spam",
            notes: "",
          })
          .select("id")
          .single(),
      ]);
    if (e1 || e2 || !flagConfirm || !flagDismiss) {
      throw new Error(`seed flags failed: ${e1?.message} ${e2?.message}`);
    }
    flagConfirmId = flagConfirm.id;
    flagDismissId = flagDismiss.id;
  });

  afterAll(async () => {
    await Promise.all([author, reporter, mod, other].map(deleteTestUser));
  });

  it("any signed-in user can file a flag, attributed to themselves", async () => {
    const { data, error } = await reporter.client
      .from("flags")
      .select("id, reporter, status")
      .eq("id", flagConfirmId)
      .single();
    expect(error).toBeNull();
    expect(data?.reporter).toBe(reporter.id);
    expect(data?.status).toBe("pending");
  });

  it("a flag cannot be attributed to another user", async () => {
    const { error } = await reporter.client.from("flags").insert({
      reporter: author.id,
      entity_creator: author.id,
      entity_type: "post",
      entity_id: postConfirmId,
      reason: "Spam",
      notes: "",
    });
    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501");
  });

  it("a flag is visible to its reporter and to moderators, but not to a random third party or the content's own creator", async () => {
    const asReporter = await reporter.client
      .from("flags")
      .select("id")
      .eq("id", flagConfirmId)
      .maybeSingle();
    expect(asReporter.data).not.toBeNull();

    const asMod = await mod.client
      .from("flags")
      .select("id")
      .eq("id", flagConfirmId)
      .maybeSingle();
    expect(asMod.data).not.toBeNull();

    const asOther = await other.client
      .from("flags")
      .select("id")
      .eq("id", flagConfirmId)
      .maybeSingle();
    expect(asOther.data).toBeNull();

    const asAuthor = await author.client
      .from("flags")
      .select("id")
      .eq("id", flagConfirmId)
      .maybeSingle();
    expect(asAuthor.data).toBeNull();
  });

  it("a non-moderator cannot resolve a flag, including the reporter themselves", async () => {
    const asOther = await other.client.rpc("resolve_flag", {
      p_flag_id: flagDismissId,
      p_action: "dismiss",
    });
    expect(asOther.error).not.toBeNull();

    const asReporter = await reporter.client.rpc("resolve_flag", {
      p_flag_id: flagDismissId,
      p_action: "dismiss",
    });
    expect(asReporter.error).not.toBeNull();
  });

  it("a non-moderator cannot mark a post disputed", async () => {
    const { error } = await other.client.rpc("mark_post_disputed", {
      p_post_id: postDisputeId,
      p_note: "Trying to abuse this.",
    });
    expect(error).not.toBeNull();
  });

  it("a moderator confirming a flag removes the content, hides it from the public, and adds a strike to the creator's violation count", async () => {
    const { data: before } = await admin
      .from("profiles")
      .select("violations")
      .eq("id", author.id)
      .single();

    const { error } = await mod.client.rpc("resolve_flag", {
      p_flag_id: flagConfirmId,
      p_action: "confirm",
    });
    expect(error).toBeNull();

    const { data: flagRow } = await mod.client
      .from("flags")
      .select("status")
      .eq("id", flagConfirmId)
      .single();
    expect(flagRow?.status).toBe("confirmed");

    // The creator can still see their own removed post...
    const { data: asAuthor } = await author.client
      .from("posts")
      .select("flagged")
      .eq("id", postConfirmId)
      .single();
    expect(asAuthor?.flagged).toBe(true);

    // ...but it's now hidden from everyone else, RLS-side.
    const { data: asAnon } = await anonClient
      .from("posts")
      .select("id")
      .eq("id", postConfirmId)
      .maybeSingle();
    expect(asAnon).toBeNull();

    const { data: after } = await admin
      .from("profiles")
      .select("violations")
      .eq("id", author.id)
      .single();
    expect(after?.violations).toBe((before?.violations ?? 0) + 1);
  });

  it("a moderator dismissing a flag leaves the content untouched and adds no strike", async () => {
    const { data: before } = await admin
      .from("profiles")
      .select("violations")
      .eq("id", author.id)
      .single();

    const { error } = await mod.client.rpc("resolve_flag", {
      p_flag_id: flagDismissId,
      p_action: "dismiss",
    });
    expect(error).toBeNull();

    const { data: flagRow } = await mod.client
      .from("flags")
      .select("status")
      .eq("id", flagDismissId)
      .single();
    expect(flagRow?.status).toBe("dismissed");

    const { data: postRow } = await anonClient
      .from("posts")
      .select("flagged")
      .eq("id", postDismissId)
      .single();
    expect(postRow?.flagged).toBe(false);

    const { data: after } = await admin
      .from("profiles")
      .select("violations")
      .eq("id", author.id)
      .single();
    expect(after?.violations).toBe(before?.violations ?? 0);
  });

  it("mark_post_disputed requires a non-empty note", async () => {
    const { error } = await mod.client.rpc("mark_post_disputed", {
      p_post_id: postDisputeId,
      p_note: "   ",
    });
    expect(error).not.toBeNull();
  });

  it("a moderator can mark a post disputed without removing it", async () => {
    const { error } = await mod.client.rpc("mark_post_disputed", {
      p_post_id: postDisputeId,
      p_note: "Some claims need independent verification.",
    });
    expect(error).toBeNull();

    const { data } = await anonClient
      .from("posts")
      .select("disputed, dispute_note, flagged")
      .eq("id", postDisputeId)
      .single();
    expect(data?.disputed).toBe(true);
    expect(data?.dispute_note).toBe("Some claims need independent verification.");
    expect(data?.flagged).toBe(false);
  });

  it("a user cannot self-promote to moderator via a direct profile update", async () => {
    const { error } = await other.client
      .from("profiles")
      .update({ is_mod: true })
      .eq("id", other.id);
    expect(error).not.toBeNull();

    const { data } = await anonClient
      .from("profiles")
      .select("is_mod")
      .eq("id", other.id)
      .single();
    expect(data?.is_mod).toBe(false);
  });

  it("a user cannot erase their own violation count via a direct profile update", async () => {
    // author picked up a strike from the confirmed flag above.
    const { error } = await author.client
      .from("profiles")
      .update({ violations: 0 })
      .eq("id", author.id);
    expect(error).not.toBeNull();

    const { data } = await admin
      .from("profiles")
      .select("violations")
      .eq("id", author.id)
      .single();
    expect(data?.violations).toBeGreaterThan(0);
  });
});

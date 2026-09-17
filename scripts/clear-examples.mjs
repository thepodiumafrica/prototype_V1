// Deletes every trace of the launch-time example content: every example
// post/comment (is_example = true), every example profile and its
// Supabase Auth account, and every like/follow that touches any of them.
// Touches no real user data.
//
// Idempotent: running this twice is a no-op the second time -- there's
// nothing left to delete, so it just reports zero.
//
// Safety: before deleting anything, this detaches (sets parent_id = null
// on) any REAL comment that replies directly to an example post. Without
// that step, deleting the example post would cascade-delete that real
// person's comment too, purely because it's a foreign key pointing at a
// row that's about to disappear -- exactly the kind of real-data loss
// this script must never cause. The comment itself is preserved, just
// detached from its now-gone parent.
//
// Likes/follows need no such safeguard: they're pure join rows with no
// content of their own, and ON DELETE CASCADE on their profiles/posts
// foreign keys removes them automatically once the example profiles and
// posts are gone -- including a real visitor's like on an example post,
// which is expected (the thing they liked no longer exists), the same as
// what already happens today when any user deletes their own post.
//
// Usage:
//   npm run clear:examples            -- delete for real
//   npm run clear:examples -- --dry-run   -- report what would be deleted, change nothing

import { supabaseAdmin } from "./lib/supabase-admin.mjs";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const { data: examplePosts, error: postsError } = await supabaseAdmin
    .from("posts")
    .select("id")
    .eq("is_example", true);
  if (postsError) throw postsError;
  const examplePostIds = (examplePosts ?? []).map((p) => p.id);

  const { data: exampleProfiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, username")
    .eq("is_example", true);
  if (profilesError) throw profilesError;

  console.log(
    `Found ${examplePostIds.length} example posts/comments and ${exampleProfiles.length} example profiles.`,
  );

  if (examplePostIds.length === 0 && exampleProfiles.length === 0) {
    console.log("Nothing to clear -- already clean.");
    return;
  }

  if (dryRun) {
    console.log("--dry-run: no changes made. Example profiles:");
    for (const p of exampleProfiles) console.log(`  @${p.username}`);
    return;
  }

  // Safety step: detach real replies before anything cascades.
  if (examplePostIds.length > 0) {
    const { data: detached, error: detachError } = await supabaseAdmin
      .from("posts")
      .update({ parent_id: null })
      .eq("is_example", false)
      .in("parent_id", examplePostIds)
      .select("id");
    if (detachError) throw detachError;
    if (detached && detached.length > 0) {
      console.log(
        `  detached ${detached.length} real reply/replies from example content they pointed at (preserved, not deleted)`,
      );
    }
  }

  // Deleting the auth user cascades: profiles -> posts (creator) ->
  // likes/follows/comments referencing those posts/profiles. This is the
  // primary removal path.
  let deletedPersonas = 0;
  for (const profile of exampleProfiles) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(profile.id);
    if (error) {
      console.error(`  failed to delete @${profile.username}:`, error.message);
      continue;
    }
    deletedPersonas++;
  }

  // Defensive fallback, not the primary path: cleans up any is_example
  // post/profile the cascade above didn't reach (e.g. a partially-applied
  // previous run, or a row manually flagged is_example outside the seed
  // script). A no-op when the cascade already handled everything.
  const { data: remainingPosts, error: remainingPostsError } = await supabaseAdmin
    .from("posts")
    .delete()
    .eq("is_example", true)
    .select("id");
  if (remainingPostsError) throw remainingPostsError;

  const { data: remainingProfiles, error: remainingProfilesError } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("is_example", true)
    .select("id");
  if (remainingProfilesError) throw remainingProfilesError;

  console.log("\nDone.");
  console.log(`  ${deletedPersonas} example accounts deleted (cascaded their posts/likes/follows).`);
  if (remainingPosts?.length) console.log(`  ${remainingPosts.length} orphaned example post(s) cleaned up.`);
  if (remainingProfiles?.length)
    console.log(`  ${remainingProfiles.length} orphaned example profile(s) cleaned up.`);
  console.log("  No real user data was touched.");
}

main().catch((err) => {
  console.error("\nclear-examples failed:", err);
  process.exit(1);
});

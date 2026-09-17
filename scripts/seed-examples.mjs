// Seeds the launch-time example content into the real Supabase database:
// the 9 personas, 8 articles, 4 forum posts, 5 comments, and the likes/
// follows connecting them -- all ported verbatim from
// reference/ThePodium_v5.html (see scripts/lib/example-data.mjs).
//
// Idempotent by design: run it as many times as you like.
//   - Personas are matched by username (already unique in profiles). An
//     existing example persona is updated in place, not recreated; a
//     username already taken by a REAL (non-example) account is skipped
//     entirely, with a warning -- this script never overwrites real data.
//   - Posts/comments are matched by example_key (see the migration) and
//     upserted, so re-running after a content tweak in example-data.mjs
//     syncs it instead of duplicating it.
//   - Likes/follows are inserted with ON CONFLICT DO NOTHING against their
//     existing composite primary keys.
//
// Usage: npm run seed:examples

import { supabaseAdmin } from "./lib/supabase-admin.mjs";
import {
  PERSONAS,
  POSTS,
  COMMENTS,
  T,
  EXAMPLE_PASSWORD,
  EXAMPLE_EMAIL_DOMAIN,
  EXAMPLE_DATE_OF_BIRTH,
} from "./lib/example-data.mjs";

async function ensurePersona(persona) {
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("profiles")
    .select("id, is_example")
    .eq("username", persona.username)
    .maybeSingle();
  if (lookupError) throw lookupError;

  if (existing && !existing.is_example) {
    console.warn(
      `  skip @${persona.username}: a REAL account already has this username -- not touching it.`,
    );
    return null;
  }

  let id = existing?.id;
  if (!id) {
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: `${persona.username.toLowerCase()}@${EXAMPLE_EMAIL_DOMAIN}`,
      password: EXAMPLE_PASSWORD,
      email_confirm: true,
      user_metadata: {
        username: persona.username,
        user_type: persona.user_type,
        date_of_birth: EXAMPLE_DATE_OF_BIRTH,
        preferred_language: "en",
      },
    });
    if (createError) throw createError;
    id = created.user.id;
    console.log(`  created @${persona.username}`);
  } else {
    console.log(`  updating existing example @${persona.username}`);
  }

  // handle_new_user() only sets username/user_type/african_identity
  // (default "continent")/referral_code -- everything else the seed cares
  // about (bio, expertise, ...) is filled in here, as the service role,
  // which bypasses the column-level UPDATE grants an ordinary signed-in
  // user is restricted to.
  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({
      is_mod: false, // deliberate: never port isMod, even where the prototype has it
      verified: persona.verified,
      founding_creator: persona.founding_creator,
      bio: persona.bio,
      african_identity: persona.african_identity,
      country_origin: persona.country_origin,
      country_residence: persona.country_residence,
      profession: persona.profession,
      industry: persona.industry,
      years_experience: persona.years_experience,
      linkedin_url: persona.linkedin_url,
      expertise: persona.expertise,
      interests: persona.interests,
      is_example: true,
      created_at: T(persona.joinedDaysAgo),
    })
    .eq("id", id);
  if (updateError) throw updateError;

  return id;
}

async function upsertPosts(usernameToId) {
  const rows = POSTS.map((p) => ({
    example_key: p.example_key,
    creator: usernameToId[p.creator],
    otype: p.otype,
    status: "published",
    category: p.category,
    tags: p.tags,
    title: p.title,
    content: p.content,
    views: p.views,
    is_example: true,
    created_at: T(p.daysAgo),
  }));

  const { data, error } = await supabaseAdmin
    .from("posts")
    .upsert(rows, { onConflict: "example_key" })
    .select("id, example_key");
  if (error) throw error;

  const keyToId = {};
  for (const row of data) keyToId[row.example_key] = row.id;
  return keyToId;
}

async function upsertComments(usernameToId, postKeyToId) {
  const rows = COMMENTS.map((c) => ({
    example_key: c.example_key,
    creator: usernameToId[c.creator],
    otype: "Comment",
    status: "published",
    parent_id: postKeyToId[c.parent],
    content: c.content,
    is_example: true,
    created_at: T(c.daysAgo),
  }));

  const { data, error } = await supabaseAdmin
    .from("posts")
    .upsert(rows, { onConflict: "example_key" })
    .select("id, example_key");
  if (error) throw error;

  const keyToId = {};
  for (const row of data) keyToId[row.example_key] = row.id;
  return keyToId;
}

async function insertLikes(usernameToId, allKeyToId) {
  const rows = [];
  for (const item of [...POSTS, ...COMMENTS]) {
    const postId = allKeyToId[item.example_key];
    for (const username of item.likedBy ?? []) {
      const userId = usernameToId[username];
      if (postId && userId) rows.push({ user_id: userId, post_id: postId });
    }
  }
  if (rows.length === 0) return 0;
  const { error } = await supabaseAdmin
    .from("likes")
    .upsert(rows, { onConflict: "user_id,post_id", ignoreDuplicates: true });
  if (error) throw error;
  return rows.length;
}

async function insertFollows(usernameToId) {
  const rows = [];
  for (const persona of PERSONAS) {
    const followerId = usernameToId[persona.username];
    for (const followeeName of persona.following) {
      const followeeId = usernameToId[followeeName];
      if (followerId && followeeId) rows.push({ follower: followerId, following: followeeId });
    }
  }
  if (rows.length === 0) return 0;
  const { error } = await supabaseAdmin
    .from("follows")
    .upsert(rows, { onConflict: "follower,following", ignoreDuplicates: true });
  if (error) throw error;
  return rows.length;
}

async function main() {
  console.log("Seeding example personas...");
  const usernameToId = {};
  for (const persona of PERSONAS) {
    const id = await ensurePersona(persona);
    if (id) usernameToId[persona.username] = id;
  }

  const seededUsernames = Object.keys(usernameToId);
  if (seededUsernames.length === 0) {
    console.error(
      "No example personas could be created or reused -- every username is taken by a real account. Aborting before touching posts/likes/follows.",
    );
    process.exit(1);
  }

  console.log("Seeding example articles and forum posts...");
  const postKeyToId = await upsertPosts(usernameToId);

  console.log("Seeding example comments...");
  const commentKeyToId = await upsertComments(usernameToId, postKeyToId);
  const allKeyToId = { ...postKeyToId, ...commentKeyToId };

  console.log("Seeding example likes...");
  const likeCount = await insertLikes(usernameToId, allKeyToId);

  console.log("Seeding example follows...");
  const followCount = await insertFollows(usernameToId);

  console.log("\nDone.");
  console.log(
    `  ${seededUsernames.length} personas, ${Object.keys(postKeyToId).length} articles/forum posts, ${Object.keys(commentKeyToId).length} comments, up to ${likeCount} likes, up to ${followCount} follows.\n`,
  );

  console.log("Example account credentials (demo only, never real):");
  console.log(`  Shared password: ${EXAMPLE_PASSWORD}`);
  for (const username of seededUsernames) {
    console.log(`  ${username.padEnd(20)} ${username.toLowerCase()}@${EXAMPLE_EMAIL_DOMAIN}`);
  }
  console.log("\nTo remove every trace of this content later: npm run clear:examples");
}

main().catch((err) => {
  console.error("\nseed-examples failed:", err);
  process.exit(1);
});

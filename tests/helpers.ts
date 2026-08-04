// Shared setup for integration tests that run against the REAL linked
// Supabase project (no local Supabase/Docker in this environment). Creates
// real throwaway auth users, signed in as themselves, so RLS is genuinely
// exercised rather than mocked.

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

// Admin client: only for creating/deleting throwaway test users. Never used
// to read or write app data directly -- that always goes through a test
// user's own signed-in client below.
export const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const anonClient = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const runId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export interface TestUser {
  id: string;
  username: string;
  client: SupabaseClient;
}

export async function createTestUser(
  userType: string,
  label = userType,
): Promise<TestUser> {
  const email = `test-${label}-${runId}@example.com`;
  const password = "TestPass123!";
  const username = `t_${label}_${runId}`.slice(0, 24);

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, user_type: userType },
  });
  if (error || !data.user) {
    throw new Error(`Failed to create ${label} test user: ${error?.message}`);
  }

  const client = createClient(url!, anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    throw new Error(
      `Failed to sign in ${label} test user: ${signInError.message}`,
    );
  }

  return { id: data.user.id, username, client };
}

// The one legitimate use of the admin client for "app data" rather than
// user lifecycle: there is no user-facing path to become a moderator (no
// self-service RLS policy allows it, by design -- see is_mod's absence
// from the profiles UPDATE policy). A real moderator is made by an admin
// flipping this flag directly in the database, so that's what this does.
export async function makeModerator(user: TestUser) {
  const { error } = await admin
    .from("profiles")
    .update({ is_mod: true })
    .eq("id", user.id);
  if (error) {
    throw new Error(`Failed to make ${user.username} a moderator: ${error.message}`);
  }
}

export async function deleteTestUser(user: TestUser | undefined) {
  // Deleting the auth user cascades: profiles -> posts/follows/etc. all
  // clean up automatically via "on delete cascade" foreign keys.
  if (!user) return;
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error(`Failed to delete test user ${user.username}:`, error.message);
  }
}

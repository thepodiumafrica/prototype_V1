import type { SupabaseClient } from "@supabase/supabase-js";

// Calls the public.compute_trust() database function (see
// supabase/migrations/20260803090007_compute_trust.sql), which ports
// ThePodium_v5.html's computeTrust(). Done via an RPC rather than querying
// posts/flags directly here, because the flags table is intentionally
// private -- only the derived trust number is meant to be public.
export async function computeTrust(
  supabase: SupabaseClient,
  profileId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc("compute_trust", {
    profile_id: profileId,
  });
  if (error || data == null) return 1;
  return data;
}

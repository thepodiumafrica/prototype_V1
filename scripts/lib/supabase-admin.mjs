// Shared by every scripts/*.mjs operational script: a Supabase client
// authenticated as the service role, which bypasses RLS and the
// column-level UPDATE grants in supabase/migrations -- the right
// privilege level for a backend seed/maintenance script, never for
// app code that runs on a visitor's behalf.

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
config({ path: path.join(projectRoot, ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local -- this script needs the service role key, not the anon key.",
  );
  process.exit(1);
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Flips the operator-controlled app_settings.auto_retire_examples flag
// (see supabase/migrations/20260918090001_example_content.sql and
// src/lib/example-retirement.ts). When on, an example ARTICLE stops being
// shown in any category that already has 3+ real published articles --
// the scaffolding falls away category by category as real writing
// arrives, instead of all at once via clear-examples.
//
// Usage:
//   npm run toggle:example-retirement -- on
//   npm run toggle:example-retirement -- off
//   npm run toggle:example-retirement           -- prints the current value

import { supabaseAdmin } from "./lib/supabase-admin.mjs";

const arg = process.argv[2];

async function main() {
  if (arg !== "on" && arg !== "off" && arg !== undefined) {
    console.error('Usage: npm run toggle:example-retirement -- on|off');
    process.exit(1);
  }

  if (arg === undefined) {
    const { data, error } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", "auto_retire_examples")
      .maybeSingle();
    if (error) throw error;
    console.log(`auto_retire_examples is currently: ${data?.value === true ? "on" : "off"}`);
    return;
  }

  const { error } = await supabaseAdmin
    .from("app_settings")
    .upsert({ key: "auto_retire_examples", value: arg === "on", updated_at: new Date().toISOString() });
  if (error) throw error;
  console.log(`auto_retire_examples set to: ${arg}`);
}

main().catch((err) => {
  console.error("\ntoggle-example-retirement failed:", err);
  process.exit(1);
});

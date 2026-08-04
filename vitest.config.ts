import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    // These hit the real Supabase project over the network (creating and
    // tearing down real auth users), so give them more room than unit tests.
    testTimeout: 20000,
    // These are integration tests against one shared live database, not
    // isolated unit tests -- running files in parallel caused concurrent
    // cascading deletes (auth user -> profile -> posts -> comments) to lock
    // against each other, and admin.auth.admin.deleteUser() would return
    // successfully while the user silently survived. Sequential avoids the
    // contention entirely.
    fileParallelism: false,
  },
});

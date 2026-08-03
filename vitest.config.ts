import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    // These hit the real Supabase project over the network (creating and
    // tearing down real auth users), so give them more room than unit tests.
    testTimeout: 20000,
  },
});

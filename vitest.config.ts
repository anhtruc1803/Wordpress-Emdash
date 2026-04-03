import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic"
  },
  test: {
    globals: true,
    environment: "node",
    environmentMatchGlobs: [
      ["apps/migration-console/tests/**/*.test.tsx", "jsdom"]
    ],
    include: [
      "packages/migration-core/src/__tests__/**/*.test.ts",
      "apps/migration-console/tests/**/*.test.tsx"
    ],
    setupFiles: [resolve("apps/migration-console/tests/setup.tsx")]
  },
  resolve: {
    alias: {
      "@": resolve("apps/migration-console")
    }
  }
});

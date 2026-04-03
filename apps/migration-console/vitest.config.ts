import { defineConfig } from "vitest/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  esbuild: {
    jsx: "automatic"
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [resolve(currentDir, "tests/setup.tsx")],
    include: ["tests/**/*.test.tsx"]
  },
  resolve: {
    alias: {
      "@": currentDir
    }
  }
});

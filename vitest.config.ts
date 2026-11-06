import { defineConfig } from "vitest/config";

// Every test drives a real Chrome, so rendering a whole style takes longer than the default timeout.
export default defineConfig({
  test: {
    testTimeout: 180_000,
    hookTimeout: 180_000,
  },
});

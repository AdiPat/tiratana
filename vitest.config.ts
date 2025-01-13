import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["test_folder", "node_modules", "dist"],
  },
});

/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { apiDevPlugin } from "./server/api-dev-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevPlugin()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test-setup.ts",
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
  },
});

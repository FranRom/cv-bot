import { execFileSync } from "child_process";
import { cpSync, mkdirSync, writeFileSync } from "fs";

// 1. Build the frontend with Vite
console.log("Building frontend...");
execFileSync("npx", ["vite", "build"], { stdio: "inherit" });

// 2. Bundle the API function with esbuild
console.log("Bundling API function...");
await import("./build-api.mjs");

// 3. Copy static assets to Build Output API format
const OUTPUT_DIR = ".vercel/output";
mkdirSync(`${OUTPUT_DIR}/static`, { recursive: true });
cpSync("dist", `${OUTPUT_DIR}/static`, { recursive: true });

// 4. Write the output config with routes
writeFileSync(
  `${OUTPUT_DIR}/config.json`,
  JSON.stringify({
    version: 3,
    routes: [
      { src: "/api/(.*)", dest: "/api/$1" },
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/index.html" },
    ],
  })
);

console.log("Vercel build complete.");

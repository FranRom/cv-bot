import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "fs";

const FUNC_DIR = ".vercel/output/functions/api/chat.func";

// Bundle the API function into a single file
await build({
  entryPoints: ["api/chat.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: `${FUNC_DIR}/index.mjs`,
  // Don't bundle node built-ins
  external: [],
  // Handle JSON imports
  loader: { ".json": "json" },
  // ESM banner for compatibility
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
  },
});

// Write the Vercel function config
writeFileSync(
  `${FUNC_DIR}/.vc-config.json`,
  JSON.stringify({
    runtime: "nodejs20.x",
    handler: "index.mjs",
    launcherType: "Nodejs",
  })
);

console.log("API function bundled to", FUNC_DIR);

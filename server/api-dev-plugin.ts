import type { Plugin, ViteDevServer } from "vite";
import { loadEnv } from "vite";

export function apiDevPlugin(): Plugin {
  return {
    name: "api-dev-server",
    configureServer(server: ViteDevServer) {
      // Load .env.local vars into process.env so AI SDK picks up API keys
      const env = loadEnv("development", process.cwd(), "");
      for (const [key, value] of Object.entries(env)) {
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }

      server.middlewares.use("/api/chat", async (req, res) => {
        try {
          // Load the handler through Vite's SSR module system
          // The handler expects Node.js (req, res) — pass them directly
          const mod = await server.ssrLoadModule("/functions-src/chat.ts");
          await mod.default(req, res);
        } catch (error) {
          console.error("[api-dev] Error:", error);
          if (!res.headersSent) {
            res.writeHead(500, { "Content-Type": "application/json" });
          }
          res.end(JSON.stringify({ error: "Internal server error" }));
        }
      });
    },
  };
}

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
        if (req.method !== "POST") {
          res.writeHead(405);
          res.end("Method not allowed");
          return;
        }

        try {
          // Collect request body
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(chunk as Buffer);
          }
          const body = Buffer.concat(chunks).toString();

          // Build a Web Request for our handler
          const webRequest = new Request(
            `http://localhost${req.url ?? "/api/chat"}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body,
            }
          );

          // Load the handler through Vite's SSR module system
          const mod = await server.ssrLoadModule("/api/chat.ts");
          const handler = mod.default;
          const webResponse: Response = await handler(webRequest);

          // Pipe Web Response back to Node response
          res.writeHead(
            webResponse.status,
            Object.fromEntries(webResponse.headers)
          );

          if (webResponse.body) {
            const reader = webResponse.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const text = decoder.decode(value, { stream: true });
              // Log streamed error chunks to terminal
              if (text.includes('"error"') || text.includes('error')) {
                console.error("[api-dev] Stream chunk:", text);
              }
              res.write(value);
            }
            res.end();
          } else {
            const text = await webResponse.text();
            console.error("[api-dev] Non-stream response:", text);
            res.end(text);
          }
        } catch (error) {
          console.error("[api-dev] Error:", error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: "Internal server error" }));
        }
      });
    },
  };
}

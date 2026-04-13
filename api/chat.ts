import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { createTools } from "../server/tools";
import { buildSystemPrompt } from "../server/system-prompt";
import { getModel } from "../server/provider";
import { RateLimiter } from "../server/rate-limiter";
import { checkInput } from "../server/guard-rails";
import cvData from "../data/cv-data.json";
import config from "../data/config.json";
import type { CvData, Config } from "../src/lib/types";

export const runtime = "edge";

const typedCvData = cvData as CvData;
const typedConfig = config as Config;
const rateLimiter = new RateLimiter(typedConfig.rateLimit);

// Pre-build the system prompt once — it never changes at runtime.
const systemPrompt = buildSystemPrompt(
  typedCvData.profile.name,
  typedConfig.chat
);

// Pre-build tools once — they're static.
const tools = createTools(typedCvData);

// Workaround: AI SDK strips "type" from empty object schemas.
// Patch fetch to ensure input_schema always has "type": "object".
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  if (
    typeof input === "string" &&
    input.includes("anthropic.com") &&
    init?.body
  ) {
    const body = JSON.parse(init.body as string);
    if (body.tools) {
      for (const tool of body.tools) {
        if (tool.input_schema && !tool.input_schema.type) {
          tool.input_schema.type = "object";
        }
      }
      init = { ...init, body: JSON.stringify(body) };
    }
  }
  return originalFetch(input, init);
};

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = await rateLimiter.check(ip);
  if (!rateCheck.allowed) {
    return new Response(JSON.stringify({ error: rateCheck.message }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const { messages } = body;

  // Guard rails: validate the last user message before sending to LLM
  const lastMsg = messages?.[messages.length - 1];
  if (lastMsg?.role === "user") {
    const text =
      lastMsg.content ??
      lastMsg.parts
        ?.filter((p: { type: string }) => p.type === "text")
        .map((p: { text: string }) => p.text)
        .join("") ??
      "";
    const guard = checkInput(text);
    if (!guard.allowed) {
      return new Response(JSON.stringify({ error: guard.reason }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const modelMessages = await convertToModelMessages(messages.slice(-10));

  try {
    const result = streamText({
      model: getModel(typedConfig.llm),
      // System prompt with cache_control: Anthropic caches this across
      // requests within a 5-minute window, saving ~90% on input tokens.
      // Other providers ignore the providerOptions and just use the text.
      system: {
        role: "system" as const,
        content: systemPrompt,
        providerOptions: {
          anthropic: { cacheControl: { type: "ephemeral" } },
        },
      },
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(3),
      maxOutputTokens: typedConfig.llm.maxTokens,
      temperature: typedConfig.llm.temperature,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[api/chat] Error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

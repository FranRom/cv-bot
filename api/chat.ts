import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { createTools } from "./_lib/tools.js";
import { buildSystemPrompt } from "./_lib/system-prompt.js";
import { getModel } from "./_lib/provider.js";
import { RateLimiter } from "./_lib/rate-limiter.js";
import { checkInput } from "./_lib/guard-rails.js";
import { detectSkill } from "./_lib/skill-router.js";
import cvData from "../data/cv-data.json";
import config from "../data/config.json";
import type { CvData, Config } from "./_lib/types.js";

const typedCvData = cvData as CvData;
const typedConfig = config as Config;
const rateLimiter = new RateLimiter(typedConfig.rateLimit);

// Max request body size (50KB — generous for a chat)
const MAX_BODY_SIZE = 50_000;

// Pre-build the system prompt once — it never changes at runtime.
const systemPrompt = buildSystemPrompt(
  typedCvData.profile.name,
  typedConfig.chat
);

// Pre-build tools once — they're static.
const tools = createTools(typedCvData);

// Workaround: AI SDK strips "type" from empty object schemas.
// Patch fetch to ensure input_schema always has "type": "object".
// TODO: Remove once https://github.com/vercel/ai/issues/ is fixed upstream.
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  if (
    typeof input === "string" &&
    input.includes("anthropic.com") &&
    init?.body &&
    typeof init.body === "string"
  ) {
    try {
      const body = JSON.parse(init.body);
      if (body.tools) {
        for (const tool of body.tools) {
          if (tool.input_schema && !tool.input_schema.type) {
            tool.input_schema.type = "object";
          }
        }
        init = { ...init, body: JSON.stringify(body) };
      }
    } catch {
      // If body isn't parseable JSON, pass through unchanged
    }
  }
  return originalFetch(input, init);
};

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // CORS: restrict to same origin in production
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigin =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : origin; // Allow any origin in local dev

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle CORS preflight (method already checked as POST above,
  // but OPTIONS requests are handled by Vercel's Edge runtime)

  // Body size check — prevent memory exhaustion
  const contentLength = parseInt(
    req.headers.get("content-length") ?? "0",
    10
  );
  if (contentLength > MAX_BODY_SIZE) {
    return new Response(
      JSON.stringify({ error: "Request too large." }),
      { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Rate limit check — use x-real-ip (set by Vercel, not spoofable) with fallback
  const ip =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const rateCheck = await rateLimiter.check(ip);
  if (!rateCheck.allowed) {
    return new Response(JSON.stringify({ error: rateCheck.message }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse body with error handling
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: { messages?: any[] };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { messages } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "Messages are required." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Guard rails: validate the last user message before sending to LLM
  const lastMsg = messages[messages.length - 1] as {
    role?: string;
    content?: string;
    parts?: Array<{ type: string; text?: string }>;
  };
  if (lastMsg?.role === "user") {
    const text =
      lastMsg.content ??
      lastMsg.parts
        ?.filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("") ??
      "";
    const guard = checkInput(text);
    if (!guard.allowed) {
      return new Response(JSON.stringify({ error: guard.reason }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Skill routing: detect intent and augment system prompt
  const lastUserText =
    lastMsg?.role === "user"
      ? (lastMsg.content ??
          lastMsg.parts
            ?.filter((p) => p.type === "text")
            .map((p) => p.text)
            .join("") ??
          "")
      : "";
  const skill = detectSkill(lastUserText, typedCvData.profile.name);
  const augmentedPrompt = skill
    ? `${systemPrompt}\n\n${skill.prompt}`
    : systemPrompt;

  const modelMessages = await convertToModelMessages(messages.slice(-10));

  try {
    const result = streamText({
      model: getModel(typedConfig.llm),
      system: {
        role: "system" as const,
        content: augmentedPrompt,
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
    // Log full error server-side, return generic message to client
    console.error("[api/chat] Error:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

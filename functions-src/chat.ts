import type { IncomingMessage, ServerResponse } from "http";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { createTools } from "./_lib/tools";
import { buildSystemPrompt } from "./_lib/system-prompt";
import { getModel } from "./_lib/provider";
import { RateLimiter } from "./_lib/rate-limiter";
import { checkInput } from "./_lib/guard-rails";
import { detectSkill } from "./_lib/skill-router";
import cvData from "../data/cv-data.json";
import config from "../data/config.json";
import type { CvData, Config, Tone } from "./_lib/types";

const typedCvData = cvData as CvData;
const typedConfig = config as Config;
const rateLimiter = new RateLimiter(typedConfig.rateLimit);

const MAX_BODY_SIZE = 50_000;

const defaultTone = typedConfig.chat.tone;

const tools = createTools(typedCvData);

// Workaround: AI SDK strips "type" from empty object schemas.
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
      // pass through
    }
  }
  return originalFetch(input, init);
};

// Helper: read Node.js request body as string
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

// Helper: get header value from Node.js request
function getHeader(req: IncomingMessage, name: string): string | undefined {
  const val = req.headers[name.toLowerCase()];
  return Array.isArray(val) ? val[0] : val;
}

// Helper: pipe Web Response to Node.js ServerResponse
async function pipeResponse(webRes: Response, res: ServerResponse) {
  res.writeHead(webRes.status, Object.fromEntries(webRes.headers));
  if (webRes.body) {
    const reader = webRes.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  if (req.method !== "POST") {
    res.writeHead(405);
    res.end("Method not allowed");
    return;
  }

  const origin = getHeader(req, "origin") ?? "";
  const allowedOrigin = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : origin;

  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const sendJson = (status: number, data: object) => {
    res.writeHead(status, { ...corsHeaders, "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };

  // Body size check
  const contentLength = parseInt(getHeader(req, "content-length") ?? "0", 10);
  if (contentLength > MAX_BODY_SIZE) {
    sendJson(413, { error: "Request too large." });
    return;
  }

  // Rate limit
  const ip =
    getHeader(req, "x-real-ip") ??
    getHeader(req, "x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const rateCheck = await rateLimiter.check(ip);
  if (!rateCheck.allowed) {
    sendJson(429, { error: rateCheck.message });
    return;
  }

  // Parse body
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: { messages?: any[]; tone?: string };
  try {
    const raw = await readBody(req);
    body = JSON.parse(raw);
  } catch {
    sendJson(400, { error: "Invalid request body." });
    return;
  }

  const { messages, tone: rawTone } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    sendJson(400, { error: "Messages are required." });
    return;
  }

  // Validate tone
  const validTones = ["professional", "friendly", "witty", "casual"] as const;
  const tone = rawTone && validTones.includes(rawTone as Tone)
    ? (rawTone as Tone)
    : defaultTone;

  const chatConfigWithTone = { ...typedConfig.chat, tone };
  const systemPrompt = buildSystemPrompt(typedCvData.profile.name, chatConfigWithTone);

  // Guard rails
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
      sendJson(400, { error: guard.reason });
      return;
    }
  }

  // Skill routing
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

    // Convert the Web Response to Node.js response
    const webResponse = result.toUIMessageStreamResponse();
    await pipeResponse(webResponse, res);
  } catch (error) {
    console.error("[api/chat] Error:", error);
    sendJson(500, { error: "Something went wrong. Please try again." });
  }
}

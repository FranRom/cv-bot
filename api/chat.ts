import { streamText } from "ai";
import { createTools } from "../server/tools";
import { buildSystemPrompt } from "../server/system-prompt";
import { getModel } from "../server/provider";
import { RateLimiter } from "../server/rate-limiter";
import cvData from "../data/cv-data.json";
import config from "../data/config.json";
import type { CvData, Config } from "../src/lib/types";

export const runtime = "edge";

const typedCvData = cvData as CvData;
const typedConfig = config as Config;
const rateLimiter = new RateLimiter(typedConfig.rateLimit);

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = await rateLimiter.check(ip);
  if (!rateCheck.allowed) {
    return new Response(JSON.stringify({ error: rateCheck.message }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages } = await req.json();

  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role === "user" && lastMessage.content.length > 500) {
    return new Response(
      JSON.stringify({ error: "Message too long. Maximum 500 characters." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const trimmedMessages = messages.slice(-10);

  try {
    const result = streamText({
      model: getModel(typedConfig.llm),
      system: buildSystemPrompt(typedCvData.profile.name, typedConfig.chat),
      messages: trimmedMessages,
      tools: createTools(typedCvData),
      maxSteps: 3,
      maxTokens: typedConfig.llm.maxTokens,
      temperature: typedConfig.llm.temperature,
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        console.error("[api/chat] Stream error:", error);
        return String(error);
      },
    });
  } catch (error) {
    console.error("[api/chat] Error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

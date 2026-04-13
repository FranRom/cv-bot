import { readFileSync } from "fs";
import { join } from "path";
import type { ChatConfig } from "../src/lib/types";

export const TONE_MODIFIERS: Record<ChatConfig["tone"], string> = {
  professional:
    "Be professional and concise. Use clear, direct language. Avoid casual expressions.",
  friendly:
    "Be friendly and warm, but still professional. Use a conversational tone that makes people feel comfortable asking questions.",
  witty:
    "Be witty and show personality. Use clever phrasing and light humor while keeping answers informative and accurate.",
  casual:
    "Be casual and relaxed. Use informal language, contractions, and a laid-back tone. Keep it natural.",
};

const PROMPT_FILES = [
  "personality.md",
  "boundaries.md",
  "inference-rules.md",
  "response-style.md",
  "examples.md",
];

function loadPromptFile(filename: string): string {
  const promptsDir = join(process.cwd(), "prompts");
  return readFileSync(join(promptsDir, filename), "utf-8").trim();
}

function interpolate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template
  );
}

// Cache the composed prompt since the files don't change at runtime
let cachedPrompt: string | null = null;
let cachedOwnerName: string | null = null;

export function buildSystemPrompt(
  ownerName: string,
  chat: ChatConfig
): string {
  // Only recompose if owner name changed (shouldn't happen, but defensive)
  if (!cachedPrompt || cachedOwnerName !== ownerName) {
    const vars = { ownerName };
    const sections = PROMPT_FILES.map((file) =>
      interpolate(loadPromptFile(file), vars)
    );
    cachedPrompt = sections.join("\n\n");
    cachedOwnerName = ownerName;
  }

  const toneSection = `## Tone\n${TONE_MODIFIERS[chat.tone]}`;

  const parts = [cachedPrompt, toneSection];

  if (chat.systemPromptExtra?.trim()) {
    parts.push(`## Additional Instructions\n${chat.systemPromptExtra.trim()}`);
  }

  return parts.join("\n\n");
}

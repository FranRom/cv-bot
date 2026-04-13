import type { ChatConfig, Tone } from "./types";
import { PROMPT_SECTIONS } from "./prompts";

export const TONE_MODIFIERS: Record<Tone, string> = {
  professional:
    "Be professional and concise. Use clear, direct language. Avoid casual expressions.",
  friendly:
    "Be friendly and warm, but still professional. Use a conversational tone that makes people feel comfortable asking questions.",
  witty:
    "Be witty and show personality. Use clever phrasing and light humor while keeping answers informative and accurate.",
  casual:
    "Be casual and relaxed. Use informal language, contractions, and a laid-back tone. Keep it natural.",
};

function interpolate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template
  );
}

// Cache the composed prompt since it never changes at runtime
let cachedPrompt: string | null = null;
let cachedOwnerName: string | null = null;

export function buildSystemPrompt(
  ownerName: string,
  chat: ChatConfig
): string {
  if (!cachedPrompt || cachedOwnerName !== ownerName) {
    const vars = { ownerName };
    cachedPrompt = PROMPT_SECTIONS.map((section) =>
      interpolate(section, vars)
    ).join("\n\n");
    cachedOwnerName = ownerName;
  }

  const toneSection = `## Tone\n${TONE_MODIFIERS[chat.tone]}`;

  const parts = [cachedPrompt, toneSection];

  if (chat.systemPromptExtra?.trim()) {
    parts.push(`## Additional Instructions\n${chat.systemPromptExtra.trim()}`);
  }

  return parts.join("\n\n");
}

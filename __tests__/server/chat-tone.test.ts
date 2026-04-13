import { describe, it, expect } from "vitest";
import { buildSystemPrompt, TONE_MODIFIERS } from "../../functions-src/_lib/system-prompt";
import type { ChatConfig, Tone } from "../../functions-src/_lib/types";

const baseConfig: ChatConfig = {
  tone: "friendly",
  systemPromptExtra: "",
  welcomeMessage: "Hello!",
  suggestedQuestions: [],
};

describe("buildSystemPrompt with per-request tone", () => {
  it("uses the provided tone override instead of config default", () => {
    const prompt = buildSystemPrompt("Fran Rom", { ...baseConfig, tone: "witty" });
    expect(prompt).toContain(TONE_MODIFIERS.witty);
    expect(prompt).not.toContain(TONE_MODIFIERS.friendly);
  });

  it("falls back to config tone when no override given", () => {
    const prompt = buildSystemPrompt("Fran Rom", baseConfig);
    expect(prompt).toContain(TONE_MODIFIERS.friendly);
  });
});

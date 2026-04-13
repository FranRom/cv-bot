import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "../../server/system-prompt";
import type { ChatConfig } from "../../src/lib/types";

const baseConfig: ChatConfig = {
  tone: "friendly",
  systemPromptExtra: "",
  welcomeMessage: "Hello!",
  suggestedQuestions: [],
};

describe("buildSystemPrompt", () => {
  it("includes owner name from personality.md", () => {
    const prompt = buildSystemPrompt("Fran Rom", baseConfig);
    expect(prompt).toContain("Fran Rom");
  });

  it("loads and interpolates all prompt files", () => {
    const prompt = buildSystemPrompt("Fran Rom", baseConfig);
    // personality.md
    expect(prompt).toContain("personal assistant representing Fran Rom");
    // boundaries.md
    expect(prompt).toContain("Scope");
    expect(prompt).toContain("Off-limits");
    // inference-rules.md
    expect(prompt).toContain("reasonable inferences");
    expect(prompt).toContain("learns on demand");
    // response-style.md
    expect(prompt).toContain("concise");
    // examples.md
    expect(prompt).toContain("Few-Shot Examples");
  });

  it("includes tone instructions for friendly", () => {
    const prompt = buildSystemPrompt("Fran Rom", { ...baseConfig, tone: "friendly" });
    expect(prompt).toContain("friendly");
    expect(prompt).toContain("warm");
  });

  it("includes tone instructions for professional", () => {
    const prompt = buildSystemPrompt("Fran Rom", { ...baseConfig, tone: "professional" });
    expect(prompt).toContain("professional");
    expect(prompt).toContain("concise");
  });

  it("includes tone instructions for witty", () => {
    const prompt = buildSystemPrompt("Fran Rom", { ...baseConfig, tone: "witty" });
    expect(prompt).toContain("witty");
  });

  it("includes tone instructions for casual", () => {
    const prompt = buildSystemPrompt("Fran Rom", { ...baseConfig, tone: "casual" });
    expect(prompt).toContain("casual");
  });

  it("appends systemPromptExtra when provided", () => {
    const extra = "Always mention open source contributions.";
    const prompt = buildSystemPrompt("Fran Rom", { ...baseConfig, systemPromptExtra: extra });
    expect(prompt).toContain(extra);
  });

  it("caches the composed prompt across calls", () => {
    const prompt1 = buildSystemPrompt("Fran Rom", baseConfig);
    const prompt2 = buildSystemPrompt("Fran Rom", baseConfig);
    expect(prompt1).toBe(prompt2);
  });
});

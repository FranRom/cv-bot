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
  it("includes owner name", () => {
    const prompt = buildSystemPrompt("Franco R.", baseConfig);
    expect(prompt).toContain("Franco R.");
  });

  it("includes tone instructions for friendly (contains 'friendly' and 'warm')", () => {
    const prompt = buildSystemPrompt("Franco R.", { ...baseConfig, tone: "friendly" });
    expect(prompt).toContain("friendly");
    expect(prompt).toContain("warm");
  });

  it("includes tone instructions for professional (contains 'professional' and 'concise')", () => {
    const prompt = buildSystemPrompt("Franco R.", { ...baseConfig, tone: "professional" });
    expect(prompt).toContain("professional");
    expect(prompt).toContain("concise");
  });

  it("includes tone instructions for witty (contains 'witty')", () => {
    const prompt = buildSystemPrompt("Franco R.", { ...baseConfig, tone: "witty" });
    expect(prompt).toContain("witty");
  });

  it("includes tone instructions for casual (contains 'casual')", () => {
    const prompt = buildSystemPrompt("Franco R.", { ...baseConfig, tone: "casual" });
    expect(prompt).toContain("casual");
  });

  it("appends systemPromptExtra when provided", () => {
    const extra = "Always mention that Franco loves coffee.";
    const prompt = buildSystemPrompt("Franco R.", { ...baseConfig, systemPromptExtra: extra });
    expect(prompt).toContain(extra);
  });

  it("includes boundary instructions (contains 'only answer questions')", () => {
    const prompt = buildSystemPrompt("Franco R.", baseConfig);
    expect(prompt).toContain("only answer questions");
  });

  it("includes inference guidance (contains 'reasonable inferences')", () => {
    const prompt = buildSystemPrompt("Franco R.", baseConfig);
    expect(prompt).toContain("reasonable inferences");
  });
});

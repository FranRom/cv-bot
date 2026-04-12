import { describe, it, expect } from "vitest";
import { getModel } from "../../server/provider";

describe("getModel", () => {
  it("anthropic provider: returns model with modelId containing 'claude-haiku'", () => {
    const model = getModel({
      provider: "anthropic",
      model: "claude-haiku-4-5-20251001",
      maxTokens: 1024,
      temperature: 0.7,
    });
    expect(model).toBeDefined();
    expect((model as { modelId: string }).modelId).toContain("claude-haiku");
  });

  it("openai provider: returns model with modelId containing 'gpt-4o-mini'", () => {
    const model = getModel({
      provider: "openai",
      model: "gpt-4o-mini",
      maxTokens: 1024,
      temperature: 0.7,
    });
    expect(model).toBeDefined();
    expect((model as { modelId: string }).modelId).toContain("gpt-4o-mini");
  });

  it("google provider: returns defined model", () => {
    const model = getModel({
      provider: "google",
      model: "gemini-2.0-flash",
      maxTokens: 1024,
      temperature: 0.7,
    });
    expect(model).toBeDefined();
  });

  it("unsupported provider: throws 'Unsupported LLM provider'", () => {
    expect(() =>
      getModel({
        provider: "groq" as "anthropic",
        model: "some-model",
        maxTokens: 1024,
        temperature: 0.7,
      })
    ).toThrow("Unsupported LLM provider");
  });
});

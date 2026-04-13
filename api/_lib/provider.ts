import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import type { LlmConfig } from "./types";

export function getModel(config: LlmConfig) {
  switch (config.provider) {
    case "anthropic":
      return anthropic(config.model);
    case "openai":
      return openai(config.model);
    case "google":
      return google(config.model);
    default:
      throw new Error("Unsupported LLM provider");
  }
}

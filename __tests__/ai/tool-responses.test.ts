import { describe, it, expect } from "vitest";
import { createTools } from "../../server/tools";
import cvData from "../../data/cv-data.json";
import type { CvData } from "../../src/lib/types";

/**
 * AI Response Evaluation Tests
 *
 * These tests verify that the tool pipeline returns accurate, complete data
 * for the types of questions recruiters and hiring managers actually ask.
 * They don't call the LLM — they test the data layer that feeds the LLM.
 *
 * If a tool returns bad data, the LLM will give bad answers regardless of
 * how good the prompt is. These tests catch data quality issues early.
 */

const data = cvData as CvData;
const tools = createTools(data);

const exec = async (toolName: string, params: Record<string, unknown> = {}) => {
  const tool = tools[toolName as keyof typeof tools];
  return tool.execute(params, { toolCallId: "test", messages: [] });
};

describe("Profile questions", () => {
  it("returns correct name and title", async () => {
    const result = await exec("get_profile") as Record<string, unknown>;
    expect(result).toHaveProperty("name", "Fran Rom");
    expect(result).toHaveProperty("title");
    expect(typeof result.title).toBe("string");
    expect((result.title as string).length).toBeGreaterThan(0);
  });

  it("includes GitHub and LinkedIn links", async () => {
    const result = await exec("get_profile") as { links: Record<string, string> };
    expect(result.links.github).toContain("github.com");
    expect(result.links.linkedin).toContain("linkedin.com");
  });
});

describe("Experience questions", () => {
  it("returns all work experience entries", async () => {
    const result = await exec("get_experience") as unknown[];
    expect(result.length).toBeGreaterThanOrEqual(5);
  });

  it("filters experience by company name", async () => {
    const result = await exec("get_experience", { company: "Game7" }) as Array<{ company: string }>;
    expect(result).toHaveLength(1);
    expect(result[0].company).toBe("Game7");
  });

  it("each experience entry has required fields", async () => {
    const result = await exec("get_experience") as Array<Record<string, unknown>>;
    for (const entry of result) {
      expect(entry).toHaveProperty("company");
      expect(entry).toHaveProperty("role");
      expect(entry).toHaveProperty("period");
      expect(entry).toHaveProperty("highlights");
      expect(entry).toHaveProperty("technologies");
    }
  });
});

describe("Skills questions", () => {
  it("returns skills grouped by category", async () => {
    const result = await exec("get_skills") as Record<string, unknown[]>;
    expect(result).toHaveProperty("frontend");
    expect(result).toHaveProperty("web3");
    expect(result).toHaveProperty("ai");
  });

  it("filters by category", async () => {
    const result = await exec("get_skills", { category: "web3" }) as Record<string, unknown[]>;
    expect(result).toHaveProperty("web3");
    expect(Object.keys(result)).toHaveLength(1);
  });

  it("includes key technologies a recruiter would search for", async () => {
    const result = await exec("get_skills") as Record<string, Array<{ name: string }>>;
    const allSkills = Object.values(result).flat().map((s) => s.name.toLowerCase());
    expect(allSkills).toContain("react");
    expect(allSkills).toContain("typescript");
    expect(allSkills).toContain("wagmi");
    expect(allSkills).toContain("viem");
  });
});

describe("Technology filter (cross-cutting)", () => {
  it("finds React across experience and projects", async () => {
    const result = await exec("filter_by_technology", { technology: "React" }) as {
      experience: unknown[];
      projects: unknown[];
    };
    expect(result.experience.length).toBeGreaterThan(0);
    expect(result.projects.length).toBeGreaterThan(0);
  });

  it("is case-insensitive", async () => {
    const lower = await exec("filter_by_technology", { technology: "react" });
    const upper = await exec("filter_by_technology", { technology: "React" });
    expect(JSON.stringify(lower)).toBe(JSON.stringify(upper));
  });

  it("returns empty arrays for unknown technologies", async () => {
    const result = await exec("filter_by_technology", { technology: "COBOL" }) as {
      experience: unknown[];
      projects: unknown[];
    };
    expect(result.experience).toHaveLength(0);
    expect(result.projects).toHaveLength(0);
  });
});

describe("Crypto experience questions", () => {
  it("returns crypto journey data", async () => {
    const result = await exec("get_crypto_experience") as Record<string, unknown>;
    expect(result).toHaveProperty("since");
    expect(result).toHaveProperty("chains");
    expect(result).toHaveProperty("activities");
    expect(result).toHaveProperty("hardware_wallet");
  });

  it("mentions Trezor wallet usage", async () => {
    const result = await exec("get_crypto_experience") as { hardware_wallet: string };
    expect(result.hardware_wallet.toLowerCase()).toContain("trezor");
  });

  it("lists multiple chains", async () => {
    const result = await exec("get_crypto_experience") as { chains: string[] };
    expect(result.chains.length).toBeGreaterThan(3);
    expect(result.chains).toContain("Bitcoin");
    expect(result.chains).toContain("Ethereum");
    expect(result.chains).toContain("Solana");
  });
});

describe("Project questions", () => {
  it("returns projects including CV Bot", async () => {
    const result = await exec("get_projects") as Array<{ name: string }>;
    const names = result.map((p) => p.name);
    expect(names).toContain("CV Bot");
  });

  it("filters projects by technology", async () => {
    const result = await exec("get_projects", { technology: "wagmi" }) as Array<{ technologies: string[] }>;
    for (const project of result) {
      expect(project.technologies.map((t) => t.toLowerCase())).toContain("wagmi");
    }
  });
});

describe("Contact and interests", () => {
  it("returns contact links", async () => {
    const result = await exec("get_contact") as Record<string, string>;
    expect(result).toHaveProperty("github");
    expect(result).toHaveProperty("linkedin");
  });

  it("returns interests with categories", async () => {
    const result = await exec("get_interests") as Array<{ category: string; items: string[] }>;
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("category");
    expect(result[0]).toHaveProperty("items");
  });
});

describe("System prompt quality", () => {
  it("prompt includes few-shot examples", async () => {
    const { buildSystemPrompt } = await import("../../server/system-prompt");
    const prompt = buildSystemPrompt("Fran Rom", {
      tone: "friendly",
      systemPromptExtra: "",
      welcomeMessage: "",
      suggestedQuestions: [],
    });
    expect(prompt).toContain("Few-Shot Examples");
    expect(prompt).toContain("Good response");
  });

  it("prompt includes inference rules for skill gaps", async () => {
    const { buildSystemPrompt } = await import("../../server/system-prompt");
    const prompt = buildSystemPrompt("Fran Rom", {
      tone: "friendly",
      systemPromptExtra: "",
      welcomeMessage: "",
      suggestedQuestions: [],
    });
    expect(prompt).toContain("learns on demand");
    expect(prompt).toContain("define the problem");
  });

  it("prompt includes boundary rules", async () => {
    const { buildSystemPrompt } = await import("../../server/system-prompt");
    const prompt = buildSystemPrompt("Fran Rom", {
      tone: "friendly",
      systemPromptExtra: "",
      welcomeMessage: "",
      suggestedQuestions: [],
    });
    expect(prompt).toContain("Off-limits");
    expect(prompt).toContain("Never reveal");
    expect(prompt).toContain("Never fabricate");
  });
});

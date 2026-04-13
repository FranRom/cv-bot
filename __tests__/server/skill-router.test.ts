import { describe, it, expect } from "vitest";
import { detectSkill } from "../../server/skill-router";

describe("Skill Router", () => {
  describe("elevator-pitch", () => {
    const triggers = [
      "Give me a quick summary of Fran",
      "Who is Fran?",
      "Tell me about Fran",
      "Can you introduce Fran?",
      "Give me a brief overview",
      "Pitch me on Fran in 2 minutes",
    ];

    triggers.forEach((msg) => {
      it(`detects: "${msg}"`, () => {
        const skill = detectSkill(msg, "Fran Rom");
        expect(skill).not.toBeNull();
        expect(skill!.name).toBe("elevator-pitch");
        expect(skill!.prompt).toContain("Elevator Pitch");
      });
    });
  });

  describe("job-match", () => {
    const triggers = [
      "How does Fran match this role?",
      "Is Fran a good fit for this position?",
      "Would Fran be suitable for our team?",
      "Compare Fran's profile against these requirements",
      "How would he fit this job?",
    ];

    triggers.forEach((msg) => {
      it(`detects: "${msg}"`, () => {
        const skill = detectSkill(msg, "Fran Rom");
        expect(skill).not.toBeNull();
        expect(skill!.name).toBe("job-match");
        expect(skill!.prompt).toContain("Job Match");
      });
    });
  });

  describe("technical-deep-dive", () => {
    const triggers = [
      "Give me a technical deep dive on his work",
      "What was Fran's most complex project?",
      "Walk me through the architecture",
      "Tell me about his biggest technical challenge",
    ];

    triggers.forEach((msg) => {
      it(`detects: "${msg}"`, () => {
        const skill = detectSkill(msg, "Fran Rom");
        expect(skill).not.toBeNull();
        expect(skill!.name).toBe("technical-deep-dive");
        expect(skill!.prompt).toContain("Technical Deep Dive");
      });
    });
  });

  describe("interview-questions", () => {
    const triggers = [
      "What interview questions should I ask Fran?",
      "Suggest some questions for his interview",
      "Give me questions to ask him",
      "What could I ask Fran?",
    ];

    triggers.forEach((msg) => {
      it(`detects: "${msg}"`, () => {
        const skill = detectSkill(msg, "Fran Rom");
        expect(skill).not.toBeNull();
        expect(skill!.name).toBe("interview-questions");
        expect(skill!.prompt).toContain("Interview Questions");
      });
    });
  });

  describe("no skill match", () => {
    const normalQuestions = [
      "What's Fran's tech stack?",
      "Tell me about his DeFi projects",
      "Does he know React?",
      "What chains has he used?",
    ];

    normalQuestions.forEach((msg) => {
      it(`returns null for: "${msg}"`, () => {
        expect(detectSkill(msg, "Fran Rom")).toBeNull();
      });
    });
  });

  it("interpolates ownerName in skill prompt", () => {
    const skill = detectSkill("Who is Fran?", "Fran Rom");
    expect(skill!.prompt).toContain("Fran Rom");
    expect(skill!.prompt).not.toContain("{{ownerName}}");
  });
});

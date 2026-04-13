import { readFileSync } from "fs";
import { join } from "path";

/**
 * Skill Router — detects user intent and returns the appropriate skill prompt.
 *
 * Skills are higher-level conversation patterns that augment the system prompt
 * with specialized instructions. Unlike tools (which retrieve data), skills
 * guide how the LLM reasons about and presents the data.
 *
 * Pattern: keyword matching on the last user message → load skill markdown →
 * append to system prompt for that request only.
 */

interface Skill {
  name: string;
  file: string;
  patterns: RegExp[];
}

const SKILLS: Skill[] = [
  {
    name: "elevator-pitch",
    file: "elevator-pitch.md",
    patterns: [
      /\b(pitch|summary|summarize|overview|who is|tell me about (him|her|fran|yourself)|introduce)\b/i,
      /\b(quick|brief|short)\s+(summary|intro|description|overview)\b/i,
      /\bin (a|one|two|2)\s*(minute|min|sentence)/i,
    ],
  },
  {
    name: "job-match",
    file: "job-match.md",
    patterns: [
      /\b(match|fit|suitable|qualified|good for|right for)\b.*\b(role|job|position|team)\b/i,
      /\b(role|job|position)\b.*\b(match|fit|suitable)\b/i,
      /\b(compare|evaluate|assess)\b.*\b(against|for|to)\b.*\b(role|job|position|requirements|description)\b/i,
      /\bhow\s+(does|would)\s+(he|fran)\s+(fit|match|compare)\b/i,
    ],
  },
  {
    name: "technical-deep-dive",
    file: "technical-deep-dive.md",
    patterns: [
      /\b(deep\s*dive|technical\s*detail|architecture|how\s+did\s+(he|fran)\s+build)\b/i,
      /\b(most\s+complex|hardest|biggest|most\s+challenging)\s+\w*\s*(project|feature|problem|challenge)\b/i,
      /\b(walk\s+me\s+through|explain\s+the\s+architecture|technical\s+approach)\b/i,
    ],
  },
  {
    name: "interview-questions",
    file: "interview-questions.md",
    patterns: [
      /\b(interview\s+questions?|what\s+(should|could|would)\s+I\s+ask)\b/i,
      /\b(questions?\s+(to|for)\s+ask)\b/i,
      /\b(suggest|recommend|give\s+me)\s+.*questions?\b/i,
    ],
  },
];

function loadSkillFile(filename: string, ownerName: string): string {
  const skillsDir = join(process.cwd(), "prompts", "skills");
  const content = readFileSync(join(skillsDir, filename), "utf-8").trim();
  return content.replaceAll("{{ownerName}}", ownerName);
}

export interface SkillMatch {
  name: string;
  prompt: string;
}

/**
 * Detect which skill (if any) matches the user's message.
 * Returns the skill prompt to append, or null if no skill matches.
 */
export function detectSkill(
  message: string,
  ownerName: string
): SkillMatch | null {
  for (const skill of SKILLS) {
    for (const pattern of skill.patterns) {
      if (pattern.test(message)) {
        return {
          name: skill.name,
          prompt: loadSkillFile(skill.file, ownerName),
        };
      }
    }
  }
  return null;
}

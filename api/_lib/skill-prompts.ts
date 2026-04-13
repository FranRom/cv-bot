/**
 * Skill prompt content exported as strings.
 * Edge functions can't use readFileSync, so we export directly.
 * The .md files are kept for documentation — this file is the source of truth at runtime.
 */

export const elevatorPitch = `## Skill: Elevator Pitch

The user is asking for a quick summary or pitch about {{ownerName}}.

Compose a compelling 2-3 paragraph narrative that:
1. Opens with {{ownerName}}'s core identity and years of experience
2. Highlights 2-3 standout achievements with concrete numbers (e.g., $1M TVL, team size, years)
3. Connects the dots between their Web3, AI, and frontend expertise
4. Ends with what they're looking for and what makes them unique

Use the get_profile, get_experience, and get_skills tools to gather the data. Don't just list facts — tell a story that a recruiter would remember.`;

export const jobMatch = `## Skill: Job Match Analysis

The user wants to compare {{ownerName}}'s profile against a job description or role requirements.

Analyze the match by:
1. Use get_experience, get_skills, get_crypto_experience, and get_projects to gather {{ownerName}}'s full profile
2. Identify **strong matches** — requirements that directly align with {{ownerName}}'s experience
3. Identify **partial matches** — requirements where {{ownerName}} has related but not exact experience
4. Identify **gaps** — requirements {{ownerName}} doesn't have, but frame them through the lens of his learn-on-demand approach

Format the response as:
- **Strong matches** (with specific evidence from his experience)
- **Transferable experience** (related skills that apply)
- **Growth areas** (honest about gaps, but emphasize his track record of picking up new tools)

Be specific — reference actual companies, projects, and technologies from his data. Don't be generic.`;

export const technicalDeepDive = `## Skill: Technical Deep Dive

The user wants to understand {{ownerName}}'s technical depth — architecture decisions, complex projects, or engineering approach.

When answering:
1. Use get_experience and get_projects to find the most relevant project
2. Explain the **problem** that was being solved
3. Describe the **technical approach** — architecture, tools chosen, trade-offs
4. Highlight the **outcome** — concrete results, metrics, lessons learned
5. Connect it to broader engineering principles

Focus on depth over breadth. A hiring manager asking this wants to see how {{ownerName}} thinks, not just what he's built. Show the reasoning behind decisions.`;

export const interviewQuestions = `## Skill: Interview Questions

The user wants suggestions for interview questions to ask {{ownerName}}.

Generate 5-7 thoughtful questions based on {{ownerName}}'s actual experience:
1. Use get_experience, get_projects, and get_skills to understand his background
2. Craft questions that let him demonstrate depth (not yes/no questions)
3. Mix technical questions with leadership/collaboration questions
4. Tailor questions to his strongest areas (Web3, frontend architecture, team leadership, AI integration)

Each question should include a brief note on *why* it's a good question — what it reveals about the candidate.`;

export const SKILL_PROMPTS: Record<string, string> = {
  "elevator-pitch": elevatorPitch,
  "job-match": jobMatch,
  "technical-deep-dive": technicalDeepDive,
  "interview-questions": interviewQuestions,
};

import { describe, it, expect } from "vitest";
import { createTools } from "../../server/tools";
import type { CvData } from "../../src/lib/types";

const sampleData: CvData = {
  profile: {
    name: "Test User",
    title: "Software Engineer",
    location: "Barcelona, Spain",
    summary: "Experienced developer.",
    avatar: "/avatar.png",
    links: {
      email: "test@example.com",
      github: "https://github.com/testuser",
      linkedin: "https://linkedin.com/in/testuser",
      website: "https://testuser.dev",
    },
  },
  experience: [
    {
      company: "Company A",
      role: "Frontend Developer",
      period: "2022–2024",
      description: "Built modern UIs.",
      highlights: ["Improved performance by 30%"],
      technologies: ["React", "TypeScript"],
    },
  ],
  skills: {
    frontend: [{ name: "React", level: "expert" }],
  },
  projects: [
    {
      name: "Project A",
      description: "A frontend project.",
      role: "Lead Developer",
      highlights: ["Launched MVP in 2 weeks"],
      technologies: ["React", "TypeScript"],
      url: "https://projecta.dev",
      repo: "https://github.com/testuser/projecta",
    },
  ],
  education: [
    {
      institution: "University of Barcelona",
      degree: "B.Sc. Computer Science",
      period: "2016–2020",
      details: "Graduated with honours.",
    },
  ],
  languages: [{ language: "English", level: "native" }],
  availability: {
    status: "open",
    roles: ["Frontend Developer"],
    location_preference: "remote",
    notice_period: "1 month",
  },
};

const toolCallContext = { messages: [] as never[] };

describe("createTools", () => {
  it("returns an object with all 7 tool keys", () => {
    const tools = createTools(sampleData);
    expect(tools).toHaveProperty("get_profile");
    expect(tools).toHaveProperty("get_experience");
    expect(tools).toHaveProperty("get_projects");
    expect(tools).toHaveProperty("get_skills");
    expect(tools).toHaveProperty("get_education");
    expect(tools).toHaveProperty("filter_by_technology");
    expect(tools).toHaveProperty("get_contact");
  });

  it("get_profile.execute returns object with name 'Test User'", async () => {
    const tools = createTools(sampleData);
    const result = await tools.get_profile.execute({}, { toolCallId: "1", ...toolCallContext });
    expect(result).toHaveProperty("name", "Test User");
  });

  it("get_experience.execute with company filter returns array of length 1", async () => {
    const tools = createTools(sampleData);
    const result = await tools.get_experience.execute(
      { company: "Company A" },
      { toolCallId: "2", ...toolCallContext }
    );
    expect(result).toHaveLength(1);
  });

  it("get_projects.execute with technology filter returns array of length 1", async () => {
    const tools = createTools(sampleData);
    const result = await tools.get_projects.execute(
      { technology: "React" },
      { toolCallId: "3", ...toolCallContext }
    );
    expect(result).toHaveLength(1);
  });

  it("filter_by_technology.execute returns object with experience, projects, skills", async () => {
    const tools = createTools(sampleData);
    const result = await tools.filter_by_technology.execute(
      { technology: "React" },
      { toolCallId: "4", ...toolCallContext }
    );
    expect(result).toHaveProperty("experience");
    expect(result).toHaveProperty("projects");
    expect(result).toHaveProperty("skills");
  });
});

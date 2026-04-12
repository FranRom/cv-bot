import { describe, it, expect } from "vitest";
import {
  getProfile,
  getExperience,
  getProjects,
  getSkills,
  getEducation,
  filterByTechnology,
  getContact,
} from "../../server/cv-data";
import type { CvData } from "../../src/lib/types";

const sampleData: CvData = {
  profile: {
    name: "Jane Doe",
    title: "Software Engineer",
    location: "Barcelona, Spain",
    summary: "Experienced full-stack developer.",
    avatar: "/avatar.png",
    links: {
      email: "jane@example.com",
      github: "https://github.com/janedoe",
      linkedin: "https://linkedin.com/in/janedoe",
      website: "https://janedoe.dev",
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
    {
      company: "Company B",
      role: "Backend Developer",
      period: "2020–2022",
      description: "Built REST APIs.",
      highlights: ["Scaled service to 1M users"],
      technologies: ["Node.js", "PostgreSQL"],
    },
  ],
  skills: {
    frontend: [{ name: "React", level: "expert" }],
    backend: [{ name: "Node.js", level: "intermediate" }],
  },
  projects: [
    {
      name: "Project A",
      description: "A frontend project.",
      role: "Lead Developer",
      highlights: ["Launched MVP in 2 weeks"],
      technologies: ["React", "TypeScript"],
      url: "https://projecta.dev",
      repo: "https://github.com/janedoe/projecta",
    },
    {
      name: "Project B",
      description: "A backend service.",
      role: "Backend Developer",
      highlights: ["Handles 10K req/s"],
      technologies: ["Node.js", "Express"],
      url: "https://projectb.dev",
      repo: "https://github.com/janedoe/projectb",
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
    roles: ["Full-stack Developer", "Frontend Developer"],
    location_preference: "remote",
    notice_period: "1 month",
  },
};

describe("getProfile", () => {
  it("returns profile data with name and title", () => {
    const profile = getProfile(sampleData);
    expect(profile.name).toBe("Jane Doe");
    expect(profile.title).toBe("Software Engineer");
  });
});

describe("getExperience", () => {
  it("returns all experience entries when no filter is given", () => {
    const result = getExperience(sampleData, {});
    expect(result).toHaveLength(2);
  });

  it("returns filtered entries when company filter is provided", () => {
    const result = getExperience(sampleData, { company: "Company A" });
    expect(result).toHaveLength(1);
    expect(result[0].company).toBe("Company A");
  });
});

describe("getProjects", () => {
  it("returns all projects when no filter is given", () => {
    const result = getProjects(sampleData, {});
    expect(result).toHaveLength(2);
  });

  it("returns filtered projects when technology filter is provided", () => {
    const result = getProjects(sampleData, { technology: "React" });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Project A");
  });
});

describe("getSkills", () => {
  it("returns all skill categories when no filter is given", () => {
    const result = getSkills(sampleData, {});
    expect(Object.keys(result)).toContain("frontend");
    expect(Object.keys(result)).toContain("backend");
  });

  it("returns only the specified category when category filter is provided", () => {
    const result = getSkills(sampleData, { category: "frontend" });
    expect(Object.keys(result)).toHaveLength(1);
    expect(Object.keys(result)).toContain("frontend");
    expect(Object.keys(result)).not.toContain("backend");
  });
});

describe("getEducation", () => {
  it("returns the education array", () => {
    const result = getEducation(sampleData);
    expect(result).toHaveLength(1);
    expect(result[0].institution).toBe("University of Barcelona");
  });
});

describe("filterByTechnology", () => {
  it("returns matching experience and projects for a given technology", () => {
    const result = filterByTechnology(sampleData, "React");
    expect(result.experience).toHaveLength(1);
    expect(result.experience[0].company).toBe("Company A");
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].name).toBe("Project A");
  });

  it("is case-insensitive", () => {
    const result = filterByTechnology(sampleData, "react");
    expect(result.experience).toHaveLength(1);
    expect(result.projects).toHaveLength(1);
  });
});

describe("getContact", () => {
  it("returns email, github, linkedin, and website from profile.links", () => {
    const result = getContact(sampleData);
    expect(result.email).toBe("jane@example.com");
    expect(result.github).toBe("https://github.com/janedoe");
    expect(result.linkedin).toBe("https://linkedin.com/in/janedoe");
    expect(result.website).toBe("https://janedoe.dev");
  });
});

import { tool } from "ai";
import { z } from "zod/v4";
import type { CvData } from "../src/lib/types";
import {
  getProfile,
  getExperience,
  getProjects,
  getSkills,
  getEducation,
  filterByTechnology,
  getContact,
} from "./cv-data";

export function createTools(data: CvData) {
  return {
    get_profile: tool({
      description: "Get the profile information of the CV owner",
      inputSchema: z.object({}),
      execute: async () => getProfile(data),
    }),

    get_experience: tool({
      description: "Get work experience entries, optionally filtered by company name",
      inputSchema: z.object({
        company: z.string().optional().describe("Filter by company name"),
      }),
      execute: async (params) => getExperience(data, params ?? {}),
    }),

    get_projects: tool({
      description: "Get projects, optionally filtered by technology",
      inputSchema: z.object({
        technology: z.string().optional().describe("Filter by technology"),
      }),
      execute: async (params) => getProjects(data, params ?? {}),
    }),

    get_skills: tool({
      description: "Get skills, optionally filtered by category",
      inputSchema: z.object({
        category: z.string().optional().describe("Filter by skill category"),
      }),
      execute: async (params) => getSkills(data, params ?? {}),
    }),

    get_education: tool({
      description: "Get education history",
      inputSchema: z.object({}),
      execute: async () => getEducation(data),
    }),

    filter_by_technology: tool({
      description:
        "Find all experience, projects, and skills related to a specific technology",
      inputSchema: z.object({
        technology: z.string().describe("The technology to filter by"),
      }),
      execute: async (params) =>
        filterByTechnology(data, params?.technology ?? ""),
    }),

    get_contact: tool({
      description:
        "Get contact information (email, github, linkedin, website)",
      inputSchema: z.object({}),
      execute: async () => getContact(data),
    }),
  };
}

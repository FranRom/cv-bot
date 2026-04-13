import type {
  CvData,
  Profile,
  Experience,
  Project,
  Skills,
  Education,
} from "./types.js";

export function getProfile(data: CvData): Profile {
  return data.profile;
}

export function getExperience(
  data: CvData,
  filters: { company?: string }
): Experience[] {
  if (filters.company) {
    return data.experience.filter((e) => e.company === filters.company);
  }
  return data.experience;
}

export function getProjects(
  data: CvData,
  filters: { technology?: string }
): Project[] {
  if (filters.technology) {
    const tech = filters.technology.toLowerCase();
    return data.projects.filter((p) =>
      p.technologies.some((t) => t.toLowerCase() === tech)
    );
  }
  return data.projects;
}

export function getSkills(
  data: CvData,
  filters: { category?: string }
): Skills {
  if (filters.category) {
    const category = filters.category;
    if (category in data.skills) {
      return { [category]: data.skills[category] };
    }
    return {};
  }
  return data.skills;
}

export function getEducation(data: CvData): Education[] {
  return data.education;
}

export function filterByTechnology(
  data: CvData,
  technology: string
): { experience: Experience[]; projects: Project[]; skills: Skills } {
  const tech = technology.toLowerCase();

  const experience = data.experience.filter((e) =>
    e.technologies.some((t) => t.toLowerCase() === tech)
  );

  const projects = data.projects.filter((p) =>
    p.technologies.some((t) => t.toLowerCase() === tech)
  );

  const skills: Skills = {};
  for (const [category, skillList] of Object.entries(data.skills)) {
    const matched = skillList.filter((s) => s.name.toLowerCase() === tech);
    if (matched.length > 0) {
      skills[category] = matched;
    }
  }

  return { experience, projects, skills };
}

export function getContact(
  data: CvData
): Pick<Profile["links"], "email" | "github" | "linkedin" | "website"> {
  const { email, github, linkedin, website } = data.profile.links;
  return { email, github, linkedin, website };
}

export function getInterests(data: CvData) {
  return data.interests;
}

export function getCryptoExperience(data: CvData) {
  return data.cryptoExperience;
}

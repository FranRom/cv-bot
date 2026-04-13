export interface Profile {
  name: string;
  title: string;
  location: string;
  summary: string;
  avatar: string;
  links: {
    github: string;
    linkedin: string;
    website: string;
    email: string;
  };
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
  highlights: string[];
  technologies: string[];
}

export interface Skill {
  name: string;
  level: string;
}

export interface Skills {
  [category: string]: Skill[];
}

export interface Project {
  name: string;
  description: string;
  role: string;
  highlights: string[];
  technologies: string[];
  url: string;
  repo: string;
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
  details: string;
}

export interface Language {
  language: string;
  level: string;
}

export interface Availability {
  status: string;
  roles: string[];
  location_preference: string;
  notice_period: string;
}

export interface Interest {
  category: string;
  items: string[];
}

export interface CvData {
  profile: Profile;
  experience: Experience[];
  skills: Skills;
  projects: Project[];
  education: Education[];
  languages: Language[];
  interests: Interest[];
  availability: Availability;
}

export interface LlmConfig {
  provider: "anthropic" | "openai" | "google" | "groq";
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface ChatConfig {
  tone: "professional" | "friendly" | "witty" | "casual";
  systemPromptExtra: string;
  welcomeMessage: string;
  suggestedQuestions: string[];
}

export interface RateLimitConfig {
  maxMessagesPerSession: number;
  maxSessionsPerDay: number;
  cooldownMessage: string;
}

export interface ThemeConfig {
  primaryColor: string;
  mode: "dark" | "light" | "system";
}

export interface Config {
  llm: LlmConfig;
  chat: ChatConfig;
  rateLimit: RateLimitConfig;
  theme: ThemeConfig;
}

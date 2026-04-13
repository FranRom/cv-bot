import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Sidebar from "../../src/components/sidebar/Sidebar";
import type { Profile, Skills, Interest } from "../../src/lib/types";

const profile: Profile = {
  name: "Test User",
  title: "Engineer",
  location: "Remote",
  summary: "A summary",
  avatar: "/avatar.jpg",
  links: {
    github: "https://github.com/testuser",
    linkedin: "https://linkedin.com/in/testuser",
    website: "",
    email: "test@example.com",
  },
};

const skills: Skills = {
  frontend: [
    { name: "React", level: "expert" },
    { name: "TypeScript", level: "advanced" },
  ],
  backend: [{ name: "Node.js", level: "intermediate" }],
};

const interests: Interest[] = [
  { category: "Sports", items: ["Padel", "Cycling"] },
];

describe("Sidebar", () => {
  it("renders profile name and title", () => {
    render(<Sidebar profile={profile} skills={skills} interests={interests} />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
  });

  it("renders skill tags", () => {
    render(<Sidebar profile={profile} skills={skills} interests={interests} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
  });

  it("renders external links with correct href", () => {
    render(<Sidebar profile={profile} skills={skills} interests={interests} />);
    const githubLink = screen.getByRole("link", { name: /github/i });
    expect(githubLink).toHaveAttribute("href", "https://github.com/testuser");
  });

  it("does not render empty links", () => {
    render(<Sidebar profile={profile} skills={skills} interests={interests} />);
    const websiteLink = screen.queryByRole("link", { name: /website/i });
    expect(websiteLink).not.toBeInTheDocument();
  });
});

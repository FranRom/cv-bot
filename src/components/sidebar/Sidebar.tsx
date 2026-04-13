import type { Profile, Skills, Interest } from "../../lib/types";
import ProfileCard from "./ProfileCard";
import SkillsTags from "./SkillsTags";
import ExternalLinks from "./ExternalLinks";

interface Props {
  profile: Profile;
  skills: Skills;
  interests: Interest[];
}

function Divider() {
  return <hr className="border-[var(--color-border)]" />;
}

function InterestsSection({ interests }: { interests: Interest[] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
        Beyond Code
      </p>
      <div className="flex flex-wrap gap-1.5">
        {interests.flatMap((interest) =>
          interest.items.map((item) => (
            <span
              key={item}
              className="px-2 py-0.5 text-xs rounded-md bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
            >
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="text-center">
      <p className="text-xs text-[var(--color-text-muted)]">
        Made with <span className="text-red-400">&#9829;</span> by Fran and AI
      </p>
      <a
        href="https://github.com/FranRom/cv-bot"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
      >
        Fork it
      </a>
    </div>
  );
}

export default function Sidebar({ profile, skills, interests }: Props) {
  return (
    <aside className="flex flex-col h-full p-4 bg-[var(--color-surface)] border-r border-[var(--color-border)] overflow-y-auto">
      <div className="flex flex-col gap-4">
        <ProfileCard profile={profile} />
        <Divider />
        <SkillsTags skills={skills} />
        <Divider />
        <InterestsSection interests={interests} />
      </div>
      <div className="mt-auto flex flex-col gap-3 pt-4">
        <ExternalLinks links={profile.links} />
        <Divider />
        <Footer />
      </div>
    </aside>
  );
}

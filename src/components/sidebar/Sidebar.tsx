import type { Profile, Skills } from "../../lib/types";
import ProfileCard from "./ProfileCard";
import SkillsTags from "./SkillsTags";
import ExternalLinks from "./ExternalLinks";

interface Props {
  profile: Profile;
  skills: Skills;
}

export default function Sidebar({ profile, skills }: Props) {
  return (
    <aside className="flex flex-col gap-4 p-4">
      <ProfileCard profile={profile} />
      <hr className="border-white/10" />
      <SkillsTags skills={skills} />
      <hr className="border-white/10" />
      <ExternalLinks links={profile.links} />
      <hr className="border-white/10" />
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Made with <span className="text-red-400">&#9829;</span> by Fran and AI
        </p>
        <a
          href="https://github.com/FranRom/cv-bot"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Fork it
        </a>
      </div>
    </aside>
  );
}

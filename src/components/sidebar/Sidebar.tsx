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
      <a
        href="https://github.com/franrom/cv-bot"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors text-center"
      >
        Fork this project
      </a>
    </aside>
  );
}

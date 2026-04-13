import type { Profile, Skills, Interest } from "../../lib/types";
import ProfileCard from "./ProfileCard";
import SkillsTags from "./SkillsTags";
import ExternalLinks from "./ExternalLinks";

interface Props {
  profile: Profile;
  skills: Skills;
  interests: Interest[];
}

export default function Sidebar({ profile, skills, interests }: Props) {
  return (
    <aside className="flex flex-col h-full p-4 bg-white/5 border-r border-white/10 overflow-y-auto">
      <div className="flex flex-col gap-4">
        <ProfileCard profile={profile} />
        <hr className="border-white/10" />
        <SkillsTags skills={skills} />
        <hr className="border-white/10" />
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Beyond Code
          </p>
          <div className="flex flex-wrap gap-1.5">
            {interests.flatMap((interest) =>
              interest.items.map((item) => (
                <span
                  key={item}
                  className="px-2 py-0.5 text-xs rounded-md bg-white/5 text-gray-400 border border-white/10"
                >
                  {item}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-3 pt-4">
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
      </div>
    </aside>
  );
}

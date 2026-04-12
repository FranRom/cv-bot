import type { Profile } from "../../lib/types";

interface Props {
  profile: Profile;
}

export default function ProfileCard({ profile }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <img
        src={profile.avatar}
        alt={profile.name}
        className="w-20 h-20 rounded-full ring-2 ring-white/20"
      />
      <div>
        <p className="text-lg font-bold text-white">{profile.name}</p>
        <p className="text-sm text-gray-400">{profile.title}</p>
        <p className="text-xs text-gray-500">{profile.location}</p>
      </div>
    </div>
  );
}

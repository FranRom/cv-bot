import type { Skills } from "../../lib/types";

interface Props {
  skills: Skills;
}

export default function SkillsTags({ skills }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {Object.entries(skills).map(([category, items]) => (
        <div key={category}>
          <p className="text-xs text-gray-500 uppercase mb-1.5">{category}</p>
          <div className="flex flex-wrap gap-1.5">
            {items.map((skill) => (
              <span
                key={skill.name}
                className="px-2 py-0.5 text-xs bg-white/5 border border-white/10 rounded-md text-gray-300"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

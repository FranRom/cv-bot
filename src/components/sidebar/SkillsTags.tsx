import type { Skills } from "../../lib/types";

interface Props {
  skills: Skills;
}

export default function SkillsTags({ skills }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {Object.entries(skills).map(([category, items]) => (
        <div key={category}>
          <p className="text-xs text-[var(--color-text-muted)] uppercase mb-1.5">
            {category}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {items.map((skill) => (
              <span
                key={skill.name}
                className="px-2 py-0.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-secondary)]"
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

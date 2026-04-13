import type { Profile } from "../../lib/types";

interface Props {
  links: Profile["links"];
}

const LINK_LABELS: Record<keyof Profile["links"], string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  website: "Website",
  email: "Email",
};

export default function ExternalLinks({ links }: Props) {
  const entries = (Object.entries(links) as [keyof Profile["links"], string][]).filter(
    ([, url]) => url !== ""
  );

  return (
    <div className="flex flex-col gap-2">
      {entries.map(([key, url]) => {
        const href = key === "email" ? `mailto:${url}` : url;
        const label = LINK_LABELS[key];
        const isEmail = key === "email";

        return (
          <a
            key={key}
            href={href}
            {...(!isEmail && { target: "_blank", rel: "noopener noreferrer" })}
            className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors"
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}

const TOOL_LABELS: Record<string, string> = {
  get_profile: "Looking up profile...",
  get_experience: "Searching experience...",
  get_projects: "Fetching projects...",
  get_skills: "Checking skills...",
  get_education: "Looking up education...",
  get_contact: "Getting contact info...",
  filter_by_technology: "Filtering by technology...",
  get_interests: "Checking interests...",
  get_crypto_experience: "Looking up crypto experience...",
};

interface ToolCallIndicatorProps {
  toolName: string;
  state: string;
}

export function ToolCallIndicator({ toolName, state }: ToolCallIndicatorProps) {
  const label = TOOL_LABELS[toolName] ?? `Using ${toolName}...`;
  const isDone = state === "result" || state === "done";

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 py-1 pl-1">
      {isDone ? (
        <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      <span>{isDone ? label.replace("...", "") : label}</span>
    </div>
  );
}

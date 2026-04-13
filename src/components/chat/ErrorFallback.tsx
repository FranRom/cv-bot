import cvData from "../../../data/cv-data.json";

interface ErrorFallbackProps {
  error: Error;
  onRetry: () => void;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const isRateLimit = error.message?.includes("429") || error.message?.includes("rate");
  const links = cvData.profile.links;

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-5 py-4 text-sm bg-red-500/5 border border-red-500/20 text-gray-300">
        <p className="font-medium text-red-400 mb-2">
          {isRateLimit
            ? "I've reached my message limit for now"
            : "Something went wrong"}
        </p>
        <p className="mb-3 text-gray-400">
          {isRateLimit
            ? "Try again later, or reach out directly:"
            : "I couldn't process that request. You can try again, or reach out directly:"}
        </p>
        <div className="flex flex-wrap gap-3 mb-3">
          {links.linkedin && (
            <a
              href={links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-blue-400 hover:text-blue-300 hover:border-white/20 transition-colors"
            >
              LinkedIn
            </a>
          )}
          {links.github && (
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-blue-400 hover:text-blue-300 hover:border-white/20 transition-colors"
            >
              GitHub
            </a>
          )}
          {links.email && (
            <a
              href={`mailto:${links.email}`}
              className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-blue-400 hover:text-blue-300 hover:border-white/20 transition-colors"
            >
              Email
            </a>
          )}
        </div>
        {!isRateLimit && (
          <button
            onClick={onRetry}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

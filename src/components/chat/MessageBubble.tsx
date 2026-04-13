import ReactMarkdown from "react-markdown";
import { cn } from "../../lib/cn";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-2 last:mb-0">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc pl-4 mb-2">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal pl-4 mb-2">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="mb-1">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="font-semibold text-white mt-2 mb-1">{children}</h3>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-300 underline"
    >
      {children}
    </a>
  ),
};

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 text-sm",
          isUser
            ? "max-w-[75%] rounded-br-sm bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]"
            : "max-w-[85%] rounded-bl-sm bg-[var(--color-surface)] text-[var(--color-text-primary)]"
        )}
      >
        {isUser ? (
          content
        ) : (
          <ReactMarkdown components={markdownComponents}>
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

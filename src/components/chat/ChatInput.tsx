import { cn } from "../../lib/cn";
import { ToneSelector } from "./ToneSelector";
import type { Tone } from "../../lib/types";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  tone: Tone;
  onToneChange: (tone: Tone) => void;
}

export function ChatInput({ value, onChange, onSubmit, isLoading, tone, onToneChange }: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && value.trim()) {
      onSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 p-4 mx-4 mb-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]"
    >
      <ToneSelector tone={tone} onToneChange={onToneChange} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type a message..."
        maxLength={500}
        disabled={isLoading}
        className={cn(
          "flex-1 bg-transparent text-sm text-[var(--color-text-primary)]",
          "placeholder-[var(--color-text-muted)] focus:outline-none disabled:opacity-50"
        )}
      />
      <button
        type="submit"
        disabled={isLoading || !value}
        aria-label="Send arrow"
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 transition-colors",
          "bg-blue-600 text-white hover:bg-blue-500",
          "disabled:opacity-30 disabled:hover:bg-blue-600"
        )}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </form>
  );
}

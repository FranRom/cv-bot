import { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/cn";
import type { Tone } from "../../lib/types";

const TONE_OPTIONS: { value: Tone; label: string; icon: string }[] = [
  { value: "professional", label: "Professional", icon: "💼" },
  { value: "friendly", label: "Friendly", icon: "😊" },
  { value: "witty", label: "Witty", icon: "😏" },
  { value: "casual", label: "Casual", icon: "✌️" },
];

interface ToneSelectorProps {
  tone: Tone;
  onToneChange: (tone: Tone) => void;
}

export function ToneSelector({ tone, onToneChange }: ToneSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const currentOption = TONE_OPTIONS.find((o) => o.value === tone)!;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={`Tone: ${currentOption.label}`}
        onClick={() => setOpen(!open)}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 transition-colors",
          "hover:bg-[var(--color-border)]",
          open && "bg-[var(--color-border)]"
        )}
      >
        <span className="text-base leading-none">{currentOption.icon}</span>
      </button>

      {open && (
        <div style={{ backgroundColor: "#0f1729" }} className="absolute bottom-full left-0 mb-2 p-1.5 rounded-xl border border-[var(--color-border)] shadow-lg min-w-[140px]">
          {TONE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              data-active={option.value === tone ? "true" : "false"}
              onClick={() => {
                onToneChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                option.value === tone
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
              )}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

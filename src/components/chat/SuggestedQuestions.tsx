interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  layout?: "horizontal" | "vertical";
}

export function SuggestedQuestions({
  questions,
  onSelect,
  layout = "horizontal",
}: SuggestedQuestionsProps) {
  if (layout === "vertical") {
    return (
      <div className="flex flex-col gap-2">
        {questions.map((question) => (
          <button
            key={question}
            onClick={() => onSelect(question)}
            className="text-left px-3 py-2 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            {question}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((question) => (
        <button
          key={question}
          onClick={() => onSelect(question)}
          className="px-3 py-1.5 text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          {question}
        </button>
      ))}
    </div>
  );
}

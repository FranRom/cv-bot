interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((question) => (
        <button
          key={question}
          onClick={() => onSelect(question)}
          className="px-3 py-1.5 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
        >
          {question}
        </button>
      ))}
    </div>
  );
}

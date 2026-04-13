interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && value.trim()) {
      onSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 p-4 mx-4 mb-4 rounded-2xl bg-white/5 border border-white/10"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type a message..."
        maxLength={500}
        disabled={isLoading}
        className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-500 focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isLoading || !value}
        className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 transition-colors flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </form>
  );
}

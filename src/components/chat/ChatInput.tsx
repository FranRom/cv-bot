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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask me anything..."
        maxLength={500}
        disabled={isLoading}
        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-white/20 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isLoading || !value}
        className="px-4 py-2.5 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Send
      </button>
    </form>
  );
}

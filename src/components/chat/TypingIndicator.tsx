export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

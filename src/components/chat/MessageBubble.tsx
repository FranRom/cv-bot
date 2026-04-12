interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm bg-blue-600 text-white">
          {content}
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <p className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm bg-white/5 text-gray-200 border border-white/10">
        {content}
      </p>
    </div>
  );
}

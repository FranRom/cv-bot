import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { RobotAvatar } from "./RobotAvatar";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { config } from "../../lib/config";

function getTextContent(message: { parts: Array<{ type: string; text?: string }> }): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function ChatContainer() {
  const { messages, sendMessage, status, setMessages } = useChat();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";
  const isStreaming = status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage({ text: question });
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Small avatar at top when chatting */}
      {hasMessages && (
        <div className="flex flex-col items-center pt-4 pb-2 flex-shrink-0">
          <RobotAvatar isTalking={isStreaming} size="w-32 h-32" />
          <p className="mt-1 text-xs text-gray-500">
            {isStreaming ? "Thinking..." : ""}
          </p>
        </div>
      )}

      {/* Messages area — full width scroll, constrained content */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="max-w-4xl mx-auto px-6 space-y-4">
          {!hasMessages && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
              <RobotAvatar isTalking={false} size="w-40 h-40" />
              <div className="text-center max-w-md">
                <p className="text-gray-200 text-2xl font-semibold">
                  {config.chat.welcomeMessage}
                </p>
              </div>
              <SuggestedQuestions
                questions={config.chat.suggestedQuestions}
                onSelect={handleSuggestedQuestion}
              />
            </div>
          )}

          {messages.map((message) => {
            if (message.role === "user" || message.role === "assistant") {
              const text = getTextContent(message);
              if (!text) return null;

              return (
                <MessageBubble
                  key={message.id}
                  role={message.role}
                  content={text}
                />
              );
            }
            return null;
          })}

          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <TypingIndicator />
            )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom controls — constrained */}
      <div className="max-w-4xl mx-auto w-full">
        {hasMessages && (
          <div className="flex justify-center py-1">
            <button
              onClick={() => setMessages([])}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Clear chat
            </button>
          </div>
        )}

        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

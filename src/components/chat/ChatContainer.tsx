import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center">
              <p className="text-gray-300 text-sm">
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

      {hasMessages && (
        <div className="flex justify-center py-2 border-t border-white/5">
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
  );
}

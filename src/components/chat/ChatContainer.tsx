import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { config } from "../../lib/config";

export function ChatContainer() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } =
    useChat({
      api: "/api/chat",
      maxSteps: 3,
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSuggestedQuestion = (question: string) => {
    append({ role: "user", content: question });
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
            const text =
              typeof message.content === "string" ? message.content : "";
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

      <ChatInput
        value={input}
        onChange={(value) => handleInputChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}

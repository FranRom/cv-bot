import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { ToolCallIndicator } from "./ToolCallIndicator";
import { RobotAvatar } from "./RobotAvatar";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { ErrorFallback } from "./ErrorFallback";
import { config } from "../../lib/config";

interface MessagePart {
  type: string;
  text?: string;
  toolInvocation?: {
    toolName: string;
    state: string;
  };
}

function getTextContent(message: { parts: MessagePart[] }): string {
  return message.parts
    .filter((p): p is MessagePart & { text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function getToolCalls(message: { parts: MessagePart[] }) {
  return message.parts
    .filter((p) => p.type.startsWith("tool-"))
    .map((p) => p.type.replace("tool-", ""));
}

export function ChatContainer() {
  const { messages, sendMessage, status, setMessages, error, clearError } = useChat();

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

  // Get active tool calls from the last assistant message for the avatar status
  const lastMessage = messages[messages.length - 1];
  const activeToolNames =
    lastMessage?.role === "assistant" ? getToolCalls(lastMessage) : [];

  return (
    <div className="flex flex-col h-full">
      {hasMessages && (
        <div className="relative flex items-center justify-center pt-4 pb-2 flex-shrink-0">
          <RobotAvatar isTalking={isStreaming} size="w-32 h-32" />
          {isStreaming && (
            <div className="absolute left-[calc(50%+72px)] top-1/2 -translate-y-1/2">
              {/* Arrow pointing left toward the avatar */}
              <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-white/10" />
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm whitespace-nowrap">
                {activeToolNames.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {activeToolNames.map((name, i) => (
                      <ToolCallIndicator
                        key={`avatar-tool-${i}`}
                        toolName={name}
                        state="calling"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Composing response...</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

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
            if (message.role === "user") {
              const text = getTextContent(message);
              if (!text) return null;
              return (
                <MessageBubble key={message.id} role="user" content={text} />
              );
            }

            if (message.role === "assistant") {
              const text = getTextContent(message);
              const toolNames = getToolCalls(message);

              return (
                <div key={message.id} className="space-y-1">
                  {toolNames.map((name, i) => (
                    <ToolCallIndicator
                      key={`${message.id}-tool-${i}`}
                      toolName={name}
                      state="result"
                    />
                  ))}
                  {text && <MessageBubble role="assistant" content={text} />}
                </div>
              );
            }

            return null;
          })}

          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <TypingIndicator />
            )}

          {error && (
            <ErrorFallback
              error={error}
              onRetry={() => {
                clearError();
                const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
                if (lastUserMsg) {
                  const text = getTextContent(lastUserMsg);
                  if (text) sendMessage({ text });
                }
              }}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

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

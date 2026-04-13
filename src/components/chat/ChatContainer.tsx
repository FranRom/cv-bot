import { useCvChat } from "../../hooks/useCvChat";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { ToolCallIndicator } from "./ToolCallIndicator";
import { RobotAvatar } from "./RobotAvatar";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { ErrorFallback } from "./ErrorFallback";
import { config } from "../../lib/config";

function AvatarWithToolBubble({
  isStreaming,
  toolNames,
}: {
  isStreaming: boolean;
  toolNames: string[];
}) {
  return (
    <div className="relative flex items-center justify-center pt-4 pb-2 flex-shrink-0">
      <RobotAvatar isTalking={isStreaming} size="w-32 h-32" />
      {isStreaming && (
        <div className="absolute left-[calc(50%+72px)] top-1/2 -translate-y-1/2">
          <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2">
            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-[var(--color-border)]" />
          </div>
          <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2.5 text-sm whitespace-nowrap">
            {toolNames.length > 0 ? (
              <div className="flex flex-col gap-1">
                {toolNames.map((name, i) => (
                  <ToolCallIndicator key={i} toolName={name} state="calling" />
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)]">
                Composing response...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WelcomeScreen({
  onSelect,
}: {
  onSelect: (question: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <RobotAvatar isTalking={false} size="w-40 h-40" />
      <div className="text-center max-w-md">
        <p className="text-[var(--color-text-primary)] text-2xl font-semibold">
          {config.chat.welcomeMessage}
        </p>
      </div>
      <SuggestedQuestions
        questions={config.chat.suggestedQuestions}
        onSelect={onSelect}
      />
    </div>
  );
}

function MessageList({
  messages,
  isLoading,
}: {
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    text: string;
    toolNames: string[];
  }>;
  isLoading: boolean;
}) {
  const lastIsUser =
    messages.length > 0 && messages[messages.length - 1].role === "user";

  return (
    <>
      {messages.map((message) => {
        if (message.role === "user") {
          return (
            <MessageBubble
              key={message.id}
              role="user"
              content={message.text}
            />
          );
        }

        return (
          <div key={message.id} className="space-y-1">
            {message.toolNames.map((name, i) => (
              <ToolCallIndicator
                key={`${message.id}-tool-${i}`}
                toolName={name}
                state="result"
              />
            ))}
            {message.text && (
              <MessageBubble role="assistant" content={message.text} />
            )}
          </div>
        );
      })}

      {isLoading && lastIsUser && <TypingIndicator />}
    </>
  );
}

export function ChatContainer() {
  const {
    input,
    setInput,
    processedMessages,
    hasMessages,
    isLoading,
    isStreaming,
    activeToolNames,
    error,
    messagesEndRef,
    handleSubmit,
    handleSuggestedQuestion,
    handleClear,
    handleRetry,
  } = useCvChat();

  return (
    <div className="flex h-full">
      {/* Main chat column */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {hasMessages && (
          <AvatarWithToolBubble
            isStreaming={isStreaming}
            toolNames={activeToolNames}
          />
        )}

        <div className="flex-1 overflow-y-auto py-4">
          <div className="max-w-4xl mx-auto px-6 space-y-4">
            {!hasMessages && (
              <WelcomeScreen onSelect={handleSuggestedQuestion} />
            )}

            <MessageList
              messages={processedMessages}
              isLoading={isLoading}
            />

            {error && <ErrorFallback error={error} onRetry={handleRetry} />}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          {hasMessages && (
            <div className="flex justify-center py-1">
              <button
                onClick={handleClear}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
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

      {/* Right sidebar — suggested questions during conversation */}
      {hasMessages && (
        <div className="hidden lg:flex w-72 flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Suggested Questions
          </p>
          <SuggestedQuestions
            questions={config.chat.suggestedQuestions}
            onSelect={handleSuggestedQuestion}
            layout="vertical"
          />
        </div>
      )}
    </div>
  );
}

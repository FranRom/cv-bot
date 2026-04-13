import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";

interface MessagePart {
  type: string;
  text?: string;
}

function getTextFromParts(parts: MessagePart[]): string {
  return parts
    .filter((p): p is MessagePart & { text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function getToolNamesFromParts(parts: MessagePart[]): string[] {
  return parts
    .filter((p) => p.type.startsWith("tool-"))
    .map((p) => p.type.replace("tool-", ""));
}

/**
 * Custom hook that wraps useChat with CV Bot-specific logic.
 * Separates chat state management from UI rendering.
 */
export function useCvChat() {
  const { messages, sendMessage, status, setMessages, error, clearError } =
    useChat();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "submitted" || status === "streaming";
  const isStreaming = status === "streaming";
  const hasMessages = messages.length > 0;

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get active tool calls from the last assistant message
  const lastMessage = messages[messages.length - 1];
  const activeToolNames =
    lastMessage?.role === "assistant"
      ? getToolNamesFromParts(lastMessage.parts as MessagePart[])
      : [];

  const handleSubmit = () => {
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage({ text: question });
  };

  const handleClear = () => setMessages([]);

  const handleRetry = () => {
    clearError();
    const lastUserMsg = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMsg) {
      const text = getTextFromParts(lastUserMsg.parts as MessagePart[]);
      if (text) sendMessage({ text });
    }
  };

  // Process messages into a simpler format for rendering
  const processedMessages = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      text: getTextFromParts(m.parts as MessagePart[]),
      toolNames: getToolNamesFromParts(m.parts as MessagePart[]),
    }))
    .filter((m) => m.role === "user" ? m.text : true);

  return {
    // State
    input,
    setInput,
    processedMessages,
    hasMessages,
    isLoading,
    isStreaming,
    activeToolNames,
    error,
    messagesEndRef,

    // Actions
    handleSubmit,
    handleSuggestedQuestion,
    handleClear,
    handleRetry,
  };
}

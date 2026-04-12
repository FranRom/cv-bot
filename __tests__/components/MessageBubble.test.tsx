import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MessageBubble } from "../../src/components/chat/MessageBubble";

describe("MessageBubble", () => {
  it("renders user message text", () => {
    render(<MessageBubble role="user" content="Hello from user" />);
    expect(screen.getByText("Hello from user")).toBeInTheDocument();
  });

  it("renders assistant message text", () => {
    render(<MessageBubble role="assistant" content="Hello from assistant" />);
    expect(screen.getByText("Hello from assistant")).toBeInTheDocument();
  });

  it("applies different CSS classes for user vs assistant", () => {
    const { rerender } = render(
      <MessageBubble role="user" content="User message" />
    );
    const userWrapper = screen.getByText("User message").closest("div");
    expect(userWrapper?.className).toContain("justify-end");

    rerender(<MessageBubble role="assistant" content="Assistant message" />);
    const assistantWrapper = screen.getByText("Assistant message").closest("div");
    expect(assistantWrapper?.className).toContain("justify-start");
  });
});

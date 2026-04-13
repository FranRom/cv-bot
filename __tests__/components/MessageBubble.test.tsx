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

  it("applies different alignment for user vs assistant", () => {
    const { container, rerender } = render(
      <MessageBubble role="user" content="User message" />
    );
    expect(container.firstElementChild?.className).toContain("justify-end");

    rerender(<MessageBubble role="assistant" content="Assistant message" />);
    expect(container.firstElementChild?.className).toContain("justify-start");
  });
});

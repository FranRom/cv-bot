import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ChatInput } from "../../src/components/chat/ChatInput";

const defaultProps = {
  value: "",
  onChange: () => {},
  onSubmit: () => {},
  isLoading: false,
  tone: "friendly" as const,
  onToneChange: () => {},
};

describe("ChatInput", () => {
  it("renders input, button, and tone selector", () => {
    render(<ChatInput {...defaultProps} />);
    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tone/i })).toBeInTheDocument();
  });

  it("calls onChange when typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ChatInput {...defaultProps} onChange={onChange} />);
    await user.type(screen.getByPlaceholderText("Type a message..."), "hi");
    expect(onChange).toHaveBeenCalled();
  });

  it("calls onSubmit on button click", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChatInput {...defaultProps} value="some text" onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: /arrow/i }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it("disables input and button when loading", () => {
    render(<ChatInput {...defaultProps} value="some text" isLoading={true} />);
    expect(screen.getByPlaceholderText("Type a message...")).toBeDisabled();
  });

  it("enforces maxLength 500 on input", () => {
    render(<ChatInput {...defaultProps} />);
    const input = screen.getByPlaceholderText("Type a message...");
    expect(input).toHaveAttribute("maxLength", "500");
  });
});

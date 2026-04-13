import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ChatInput } from "../../src/components/chat/ChatInput";

describe("ChatInput", () => {
  it("renders input and button", () => {
    render(
      <ChatInput value="" onChange={() => {}} onSubmit={() => {}} isLoading={false} />
    );
    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onChange when typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ChatInput value="" onChange={onChange} onSubmit={() => {}} isLoading={false} />
    );
    await user.type(screen.getByPlaceholderText("Type a message..."), "hi");
    expect(onChange).toHaveBeenCalled();
  });

  it("calls onSubmit on button click", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <ChatInput value="some text" onChange={() => {}} onSubmit={onSubmit} isLoading={false} />
    );
    await user.click(screen.getByRole("button"));
    expect(onSubmit).toHaveBeenCalled();
  });

  it("disables input and button when loading", () => {
    render(
      <ChatInput value="some text" onChange={() => {}} onSubmit={() => {}} isLoading={true} />
    );
    expect(screen.getByPlaceholderText("Type a message...")).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("enforces maxLength 500 on input", () => {
    render(
      <ChatInput value="" onChange={() => {}} onSubmit={() => {}} isLoading={false} />
    );
    const input = screen.getByPlaceholderText("Type a message...");
    expect(input).toHaveAttribute("maxLength", "500");
  });
});

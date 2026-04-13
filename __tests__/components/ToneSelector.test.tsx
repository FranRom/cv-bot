import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ToneSelector } from "../../src/components/chat/ToneSelector";

describe("ToneSelector", () => {
  it("renders the tone button", () => {
    render(<ToneSelector tone="friendly" onToneChange={() => {}} />);
    expect(screen.getByRole("button", { name: /tone/i })).toBeInTheDocument();
  });

  it("shows popover with all tones when clicked", async () => {
    const user = userEvent.setup();
    render(<ToneSelector tone="friendly" onToneChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: /tone/i }));
    expect(screen.getByText("Professional")).toBeInTheDocument();
    expect(screen.getByText("Friendly")).toBeInTheDocument();
    expect(screen.getByText("Witty")).toBeInTheDocument();
    expect(screen.getByText("Casual")).toBeInTheDocument();
  });

  it("highlights the current tone", async () => {
    const user = userEvent.setup();
    render(<ToneSelector tone="witty" onToneChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: /tone/i }));
    const wittyButton = screen.getByText("Witty").closest("button");
    expect(wittyButton?.getAttribute("data-active")).toBe("true");
  });

  it("calls onToneChange and closes popover on selection", async () => {
    const user = userEvent.setup();
    const onToneChange = vi.fn();
    render(<ToneSelector tone="friendly" onToneChange={onToneChange} />);
    await user.click(screen.getByRole("button", { name: /tone/i }));
    await user.click(screen.getByText("Casual"));
    expect(onToneChange).toHaveBeenCalledWith("casual");
    expect(screen.queryByText("Professional")).not.toBeInTheDocument();
  });

  it("closes popover when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <ToneSelector tone="friendly" onToneChange={() => {}} />
        <span data-testid="outside">outside</span>
      </div>
    );
    await user.click(screen.getByRole("button", { name: /tone/i }));
    expect(screen.getByText("Professional")).toBeInTheDocument();
    await user.click(screen.getByTestId("outside"));
    expect(screen.queryByText("Professional")).not.toBeInTheDocument();
  });
});

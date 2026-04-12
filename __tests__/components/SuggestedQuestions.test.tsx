import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SuggestedQuestions } from "../../src/components/chat/SuggestedQuestions";

const questions = ["What is your experience?", "What are your skills?"];

describe("SuggestedQuestions", () => {
  it("renders all questions", () => {
    render(<SuggestedQuestions questions={questions} onSelect={() => {}} />);
    expect(screen.getByText("What is your experience?")).toBeInTheDocument();
    expect(screen.getByText("What are your skills?")).toBeInTheDocument();
  });

  it("calls onSelect with text on click", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<SuggestedQuestions questions={questions} onSelect={onSelect} />);
    await user.click(screen.getByText("What is your experience?"));
    expect(onSelect).toHaveBeenCalledWith("What is your experience?");
  });
});

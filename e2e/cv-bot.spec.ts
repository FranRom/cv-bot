import { test, expect } from "@playwright/test";
import { mockChatAPI, mockChatAPIError } from "./helpers/mock-api";

test.describe("Welcome screen", () => {
  test("shows avatar, welcome message, and suggested questions", async ({ page }) => {
    await page.goto("/");

    // Robot avatar is visible
    await expect(page.getByAltText("Fran Bot")).toBeVisible();

    // Welcome message
    await expect(
      page.getByText("I'm Fran's AI assistant")
    ).toBeVisible();

    // All 7 suggested question buttons
    const buttons = page.getByRole("button").filter({ hasText: /\?|Tell me|Show me|How was/ });
    await expect(buttons).toHaveCount(7);
  });
});

test.describe("Send a message", () => {
  test("shows user bubble and streams assistant response", async ({ page }) => {
    await mockChatAPI(page, {
      text: "Fran has 8 years of frontend experience with React and TypeScript.",
    });

    await page.goto("/");

    // Type and submit
    const input = page.getByPlaceholder("Type a message...");
    await input.fill("Tell me about Fran's experience");
    await page.getByRole("button", { name: /arrow/i }).click();

    // User message appears
    await expect(page.getByText("Tell me about Fran's experience")).toBeVisible();

    // Assistant response streams in
    await expect(
      page.getByText("Fran has 8 years of frontend experience")
    ).toBeVisible();

    // Input is cleared after submit
    await expect(input).toHaveValue("");
  });
});

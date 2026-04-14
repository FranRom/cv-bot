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

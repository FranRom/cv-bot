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

test.describe("Suggested question", () => {
  test("clicking a suggested question sends it and shows response", async ({ page }) => {
    await mockChatAPI(page, {
      text: "Fran's tech stack includes React, TypeScript, and Vite.",
    });

    await page.goto("/");

    // Click a suggested question
    await page.getByRole("button", { name: "What's Fran's tech stack?" }).click();

    // User message appears with the question text
    await expect(page.getByText("What's Fran's tech stack?")).toHaveCount(2); // button + user bubble

    // Assistant response appears
    await expect(
      page.getByText("Fran's tech stack includes React")
    ).toBeVisible();
  });
});

test.describe("Tool call visibility", () => {
  test("shows tool indicators that resolve to checkmarks", async ({ page }) => {
    await mockChatAPI(page, {
      text: "Here are Fran's skills in frontend development.",
      toolCalls: [
        {
          toolName: "get_skills",
          args: { category: "frontend" },
          result: { frontend: [{ name: "React", level: "expert" }] },
        },
      ],
    });

    await page.goto("/");

    const input = page.getByPlaceholder("Type a message...");
    await input.fill("What are Fran's frontend skills?");
    await page.getByRole("button", { name: /arrow/i }).click();

    // Tool indicator shows completed state (checkmark + label)
    await expect(page.getByText("Checking skills")).toBeVisible();

    // Assistant response also appears
    await expect(
      page.getByText("Here are Fran's skills in frontend development")
    ).toBeVisible();
  });
});

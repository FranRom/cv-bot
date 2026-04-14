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

test.describe("Tone selector", () => {
  test("opens popover, selects tone, and persists across reload", async ({ page }) => {
    await mockChatAPI(page, { text: "Hello!" });

    await page.goto("/");

    // Tone button is visible (default: Friendly)
    const toneButton = page.getByRole("button", { name: /tone/i });
    await expect(toneButton).toBeVisible();

    // Open popover
    await toneButton.click();

    // All 4 tones visible
    await expect(page.getByText("Professional")).toBeVisible();
    await expect(page.getByText("Friendly")).toBeVisible();
    await expect(page.getByText("Witty")).toBeVisible();
    await expect(page.getByText("Casual")).toBeVisible();

    // Select Witty
    await page.getByText("Witty").click();

    // Popover closes
    await expect(page.getByText("Professional")).not.toBeVisible();

    // Tone button now shows Witty icon
    await expect(page.getByRole("button", { name: /tone: witty/i })).toBeVisible();

    // Reload and verify persistence
    await page.reload();
    await expect(page.getByRole("button", { name: /tone: witty/i })).toBeVisible();
  });

  test("sends selected tone in request body", async ({ page }) => {
    let capturedBody: Record<string, unknown> = {};

    await page.addInitScript(() => localStorage.clear());

    await page.route("**/api/chat", (route) => {
      const postData = route.request().postData();
      if (postData) {
        capturedBody = JSON.parse(postData);
      }
      route.fulfill({
        status: 200,
        headers: {
          "content-type": "text/event-stream",
          "x-vercel-ai-ui-message-stream": "v1",
        },
        body: [
          `data: {"type":"start","messageId":"m1"}\n\n`,
          `data: {"type":"start-step"}\n\n`,
          `data: {"type":"text-start","id":"m1"}\n\n`,
          `data: {"type":"text-delta","id":"m1","delta":"Hi"}\n\n`,
          `data: {"type":"text-end","id":"m1"}\n\n`,
          `data: {"type":"finish-step"}\n\n`,
          `data: {"type":"finish","finishReason":"stop"}\n\n`,
          `data: [DONE]\n\n`,
        ].join(""),
      });
    });

    await page.goto("/");

    // Select Casual tone
    await page.getByRole("button", { name: /tone/i }).click();
    await page.getByText("Casual").click();

    // Send a message
    const input = page.getByPlaceholder("Type a message...");
    await input.fill("Hi");
    await page.getByRole("button", { name: /arrow/i }).click();

    // Wait for response to confirm request was made
    await expect(page.getByText("Hi").first()).toBeVisible();

    // Verify the tone was sent in the request body
    expect(capturedBody.tone).toBe("casual");
  });
});

test.describe("Error handling", () => {
  test("shows error fallback when API fails", async ({ page }) => {
    await mockChatAPIError(page, 500);

    await page.goto("/");

    const input = page.getByPlaceholder("Type a message...");
    await input.fill("Hello");
    await page.getByRole("button", { name: /arrow/i }).click();

    // Error fallback renders
    await expect(page.getByText("Something went wrong")).toBeVisible({
      timeout: 5000,
    });
  });
});

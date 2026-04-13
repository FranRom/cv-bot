import type { Page } from "@playwright/test";

interface MockTextResponse {
  text: string;
  toolCalls?: { toolName: string; args?: Record<string, unknown>; result?: unknown }[];
}

/**
 * Build an SSE body string that mimics AI SDK's toUIMessageStreamResponse().
 * Format: "data: <JSON>\n\n" per chunk, ending with "data: [DONE]\n\n".
 */
function buildSSEBody(opts: MockTextResponse): string {
  const msgId = "mock-msg-1";
  const chunks: string[] = [];

  const push = (obj: Record<string, unknown>) =>
    chunks.push(`data: ${JSON.stringify(obj)}\n\n`);

  push({ type: "start", messageId: msgId });

  // Tool calls (if any) — each tool goes through the full lifecycle
  if (opts.toolCalls) {
    for (let i = 0; i < opts.toolCalls.length; i++) {
      const tc = opts.toolCalls[i];
      const toolCallId = `tc-${i}`;

      push({ type: "start-step" });
      push({
        type: "tool-input-start",
        toolCallId,
        toolName: tc.toolName,
        dynamic: false,
      });
      push({
        type: "tool-input-available",
        toolCallId,
        toolName: tc.toolName,
        input: tc.args ?? {},
      });
      push({
        type: "tool-output-available",
        toolCallId,
        output: tc.result ?? {},
        preliminary: false,
      });
      push({ type: "finish-step" });
    }
  }

  // Text response — split into word-level deltas for realistic streaming
  push({ type: "start-step" });
  push({ type: "text-start", id: msgId });
  const words = opts.text.split(" ");
  for (let i = 0; i < words.length; i++) {
    const delta = i === 0 ? words[i] : ` ${words[i]}`;
    push({ type: "text-delta", id: msgId, delta });
  }
  push({ type: "text-end", id: msgId });
  push({ type: "finish-step" });

  push({ type: "finish", finishReason: "stop" });
  chunks.push("data: [DONE]\n\n");

  return chunks.join("");
}

const SSE_HEADERS: Record<string, string> = {
  "content-type": "text/event-stream",
  "cache-control": "no-cache",
  "connection": "keep-alive",
  "x-vercel-ai-ui-message-stream": "v1",
  "x-accel-buffering": "no",
};

/**
 * Intercept POST /api/chat and return a mocked SSE stream.
 */
export async function mockChatAPI(page: Page, response: MockTextResponse) {
  await page.route("**/api/chat", (route) => {
    route.fulfill({
      status: 200,
      headers: SSE_HEADERS,
      body: buildSSEBody(response),
    });
  });
}

/**
 * Intercept POST /api/chat and return an error response.
 */
export async function mockChatAPIError(page: Page, status = 500) {
  await page.route("**/api/chat", (route) => {
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ error: "Something went wrong. Please try again." }),
    });
  });
}

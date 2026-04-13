# CV Bot — Agent Context

AI-powered CV chatbot using React 19, TypeScript, Vercel AI SDK, and Anthropic Claude. The LLM uses tool-calling to query structured CV data from JSON files.

## Architecture

- **Frontend**: React 19 + Vite + Tailwind CSS 4 SPA
- **API**: Vercel Edge function at `api/chat.ts` — proxies LLM requests, executes tools, streams responses
- **Prompts**: Composable markdown files in `prompts/` — interpolated with `{{ownerName}}` at runtime
- **Tools**: Defined in `server/tools.ts` using Zod 4 schemas (import from `zod/v4`)
- **Data**: Static JSON files in `data/` — no database

## Key Files

| File | Purpose |
|---|---|
| `data/cv-data.json` | All CV data — profile, experience, skills, projects, etc. |
| `data/config.json` | LLM provider, tone, rate limits, theme |
| `prompts/*.md` | System prompt components — personality, boundaries, examples |
| `server/tools.ts` | Tool definitions the LLM can call |
| `server/cv-data.ts` | Query functions that tools execute |
| `server/system-prompt.ts` | Composes prompt files into final system prompt |
| `api/chat.ts` | Edge function — the API entry point |

## How to Add a New Tool

1. Add the query function in `server/cv-data.ts`:
```ts
export function getNewThing(data: CvData) {
  return data.newThing;
}
```

2. Add the tool definition in `server/tools.ts`:
```ts
import { z } from "zod/v4";  // Always use zod/v4, not zod

get_new_thing: tool({
  description: "Description the LLM reads to decide when to use this tool",
  inputSchema: z.object({
    optionalFilter: z.string().optional().describe("What this filter does"),
  }),
  execute: async (params) => getNewThing(data, params),
}),
```

3. If the tool needs new data, add the type in `src/lib/types.ts` and the data in `data/cv-data.json`.

4. Add tests in `__tests__/ai/tool-responses.test.ts`.

## How to Modify Bot Behavior

Edit the markdown files in `prompts/` — no code changes needed:

- `personality.md` — change how the bot introduces itself
- `boundaries.md` — change what topics are in/out of scope
- `inference-rules.md` — change how the bot handles unknown skills
- `response-style.md` — change response length, formatting, follow-ups
- `examples.md` — add/edit few-shot examples to guide response quality

All files support `{{ownerName}}` interpolation.

## How to Add a New CV Data Section

1. Add the TypeScript type in `src/lib/types.ts`
2. Add the field to the `CvData` interface
3. Add the data in `data/cv-data.json`
4. Add a query function in `server/cv-data.ts`
5. Add a tool in `server/tools.ts` (use `zod/v4`)
6. Add evaluation tests in `__tests__/ai/tool-responses.test.ts`

## Important Constraints

- **Zod 4**: Always import from `zod/v4`, not `zod`. The AI SDK uses `zod/v4` types.
- **Empty tool schemas**: `z.object({})` from `zod/v4` works, but the Anthropic API needs `"type": "object"` in the JSON Schema. There's a fetch patch in `api/chat.ts` that handles this.
- **Tool property name**: Use `inputSchema`, not `parameters` — this is AI SDK v6.
- **Streaming**: Use `toUIMessageStreamResponse()`, not `toDataStreamResponse()`.
- **Messages**: The client sends `UIMessage` format (with `parts`). Use `convertToModelMessages()` before passing to `streamText`.
- **Prompt caching**: System prompt uses `cache_control: { type: "ephemeral" }` for Anthropic cost savings.

## Running

```bash
npm run dev       # Dev server (frontend + API via Vite plugin)
npm test          # Tests in watch mode
npm run test:run  # Tests once
npm run build     # Production build
```

## Testing

- `__tests__/server/` — Unit tests for tools, prompt builder, rate limiter, provider
- `__tests__/components/` — React component tests
- `__tests__/ai/` — AI evaluation tests (tool pipeline + prompt quality)

Run all: `npx vitest run` (67 tests)

## Commit Style

- No `Co-Authored-By` lines in commit messages
- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`

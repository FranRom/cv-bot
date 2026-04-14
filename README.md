# CV Bot

An AI-powered chatbot that showcases your professional experience, skills, and projects through natural conversation. Instead of a static resume, recruiters and hiring managers can talk to your bot — ask about your tech stack, explore your projects, or dig into your experience.

The bot uses **LLM tool-calling** to query structured CV data, making it a real demonstration of agentic engineering — not just a wrapper around a prompt.

**Open source and forkable.** Swap in your own data, deploy to Vercel, and you have your own AI-powered CV in minutes.

<img width="1469" alt="CV Bot Screenshot" src="https://github.com/user-attachments/assets/1f85a61b-3f04-4dc0-865d-dc8f6bf6bb18" />

## How It Works

```
Visitor asks a question
        |
   [Vercel Edge Function]
        |
   Builds context: system prompt + conversation history + tool definitions
        |
   Sends to LLM (Claude, OpenAI, or Gemini — configurable)
        |
   LLM decides which tools to call (get_experience, get_skills, filter_by_technology, etc.)
        |
   Tools execute server-side, querying cv-data.json
        |
   LLM weaves the structured data into a natural response
        |
   Response streams back to the browser via SSE
```

The LLM has access to **9 tools** that query your CV data:

| Tool | What it does |
|---|---|
| `get_profile` | Name, title, location, summary, links |
| `get_experience` | Work history, filterable by company |
| `get_projects` | Projects, filterable by technology |
| `get_skills` | Skills by category with proficiency levels |
| `get_education` | Education and certifications |
| `get_contact` | Contact information and links |
| `filter_by_technology` | Cross-cuts all data by a specific tech |
| `get_interests` | Personal interests and hobbies |
| `get_crypto_experience` | Crypto journey, chains used, opinions |

All tools read from a single `cv-data.json` file — no database, no external APIs.

## Features

- **Animated robot avatar** with blue neon glow that talks while the bot is streaming
- **Tool call transparency** — speech bubble shows which tools are being called in real-time
- **Skill-based prompt routing** — elevator pitch, job match, deep dive, interview questions
- **Sidebar** with quick-glance profile info, skills tags, interests, and links
- **Suggested questions sidebar** — persistent during conversation for easy follow-ups
- **Markdown rendering** in bot responses (lists, bold, links, headings)
- **Guard rails** — prompt injection detection with Unicode normalization
- **Graceful degradation** — friendly error fallback with contact links when LLM fails
- **Rate limiting** to protect your API budget (per-session + daily caps)
- **Prompt caching** — Anthropic cache_control saves ~90% on repeat conversations
- **Configurable LLM provider** — Claude, OpenAI, or Gemini
- **User-selectable tone** — visitors pick professional, friendly, witty, or casual from a popover in the chat input; persisted to localStorage and applied per-request
- **Mobile responsive** — sidebar collapses into a drawer on small screens
- **Dark theme** with CSS design tokens for easy customization
- **E2E tests** — Playwright tests with mocked API verify the full user flow (welcome, chat, tool calls, tone selector, error handling)
- **Pre-commit hooks** — Husky runs all 121 unit tests before every commit
- **CI/CD** — GitHub Actions runs tests + type-check on push/PR

## AI Engineering

This isn't just an LLM wrapper. The project implements production AI best practices:

### Structured Prompt Architecture

The system prompt is composed from modular markdown files rather than hardcoded strings:

```
prompts/
├── personality.md        # Voice, identity, behavior
├── boundaries.md         # What to answer, what to refuse, off-limits topics
├── inference-rules.md    # How to handle skill gaps and make inferences
├── response-style.md     # Formatting, length, follow-up guidance
└── examples.md           # Few-shot examples of ideal responses
```

Each file uses `{{ownerName}}` template variables, interpolated at runtime. This makes prompts **testable**, **version-controlled**, and **independently editable** — you can tweak the bot's personality without touching code.

The prompt builder caches the composed result in memory since the files don't change at runtime.

### Prompt Caching (Anthropic)

The system prompt is marked with `cache_control: { type: "ephemeral" }`, which tells Anthropic to cache it across requests within a 5-minute window. Since the system prompt + tool definitions are identical for every request, this saves **~90% on input tokens** for repeat conversations.

Other providers (OpenAI, Google) ignore this field gracefully — no code branching needed.

### Few-Shot Examples

The `prompts/examples.md` file contains example question-answer pairs that guide the LLM's response quality and style. This is more effective than verbose instructions — the model learns the expected pattern from concrete examples.

### AI Response Evaluation Tests

The `__tests__/ai/tool-responses.test.ts` suite (21 tests) verifies the data pipeline that feeds the LLM:

- Profile returns correct name, title, and links
- Experience entries have all required fields
- Skills include key technologies recruiters search for
- Technology filter works cross-cutting (experience + projects + skills)
- Crypto experience data is accurate (chains, wallet, activities)
- System prompt contains boundary rules, inference rules, and few-shot examples

These tests don't call the LLM (too slow and expensive for CI). Instead, they test the **data layer** — if the tools return bad data, the LLM will give bad answers regardless of prompt quality.

### Skill-Based Prompt Routing

Beyond simple Q&A, the bot detects user intent and activates specialized **skills** — higher-level conversation patterns that augment the system prompt with task-specific instructions:

| Skill | Trigger examples | What it does |
|---|---|---|
| **Elevator Pitch** | "Who is [name]?", "Give me a summary" | Composes a compelling narrative from profile + experience + skills |
| **Job Match** | "How does [name] fit this role?" | Analyzes strong matches, transferable skills, and growth areas |
| **Technical Deep Dive** | "Most complex project?", "Walk me through the architecture" | Guides through problem → approach → trade-offs → outcome |
| **Interview Questions** | "What should I ask [name]?" | Generates tailored questions based on actual experience |

Skills live as markdown files in `prompts/skills/` — the router detects keywords in the user's message and appends the skill prompt to the system prompt for that request only. Regular questions bypass the skill system entirely.

This is a form of **prompt routing** — a common pattern in production AI systems where different intents get different instructions.

### Tool Call Transparency

When the bot processes a question, visitors can see exactly which tools are being called in real-time. A speech bubble appears next to the robot avatar showing labels like "Searching experience..." or "Checking skills..." with a spinner. This makes the agentic architecture visible — it's not a black box, you can see the reasoning steps happening.

Completed tool calls also appear as checkmarks above the response in the chat, so you can see which data sources informed each answer.

### Graceful Degradation

When the LLM fails or the rate limit is hit, the bot doesn't show a generic error. Instead, it displays a friendly fallback card with:
- A clear explanation of what happened (rate limit vs error)
- Direct links to LinkedIn, GitHub, and email so the visitor can still reach you
- A retry button for transient errors

This ensures visitors always have a way to connect, even when the AI is unavailable.

### Guard Rails

Server-side input validation runs before every message reaches the LLM:

- **Prompt injection detection** — regex patterns catch common injection attempts ("ignore previous instructions", "you are now a...", "reveal your system prompt", etc.) and return a polite redirect instead of forwarding to the LLM
- **Length validation** — messages over 500 characters are rejected
- **Empty input** — blank messages are caught server-side

All guard rails are tested (23 tests) with both legitimate questions (allowed) and injection attempts (blocked). The patterns are deliberately conservative — false positives are worse than letting a borderline message through, since the system prompt already constrains the bot's behavior.

### Tool Design

Tools are designed to be **lean** — they return only filtered data, not the entire CV. This reduces token usage per response:

- `get_skills({ category: "web3" })` returns only Web3 skills, not all categories
- `filter_by_technology("React")` returns only matching experience and projects
- The LLM decides which tools to call based on the question — no wasted data

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| AI | Vercel AI SDK (streaming, tool-calling, multi-provider), skill routing |
| Backend | Vercel Serverless Functions (esbuild-bundled) |
| Schema | Zod 4 |
| Utilities | clsx + tailwind-merge (`cn()`), CSS design tokens |
| Testing | Vitest, React Testing Library (121 unit tests), Playwright E2E (7 tests) |
| CI/CD | GitHub Actions, Husky pre-commit hooks |

## Project Structure

```
cv-bot/
├── functions-src/
│   ├── chat.ts                  # Vercel serverless function — LLM proxy + tools
│   └── _lib/                    # Server modules (bundled by esbuild for deploy)
│       ├── tools.ts             # LLM tool definitions (Zod 4 schemas + executors)
│       ├── system-prompt.ts     # Prompt composer from modular sections
│       ├── skill-router.ts      # Intent detection → skill prompt routing
│       ├── guard-rails.ts       # Prompt injection detection + input validation
│       ├── provider.ts          # Multi-provider LLM router
│       ├── rate-limiter.ts      # IP-based rate limiting
│       └── cv-data.ts           # CV data query functions
├── data/
│   ├── cv-data.json             # Your CV data (edit this)
│   └── config.json              # App config (provider, tone, rate limits, theme)
├── prompts/
│   ├── index.ts                 # System prompt sections (runtime source of truth)
│   ├── *.md                     # Documentation versions of prompt files
│   └── skills/
│       ├── index.ts             # Skill prompts (elevator-pitch, job-match, etc.)
│       └── *.md                 # Documentation versions of skill files
├── server/
│   └── api-dev-plugin.ts        # Vite plugin for local API development
├── scripts/
│   ├── build-vercel.mjs         # Full Vercel build (frontend + API)
│   └── build-api.mjs            # esbuild bundler for the API function
├── src/
│   ├── components/
│   │   ├── chat/                # ChatContainer, MessageBubble, ChatInput,
│   │   │                        # ToneSelector, RobotAvatar, ToolCallIndicator,
│   │   │                        # ErrorFallback, TypingIndicator, SuggestedQuestions
│   │   ├── sidebar/             # Sidebar, ProfileCard, SkillsTags, ExternalLinks
│   │   └── layout/              # AppLayout (responsive grid + mobile drawer)
│   ├── hooks/
│   │   └── useCvChat.ts         # Custom hook — chat logic separated from UI
│   ├── lib/
│   │   ├── types.ts             # Shared TypeScript types
│   │   ├── config.ts            # Config loader
│   │   └── cn.ts                # cn() utility (clsx + tailwind-merge)
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── avatar.jpg               # Your profile photo
│   └── robot-*.png              # Robot avatar frames (idle, talking)
├── e2e/
│   ├── cv-bot.spec.ts               # Playwright E2E tests (mocked API)
│   └── helpers/
│       └── mock-api.ts              # SSE stream mock builders
└── __tests__/
    ├── ai/                      # AI evaluation tests (21 tests)
    ├── server/                  # Server logic + guard rails + skill router tests
    └── components/              # React component tests
```

## Make Your Own

### Option 1: Deploy with Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFranRom%2Fcv-bot&env=ANTHROPIC_API_KEY&envDescription=Your%20LLM%20API%20key&project-name=cv-bot&repository-name=cv-bot)

1. Click the deploy button above
2. Set your LLM API key in Vercel environment variables
3. Edit `data/cv-data.json` with your information
4. Edit `data/config.json` to set your provider, tone, and rate limits
5. Replace `public/avatar.jpg` with your photo
6. Optionally replace `public/robot-*.png` with your own avatar frames

### Option 2: Fork and run locally

```bash
# Clone the repo
git clone https://github.com/FranRom/cv-bot.git
cd cv-bot

# Install dependencies
npm install

# Set up your API key
cp .env.example .env.local
# Edit .env.local and add your API key

# Start the dev server
npm run dev
```

The dev server runs both the frontend and the API locally — no Vercel CLI needed.

## Configuration

### `data/cv-data.json`

Your CV data. Structured into sections:

| Section | Description |
|---|---|
| `profile` | Name, title, location, summary, avatar, links |
| `experience` | Work history with highlights and technologies |
| `skills` | Skills grouped by category with proficiency levels |
| `projects` | Projects with descriptions, highlights, and tech used |
| `education` | Education and certifications |
| `languages` | Languages spoken |
| `interests` | Personal interests grouped by category |
| `cryptoExperience` | Crypto journey (optional — remove if not relevant) |
| `availability` | Job search status, preferred roles, location |

### `data/config.json`

| Setting | Options | Description |
|---|---|---|
| `llm.provider` | `"anthropic"`, `"openai"`, `"google"` | Which LLM to use |
| `llm.model` | Any model ID | e.g., `"claude-haiku-4-5-20251001"` |
| `chat.tone` | `"professional"`, `"friendly"`, `"witty"`, `"casual"` | Default tone (visitors can override via UI) |
| `chat.welcomeMessage` | Any string | Shown on the landing screen |
| `chat.suggestedQuestions` | Array of strings | Clickable question chips |
| `rateLimit.maxMessagesPerSession` | Number | Per-visitor message cap |
| `rateLimit.maxSessionsPerDay` | Number | Global daily visitor cap |
| `theme.primaryColor` | Hex color | Accent color |
| `theme.mode` | `"dark"`, `"light"`, `"system"` | Color scheme |

### Environment Variables

```bash
# Required — depends on your chosen provider
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (frontend + API via Vite plugin) |
| `npm run build` | TypeScript check + Vite production build |
| `npm run build:vercel` | Full Vercel build (frontend + esbuild-bundled API) |
| `npm run preview` | Preview production build |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run unit tests once (121 tests) |
| `npm run test:e2e` | Run Playwright E2E tests (7 tests) |
| `npm run test:e2e:ui` | Run E2E tests with Playwright UI |

## Security

- API key lives exclusively in environment variables — never in the repo
- All LLM calls proxied through the serverless function
- **Guard rails** — prompt injection detection with Unicode normalization (23 tests)
- **CORS** — API restricted to same origin in production
- **Body size limit** — 50KB max to prevent memory exhaustion
- Rate limiting prevents abuse (per-IP using `x-real-ip`, session + daily caps)
- Input validation: max 500 character messages, conversation history capped at 10 messages
- Generic error messages to client — no stack traces or internal details leaked
- System prompt instructs the bot to only answer CV-related questions
- No user data collection, no database, no analytics

## Cost

Running this costs very little:

- **Vercel hosting**: Free (Hobby tier)
- **LLM API**: ~$0.01-0.05 per conversation with Claude Haiku
- **Prompt caching**: Saves ~90% on input tokens for repeat conversations within 5 minutes
- **Estimated monthly**: $3-15 for moderate traffic (10-20 visitors/day)

Rate limiting in `config.json` lets you cap your daily spend.

## License

[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — free to use, modify, and share with attribution to the [original project](https://github.com/FranRom/cv-bot).

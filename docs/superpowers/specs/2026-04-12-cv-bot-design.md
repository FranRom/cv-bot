# CV Bot — Design Spec

An interactive AI chatbot that showcases your CV, experience, skills, and projects. Visitors (recruiters and hiring managers) have a conversation with the bot to learn about you. The bot uses LLM tool-calling to surface structured data from a JSON file, demonstrating agentic engineering skills. Fully open-source and forkable.

## Audience

- **Recruiters** — quick surface-level questions (tech stack, years of experience, availability)
- **Hiring managers / tech leads** — deeper dives (architecture decisions, project details, technical depth)

## Architecture

Three layers:

### Frontend (React + TypeScript)

Single-page application. No framework (no Next.js) — pure React + Vite for fast builds and minimal complexity.

Components:
- **Chat interface** — message list, input, streaming response display, typing indicator
- **Quick-glance sidebar** — persistent sidebar showing profile info, skills tags, links. Collapses to drawer on mobile.
- **Tool result renderers** — optional rich cards when the bot surfaces projects or filtered data
- **Theme system** — dark/light/system mode, configurable accent color

### API Route (Vercel Serverless Function)

A single `/api/chat` endpoint that:
1. Validates input (rate limit check, message length, session tracking)
2. Constructs the LLM request (system prompt + conversation history + tool definitions)
3. Proxies to the configured LLM provider
4. Executes tool calls server-side by reading `cv-data.json`
5. Returns the final response via SSE streaming

The API key lives exclusively in Vercel environment variables.

### LLM Provider (Configurable)

Supported providers:
- Anthropic (Claude) — default
- OpenAI
- Google Gemini
- Groq
- Ollama (local)

Provider is set in `config.json`. A provider-agnostic adapter normalizes the request/response format across providers.

## Bot Tools

The LLM uses tool-calling to decide when to pull structured data. All tools read from `cv-data.json` — no external calls.

### Phase 1 (MVP)

| Tool | Purpose | Parameters |
|---|---|---|
| `get_profile` | Basic info (name, title, location, links) | none |
| `get_experience` | Work history | `company?`, `from_year?`, `to_year?` |
| `get_projects` | Project details | `technology?` |
| `get_skills` | Skills by category with proficiency | `category?` |
| `get_education` | Education and certifications | none |
| `filter_by_technology` | Cross-cut all data by tech | `technology` |
| `get_contact` | Contact info and preferred channels | none |

### Phase 2

| Tool | Purpose |
|---|---|
| `get_availability` | Job search status, preferred roles, location, notice period |
| `compare_requirements` | Takes a job description, maps against skills/experience |
| `get_recommendations` | Testimonials or notable achievements |

## Data Model

### cv-data.json

```json
{
  "profile": {
    "name": "",
    "title": "",
    "location": "",
    "summary": "",
    "avatar": "",
    "links": {
      "github": "",
      "linkedin": "",
      "website": "",
      "email": ""
    }
  },
  "experience": [
    {
      "company": "",
      "role": "",
      "period": "",
      "description": "",
      "highlights": [],
      "technologies": []
    }
  ],
  "skills": {
    "frontend": [{ "name": "", "level": "" }],
    "backend": [],
    "tools": [],
    "other": []
  },
  "projects": [
    {
      "name": "",
      "description": "",
      "role": "",
      "highlights": [],
      "technologies": [],
      "url": "",
      "repo": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "period": "",
      "details": ""
    }
  ],
  "languages": [
    { "language": "", "level": "" }
  ],
  "availability": {
    "status": "",
    "roles": [],
    "location_preference": "",
    "notice_period": ""
  }
}
```

### config.json

```json
{
  "llm": {
    "provider": "anthropic",
    "model": "claude-haiku-4-5-20251001",
    "maxTokens": 1024,
    "temperature": 0.7
  },
  "chat": {
    "tone": "friendly",
    "systemPromptExtra": "",
    "welcomeMessage": "",
    "suggestedQuestions": []
  },
  "rateLimit": {
    "maxMessagesPerSession": 20,
    "maxSessionsPerDay": 100,
    "cooldownMessage": ""
  },
  "theme": {
    "primaryColor": "#60a5fa",
    "mode": "dark"
  }
}
```

## UI Layout

**Sidebar + Chat layout:**

- Left sidebar (~280px): profile avatar/name/title, skills tags, external links (GitHub, LinkedIn, etc.), "Fork this" button
- Main area: full chat interface with streaming responses
- Mobile: sidebar collapses into a slide-out drawer triggered by a hamburger icon
- Suggested question chips displayed in the chat area before the first message

## Conversation Behavior

- **Tone:** Configurable via `config.json` — maps to a modifier in the system prompt. Options: professional, friendly, witty, casual.
- **Knowledge boundary:** Bot answers strictly from CV data. When it can make reasonable inferences about related skills, it does so transparently ("Franco hasn't listed GraphQL specifically, but his React and API experience suggests...").
- **Out of scope:** Questions unrelated to the CV owner get a polite redirect with contact information.
- **Conversation cap:** Last 10 messages sent to the LLM. Older messages are dropped to bound token cost.

## Security

### API Key Protection
- API key in Vercel environment variables only — never in the repo
- All LLM calls proxied through the serverless function
- `.env.example` documents required vars without values

### Rate Limiting
- Per-IP session limits (configurable)
- Global daily cap tracked via Vercel KV (free tier) — persists across serverless invocations
- Configurable cooldown message + contact info when limits hit

### Input Validation
- Max message length: 500 characters (client + server)
- System prompt never exposed to client
- Conversation history capped at 10 messages

### Prompt Injection Mitigation
- CV data injected as tool responses, not user message content
- System prompt restricts bot to CV-related questions only
- No code execution, no external URL access, no actions beyond reading CV data

### Open Source Safety
- No secrets in repo
- `.gitignore` covers `.env`, `.env.local`, `.superpowers/`
- Forkers use their own API keys via their own Vercel env vars

### Not in Scope
- No user authentication (visitors are anonymous)
- No data persistence (no database, no analytics)
- No PII collection from visitors

## Token Optimization

- **Sliding context window:** Only last 10 messages sent to LLM
- **Lean tool responses:** Tools return filtered data, not the entire CV
- **Response cap:** Max 1024 tokens per response
- **Cheap model default:** Claude Haiku as default — quality enough for Q&A, fraction of the cost
- **SSE streaming:** Perceived instant responses without waiting for full generation

## Deployment

- **Hosting:** Vercel (free Hobby tier)
- **Serverless function:** `/api/chat` — handles LLM proxy, rate limiting, tool execution
- **Fork model:** Fork repo → edit `cv-data.json` + `config.json` → deploy to Vercel → set API key in Vercel dashboard
- **One-click deploy:** Deploy button in README for instant forking

## Tech Stack

- React 18+
- TypeScript
- Vite (build tool)
- Vercel (hosting + serverless)
- Tailwind CSS (utility-first, fast to iterate, well-known in the React ecosystem)
- Vercel AI SDK (provider-agnostic LLM streaming — handles SSE, tool-calling, and multi-provider support out of the box)

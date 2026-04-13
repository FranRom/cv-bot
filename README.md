# CV Bot

An AI-powered chatbot that showcases your professional experience, skills, and projects through natural conversation. Instead of a static resume, recruiters and hiring managers can talk to your bot — ask about your tech stack, explore your projects, or dig into your experience.

The bot uses **LLM tool-calling** to query structured CV data, making it a real demonstration of agentic engineering — not just a wrapper around a prompt.

**Open source and forkable.** Swap in your own data, deploy to Vercel, and you have your own AI-powered CV in minutes.

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

- **Animated robot avatar** that talks while the bot is streaming responses
- **Sidebar** with quick-glance profile info, skills tags, interests, and links
- **Markdown rendering** in bot responses (lists, bold, links, headings)
- **Suggested questions** to guide visitors who don't know what to ask
- **Rate limiting** to protect your API budget (per-session + daily caps)
- **Configurable LLM provider** — Claude, OpenAI, or Gemini
- **Configurable tone** — professional, friendly, witty, or casual
- **Mobile responsive** — sidebar collapses into a drawer on small screens
- **Dark theme** with customizable accent color

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| AI | Vercel AI SDK (streaming, tool-calling, multi-provider) |
| Backend | Vercel Edge Functions |
| Schema | Zod 4 |
| Testing | Vitest, React Testing Library |

## Project Structure

```
cv-bot/
├── api/
│   └── chat.ts                  # Vercel Edge function — LLM proxy + tool execution
├── data/
│   ├── cv-data.json             # Your CV data (edit this)
│   └── config.json              # App config (provider, tone, rate limits, theme)
├── server/
│   ├── tools.ts                 # LLM tool definitions (Zod schemas + executors)
│   ├── system-prompt.ts         # System prompt builder with tone modifiers
│   ├── provider.ts              # Multi-provider LLM router
│   ├── rate-limiter.ts          # IP-based rate limiting
│   ├── cv-data.ts               # CV data query functions
│   └── api-dev-plugin.ts        # Vite plugin for local API development
├── src/
│   ├── components/
│   │   ├── chat/                # ChatContainer, MessageBubble, ChatInput,
│   │   │                        # RobotAvatar, TypingIndicator, SuggestedQuestions
│   │   ├── sidebar/             # Sidebar, ProfileCard, SkillsTags, ExternalLinks
│   │   └── layout/              # AppLayout (responsive grid + mobile drawer)
│   ├── lib/
│   │   ├── types.ts             # Shared TypeScript types
│   │   └── config.ts            # Config loader
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── avatar.jpg               # Your profile photo
│   └── robot-*.png              # Robot avatar frames (idle, talking)
└── __tests__/                   # Unit tests for server logic + components
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
| `chat.tone` | `"professional"`, `"friendly"`, `"witty"`, `"casual"` | Bot personality |
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
| `npm run dev` | Start dev server (frontend + API) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

## Security

- API key lives exclusively in environment variables — never in the repo
- All LLM calls proxied through the serverless function
- Rate limiting prevents abuse (per-IP session limits + global daily cap)
- Input validation: max 500 character messages, conversation history capped at 10 messages
- System prompt instructs the bot to only answer CV-related questions
- No user data collection, no database, no analytics

## Cost

Running this costs very little:

- **Vercel hosting**: Free (Hobby tier)
- **LLM API**: ~$0.01-0.05 per conversation with Claude Haiku
- **Estimated monthly**: $3-15 for moderate traffic (10-20 visitors/day)

Rate limiting in `config.json` lets you cap your daily spend.

## License

MIT

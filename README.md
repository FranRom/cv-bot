# CV Bot

An AI-powered chatbot that showcases your professional experience, skills, and projects. Built with React 19, TypeScript, and the Vercel AI SDK.

Visitors (recruiters, hiring managers) can have a natural conversation with your bot to learn about you. The bot uses LLM tool-calling to surface structured data from your CV.

## Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffranrom%2Fcv-bot&env=ANTHROPIC_API_KEY&envDescription=Your%20LLM%20API%20key&project-name=cv-bot&repository-name=cv-bot)

1. Click the button above (or fork this repo)
2. Edit `data/cv-data.json` with your information
3. Edit `data/config.json` to set your preferred LLM provider and tone
4. Set your API key in Vercel environment variables

## Local Development

```bash
npm install
cp .env.example .env.local
# Add your API key to .env.local
npm run dev
```

## Configuration

### `data/cv-data.json`

Your CV data — profile, experience, skills, projects, education, availability.

### `data/config.json`

- **llm.provider**: `"anthropic"` | `"openai"` | `"google"`
- **llm.model**: Model ID (e.g., `"claude-haiku-4-5-20251001"`)
- **chat.tone**: `"professional"` | `"friendly"` | `"witty"` | `"casual"`
- **chat.suggestedQuestions**: Starter questions shown to visitors
- **rateLimit**: Per-session and daily caps to control costs
- **theme.mode**: `"dark"` | `"light"` | `"system"`

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- Vercel AI SDK (streaming, tool-calling, multi-provider)
- Vercel Edge Functions

## License

MIT

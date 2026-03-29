# PodCraft

AI-generated podcasts, tailored to you. Describe your ideal podcast and PodCraft generates it — topic research, script writing, and natural voice recording, all in under a minute.

## Quick start

```bash
# Install dependencies
npm install

# Add your API keys to .env.local
cp .env.local.example .env.local
# Edit .env.local with your keys

# Run locally
npm run dev
```

Open http://localhost:3000

## API keys needed

| Key | Sign up | Free tier |
|-----|---------|-----------|
| Anthropic | https://console.anthropic.com/ | Pay-per-use (~$0.003/script) |
| ElevenLabs | https://elevenlabs.io/ | 10,000 chars/month |
| NewsAPI | https://newsapi.org/ | 100 requests/day (optional) |

## How it works

1. Enter a topic (e.g. "Limerick GAA hurling results")
2. Pick a style (news briefing, deep dive, casual chat, storytelling)
3. Choose length and voice
4. PodCraft fetches relevant articles, writes a script with Claude, and records it with ElevenLabs
5. Listen in the built-in player

## Docs

* [PRD](docs/PRD.md) — product requirements and roadmap
* [Architecture](docs/ARCHITECTURE.md) — technical design and project structure

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/timothyglynn-personal/podcraft)

Add `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY`, and `NEWS_API_KEY` as environment variables in Vercel project settings. For production audio storage, add a Vercel Blob store and set `BLOB_READ_WRITE_TOKEN`.

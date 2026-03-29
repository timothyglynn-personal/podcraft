# PodCraft architecture

**@timothyglynn | Last updated: Mar 29, 2026**

---

## Pipeline

```
User input (topic, style, length, voice)
    │
    ▼
/api/ingest ──── NewsAPI ──── Articles[]
    │
    ▼
/api/generate-script ──── Claude Haiku ──── PodcastScript
    │
    ▼
/api/generate-audio ──── ElevenLabs TTS ──── MP3 buffer
    │                         │
    │                         ▼
    │                    Store to filesystem (dev) / Vercel Blob (prod)
    │
    ▼
Redirect to /podcast/[id] ──── Audio player + script viewer
```

## Project structure

```
podcraft/
  docs/
    PRD.md                       # Product requirements
    ARCHITECTURE.md              # This file
  src/
    app/
      layout.tsx                 # Root layout, meta tags, Tailwind
      page.tsx                   # Home: podcast creation form + recent podcasts
      podcast/[id]/page.tsx      # Player page for a generated podcast
      api/
        ingest/route.ts          # Fetch articles from NewsAPI
        generate-script/route.ts # Claude generates podcast script
        generate-audio/route.ts  # ElevenLabs TTS + storage
        podcasts/route.ts        # List generated podcasts
    lib/
      types.ts                   # Shared TypeScript types
      news.ts                    # NewsAPI client
      claude.ts                  # Claude API wrapper + system prompt
      elevenlabs.ts              # ElevenLabs TTS wrapper
      blob.ts                    # Storage abstraction (local fs for dev)
    components/
      PodcastForm.tsx            # Topic input, style/length/accent selectors
      AudioPlayer.tsx            # HTML5 audio with custom controls
      GeneratingStatus.tsx       # Pipeline progress indicator
      PodcastCard.tsx            # Card for a generated podcast
```

## Key design decisions

* **No auth for MVP** — podcasts stored with public URLs
* **No database** — metadata stored as JSON files alongside MP3s
* **Claude Haiku for speed** — scripts generate in 2-3 seconds
* **ElevenLabs `eleven_multilingual_v2`** — best accent support
* **5,000 char limit awareness** — scripts split at sentence boundaries for longer podcasts
* **Local storage for dev** — `public/podcasts/` dir, no Vercel Blob token needed
* **localStorage for library** — client-side podcast history, no backend needed

## Environment variables

| Variable | Required | Source |
|----------|----------|--------|
| `ANTHROPIC_API_KEY` | Yes | https://console.anthropic.com/ |
| `ELEVENLABS_API_KEY` | Yes | https://elevenlabs.io/ |
| `NEWS_API_KEY` | Optional | https://newsapi.org/ (falls back to generated content) |
| `BLOB_READ_WRITE_TOKEN` | Prod only | Vercel Blob storage (not needed for local dev) |

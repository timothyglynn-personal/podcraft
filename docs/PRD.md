# PodCraft: AI Podcast Generator

**@timothyglynn | Last updated: Mar 29, 2026**

---

## Problem

Tim's dad is an Irish man in Limerick who reads newspapers but would listen to a podcast if one existed for him — about hurling, rugby, local news — in an Irish accent. No such podcast exists.

The insight: AI can generate hyper-specific, locale-tailored audio content at scale. This app lets anyone describe their ideal podcast and get it generated automatically.

## Tech stack

| Layer | Tool | Why |
|-------|------|-----|
| Framework | Next.js 15 (App Router) | Mobile-friendly, API routes built in, deploys to Vercel in one click |
| Styling | Tailwind CSS | Fast to build, responsive by default |
| Script generation | Claude API (Haiku) | Fast, cheap (~$0.003/script), great at conversational writing |
| Text-to-speech | ElevenLabs API | Best accent support (Irish, British, etc.), natural multi-voice |
| Content ingestion | NewsAPI + RSS | Free tier for MVP, no scraping complexity |
| Audio storage | Local filesystem (dev), Vercel Blob (prod) | Zero config for dev, CDN included for prod |
| Voice input (Phase 2) | OpenAI Whisper | Accurate, cheap ($0.006/min) |

**Cost:** Effectively $0/month on free tiers for low usage. Primary cost driver at scale is ElevenLabs TTS.

## Phased roadmap

### Phase 1: MVP (complete)
Core loop: type a topic, fetch content, generate script, generate audio, play it.

### Phase 2: Demo-ready (this week)
Voice input, Irish accent selection with previews, PWA install, podcast library, polished mobile UI.

### Phase 3: Subscriptions
User accounts (NextAuth), database (Vercel Postgres), saved podcast subscriptions, scheduled generation via cron.

### Phase 4: Source management and feedback
Dedicated source management page, feedback after listening, learning loop where Claude adapts to preferences.

### Phase 5: Distribution
RSS feed output for Apple Podcasts/Spotify, share links, multi-host format (two AI voices).

### Phase 6: Native mobile app
React Native with Expo, background audio, push notifications, offline playback.

### Phase 7: Scale and monetization
Cost optimization, caching, freemium model, analytics.

## Target users

* People who want podcasts about niche/local topics that don't exist
* Non-technical users who want to describe a podcast and have it generated
* Anyone who wants a quick audio summary of a topic

## Success metrics

* End-to-end generation time under 60 seconds for a 3-minute podcast
* Audio quality indistinguishable from a real podcast on first listen
* Dad actually listens to it

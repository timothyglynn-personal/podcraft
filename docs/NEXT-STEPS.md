# PodCraft next steps

**@timothyglynn | Last updated: Mar 29, 2026**

---

## Completed (Phase 1 MVP + extras)

* [x] Core pipeline: topic -> news ingestion -> Claude script -> ElevenLabs TTS -> audio playback
* [x] Two-step creation flow (describe podcast, then add context/sources)
* [x] 46 voices across 13 accents (Irish first, then British, Scottish, Welsh, Australian, American, Indian, Nigerian, French, German, Italian, Spanish, Swedish)
* [x] URL scraping for any article link
* [x] YouTube transcript extraction
* [x] RSS feed support (RTE, The42, BBC) for production — no NewsAPI dependency
* [x] Anti-hallucination prompt engineering (source-constrained facts)
* [x] Vercel deployment with private Blob storage
* [x] Local dev with filesystem storage (no Blob token needed)
* [x] Mobile-responsive UI
* [x] localStorage podcast library

## Known issues to fix first

* [ ] **Audio playback on Vercel** — private Blob proxy may still have issues. Test and confirm the `/api/audio/[id]` proxy works end-to-end on the deployed site. If not, consider switching to a public Blob store.
* [ ] **ElevenLabs shared voices** — shared library voices may require "adding" to the account first. Test each Irish voice and remove any that return 401/403.

## Phase 2: Demo-ready (next session)

* [ ] **Voice preview** — small play button next to each voice in the dropdown that plays a 5-second sample before committing to a full podcast
* [ ] **Script review step** — after generating the script, show it for review before generating audio (saves ElevenLabs credits). "Edit & Generate Audio" or "Regenerate Script" buttons.
* [ ] **PWA support** — manifest.json, service worker, "Add to Home Screen" on iOS/Android so it feels like a native app
* [ ] **Loading skeleton** — better loading states when the page first loads
* [ ] **Error recovery** — if audio generation fails, allow retrying just the audio step (don't re-generate the script)

## Phase 3: Subscriptions

* [ ] **User accounts** — NextAuth with Google/email login
* [ ] **Database** — Vercel Postgres for user data, podcast metadata, subscriptions
* [ ] **Saved podcast subscriptions** — "I want a daily briefing about Limerick GAA" saved to profile
* [ ] **Scheduled generation** — Vercel cron generates subscribed podcasts on schedule (daily, weekly)
* [ ] **Email/push notification** — "Your podcast is ready" when scheduled generation completes

## Phase 4: Source management and feedback

* [ ] **Dedicated source management page** — save favorite RSS feeds, YouTube channels, article sources
* [ ] **Post-listen feedback** — thumbs up/down after listening, with optional text
* [ ] **Learning loop** — Claude adapts style/tone based on accumulated feedback
* [ ] **Source quality scoring** — track which sources produce the best content

## Phase 5: Distribution

* [ ] **RSS feed output** — generate a valid podcast RSS feed so users can subscribe in Apple Podcasts, Spotify, etc.
* [ ] **Share links** — shareable URL for any generated podcast
* [ ] **Multi-host format** — two AI voices having a conversation (requires ElevenLabs voice switching)
* [ ] **Podcast cover art** — auto-generated cover image for each episode

## Phase 6: Native mobile app

* [ ] **React Native with Expo** — native iOS/Android app
* [ ] **Background audio** — keep playing when app is minimized
* [ ] **Push notifications** — "Your daily podcast is ready"
* [ ] **Offline playback** — download episodes for offline listening

## Phase 7: Scale and monetization

* [ ] **Cost optimization** — cache popular topics, reuse scripts for similar requests
* [ ] **Freemium model** — free tier with limits, paid tier for more/longer podcasts
* [ ] **Analytics** — track what topics are popular, listen-through rates
* [ ] **Multi-language** — generate podcasts in other languages (ElevenLabs supports many)

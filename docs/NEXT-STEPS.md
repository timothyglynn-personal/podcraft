# PodCraft next steps

**@timothyglynn | Last updated: Apr 21, 2026**

---

## Completed

* [x] Core pipeline: topic -> news ingestion -> Claude script -> ElevenLabs TTS -> audio playback
* [x] Multi-page creation flow with source suggestions, voice selection
* [x] 46 voices across 13 accents
* [x] URL scraping, YouTube transcripts, RSS feeds
* [x] Anti-hallucination prompt engineering
* [x] Vercel deployment with private Blob storage
* [x] Mobile-responsive UI with dark theme
* [x] localStorage podcast library
* [x] PWA support with service worker
* [x] Capacitor iOS setup
* [x] **Stripe Projects initialized** — Supabase provisioned for database + auth
* [x] **Database schema** — 8 tables via Drizzle ORM, deployed to Supabase via pooler connection
* [x] **Auth.js v5** — Sign in with Apple + email magic links (Resend provider)
* [x] **Sign-in pages** — `/auth/signin` and `/auth/verify`, with session redirect
* [x] **Subscription model** — frequency selector (one-time / daily / weekly) on ExtraSourcesPage
* [x] **Subscriptions API** — CRUD at `/api/subscriptions`
* [x] **Server-side generation** — `src/lib/generate-podcast.ts` shared by interactive flow and cron
* [x] **Vercel Cron** — `/api/cron/generate-subscriptions` runs daily at 6am
* [x] **Push notifications** — Capacitor plugin + APNs sender + device token registration
* [x] **Email notifications** — Resend integration, "Your daily podcast is ready"
* [x] **Enhanced profile** — Subscriptions tab with episode history, pause/cancel
* [x] **App Store prep** — privacy policy, terms of service, universal links, Info.plist updates
* [x] **Generation bug fixes** — scriptRes.ok check, ElevenLabs timeout, error display on GeneratingPage with retry/back buttons
* [x] **Share menu** — copy link, WhatsApp, email sharing on PlayerPage and podcast detail page
* [x] **Sign-in flow for subscriptions** — sign-in button when selecting daily/weekly, proper button labels
* [x] **Notification preferences** — setup card after subscription creation, toggles in profile settings
* [x] **Persistent profile button** — visible on every page (top-right corner)
* [x] **Sign in/out from profile** — sign-in prompt for anonymous users, sign-out button for authenticated
* [x] **Editable profile fields** — name, location, origin editable in Settings tab, syncs to DB
* [x] **localStorage-to-DB sync** — WelcomePage and Settings save to both localStorage and database
* [x] **Voice feedback fallback** — text input shown on browsers without Speech Recognition API
* [x] **Podcast not found page** — proper error state instead of infinite spinner
* [x] **Debug endpoint removed** — auth-debug route deleted for security
* [x] **Feedback learning loop** — user feedback summarized and passed as context to Claude for future episodes

## Current deployment

* **URL:** https://podcraft-mocha.vercel.app
* **Vercel project:** timothy-glynns-projects/podcraft-mocha
* **Database:** Supabase (provisioned via Stripe Projects), connected via transaction pooler
* **Email:** Resend free tier (sandbox sender, delivers only to account email)
* **Auth:** Email magic links working, Sign in with Apple not yet configured

## Before App Store submission

### Must do

1. **Apple Developer Account** — Enroll at developer.apple.com ($99/year)
2. **Replace TEAMID** in `public/.well-known/apple-app-site-association` with actual Apple Team ID
3. **Sign in with Apple** — Configure in Apple Developer Console, add `APPLE_CLIENT_ID` and `APPLE_CLIENT_SECRET` to Vercel env vars (required by App Store if any third-party sign-in is offered)
4. **APNs key** — Create .p8 key for push notifications, add `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_KEY` to Vercel env vars
5. **Rotate Supabase credentials** — Database password is in git history from early commits. Rotate via Supabase dashboard and update Vercel env var.
6. **Resend domain verification** — Verify a custom sending domain (e.g. podcraft.app) so emails can be sent to any address, not just the account email
7. **App icon** — 1024x1024 PNG (no alpha, no rounded corners)
8. **Screenshots** — iPhone 6.7" (1290x2796) and 6.5" (1284x2778), minimum 3 per size
9. **Xcode build** — Open `ios/App/App.xcworkspace`, set signing identity, version 1.0.0/build 1, archive, upload to App Store Connect
10. **App Store Connect** — Create app, category Entertainment, age rating 4+, privacy policy URL, submit for review

### Should do

* **Upgrade ElevenLabs plan** — free tier (10K chars/month) is insufficient for regular use. Starter plan is $5/mo for 30K credits.
* **Vercel Pro plan** — Hobby plan has 10s cron timeout, may need Pro ($20/mo) for subscription generation
* **Podcast not found timeout** — currently shows spinner until server responds; could add a client-side timeout

## Future phases (after App Store launch)

* [ ] Voice preview — play 5-second sample before committing
* [ ] Script review step — edit before generating audio
* [ ] RSS feed output — subscribe in Apple Podcasts / Spotify
* [ ] Multi-host format — two AI voices in conversation
* [ ] Offline playback — download episodes
* [ ] Analytics — PostHog via `stripe projects add posthog`
* [ ] Freemium monetization

## Key files reference

* Database schema: `src/lib/db/schema.ts`
* Database client: `src/lib/db/index.ts` (lazy init, pooler-compatible with `prepare: false`)
* Auth config: `src/lib/auth.ts` (lazy init, Resend provider)
* Safe auth wrapper: `src/lib/safe-auth.ts`
* Subscription API: `src/app/api/subscriptions/route.ts`
* Cron generation: `src/app/api/cron/generate-subscriptions/route.ts`
* Server-side generation: `src/lib/generate-podcast.ts`
* Push notifications: `src/lib/push.ts` (client), `src/lib/apns.ts` (server)
* Email: `src/lib/email.ts`
* Frequency selector: `src/components/flow/ExtraSourcesPage.tsx`
* Profile: `src/components/ProfileView.tsx`
* Share menu: `src/components/ShareMenu.tsx`
* Flow container (persistent profile button): `src/components/flow/FlowContainer.tsx`
* Stripe Projects state: `.projects/state.json`

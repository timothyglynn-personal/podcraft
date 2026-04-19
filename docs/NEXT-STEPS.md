# PodCraft next steps

**@timothyglynn | Last updated: Apr 18, 2026**

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
* [x] **Database schema** — 8 tables (users, accounts, sessions, verification_tokens, user_preferences, podcasts, subscriptions, feedback, device_tokens) via Drizzle ORM
* [x] **Auth.js v5** — Sign in with Apple + email magic links (Resend)
* [x] **Sign-in pages** — `/auth/signin` and `/auth/verify`
* [x] **Subscription model** — frequency selector (one-time / daily / weekly) on ExtraSourcesPage
* [x] **Subscriptions API** — CRUD at `/api/subscriptions`
* [x] **Server-side generation** — `src/lib/generate-podcast.ts` shared by interactive flow and cron
* [x] **Vercel Cron** — `/api/cron/generate-subscriptions` runs daily at 6am
* [x] **Push notifications** — Capacitor plugin + APNs sender + device token registration
* [x] **Email notifications** — Resend integration, "Your daily podcast is ready"
* [x] **Enhanced profile** — Subscriptions tab with episode history, pause/cancel
* [x] **App Store prep** — privacy policy, terms of service, universal links, Info.plist updates

## Deployment checklist (pick up from here)

All code is committed and pushed. These are configuration and deployment steps:

### 1. Push the database schema
* Open Supabase SQL Editor: `stripe projects open supabase`
* Paste the contents of `drizzle/0000_init.sql` and execute

### 2. Generate auth secret
* Run: `openssl rand -base64 32`
* Save the output — you'll need it for Vercel

### 3. Set Vercel environment variables
Add these in Vercel dashboard (Settings > Environment Variables):
```
NEXTAUTH_SECRET=<from step 2>
NEXTAUTH_URL=https://podcraft.vercel.app
RESEND_API_KEY=<from resend.com>
SUPABASE_DB_URL=<from stripe projects env>
```

### 4. Set up Resend
* Create account at resend.com
* Verify a sending domain (or use their sandbox for testing)
* Copy the API key to Vercel env vars

### 5. Deploy and test auth
* Push triggers auto-deploy on Vercel
* Test: sign in with email, create a podcast, verify it persists after sign-out/in
* Test: create a "daily" subscription, check the database for the subscription record

### 6. Apple Developer Account
* Enroll at developer.apple.com ($99/year)
* Create App ID: `com.podcraft.app`
* Create provisioning profiles (Development + Distribution)

### 7. Sign in with Apple
* Configure in Apple Developer Console > Certificates, Identifiers & Profiles > Services
* Get client ID and generate client secret (JWT)
* Add `APPLE_CLIENT_ID` and `APPLE_CLIENT_SECRET` to Vercel env vars

### 8. APNs for push notifications
* Create a .p8 key in Apple Developer Console > Keys
* Base64-encode it: `base64 -i AuthKey_XXXXXX.p8`
* Add to Vercel: `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_KEY`

### 9. Update universal links
* Edit `public/.well-known/apple-app-site-association`
* Replace `TEAMID` with your actual Apple Team ID
* Commit and push

### 10. App Store assets
* App icon: 1024x1024 PNG (no alpha, no rounded corners)
* Screenshots: iPhone 6.7" (1290x2796) and 6.5" (1284x2778) — minimum 3 per size
* Optional: 15-30 second app preview video

### 11. Xcode build and upload
* Open `ios/App/App.xcworkspace` in Xcode
* Set signing identity and provisioning profile
* Set Marketing Version: 1.0.0, Build: 1
* Product > Archive > Distribute App > App Store Connect > Upload

### 12. App Store Connect submission
* Create new app at appstoreconnect.apple.com
* Bundle ID: `com.podcraft.app`
* Category: Entertainment (secondary: News)
* Age Rating: 4+
* Pricing: Free
* Privacy Policy URL: `https://podcraft.vercel.app/privacy`
* Data privacy labels: email (Account), name/location (Functionality), usage data (Analytics)
* Select the uploaded build, write "What's New", submit for review

## Risks

* **Vercel Hobby plan** has 10s cron timeout — may need Pro ($20/mo) for subscription generation
* **ElevenLabs free tier** is 10K chars/month — multiple daily subscriptions will exceed this
* **First App Store submission** often gets rejected for minor issues, budget 3-5 extra days

## Future phases (after App Store launch)

* [ ] Voice preview — play 5-second sample before committing
* [ ] Script review step — edit before generating audio
* [ ] RSS feed output — subscribe in Apple Podcasts / Spotify
* [ ] Multi-host format — two AI voices in conversation
* [ ] Offline playback — download episodes
* [ ] Analytics — PostHog via `stripe projects add posthog`
* [ ] Freemium monetization

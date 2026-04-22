-- Drop old tables and recreate with correct schema for Auth.js
-- Auth.js requires specific table names and column names

DROP TABLE IF EXISTS device_tokens CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS podcasts CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Auth.js tables (must match @auth/drizzle-adapter defaults)
CREATE TABLE "user" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  location TEXT,
  origin TEXT,
  image TEXT,
  "emailVerified" TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "account" (
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  PRIMARY KEY (provider, "providerAccountId")
);

CREATE TABLE "session" (
  "sessionToken" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);

CREATE TABLE "verificationToken" (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- App tables
CREATE TABLE user_preferences (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  default_style TEXT DEFAULT 'news-briefing',
  default_length INTEGER DEFAULT 5,
  default_accent TEXT DEFAULT 'american',
  default_voice_id TEXT DEFAULT '',
  notify_push BOOLEAN DEFAULT true,
  notify_email BOOLEAN DEFAULT true
);

CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  style TEXT NOT NULL,
  length_minutes INTEGER NOT NULL,
  voice_id TEXT NOT NULL,
  accent TEXT NOT NULL,
  frequency TEXT NOT NULL,
  weekly_day INTEGER,
  suggested_sources JSONB DEFAULT '[]',
  additional_urls TEXT DEFAULT '',
  additional_context TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  last_generated_at TIMESTAMP,
  next_due_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE podcasts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES "user"(id),
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  style TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  script_text TEXT,
  sources JSONB DEFAULT '[]',
  duration_seconds INTEGER,
  subscription_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES "user"(id),
  podcast_id TEXT REFERENCES podcasts(id),
  quick_tags JSONB DEFAULT '[]',
  text_feedback TEXT,
  voice_transcript TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE device_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT DEFAULT 'ios',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_podcasts_user_id ON podcasts(user_id);
CREATE INDEX idx_podcasts_subscription_id ON podcasts(subscription_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_next_due ON subscriptions(next_due_at) WHERE active = true;
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_accounts_user_id ON account("userId");
CREATE INDEX idx_sessions_user_id ON session("userId");

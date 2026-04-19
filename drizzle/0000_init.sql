-- PodCraft database schema
-- Run against your Supabase Postgres instance

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Auth.js tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT,
  location TEXT,
  origin TEXT,
  image TEXT,
  email_verified TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMP NOT NULL
);

-- App tables
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  default_style TEXT DEFAULT 'news-briefing',
  default_length INTEGER DEFAULT 5,
  default_accent TEXT DEFAULT 'american',
  default_voice_id TEXT DEFAULT '',
  notify_push BOOLEAN DEFAULT true,
  notify_email BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS podcasts (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  style TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  script_text TEXT,
  sources JSONB DEFAULT '[]',
  duration_seconds INTEGER,
  subscription_id UUID REFERENCES subscriptions(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  podcast_id TEXT REFERENCES podcasts(id),
  quick_tags JSONB DEFAULT '[]',
  text_feedback TEXT,
  voice_transcript TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT DEFAULT 'ios',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_podcasts_user_id ON podcasts(user_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_subscription_id ON podcasts(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_due ON subscriptions(next_due_at) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

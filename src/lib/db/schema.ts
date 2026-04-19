import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique(),
  name: text("name"),
  location: text("location"),
  origin: text("origin"),
  image: text("image"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: text("session_token").notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  defaultStyle: text("default_style").default("news-briefing"),
  defaultLength: integer("default_length").default(5),
  defaultAccent: text("default_accent").default("american"),
  defaultVoiceId: text("default_voice_id").default(""),
  notifyPush: boolean("notify_push").default(true),
  notifyEmail: boolean("notify_email").default(true),
});

export const podcasts = pgTable("podcasts", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  title: text("title").notNull(),
  topic: text("topic").notNull(),
  style: text("style").notNull(),
  audioUrl: text("audio_url").notNull(),
  scriptText: text("script_text"),
  sources: jsonb("sources").default([]),
  durationSeconds: integer("duration_seconds"),
  subscriptionId: uuid("subscription_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(),
  style: text("style").notNull(),
  lengthMinutes: integer("length_minutes").notNull(),
  voiceId: text("voice_id").notNull(),
  accent: text("accent").notNull(),
  frequency: text("frequency").notNull(), // 'daily' | 'weekly'
  weeklyDay: integer("weekly_day"), // 0=Sun, 1=Mon, ..., 6=Sat
  suggestedSources: jsonb("suggested_sources").default([]),
  additionalUrls: text("additional_urls").default(""),
  additionalContext: text("additional_context").default(""),
  active: boolean("active").default(true),
  lastGeneratedAt: timestamp("last_generated_at", { mode: "date" }),
  nextDueAt: timestamp("next_due_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  podcastId: text("podcast_id").references(() => podcasts.id),
  quickTags: jsonb("quick_tags").default([]),
  textFeedback: text("text_feedback"),
  voiceTranscript: text("voice_transcript"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const deviceTokens = pgTable("device_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  platform: text("platform").default("ios"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

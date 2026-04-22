import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";

// Auth.js tables — must match @auth/drizzle-adapter expectations
export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique(),
  name: text("name"),
  location: text("location"),
  origin: text("origin"),
  image: text("image"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const accounts = pgTable("account", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => ({
  compositePk: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => ({
  compositePk: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  defaultStyle: text("default_style").default("news-briefing"),
  defaultLength: integer("default_length").default(5),
  defaultAccent: text("default_accent").default("american"),
  defaultVoiceId: text("default_voice_id").default(""),
  notifyPush: boolean("notify_push").default(true),
  notifyEmail: boolean("notify_email").default(true),
});

export const podcasts = pgTable("podcasts", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  title: text("title").notNull(),
  topic: text("topic").notNull(),
  style: text("style").notNull(),
  audioUrl: text("audio_url").notNull(),
  scriptText: text("script_text"),
  sources: jsonb("sources").default([]),
  durationSeconds: integer("duration_seconds"),
  subscriptionId: text("subscription_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id),
  podcastId: text("podcast_id").references(() => podcasts.id),
  quickTags: jsonb("quick_tags").default([]),
  textFeedback: text("text_feedback"),
  voiceTranscript: text("voice_transcript"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const deviceTokens = pgTable("device_tokens", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  platform: text("platform").default("ios"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

import { eq, and, lte } from "drizzle-orm";
import { db, users, userPreferences, podcasts, subscriptions, feedback, deviceTokens } from "./index";
import type { UserPreferences as ClientPreferences } from "@/lib/types";

// --- Users ---

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user || null;
}

export async function updateUserProfile(userId: string, data: { name?: string; location?: string; origin?: string }) {
  await db.update(users).set(data).where(eq(users.id, userId));
}

// --- Preferences ---

export async function getPreferences(userId: string) {
  const [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return prefs || null;
}

export async function upsertPreferences(userId: string, prefs: Partial<ClientPreferences> & { notifyPush?: boolean; notifyEmail?: boolean }) {
  const existing = await getPreferences(userId);
  const data = {
    defaultStyle: prefs.defaultStyle,
    defaultLength: prefs.defaultLength,
    defaultAccent: prefs.defaultAccent,
    defaultVoiceId: prefs.defaultVoiceId,
    notifyPush: prefs.notifyPush,
    notifyEmail: prefs.notifyEmail,
  };

  if (existing) {
    await db.update(userPreferences).set(data).where(eq(userPreferences.userId, userId));
  } else {
    await db.insert(userPreferences).values({ userId, ...data });
  }
}

// --- Podcasts ---

export async function savePodcast(podcast: {
  id: string;
  userId?: string;
  title: string;
  topic: string;
  style: string;
  audioUrl: string;
  scriptText?: string;
  sources?: unknown[];
  durationSeconds?: number;
  subscriptionId?: string;
}) {
  await db.insert(podcasts).values({
    id: podcast.id,
    userId: podcast.userId || undefined,
    title: podcast.title,
    topic: podcast.topic,
    style: podcast.style,
    audioUrl: podcast.audioUrl,
    scriptText: podcast.scriptText || null,
    sources: podcast.sources || [],
    durationSeconds: podcast.durationSeconds || null,
    subscriptionId: podcast.subscriptionId || null,
  });
}

export async function getUserPodcasts(userId: string) {
  return db.select().from(podcasts).where(eq(podcasts.userId, userId)).orderBy(podcasts.createdAt);
}

export async function getPodcastById(id: string) {
  const [podcast] = await db.select().from(podcasts).where(eq(podcasts.id, id)).limit(1);
  return podcast || null;
}

export async function getSubscriptionPodcasts(subscriptionId: string) {
  return db.select().from(podcasts).where(eq(podcasts.subscriptionId, subscriptionId)).orderBy(podcasts.createdAt);
}

// --- Subscriptions ---

export async function createSubscription(sub: {
  userId: string;
  topic: string;
  style: string;
  lengthMinutes: number;
  voiceId: string;
  accent: string;
  frequency: string;
  weeklyDay?: number;
  suggestedSources?: unknown[];
  additionalUrls?: string;
  additionalContext?: string;
  nextDueAt: Date;
}) {
  const [created] = await db.insert(subscriptions).values({
    userId: sub.userId,
    topic: sub.topic,
    style: sub.style,
    lengthMinutes: sub.lengthMinutes,
    voiceId: sub.voiceId,
    accent: sub.accent,
    frequency: sub.frequency,
    weeklyDay: sub.weeklyDay ?? null,
    suggestedSources: sub.suggestedSources || [],
    additionalUrls: sub.additionalUrls || "",
    additionalContext: sub.additionalContext || "",
    nextDueAt: sub.nextDueAt,
  }).returning();
  return created;
}

export async function getUserSubscriptions(userId: string) {
  return db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).orderBy(subscriptions.createdAt);
}

export async function getDueSubscriptions() {
  return db.select().from(subscriptions).where(
    and(eq(subscriptions.active, true), lte(subscriptions.nextDueAt, new Date()))
  );
}

export async function updateSubscription(id: string, data: Partial<{
  active: boolean;
  lastGeneratedAt: Date;
  nextDueAt: Date;
}>) {
  await db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
}

export async function deactivateSubscription(id: string) {
  await db.update(subscriptions).set({ active: false }).where(eq(subscriptions.id, id));
}

// --- Feedback ---

export async function saveFeedback(data: {
  userId?: string;
  podcastId: string;
  quickTags: string[];
  textFeedback?: string;
  voiceTranscript?: string;
}) {
  await db.insert(feedback).values({
    userId: data.userId || undefined,
    podcastId: data.podcastId,
    quickTags: data.quickTags,
    textFeedback: data.textFeedback || null,
    voiceTranscript: data.voiceTranscript || null,
  });
}

// --- Device Tokens ---

export async function saveDeviceToken(userId: string, token: string, platform: string = "ios") {
  await db.insert(deviceTokens).values({ userId, token, platform }).onConflictDoNothing();
}

export async function getUserDeviceTokens(userId: string) {
  return db.select().from(deviceTokens).where(eq(deviceTokens.userId, userId));
}

export async function removeDeviceToken(token: string) {
  await db.delete(deviceTokens).where(eq(deviceTokens.token, token));
}

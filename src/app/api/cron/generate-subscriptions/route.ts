import { NextRequest, NextResponse } from "next/server";
import { getDueSubscriptions, updateSubscription, getUserDeviceTokens, getPreferences, getUserById } from "@/lib/db/queries";
import { generatePodcastServerSide } from "@/lib/generate-podcast";
import { sendPodcastReadyEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/apns";

export const maxDuration = 300; // 5 minutes (requires Vercel Pro)

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await getDueSubscriptions();
  console.log(`[cron] Found ${subscriptions.length} due subscriptions`);

  const results: { id: string; status: string; podcastId?: string }[] = [];

  for (const sub of subscriptions) {
    try {
      // Generate the podcast
      const podcast = await generatePodcastServerSide({
        topic: sub.topic,
        style: sub.style,
        lengthMinutes: sub.lengthMinutes,
        voiceId: sub.voiceId,
        userId: sub.userId,
        subscriptionId: sub.id,
        additionalUrls: sub.additionalUrls || undefined,
        additionalContext: sub.additionalContext || undefined,
      });

      // Compute next due date
      const nextDueAt = computeNextDueAt(sub.frequency, sub.weeklyDay);

      await updateSubscription(sub.id, {
        lastGeneratedAt: new Date(),
        nextDueAt,
      });

      // Send notifications
      const prefs = await getPreferences(sub.userId);
      const user = await getUserById(sub.userId);

      // Push notification
      if (prefs?.notifyPush !== false) {
        const tokens = await getUserDeviceTokens(sub.userId);
        for (const { token } of tokens) {
          await sendPushNotification(token, {
            title: "Your podcast is ready",
            body: podcast.title,
            podcastId: podcast.id,
          });
        }
      }

      // Email notification
      if (prefs?.notifyEmail !== false && user?.email) {
        await sendPodcastReadyEmail(
          user.email,
          podcast.title,
          podcast.id,
          sub.frequency
        );
      }

      results.push({ id: sub.id, status: "success", podcastId: podcast.id });
      console.log(`[cron] Generated podcast ${podcast.id} for subscription ${sub.id}`);
    } catch (e) {
      console.error(`[cron] Failed for subscription ${sub.id}:`, e);
      results.push({ id: sub.id, status: "error" });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}

function computeNextDueAt(frequency: string, weeklyDay: number | null): Date {
  const now = new Date();
  if (frequency === "daily") {
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    next.setHours(6, 0, 0, 0);
    return next;
  }
  if (frequency === "weekly" && weeklyDay !== null) {
    const next = new Date(now);
    const currentDay = next.getDay();
    const daysUntil = (weeklyDay - currentDay + 7) % 7 || 7;
    next.setDate(next.getDate() + daysUntil);
    next.setHours(6, 0, 0, 0);
    return next;
  }
  // Fallback: tomorrow
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(6, 0, 0, 0);
  return next;
}

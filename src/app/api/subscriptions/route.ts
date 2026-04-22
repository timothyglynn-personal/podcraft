import { NextResponse } from "next/server";
import { safeAuth } from "@/lib/safe-auth";
import {
  createSubscription,
  getUserSubscriptions,
  deactivateSubscription,
  getSubscriptionPodcasts,
} from "@/lib/db/queries";

function computeNextDueAt(frequency: string, weeklyDay?: number): Date {
  const now = new Date();
  if (frequency === "daily") {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(6, 0, 0, 0); // 6am
    return tomorrow;
  }
  if (frequency === "weekly" && weeklyDay !== undefined) {
    const next = new Date(now);
    const currentDay = next.getDay();
    const daysUntil = (weeklyDay - currentDay + 7) % 7 || 7;
    next.setDate(next.getDate() + daysUntil);
    next.setHours(6, 0, 0, 0);
    return next;
  }
  throw new Error("Invalid frequency");
}

export async function GET() {
  const session = await safeAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const subs = await getUserSubscriptions(session.user.id);

  // Enrich with episode counts
  const enriched = await Promise.all(
    subs.map(async (sub) => {
      const episodes = await getSubscriptionPodcasts(sub.id);
      return { ...sub, episodes };
    })
  );

  return NextResponse.json({ subscriptions: enriched });
}

export async function POST(req: Request) {
  const session = await safeAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { topic, style, lengthMinutes, voiceId, accent, frequency, weeklyDay, suggestedSources, additionalUrls, additionalContext } = body;

  if (!topic || !style || !frequency) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const nextDueAt = computeNextDueAt(frequency, weeklyDay);

  const subscription = await createSubscription({
    userId: session.user.id,
    topic,
    style,
    lengthMinutes: lengthMinutes || 5,
    voiceId: voiceId || "",
    accent: accent || "american",
    frequency,
    weeklyDay,
    suggestedSources,
    additionalUrls,
    additionalContext,
    nextDueAt,
  });

  return NextResponse.json({ subscription });
}

export async function DELETE(req: Request) {
  const session = await safeAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing subscription id" }, { status: 400 });
  }

  await deactivateSubscription(id);
  return NextResponse.json({ success: true });
}

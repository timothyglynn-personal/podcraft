import { PodcastFeedback } from "./types";

const FEEDBACK_KEY = "podcraft-feedback";

export function saveFeedback(feedback: PodcastFeedback): void {
  if (typeof window === "undefined") return;
  const all = getAllFeedback();
  all.unshift(feedback);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all.slice(0, 100)));
}

export function getAllFeedback(): PodcastFeedback[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getFeedbackForPodcast(podcastId: string): PodcastFeedback | null {
  const all = getAllFeedback();
  return all.find((f) => f.podcastId === podcastId) || null;
}

export function getRecentFeedbackSummary(limit = 5): string {
  const all = getAllFeedback().slice(0, limit);
  if (all.length === 0) return "";

  const parts: string[] = [];

  // Aggregate quick tags
  const tagCounts: Record<string, number> = {};
  all.forEach((f) => {
    f.quickTags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag.replace(/-/g, " "));

  if (topTags.length > 0) {
    parts.push(`Common feedback: ${topTags.join(", ")}`);
  }

  // Include text feedback
  const textFeedback = all
    .filter((f) => f.textFeedback || f.voiceTranscript)
    .slice(0, 3)
    .map((f) => `"${(f.textFeedback || f.voiceTranscript).slice(0, 100)}"`)
    .join("; ");

  if (textFeedback) {
    parts.push(`Listener comments: ${textFeedback}`);
  }

  return parts.join(". ");
}

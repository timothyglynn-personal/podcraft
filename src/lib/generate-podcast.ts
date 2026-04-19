import { generateScript } from "@/lib/claude";
import { textToSpeech } from "@/lib/elevenlabs";
import { storeAudio, storeMetadata } from "@/lib/blob";
import { savePodcast } from "@/lib/db/queries";
import type { Article, Podcast } from "@/lib/types";

interface GenerateOptions {
  topic: string;
  style: string;
  lengthMinutes: number;
  voiceId: string;
  userId?: string;
  subscriptionId?: string;
  additionalUrls?: string;
  additionalContext?: string;
}

export async function generatePodcastServerSide(opts: GenerateOptions): Promise<Podcast> {
  let articles: Article[] = [];

  // Fetch from news sources
  try {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const ingestRes = await fetch(`${baseUrl}/api/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: opts.topic }),
    });
    const ingestData = await ingestRes.json();
    if (ingestData.articles) {
      articles = ingestData.articles;
    }
  } catch (e) {
    console.error("[generate-podcast] Ingest failed:", e);
  }

  // Parse additional URLs if provided
  if (opts.additionalUrls) {
    const urls = opts.additionalUrls
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http"));

    if (urls.length > 0) {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000";

        const parseRes = await fetch(`${baseUrl}/api/parse-source`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: urls.slice(0, 10) }),
        });
        const parseData = await parseRes.json();
        if (parseData.articles) {
          articles = [...parseData.articles, ...articles];
        }
      } catch (e) {
        console.error("[generate-podcast] URL parsing failed:", e);
      }
    }
  }

  // Add context as synthetic article
  if (opts.additionalContext?.trim()) {
    articles.unshift({
      title: "Additional context",
      description: opts.additionalContext,
      content: opts.additionalContext,
      source: "User-provided",
      url: "",
      publishedAt: new Date().toISOString(),
    });
  }

  // Generate script
  const script = await generateScript(
    opts.topic,
    opts.style,
    opts.lengthMinutes,
    articles
  );

  // Generate audio
  const audioBuffer = await textToSpeech(script.script, opts.voiceId);

  const id = `pod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  await storeAudio(id, audioBuffer);

  const audioUrl = process.env.BLOB_READ_WRITE_TOKEN
    ? `/api/audio/${id}`
    : `/podcasts/${id}.mp3`;

  const wordCount = script.script.split(/\s+/).length;
  const durationSeconds = Math.round((wordCount / 150) * 60);

  const podcast: Podcast = {
    id,
    title: script.title,
    topic: opts.topic,
    style: opts.style,
    audioUrl,
    scriptText: script.script,
    sources: script.sources,
    durationSeconds,
    createdAt: new Date().toISOString(),
  };

  await storeMetadata(podcast);

  // Save to database if user is known
  if (opts.userId) {
    await savePodcast({
      id: podcast.id,
      userId: opts.userId,
      title: podcast.title,
      topic: podcast.topic,
      style: podcast.style,
      audioUrl: podcast.audioUrl,
      scriptText: podcast.scriptText,
      sources: podcast.sources,
      durationSeconds: podcast.durationSeconds,
      subscriptionId: opts.subscriptionId,
    });
  }

  return podcast;
}

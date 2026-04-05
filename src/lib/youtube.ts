import { Article } from "./types";
import { extractMeta, extractTag, decodeHtmlEntities } from "./scrape";

export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/watch|youtu\.be\/|youtube\.com\/shorts\/)/.test(url);
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function extractYouTubeTranscript(url: string): Promise<Article | null> {
  const videoId = extractVideoId(url);
  if (!videoId) return null;

  const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!pageRes.ok) return null;
  const html = await pageRes.text();

  const title = extractMeta(html, "og:title")
    || extractTag(html, "title")
    || `YouTube video ${videoId}`;

  const description = extractMeta(html, "og:description") || "";
  const channel = extractMeta(html, "og:site_name") || "YouTube";

  const captionTrackUrl = extractCaptionTrackUrl(html);

  if (!captionTrackUrl) {
    return {
      title,
      description,
      content: description || `Video: ${title}`,
      source: channel,
      url,
      publishedAt: new Date().toISOString(),
    };
  }

  const captionRes = await fetch(captionTrackUrl, {
    signal: AbortSignal.timeout(10000),
  });

  if (!captionRes.ok) {
    return {
      title,
      description,
      content: description || `Video: ${title}`,
      source: channel,
      url,
      publishedAt: new Date().toISOString(),
    };
  }

  const captionXml = await captionRes.text();
  const transcript = parseCaptionXml(captionXml);

  return {
    title,
    description,
    content: transcript.slice(0, 8000),
    source: channel,
    url,
    publishedAt: new Date().toISOString(),
  };
}

function extractCaptionTrackUrl(html: string): string | null {
  const captionsMatch = html.match(/"captionTracks":\s*(\[[\s\S]*?\])/);
  if (!captionsMatch) return null;

  try {
    const cleaned = captionsMatch[1]
      .replace(/\\u0026/g, "&")
      .replace(/\\"/g, '"');
    const tracks = JSON.parse(cleaned);

    const english = tracks.find(
      (t: { languageCode: string }) => t.languageCode === "en" || t.languageCode?.startsWith("en")
    );
    const track = english || tracks[0];

    return track?.baseUrl || null;
  } catch {
    const baseUrlMatch = html.match(/"baseUrl"\s*:\s*"(https:\/\/www\.youtube\.com\/api\/timedtext[^"]+)"/);
    if (baseUrlMatch) {
      return baseUrlMatch[1].replace(/\\u0026/g, "&");
    }
    return null;
  }
}

function parseCaptionXml(xml: string): string {
  const segments: string[] = [];
  const regex = /<text[^>]*>([\s\S]*?)<\/text>/gi;
  let match;

  while ((match = regex.exec(xml)) !== null) {
    const text = decodeHtmlEntities(
      match[1].replace(/\n/g, " ").trim()
    );
    if (text) segments.push(text);
  }

  return segments.join(" ");
}

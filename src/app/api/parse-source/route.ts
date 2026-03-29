import { NextRequest, NextResponse } from "next/server";
import { Article } from "@/lib/types";

export const maxDuration = 15;

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "At least one URL is required" },
        { status: 400 }
      );
    }

    const articles: Article[] = [];

    for (const url of urls.slice(0, 5)) {
      try {
        const article = isYouTubeUrl(url)
          ? await extractYouTubeTranscript(url)
          : await scrapeUrl(url);
        if (article) articles.push(article);
      } catch (e) {
        console.error(`Failed to parse ${url}:`, e);
      }
    }

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Parse source error:", error);
    return NextResponse.json(
      { error: "Failed to parse sources" },
      { status: 500 }
    );
  }
}

async function scrapeUrl(url: string): Promise<Article | null> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; PodCraft/1.0)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) return null;

  const html = await response.text();

  const title = extractMeta(html, "og:title")
    || extractMeta(html, "twitter:title")
    || extractTag(html, "title")
    || url;

  const description = extractMeta(html, "og:description")
    || extractMeta(html, "description")
    || extractMeta(html, "twitter:description")
    || "";

  const content = extractArticleContent(html);

  const siteName = extractMeta(html, "og:site_name")
    || new URL(url).hostname.replace("www.", "");

  return {
    title,
    description,
    content: content || description,
    source: siteName,
    url,
    publishedAt: extractMeta(html, "article:published_time") || new Date().toISOString(),
  };
}

function extractMeta(html: string, property: string): string | null {
  // Try property="..." (Open Graph style)
  const ogMatch = html.match(
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i")
  );
  if (ogMatch) return decodeHtmlEntities(ogMatch[1]);

  // Try content="..." property="..." (reversed order)
  const ogMatch2 = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i")
  );
  if (ogMatch2) return decodeHtmlEntities(ogMatch2[1]);

  // Try name="..." (standard meta)
  const nameMatch = html.match(
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i")
  );
  if (nameMatch) return decodeHtmlEntities(nameMatch[1]);

  const nameMatch2 = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i")
  );
  if (nameMatch2) return decodeHtmlEntities(nameMatch2[1]);

  return null;
}

function extractTag(html: string, tag: string): string | null {
  const match = html.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i"));
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

function extractArticleContent(html: string): string {
  // Remove script, style, nav, header, footer tags
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "");

  // Try to find article body
  const articleMatch = cleaned.match(/<article[\s\S]*?>([\s\S]*?)<\/article>/i);
  if (articleMatch) cleaned = articleMatch[1];

  // Extract text from paragraphs
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pRegex.exec(cleaned)) !== null) {
    const text = match[1]
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length > 30) {
      paragraphs.push(text);
    }
  }

  return decodeHtmlEntities(paragraphs.join("\n\n")).slice(0, 5000);
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ");
}

// --- YouTube transcript extraction ---

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/watch|youtu\.be\/|youtube\.com\/shorts\/)/.test(url);
}

function extractVideoId(url: string): string | null {
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

async function extractYouTubeTranscript(url: string): Promise<Article | null> {
  const videoId = extractVideoId(url);
  if (!videoId) return null;

  // Fetch the YouTube page to get the title and caption tracks
  const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!pageRes.ok) return null;
  const html = await pageRes.text();

  // Extract video title
  const title = extractMeta(html, "og:title")
    || extractTag(html, "title")
    || `YouTube video ${videoId}`;

  const description = extractMeta(html, "og:description") || "";
  const channel = extractMeta(html, "og:site_name") || "YouTube";

  // Extract caption track URL from the page's embedded data
  const captionTrackUrl = extractCaptionTrackUrl(html);

  if (!captionTrackUrl) {
    // No captions available, use the description as content
    return {
      title,
      description,
      content: description || `Video: ${title}`,
      source: channel,
      url,
      publishedAt: new Date().toISOString(),
    };
  }

  // Fetch the caption track (XML format)
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
  // Look for captions in the ytInitialPlayerResponse
  const captionsMatch = html.match(/"captionTracks":\s*(\[[\s\S]*?\])/);
  if (!captionsMatch) return null;

  try {
    // Clean up the JSON (it may have escaped characters)
    const cleaned = captionsMatch[1]
      .replace(/\\u0026/g, "&")
      .replace(/\\"/g, '"');
    const tracks = JSON.parse(cleaned);

    // Prefer English captions, then any available
    const english = tracks.find(
      (t: { languageCode: string }) => t.languageCode === "en" || t.languageCode?.startsWith("en")
    );
    const track = english || tracks[0];

    return track?.baseUrl || null;
  } catch {
    // Try regex fallback for baseUrl
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
    const text = match[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n/g, " ")
      .trim();
    if (text) segments.push(text);
  }

  return segments.join(" ");
}

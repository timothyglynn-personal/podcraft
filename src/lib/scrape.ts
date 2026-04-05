import { Article } from "./types";
import { isYouTubeUrl, extractYouTubeTranscript } from "./youtube";

export async function scrapeUrl(url: string): Promise<Article | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PodCraft/1.0)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;

    const html = await response.text();

    const title =
      extractMeta(html, "og:title") ||
      extractMeta(html, "twitter:title") ||
      extractTag(html, "title") ||
      url;

    const description =
      extractMeta(html, "og:description") ||
      extractMeta(html, "description") ||
      extractMeta(html, "twitter:description") ||
      "";

    const content = extractArticleContent(html);

    const siteName =
      extractMeta(html, "og:site_name") ||
      new URL(url).hostname.replace("www.", "");

    return {
      title,
      description,
      content: content || description,
      source: siteName,
      url,
      publishedAt:
        extractMeta(html, "article:published_time") ||
        new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function extractMeta(html: string, property: string): string | null {
  const ogMatch = html.match(
    new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i"
    )
  );
  if (ogMatch) return decodeHtmlEntities(ogMatch[1]);

  const ogMatch2 = html.match(
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
      "i"
    )
  );
  if (ogMatch2) return decodeHtmlEntities(ogMatch2[1]);

  const nameMatch = html.match(
    new RegExp(
      `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i"
    )
  );
  if (nameMatch) return decodeHtmlEntities(nameMatch[1]);

  const nameMatch2 = html.match(
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`,
      "i"
    )
  );
  if (nameMatch2) return decodeHtmlEntities(nameMatch2[1]);

  return null;
}

export function extractTag(html: string, tag: string): string | null {
  const match = html.match(
    new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i")
  );
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

export function extractArticleContent(html: string): string {
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "");

  const articleMatch = cleaned.match(
    /<article[\s\S]*?>([\s\S]*?)<\/article>/i
  );
  if (articleMatch) cleaned = articleMatch[1];

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

export function decodeHtmlEntities(text: string): string {
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

// Scrape a single URL — handles both web pages and YouTube
export async function scrapeAny(url: string): Promise<Article | null> {
  if (isYouTubeUrl(url)) {
    return extractYouTubeTranscript(url);
  }
  return scrapeUrl(url);
}

// Scrape multiple URLs in parallel with concurrency limit
export async function scrapeMultipleUrls(
  urls: string[],
  concurrency = 3
): Promise<Article[]> {
  const results: Article[] = [];
  const queue = [...urls];

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) break;
      try {
        const article = await scrapeAny(url);
        if (article) results.push(article);
      } catch (e) {
        console.error(`Failed to scrape ${url}:`, e);
      }
    }
  }

  const workers = Array(Math.min(concurrency, urls.length))
    .fill(null)
    .map(() => worker());

  await Promise.all(workers);
  return results;
}

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
        const article = await scrapeUrl(url);
        if (article) articles.push(article);
      } catch (e) {
        console.error(`Failed to scrape ${url}:`, e);
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

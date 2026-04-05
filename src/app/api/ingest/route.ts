import { NextRequest, NextResponse } from "next/server";
import { fetchArticles } from "@/lib/news";
import { fetchRssArticles } from "@/lib/rss";
import { scrapeMultipleUrls } from "@/lib/scrape";
import { searchWeb } from "@/lib/search";
import { Article } from "@/lib/types";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { topic, suggestedUrls } = await request.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    let articles: Article[] = [];

    // Step 1: Scrape any suggested URLs from the source suggestion page
    if (suggestedUrls && Array.isArray(suggestedUrls) && suggestedUrls.length > 0) {
      const scraped = await scrapeMultipleUrls(
        suggestedUrls.filter((u: string) => u.startsWith("http")).slice(0, 5)
      );
      articles = [...articles, ...scraped];
    }

    // Step 2: Search the web for additional sources (if Brave Search available)
    const searchResults = await searchWeb(`${topic} latest news`, 5);
    if (searchResults.length > 0) {
      const searchUrls = searchResults
        .map((r) => r.url)
        .filter((url) => !articles.some((a) => a.url === url))
        .slice(0, 3);

      if (searchUrls.length > 0) {
        const webArticles = await scrapeMultipleUrls(searchUrls);
        articles = [...articles, ...webArticles];
      }
    }

    // Step 3: Try RSS feeds (always available, no API key needed)
    if (articles.length < 5) {
      const rssArticles = await fetchRssArticles(topic);
      // Add RSS articles that aren't duplicates
      for (const rssArticle of rssArticles) {
        if (!articles.some((a) => a.url === rssArticle.url || a.title === rssArticle.title)) {
          articles.push(rssArticle);
        }
      }
    }

    // Step 4: Supplement with NewsAPI if still thin
    if (articles.length < 3) {
      try {
        const newsApiArticles = await fetchArticles(topic);
        for (const article of newsApiArticles) {
          if (!articles.some((a) => a.url === article.url || a.title === article.title)) {
            articles.push(article);
          }
        }
      } catch {
        // NewsAPI may fail on deployed environments (free tier = localhost only)
      }
    }

    // Limit total articles and sort by content richness
    articles = articles
      .sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0))
      .slice(0, 8);

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

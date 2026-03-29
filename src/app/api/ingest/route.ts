import { NextRequest, NextResponse } from "next/server";
import { fetchArticles } from "@/lib/news";
import { fetchRssArticles } from "@/lib/rss";

export const maxDuration = 15;

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    // Try RSS feeds first (works everywhere, no API key needed)
    let articles = await fetchRssArticles(topic);

    // If RSS didn't find enough, supplement with NewsAPI (localhost only on free tier)
    if (articles.length < 3) {
      try {
        const newsApiArticles = await fetchArticles(topic);
        articles = [...articles, ...newsApiArticles];
      } catch {
        // NewsAPI may fail on deployed environments (free tier = localhost only)
      }
    }

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

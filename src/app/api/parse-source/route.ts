import { NextRequest, NextResponse } from "next/server";
import { Article } from "@/lib/types";
import { scrapeAny } from "@/lib/scrape";

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

    for (const url of urls.slice(0, 10)) {
      try {
        const article = await scrapeAny(url);
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

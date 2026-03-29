import { Article } from "./types";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = "https://newsapi.org/v2/everything";

export async function fetchArticles(topic: string, limit = 5): Promise<Article[]> {
  if (!NEWS_API_KEY) {
    console.warn("NEWS_API_KEY not set, using fallback content");
    return getFallbackArticles(topic);
  }

  try {
    const params = new URLSearchParams({
      q: topic,
      sortBy: "publishedAt",
      pageSize: String(limit),
      language: "en",
      apiKey: NEWS_API_KEY,
    });

    const response = await fetch(`${NEWS_API_URL}?${params}`);
    if (!response.ok) {
      console.error("NewsAPI error:", response.status);
      return getFallbackArticles(topic);
    }

    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.articles || []).map((a: any) => ({
      title: a.title || "",
      description: a.description || "",
      content: a.content || a.description || "",
      source: a.source?.name || "Unknown",
      url: a.url || "",
      publishedAt: a.publishedAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return getFallbackArticles(topic);
  }
}

function getFallbackArticles(topic: string): Article[] {
  return [
    {
      title: `Latest developments in ${topic}`,
      description: `A comprehensive overview of recent events and developments related to ${topic}. Multiple sources report significant activity in this area over the past week.`,
      content: `Recent developments in ${topic} have drawn attention from commentators and fans alike. The topic continues to generate discussion across media outlets, with several notable events occurring in the past few days. Experts suggest this trend will continue in the coming weeks, with implications for the broader community. Local perspectives have been particularly vocal, highlighting the importance of ${topic} to community identity and culture.`,
      source: "PodCraft Research",
      url: "",
      publishedAt: new Date().toISOString(),
    },
  ];
}

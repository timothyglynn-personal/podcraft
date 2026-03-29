import { Article } from "./types";

// Pre-configured RSS feeds by category
const RSS_FEEDS: Record<string, { name: string; url: string }[]> = {
  // Irish sports (verified working feeds)
  "gaa": [
    { name: "RTE Sport", url: "https://www.rte.ie/rss/sport.xml" },
    { name: "The42", url: "https://www.the42.ie/feed/" },
  ],
  "hurling": [
    { name: "RTE Sport", url: "https://www.rte.ie/rss/sport.xml" },
    { name: "The42", url: "https://www.the42.ie/feed/" },
  ],
  "rugby": [
    { name: "RTE Sport", url: "https://www.rte.ie/rss/sport.xml" },
    { name: "The42", url: "https://www.the42.ie/feed/" },
    { name: "BBC Rugby", url: "https://feeds.bbci.co.uk/sport/rugby-union/rss.xml" },
  ],
  "soccer": [
    { name: "RTE Sport", url: "https://www.rte.ie/rss/sport.xml" },
    { name: "BBC Football", url: "https://feeds.bbci.co.uk/sport/football/rss.xml" },
  ],
  // Irish news
  "ireland": [
    { name: "RTE News", url: "https://www.rte.ie/rss/news.xml" },
    { name: "RTE Sport", url: "https://www.rte.ie/rss/sport.xml" },
  ],
  "limerick": [
    { name: "RTE Sport", url: "https://www.rte.ie/rss/sport.xml" },
    { name: "RTE News", url: "https://www.rte.ie/rss/news.xml" },
  ],
  "munster": [
    { name: "RTE Sport", url: "https://www.rte.ie/rss/sport.xml" },
  ],
  // International sports
  "football": [
    { name: "BBC Football", url: "https://feeds.bbci.co.uk/sport/football/rss.xml" },
    { name: "RTE Sport", url: "https://www.rte.ie/rss/sport.xml" },
  ],
  "cricket": [
    { name: "BBC Cricket", url: "https://feeds.bbci.co.uk/sport/cricket/rss.xml" },
  ],
  "tennis": [
    { name: "BBC Tennis", url: "https://feeds.bbci.co.uk/sport/tennis/rss.xml" },
  ],
  "f1": [
    { name: "BBC F1", url: "https://feeds.bbci.co.uk/sport/formula1/rss.xml" },
  ],
  "golf": [
    { name: "BBC Golf", url: "https://feeds.bbci.co.uk/sport/golf/rss.xml" },
  ],
  // General news
  "technology": [
    { name: "BBC Tech", url: "https://feeds.bbci.co.uk/news/technology/rss.xml" },
    { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index" },
  ],
  "world": [
    { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
    { name: "RTE News", url: "https://www.rte.ie/rss/news.xml" },
  ],
  "business": [
    { name: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml" },
  ],
  "science": [
    { name: "BBC Science", url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml" },
  ],
  "sport": [
    { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/rss.xml" },
    { name: "RTE Sport", url: "https://www.rte.ie/rss/sport.xml" },
  ],
};

// General fallback feeds
const FALLBACK_FEEDS = [
  { name: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml" },
  { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/rss.xml" },
  { name: "RTE News", url: "https://www.rte.ie/rss/news.xml" },
];

export async function fetchRssArticles(topic: string, limit = 5): Promise<Article[]> {
  const feeds = findRelevantFeeds(topic);
  const articles: Article[] = [];

  for (const feed of feeds) {
    if (articles.length >= limit) break;
    try {
      const feedArticles = await parseFeed(feed.url, feed.name);
      // Filter articles that are relevant to the topic
      const relevant = filterByRelevance(feedArticles, topic);
      articles.push(...relevant);
    } catch (e) {
      console.error(`Failed to fetch RSS feed ${feed.name}:`, e);
    }
  }

  return articles.slice(0, limit);
}

function findRelevantFeeds(topic: string): { name: string; url: string }[] {
  const topicLower = topic.toLowerCase();
  const matched: { name: string; url: string }[] = [];
  const seen = new Set<string>();

  for (const [keyword, feeds] of Object.entries(RSS_FEEDS)) {
    if (topicLower.includes(keyword)) {
      for (const feed of feeds) {
        if (!seen.has(feed.url)) {
          matched.push(feed);
          seen.add(feed.url);
        }
      }
    }
  }

  // If no keyword match, use fallback feeds
  if (matched.length === 0) {
    return FALLBACK_FEEDS;
  }

  return matched;
}

async function parseFeed(feedUrl: string, sourceName: string): Promise<Article[]> {
  const response = await fetch(feedUrl, {
    headers: { "User-Agent": "PodCraft/1.0" },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) return [];

  const xml = await response.text();
  const articles: Article[] = [];

  // Parse RSS <item> elements
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];

    const title = extractXmlTag(item, "title");
    const description = extractXmlTag(item, "description")
      || extractXmlTag(item, "content:encoded")
      || "";
    const link = extractXmlTag(item, "link") || "";
    const pubDate = extractXmlTag(item, "pubDate") || "";

    if (title) {
      // Clean HTML from description
      const cleanDesc = description
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();

      articles.push({
        title: title.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim(),
        description: cleanDesc.slice(0, 500),
        content: cleanDesc,
        source: sourceName,
        url: link.trim(),
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      });
    }
  }

  return articles;
}

function extractXmlTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function filterByRelevance(articles: Article[], topic: string): Article[] {
  const keywords = topic.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

  if (keywords.length === 0) return articles;

  // Score each article by keyword matches
  const scored = articles.map((article) => {
    const text = `${article.title} ${article.description}`.toLowerCase();
    const score = keywords.reduce((sum, kw) => sum + (text.includes(kw) ? 1 : 0), 0);
    return { article, score };
  });

  // Return articles with at least one keyword match, sorted by relevance
  const relevant = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.article);

  // If nothing matched, return all articles (the feed was already topic-selected)
  return relevant.length > 0 ? relevant : articles;
}

export interface SearchResult {
  title: string;
  url: string;
  description: string;
}

export async function searchWeb(query: string, count = 5): Promise<SearchResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;

  if (!apiKey) {
    // Fallback: return empty results if no API key
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      count: String(count),
    });

    const res = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error("Brave Search error:", res.status, await res.text());
      return [];
    }

    const data = await res.json();
    const results: SearchResult[] = (data.web?.results || []).map(
      (r: { title: string; url: string; description: string }) => ({
        title: r.title || "",
        url: r.url || "",
        description: r.description || "",
      })
    );

    return results;
  } catch (error) {
    console.error("Brave Search failed:", error);
    return [];
  }
}

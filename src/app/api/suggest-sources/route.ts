import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { searchWeb } from "@/lib/search";

export const maxDuration = 30;

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { topic, location, origin, style } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    // Step 1: Ask Claude to suggest sources and search queries
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `You are a research assistant helping find the best content sources for a podcast.
Given a topic, user location, and origin, suggest 3-5 specific content sources.
For each source, provide:
- name: The source name (e.g. "Limerick Leader", "ESPN", "BBC Sport")
- url: A direct URL to the source homepage or relevant section
- reason: Why this source is good for this topic (1 sentence)
- searchQuery: A search query to find recent content from this source

IMPORTANT: Prefer local/regional sources when the topic has a geographic component.
For example, if someone in Limerick wants hurling news, suggest the Limerick Leader before RTE.
If someone in Michigan wants football, suggest Detroit Free Press before national outlets.

Also suggest an accent that matches the user's origin. Return one of: irish, british, scottish, welsh, australian, american, indian, nigerian, french, german, italian, spanish, swedish.

Respond with ONLY valid JSON in this format:
{
  "sources": [
    {"name": "...", "url": "...", "reason": "...", "searchQuery": "..."}
  ],
  "suggestedAccent": "..."
}`,
      messages: [
        {
          role: "user",
          content: `Topic: "${topic}"
User lives in: ${location || "not specified"}
Originally from: ${origin || "not specified"}
Podcast style: ${style || "not specified"}`,
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    let claudeSuggestions;
    try {
      claudeSuggestions = JSON.parse(text);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        claudeSuggestions = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({
          sources: [],
          suggestedAccent: guessAccent(origin),
        });
      }
    }

    // Step 2: Enrich with Brave Search results (if API key available)
    const enrichedSources = await Promise.all(
      (claudeSuggestions.sources || []).map(
        async (source: { name: string; url: string; reason: string; searchQuery?: string }) => {
          // Try to find real URLs via search if we have a search query
          if (source.searchQuery) {
            const searchResults = await searchWeb(source.searchQuery, 2);
            if (searchResults.length > 0) {
              // Use the first search result URL if the original URL seems generic
              const betterUrl = searchResults[0].url;
              return {
                name: source.name,
                url: betterUrl || source.url,
                reason: source.reason,
                selected: true,
              };
            }
          }
          return {
            name: source.name,
            url: source.url,
            reason: source.reason,
            selected: true,
          };
        }
      )
    );

    // Step 3: Also add general search results for the topic
    const topicResults = await searchWeb(`${topic} ${location || ""}`, 3);
    const additionalSources = topicResults
      .filter(
        (r) =>
          !enrichedSources.some(
            (s: { url: string }) =>
              s.url && r.url && new URL(s.url).hostname === new URL(r.url).hostname
          )
      )
      .slice(0, 2)
      .map((r) => ({
        name: r.title.slice(0, 50),
        url: r.url,
        reason: r.description.slice(0, 100),
        selected: false,
      }));

    return NextResponse.json({
      sources: [...enrichedSources, ...additionalSources],
      suggestedAccent: claudeSuggestions.suggestedAccent || guessAccent(origin),
    });
  } catch (error) {
    console.error("Suggest sources error:", error);
    return NextResponse.json({
      sources: [],
      suggestedAccent: guessAccent(""),
    });
  }
}

function guessAccent(origin: string): string {
  if (!origin) return "american";
  const o = origin.toLowerCase();
  if (o.includes("ireland") || o.includes("irish")) return "irish";
  if (o.includes("england") || o.includes("british") || o.includes("uk")) return "british";
  if (o.includes("scotland") || o.includes("scottish")) return "scottish";
  if (o.includes("australia")) return "australian";
  if (o.includes("india")) return "indian";
  if (o.includes("nigeria")) return "nigerian";
  if (o.includes("france") || o.includes("french")) return "french";
  if (o.includes("germany") || o.includes("german")) return "german";
  if (o.includes("italy") || o.includes("italian")) return "italian";
  if (o.includes("spain") || o.includes("spanish")) return "spanish";
  if (o.includes("sweden") || o.includes("swedish")) return "swedish";
  return "american";
}

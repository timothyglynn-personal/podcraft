import Anthropic from "@anthropic-ai/sdk";
import { Article, PodcastScript } from "./types";

const client = new Anthropic();

const STYLE_PROMPTS: Record<string, string> = {
  "news-briefing": "You are a professional podcast host delivering a crisp news briefing. Get straight to the stories, summarize clearly, and connect the dots between related events. Use transitions like 'Moving on to...' and 'In related news...'",
  "deep-dive": "You are a thoughtful podcast host doing an in-depth analysis. Explore the nuances, provide context, ask rhetorical questions, and give your informed take. Take time to explain why things matter.",
  "casual-chat": "You are a friendly podcast host having a relaxed conversation with the listener. Use casual language, share opinions naturally, throw in the occasional aside or joke. Feel like a knowledgeable friend catching them up.",
  "storytelling": "You are a compelling storyteller weaving a narrative. Open with a hook, build tension, use vivid descriptions, and bring the listener on a journey. Make facts feel like story beats.",
};

const WORDS_PER_MINUTE = 150;

export async function generateScript(
  topic: string,
  style: string,
  lengthMinutes: number,
  articles: Article[]
): Promise<PodcastScript> {
  const targetWords = lengthMinutes * WORDS_PER_MINUTE;
  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS["casual-chat"];
  const hasSources = articles.length > 0 && articles.some((a) => a.content.length > 50);

  const articleSummaries = articles
    .map((a, i) => `[SOURCE ${i + 1}] "${a.title}" (${a.source})\n${a.content}`)
    .join("\n\n");

  const factualnessRules = hasSources
    ? `FACTUAL ACCURACY — THIS IS CRITICAL:
- You may ONLY state facts, names, scores, dates, statistics, and quotes that appear in the provided sources
- Do NOT invent, assume, or fill in any factual details not present in the sources
- Do NOT guess scores, player names, dates, or statistics — if the source doesn't say it, you don't say it
- If the sources are thin on detail, keep the podcast shorter rather than padding with invented content
- When referencing a fact, attribute it naturally: "According to [source name]..." or "As [source name] reports..."
- If you want to add general context (e.g. explaining what hurling is), clearly frame it as background, not news
- Never present analysis or speculation as fact — say "it seems" or "one could argue" for opinion`
    : `FACTUAL ACCURACY — THIS IS CRITICAL:
- No specific source articles were provided, so you are working from general knowledge only
- You MUST explicitly tell the listener this: "Based on what I know..." or "From my understanding..."
- Do NOT invent specific scores, dates, statistics, quotes, or recent events
- Do NOT pretend you have current information — be honest about what you know and don't know
- Keep to well-established facts and general context rather than inventing recent details
- If the topic is about recent events, acknowledge that you don't have the latest and suggest where to check`;

  const systemPrompt = `${stylePrompt}

${factualnessRules}

SCRIPT RULES:
- Write approximately ${targetWords} words (${lengthMinutes} minutes at speaking pace)
- The topic is: "${topic}"
- Write ONLY the spoken words — no stage directions, no [pause], no (laughs), no sound effect notes
- Open with a brief greeting and the podcast topic
- Close with a sign-off
- Make it sound natural when read aloud — use contractions, short sentences, conversational rhythm
- DO NOT include any markdown formatting, headers, or annotations
- The output should be ONLY the script text, nothing else`;

  const userMessage = hasSources
    ? `Here are the source materials to base the podcast on. Use ONLY facts from these sources:\n\n${articleSummaries}\n\nGenerate the podcast script about "${topic}". Remember: do not invent any facts not present in the sources above.`
    : `Generate a podcast script about "${topic}". No specific source articles were provided — rely on general knowledge only and be transparent about that with the listener.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const scriptText = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  const title = generateTitle(topic, style);
  const wordCount = scriptText.split(/\s+/).length;

  return {
    title,
    script: scriptText,
    sources: articles.filter((a) => a.url).map((a) => ({ title: a.title, url: a.url })),
    wordCount,
  };
}

function generateTitle(topic: string, style: string): string {
  const prefix: Record<string, string> = {
    "news-briefing": "Briefing:",
    "deep-dive": "Deep Dive:",
    "casual-chat": "Chat:",
    "storytelling": "Story:",
  };
  return `${prefix[style] || ""} ${topic}`.trim();
}

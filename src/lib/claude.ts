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

  const articleSummaries = articles
    .map((a, i) => `[${i + 1}] "${a.title}" (${a.source})\n${a.content}`)
    .join("\n\n");

  const systemPrompt = `${stylePrompt}

RULES:
- Write a podcast script of approximately ${targetWords} words (${lengthMinutes} minutes at speaking pace)
- The topic is: "${topic}"
- Write ONLY the spoken words — no stage directions, no [pause], no (laughs), no sound effect notes
- Open with a brief greeting and the podcast topic
- Close with a sign-off
- Reference sources naturally ("According to..." or "As reported by...")
- Make it sound natural when read aloud — use contractions, short sentences, conversational rhythm
- DO NOT include any markdown formatting, headers, or annotations
- The output should be ONLY the script text, nothing else`;

  const userMessage = articles.length > 0
    ? `Here are the source articles to base the podcast on:\n\n${articleSummaries}\n\nGenerate the podcast script about "${topic}".`
    : `Generate a podcast script about "${topic}". Use your general knowledge since no specific articles were provided.`;

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
    sources: articles.map((a) => ({ title: a.title, url: a.url })),
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

export interface PodcastRequest {
  topic: string;
  style: "news-briefing" | "deep-dive" | "casual-chat" | "storytelling";
  lengthMinutes: 3 | 5 | 10;
  accent: string;
  voiceId: string;
}

export interface Article {
  title: string;
  description: string;
  content: string;
  source: string;
  url: string;
  publishedAt: string;
}

export interface PodcastScript {
  title: string;
  script: string;
  sources: { title: string; url: string }[];
  wordCount: number;
}

export interface Podcast {
  id: string;
  title: string;
  topic: string;
  style: string;
  audioUrl: string;
  scriptText: string;
  sources: { title: string; url: string }[];
  durationSeconds: number;
  createdAt: string;
}

export interface GenerationStatus {
  step: "idle" | "ingesting" | "scripting" | "recording" | "done" | "error";
  message: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  accent: string;
  description: string;
  category: "irish" | "british" | "american" | "other";
}

export const VOICE_OPTIONS: VoiceOption[] = [
  // Irish voices (from ElevenLabs shared library)
  { id: "kOvUpYLYS0rKGldsKcD1", name: "Maeve", accent: "Irish", description: "Soft Irish female", category: "irish" },
  { id: "1OYA2kgM85gF2eGN8HEp", name: "Colleen", accent: "Irish", description: "Warm Southern Irish woman", category: "irish" },
  { id: "RlSVB64yXMZJjq67jbB1", name: "Bren", accent: "Irish", description: "Calm Irish conversational", category: "irish" },
  { id: "2GErPEnQqbyeqhZQPM6r", name: "Mick", accent: "Irish", description: "Irish male, neutral", category: "irish" },
  { id: "5OgOMFAcpSKqVQHHQHrU", name: "Thomas", accent: "Irish", description: "Irish narration voice", category: "irish" },
  { id: "huSf6WJX1X9lGY6I9CfQ", name: "Stephen", accent: "Irish", description: "Irish narration voice", category: "irish" },
  { id: "LrLmdJKFulHhIm3zTngO", name: "Sean", accent: "Irish", description: "Deep and clear", category: "irish" },
  { id: "1e9Gn3OQenGu4rjQ3Du1", name: "Niamh", accent: "Irish", description: "Soft, engaging, friendly", category: "irish" },
  // British voices
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", accent: "British", description: "Steady broadcaster", category: "british" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", accent: "British", description: "Warm storyteller", category: "british" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", accent: "British", description: "Clear educator", category: "british" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", accent: "British", description: "Velvety actress", category: "british" },
  // American voices
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", accent: "American", description: "Laid-back, casual", category: "american" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", accent: "American", description: "Mature, confident", category: "american" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", accent: "American", description: "Deep, comforting", category: "american" },
  { id: "cjVigY5qzO86Huf0OWal", name: "Eric", accent: "American", description: "Smooth, trustworthy", category: "american" },
];

export const STYLE_OPTIONS = [
  { value: "news-briefing" as const, label: "News Briefing", description: "Quick summary of top stories", icon: "📰" },
  { value: "deep-dive" as const, label: "Deep Dive", description: "In-depth analysis of a topic", icon: "🔍" },
  { value: "casual-chat" as const, label: "Casual Chat", description: "Relaxed, conversational tone", icon: "💬" },
  { value: "storytelling" as const, label: "Storytelling", description: "Narrative-driven episode", icon: "📖" },
] as const;

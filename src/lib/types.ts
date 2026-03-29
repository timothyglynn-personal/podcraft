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

export const VOICE_OPTIONS = [
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", accent: "American", description: "Clear, professional" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni", accent: "American", description: "Warm, conversational" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold", accent: "American", description: "Deep, authoritative" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", accent: "American", description: "Soft, friendly" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", accent: "British", description: "British newsreader" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum", accent: "Transatlantic", description: "Calm, measured" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", accent: "American", description: "Articulate, young" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", accent: "English-Swedish", description: "Warm, engaging" },
] as const;

export const STYLE_OPTIONS = [
  { value: "news-briefing" as const, label: "News Briefing", description: "Quick summary of top stories", icon: "📰" },
  { value: "deep-dive" as const, label: "Deep Dive", description: "In-depth analysis of a topic", icon: "🔍" },
  { value: "casual-chat" as const, label: "Casual Chat", description: "Relaxed, conversational tone", icon: "💬" },
  { value: "storytelling" as const, label: "Storytelling", description: "Narrative-driven episode", icon: "📖" },
] as const;

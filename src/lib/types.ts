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

export type VoiceCategory =
  | "irish" | "british" | "scottish" | "welsh"
  | "american" | "australian"
  | "indian" | "nigerian"
  | "french" | "german" | "italian" | "spanish" | "swedish";

export interface VoiceOption {
  id: string;
  name: string;
  accent: string;
  description: string;
  category: VoiceCategory;
}

export const VOICE_CATEGORIES: { key: VoiceCategory; label: string }[] = [
  { key: "irish", label: "Irish" },
  { key: "british", label: "British" },
  { key: "scottish", label: "Scottish" },
  { key: "welsh", label: "Welsh" },
  { key: "australian", label: "Australian" },
  { key: "american", label: "American" },
  { key: "indian", label: "Indian" },
  { key: "nigerian", label: "Nigerian" },
  { key: "french", label: "French" },
  { key: "german", label: "German" },
  { key: "italian", label: "Italian" },
  { key: "spanish", label: "Spanish" },
  { key: "swedish", label: "Swedish" },
];

export const VOICE_OPTIONS: VoiceOption[] = [
  // Irish
  { id: "kOvUpYLYS0rKGldsKcD1", name: "Maeve", accent: "Irish", description: "Soft Irish female", category: "irish" },
  { id: "1OYA2kgM85gF2eGN8HEp", name: "Colleen", accent: "Irish", description: "Warm Southern Irish woman", category: "irish" },
  { id: "RlSVB64yXMZJjq67jbB1", name: "Bren", accent: "Irish", description: "Calm conversational", category: "irish" },
  { id: "2GErPEnQqbyeqhZQPM6r", name: "Mick", accent: "Irish", description: "Male, neutral", category: "irish" },
  { id: "5OgOMFAcpSKqVQHHQHrU", name: "Thomas", accent: "Irish", description: "Narration voice", category: "irish" },
  { id: "huSf6WJX1X9lGY6I9CfQ", name: "Stephen", accent: "Irish", description: "Narration voice", category: "irish" },
  { id: "LrLmdJKFulHhIm3zTngO", name: "Sean", accent: "Irish", description: "Deep and clear", category: "irish" },
  { id: "1e9Gn3OQenGu4rjQ3Du1", name: "Niamh", accent: "Irish", description: "Soft, engaging, friendly", category: "irish" },
  // British
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", accent: "British", description: "Steady broadcaster", category: "british" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", accent: "British", description: "Warm storyteller", category: "british" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", accent: "British", description: "Clear educator", category: "british" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", accent: "British", description: "Velvety actress", category: "british" },
  // Scottish
  { id: "TVmbglAk3F1GkiCoOq47", name: "Isla", accent: "Scottish", description: "Soft and warm", category: "scottish" },
  { id: "U5UjeJMsOvyhYhXfZdvZ", name: "Adam", accent: "Scottish", description: "Classic storyteller", category: "scottish" },
  { id: "1N4VgTBW1ZGBv5IHWRAf", name: "David", accent: "Scottish", description: "Deep and smooth", category: "scottish" },
  // Welsh
  { id: "wUkGqD7qevNIshEdEC5s", name: "Owen", accent: "Welsh", description: "Friendly and clean", category: "welsh" },
  { id: "DikmR0aoFXAp1A3NcovW", name: "Sam", accent: "Welsh", description: "Soft and friendly", category: "welsh" },
  { id: "73fZMjboCm1aBVyxTbBp", name: "Hannah", accent: "Welsh", description: "Welsh and friendly", category: "welsh" },
  // Australian
  { id: "nBoLwpO4PAjQaQwVKPI1", name: "Amelia", accent: "Australian", description: "Young female", category: "australian" },
  { id: "aGkVQvWUZi16EH8aZJvT", name: "Steve", accent: "Australian", description: "Australian male", category: "australian" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", accent: "Australian", description: "Confident, energetic", category: "australian" },
  // American
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", accent: "American", description: "Laid-back, casual", category: "american" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", accent: "American", description: "Mature, confident", category: "american" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", accent: "American", description: "Deep, comforting", category: "american" },
  { id: "cjVigY5qzO86Huf0OWal", name: "Eric", accent: "American", description: "Smooth, trustworthy", category: "american" },
  // Indian
  { id: "RpiHVNPKGBg7UmgmrKrN", name: "Aashish", accent: "Indian", description: "Natural Indian male", category: "indian" },
  { id: "wJ5MX7uuKXZwFqGdWM4N", name: "Raj", accent: "Indian", description: "Professional Indian English", category: "indian" },
  { id: "TmPeb2hSxdVrThJLywkg", name: "Vanishree", accent: "Indian", description: "Energetic Indian English", category: "indian" },
  // Nigerian
  { id: "77aEIu0qStu8Jwv1EdhX", name: "Ayinde", accent: "Nigerian", description: "Deep and melodic", category: "nigerian" },
  { id: "8P18CIVcRlwP98FOjZDm", name: "Ola", accent: "Nigerian", description: "Nigerian storyteller", category: "nigerian" },
  { id: "bHclEKSjOa1XXz9wbyW6", name: "Terna", accent: "Nigerian", description: "Nigerian male", category: "nigerian" },
  // French
  { id: "xNtG3W2oqJs0cJZuTyBc", name: "Chloe", accent: "French", description: "Lively and expressive", category: "french" },
  { id: "CKfuQaJKfvUG2Wtrda3Y", name: "Lison", accent: "French", description: "Soft French accent", category: "french" },
  { id: "K8nDX2f6wjv6bCh5UeZi", name: "Jamie", accent: "French", description: "Charismatic", category: "french" },
  // German
  { id: "Jvf6TAXwMUVTSR20U0f9", name: "Klaus", accent: "German", description: "English with German accent", category: "german" },
  { id: "9ykbMbZ9spm3mWyhe0Gr", name: "Niklas", accent: "German", description: "Friendly German", category: "german" },
  { id: "uWjgUwvlRVb9s2zMRz8v", name: "Markus", accent: "German", description: "Excitable instructor", category: "german" },
  // Italian
  { id: "f8NAZK1ciwrVujah7clz", name: "Valerio", accent: "Italian", description: "Warm storyteller", category: "italian" },
  { id: "yowh82B72eMNrxcxHgBh", name: "Lorenzo", accent: "Italian", description: "Refined Italian accent", category: "italian" },
  { id: "zFA34HbdHBvF8WhlSusK", name: "Nora", accent: "Italian", description: "Bright female narrator", category: "italian" },
  // Spanish
  { id: "zl1Ut8dvwcVSuQSB9XkG", name: "Ninoska", accent: "Spanish", description: "Spanish teacher", category: "spanish" },
  { id: "5jTLciGr7JGMshpxjhek", name: "Diego", accent: "Spanish", description: "Deep voice", category: "spanish" },
  { id: "ClNifCEVq1smkl4M3aTk", name: "Cristian", accent: "Spanish", description: "Chilean Spanish", category: "spanish" },
  // Swedish
  { id: "ZMs9a3j1SLzirC7aygJQ", name: "Kim", accent: "Swedish", description: "Svenska Swedish", category: "swedish" },
  { id: "9n6dGtreZHvmNb14Y1VO", name: "CJ", accent: "Swedish", description: "Young Swedish male", category: "swedish" },
];

export const STYLE_OPTIONS = [
  { value: "news-briefing" as const, label: "News Briefing", description: "Quick summary of top stories", icon: "📰" },
  { value: "deep-dive" as const, label: "Deep Dive", description: "In-depth analysis of a topic", icon: "🔍" },
  { value: "casual-chat" as const, label: "Casual Chat", description: "Relaxed, conversational tone", icon: "💬" },
  { value: "storytelling" as const, label: "Storytelling", description: "Narrative-driven episode", icon: "📖" },
] as const;

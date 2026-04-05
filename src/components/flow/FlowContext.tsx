"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  FlowState,
  FlowStep,
  GenerationStatus,
  Podcast,
  Article,
  VOICE_OPTIONS,
  VOICE_CATEGORIES,
  SuggestedSource,
} from "@/lib/types";
import { getActiveProfile, saveProfile, setActiveUser, addPodcastToProfile, getPreferences } from "@/lib/profile";
import { getRecentFeedbackSummary } from "@/lib/feedback";

const STEP_ORDER: FlowStep[] = [
  "welcome",
  "topic",
  "style",
  "suggested-sources",
  "extra-sources",
  "generating",
  "player",
];

const initialState: FlowState = {
  step: "welcome",
  userName: "",
  userLocation: "",
  userOrigin: "",
  topic: "",
  style: "news-briefing",
  lengthMinutes: 5,
  suggestedSources: [],
  additionalUrls: "",
  additionalContext: "",
  accent: "american",
  voiceId: VOICE_OPTIONS.find((v) => v.category === "american")?.id || VOICE_OPTIONS[0].id,
  generatedPodcast: null,
  status: { step: "idle", message: "" },
};

interface FlowContextType {
  state: FlowState;
  update: (partial: Partial<FlowState>) => void;
  next: () => void;
  back: () => void;
  goTo: (step: FlowStep) => void;
  reset: () => void;
  generate: () => Promise<void>;
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
}

const FlowContext = createContext<FlowContextType | null>(null);

export function useFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlow must be used within FlowProvider");
  return ctx;
}

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FlowState>(initialState);
  const [showProfile, setShowProfile] = useState(false);

  // Check for existing user on mount — load profile + preferences
  useEffect(() => {
    const profile = getActiveProfile();
    if (profile) {
      const prefs = getPreferences();
      const accent = prefs.defaultAccent || guessAccentFromOrigin(profile.origin);
      const voiceId = prefs.defaultVoiceId || guessVoiceFromOrigin(profile.origin);
      setState((prev) => ({
        ...prev,
        step: "topic",
        userName: profile.name,
        userLocation: profile.location,
        userOrigin: profile.origin,
        style: prefs.defaultStyle || prev.style,
        lengthMinutes: prefs.defaultLength || prev.lengthMinutes,
        accent,
        voiceId,
      }));
    }
  }, []);

  const update = useCallback((partial: Partial<FlowState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const next = useCallback(() => {
    setState((prev) => {
      const idx = STEP_ORDER.indexOf(prev.step);
      if (idx < STEP_ORDER.length - 1) {
        return { ...prev, step: STEP_ORDER[idx + 1] };
      }
      return prev;
    });
  }, []);

  const back = useCallback(() => {
    setState((prev) => {
      const idx = STEP_ORDER.indexOf(prev.step);
      if (idx > 0) {
        return { ...prev, step: STEP_ORDER[idx - 1] };
      }
      return prev;
    });
  }, []);

  const goTo = useCallback((step: FlowStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...initialState,
      step: "topic",
      userName: prev.userName,
      userLocation: prev.userLocation,
      userOrigin: prev.userOrigin,
      accent: prev.accent,
      voiceId: prev.voiceId,
    }));
  }, []);

  const generate = useCallback(async () => {
    setState((prev) => ({ ...prev, step: "generating" }));

    const setStatus = (status: GenerationStatus) => {
      setState((prev) => ({ ...prev, status }));
    };

    try {
      setStatus({ step: "ingesting", message: "Finding the best content..." });

      let articles: Article[] = [];

      // Gather all source URLs from suggested + user-added
      const selectedSourceUrls = state.suggestedSources
        .filter((s) => s.selected)
        .map((s) => s.url)
        .filter((u) => u.startsWith("http"));

      const userUrls = state.additionalUrls
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u.startsWith("http"));

      const allUrls = [...selectedSourceUrls, ...userUrls];

      // Parse user-provided URLs
      if (allUrls.length > 0) {
        try {
          const parseRes = await fetch("/api/parse-source", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls: allUrls.slice(0, 10) }),
          });
          const parseData = await parseRes.json();
          if (parseData.articles) {
            articles = parseData.articles;
          }
        } catch (e) {
          console.error("URL parsing failed:", e);
        }
      }

      // Supplement with RSS/NewsAPI if needed
      if (articles.length < 3) {
        try {
          const ingestRes = await fetch("/api/ingest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic: state.topic }),
          });
          const ingestData = await ingestRes.json();
          if (ingestData.articles) {
            articles = [...articles, ...ingestData.articles];
          }
        } catch (e) {
          console.error("Ingest failed:", e);
        }
      }

      // Add user context as synthetic article
      if (state.additionalContext.trim()) {
        articles.unshift({
          title: "Additional context from user",
          description: state.additionalContext,
          content: state.additionalContext,
          source: "User-provided",
          url: "",
          publishedAt: new Date().toISOString(),
        });
      }

      // Also add non-URL source text from additional sources
      const textSources = state.additionalUrls
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u && !u.startsWith("http"));

      if (textSources.length > 0) {
        articles.unshift({
          title: "User-suggested sources",
          description: textSources.join(", "),
          content: `The user suggested these additional sources for research: ${textSources.join(", ")}. Please incorporate knowledge from these sources.`,
          source: "User-provided",
          url: "",
          publishedAt: new Date().toISOString(),
        });
      }

      // Add feedback context for the learning loop
      const feedbackSummary = getRecentFeedbackSummary();
      if (feedbackSummary) {
        articles.unshift({
          title: "Listener feedback from previous episodes",
          description: feedbackSummary,
          content: `LISTENER PREFERENCES (use these to adjust tone and style): ${feedbackSummary}`,
          source: "User feedback",
          url: "",
          publishedAt: new Date().toISOString(),
        });
      }

      // Generate script
      setStatus({ step: "scripting", message: "Writing your podcast script..." });
      const scriptRes = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: state.topic,
          style: state.style,
          lengthMinutes: state.lengthMinutes,
          articles,
        }),
      });
      const { script } = await scriptRes.json();

      // Generate audio
      setStatus({ step: "recording", message: "Recording with AI voice..." });
      const audioRes = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: script.script,
          title: script.title,
          topic: state.topic,
          style: state.style,
          voiceId: state.voiceId,
          sources: script.sources,
        }),
      });

      const audioData = await audioRes.json();
      if (!audioRes.ok) {
        throw new Error(audioData.error || "Audio generation failed");
      }

      const { podcast } = audioData;

      // Save to localStorage
      const saved = JSON.parse(localStorage.getItem("podcraft-podcasts") || "[]");
      saved.unshift(podcast);
      localStorage.setItem("podcraft-podcasts", JSON.stringify(saved.slice(0, 50)));

      // Save to user profile
      addPodcastToProfile(podcast.id);

      setStatus({ step: "done", message: "Your podcast is ready!" });
      setState((prev) => ({ ...prev, step: "player", generatedPodcast: podcast }));
    } catch (error) {
      console.error("Generation error:", error);
      setStatus({
        step: "error",
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
      setState((prev) => ({ ...prev, step: "extra-sources" }));
    }
  }, [state.topic, state.style, state.lengthMinutes, state.voiceId, state.suggestedSources, state.additionalUrls, state.additionalContext]);

  return (
    <FlowContext.Provider value={{ state, update, next, back, goTo, reset, generate, showProfile, setShowProfile }}>
      {children}
    </FlowContext.Provider>
  );
}

// Map user origin text to a voice category
export function guessAccentFromOrigin(origin: string): string {
  const o = origin.toLowerCase();
  const mappings: [string[], string][] = [
    [["ireland", "irish", "dublin", "cork", "galway", "limerick", "belfast"], "irish"],
    [["england", "english", "british", "uk", "london", "manchester", "liverpool", "birmingham"], "british"],
    [["scotland", "scottish", "edinburgh", "glasgow"], "scottish"],
    [["wales", "welsh", "cardiff"], "welsh"],
    [["australia", "australian", "sydney", "melbourne", "brisbane"], "australian"],
    [["america", "american", "usa", "us", "united states", "new york", "california", "texas", "michigan", "florida", "chicago", "boston", "seattle"], "american"],
    [["india", "indian", "mumbai", "delhi", "bangalore", "calcutta", "kolkata", "chennai", "hyderabad"], "indian"],
    [["nigeria", "nigerian", "lagos", "abuja"], "nigerian"],
    [["france", "french", "paris", "lyon", "marseille"], "french"],
    [["germany", "german", "berlin", "munich", "hamburg"], "german"],
    [["italy", "italian", "rome", "milan", "naples", "florence"], "italian"],
    [["spain", "spanish", "madrid", "barcelona", "mexico", "mexican", "colombia", "colombian", "argentina", "argentinian", "chile", "chilean"], "spanish"],
    [["sweden", "swedish", "stockholm"], "swedish"],
  ];

  for (const [keywords, category] of mappings) {
    if (keywords.some((k) => o.includes(k))) {
      return category;
    }
  }
  return "american";
}

export function guessVoiceFromOrigin(origin: string): string {
  const category = guessAccentFromOrigin(origin);
  const voice = VOICE_OPTIONS.find((v) => v.category === category);
  return voice?.id || VOICE_OPTIONS[0].id;
}

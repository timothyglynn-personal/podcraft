"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PodcastRequest,
  GenerationStatus,
  VOICE_OPTIONS,
  STYLE_OPTIONS,
  Article,
} from "@/lib/types";
import GeneratingStatus from "./GeneratingStatus";

export default function PodcastForm() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<PodcastRequest["style"]>("news-briefing");
  const [lengthMinutes, setLengthMinutes] = useState<3 | 5 | 10>(5);
  const [voiceId, setVoiceId] = useState<string>(VOICE_OPTIONS[0].id);
  const [status, setStatus] = useState<GenerationStatus>({
    step: "idle",
    message: "",
  });

  const isGenerating = status.step !== "idle" && status.step !== "done" && status.step !== "error";

  const generate = async () => {
    if (!topic.trim() || isGenerating) return;

    try {
      // Step 1: Ingest articles
      setStatus({ step: "ingesting", message: "Searching for articles..." });
      const ingestRes = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const { articles } = await ingestRes.json();

      // Step 2: Generate script
      setStatus({ step: "scripting", message: "Writing your podcast script..." });
      const scriptRes = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          style,
          lengthMinutes,
          articles: articles as Article[],
        }),
      });
      const { script } = await scriptRes.json();

      // Step 3: Generate audio
      setStatus({ step: "recording", message: "Recording audio..." });
      const audioRes = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: script.script,
          title: script.title,
          topic,
          style,
          voiceId,
          sources: script.sources,
        }),
      });

      const audioData = await audioRes.json();
      if (!audioRes.ok) {
        throw new Error(audioData.error || "Audio generation failed");
      }

      const { podcast } = audioData;

      // Step 4: Done
      setStatus({ step: "done", message: "Your podcast is ready!" });

      // Save to localStorage for library
      const saved = JSON.parse(localStorage.getItem("podcraft-podcasts") || "[]");
      saved.unshift(podcast);
      localStorage.setItem("podcraft-podcasts", JSON.stringify(saved.slice(0, 50)));

      // Navigate to player after brief delay
      setTimeout(() => {
        router.push(`/podcast/${podcast.id}`);
      }, 1000);
    } catch (error) {
      console.error("Generation error:", error);
      setStatus({
        step: "error",
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {status.step === "idle" || status.step === "error" ? (
        <div className="space-y-6">
          {/* Topic input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What should your podcast be about?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Hurling results and Limerick GAA"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900 placeholder-gray-400"
              onKeyDown={(e) => e.key === "Enter" && generate()}
            />
          </div>

          {/* Style selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStyle(opt.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    style === opt.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="text-lg mb-1">{opt.icon}</div>
                  <div className="text-sm font-medium text-gray-900">
                    {opt.label}
                  </div>
                  <div className="text-xs text-gray-500">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Length selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Length
            </label>
            <div className="flex gap-2">
              {([3, 5, 10] as const).map((mins) => (
                <button
                  key={mins}
                  onClick={() => setLengthMinutes(mins)}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    lengthMinutes === mins
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-100 text-gray-600 hover:border-gray-200"
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Voice selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice
            </label>
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900 bg-white"
            >
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} ({voice.accent}) - {voice.description}
                </option>
              ))}
            </select>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={!topic.trim()}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
          >
            Generate Podcast
          </button>

          {status.step === "error" && (
            <div className="p-3 bg-red-50 rounded-xl text-sm text-red-700">
              {status.message}
            </div>
          )}
        </div>
      ) : (
        <GeneratingStatus status={status} />
      )}
    </div>
  );
}

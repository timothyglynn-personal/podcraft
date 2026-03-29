"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AudioPlayer from "@/components/AudioPlayer";
import { Podcast } from "@/lib/types";

export default function PodcastPage() {
  const params = useParams();
  const id = params.id as string;
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [showScript, setShowScript] = useState(false);

  useEffect(() => {
    // Try localStorage first
    const saved = JSON.parse(
      localStorage.getItem("podcraft-podcasts") || "[]"
    ) as Podcast[];
    const found = saved.find((p) => p.id === id);
    if (found) {
      setPodcast(found);
    }
  }, [id]);

  if (!podcast) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading podcast...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white px-4 pt-8 pb-20">
        <div className="max-w-lg mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-blue-100 hover:text-white text-sm mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl font-bold">{podcast.title}</h1>
          <p className="text-blue-100 text-sm mt-1">
            {podcast.style} &middot;{" "}
            {Math.floor(podcast.durationSeconds / 60)} min
          </p>
        </div>
      </div>

      {/* Player */}
      <div className="px-4 -mt-12 max-w-lg mx-auto">
        <AudioPlayer src={podcast.audioUrl} title={podcast.title} />
      </div>

      {/* Script toggle */}
      <div className="px-4 mt-6 max-w-lg mx-auto">
        <button
          onClick={() => setShowScript(!showScript)}
          className="w-full py-3 text-sm font-medium text-gray-600 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
        >
          {showScript ? "Hide script" : "Show script"}
        </button>

        {showScript && (
          <div className="mt-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {podcast.scriptText}
            </p>
          </div>
        )}
      </div>

      {/* Sources */}
      {podcast.sources.length > 0 && (
        <div className="px-4 mt-6 max-w-lg mx-auto">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Sources</h3>
          <div className="space-y-2">
            {podcast.sources
              .filter((s) => s.url)
              .map((source, i) => (
                <a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-white rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors border border-gray-100"
                >
                  {source.title}
                </a>
              ))}
          </div>
        </div>
      )}
    </main>
  );
}

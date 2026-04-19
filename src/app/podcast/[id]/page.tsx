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

  useEffect(() => {
    // Try localStorage first (for podcasts created in this session)
    const saved = JSON.parse(
      localStorage.getItem("podcraft-podcasts") || "[]"
    ) as Podcast[];
    const found = saved.find((p) => p.id === id);
    if (found) {
      setPodcast(found);
      return;
    }

    // Fall back to server (for subscription-generated podcasts)
    fetch(`/api/podcasts?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.podcast) setPodcast(data.podcast);
      })
      .catch(() => {});
  }, [id]);

  if (!podcast) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading podcast...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 px-4 pt-8 pb-20">
        <div className="max-w-lg mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-brand-300 hover:text-white text-sm mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to PodCraft
          </Link>
          <h1 className="text-2xl font-bold text-white">{podcast.title}</h1>
          <p className="text-brand-300 text-sm mt-1">
            {podcast.style} &middot; {Math.floor(podcast.durationSeconds / 60)} min
          </p>
        </div>
      </div>

      {/* Player */}
      <div className="px-4 -mt-12 max-w-lg mx-auto">
        <div className="glass-card p-6">
          <AudioPlayer src={podcast.audioUrl} title={podcast.title} />
        </div>
      </div>

      {/* Script */}
      <div className="px-4 mt-6 max-w-lg mx-auto">
        <details className="glass-card">
          <summary className="p-4 cursor-pointer text-sm font-medium text-gray-300 hover:text-white transition-colors">
            View Script
          </summary>
          <div className="px-4 pb-4 text-sm text-gray-400 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            {podcast.scriptText}
          </div>
        </details>
      </div>

      {/* Sources */}
      {podcast.sources.length > 0 && (
        <div className="px-4 mt-4 max-w-lg mx-auto">
          <details className="glass-card">
            <summary className="p-4 cursor-pointer text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Sources ({podcast.sources.length})
            </summary>
            <div className="px-4 pb-4 space-y-2">
              {podcast.sources.filter((s) => s.url).map((source, i) => (
                <a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-brand-400 hover:text-brand-300 truncate"
                >
                  {source.title}
                </a>
              ))}
            </div>
          </details>
        </div>
      )}
    </main>
  );
}

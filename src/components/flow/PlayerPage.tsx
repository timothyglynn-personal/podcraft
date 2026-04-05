"use client";

import { useFlow } from "./FlowContext";
import AudioPlayer from "../AudioPlayer";

export default function PlayerPage() {
  const { state, reset, setShowProfile } = useFlow();
  const podcast = state.generatedPodcast;

  if (!podcast) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400">No podcast loaded</p>
          <button onClick={reset} className="mt-4 text-brand-400 hover:text-brand-300 text-sm">
            Create a new podcast
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-4 pt-6 pb-8">
      <div className="max-w-lg mx-auto w-full">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-sm text-gray-400">Now Playing</div>
          <button
            onClick={() => setShowProfile(true)}
            className="w-9 h-9 rounded-full bg-surface-card border border-brand-500/20 flex items-center justify-center hover:bg-surface-hover transition-colors"
          >
            <span className="text-sm font-medium text-brand-400">
              {state.userName.charAt(0).toUpperCase()}
            </span>
          </button>
        </div>

        {/* Podcast artwork */}
        <div className="relative mx-auto w-48 h-48 mb-8">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 animate-glow" />
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center">
            <span className="text-6xl">🎙️</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white mb-1">{podcast.title}</h1>
          <p className="text-sm text-gray-400">{podcast.topic}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-brand-600/20 text-brand-300 text-xs rounded-full">
            {podcast.style}
          </span>
        </div>

        {/* Audio Player */}
        <div className="glass-card p-6 mb-6">
          <AudioPlayer src={podcast.audioUrl} title={podcast.title} />
        </div>

        {/* Script viewer */}
        <details className="glass-card mb-6">
          <summary className="p-4 cursor-pointer text-sm font-medium text-gray-300 hover:text-white transition-colors">
            View Script
          </summary>
          <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
            {podcast.scriptText}
          </div>
        </details>

        {/* Sources */}
        {podcast.sources.length > 0 && (
          <details className="glass-card mb-6">
            <summary className="p-4 cursor-pointer text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Sources ({podcast.sources.length})
            </summary>
            <div className="px-4 pb-4 space-y-2">
              {podcast.sources.map((source, i) => (
                <a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-brand-400 hover:text-brand-300 truncate"
                >
                  {source.title || source.url}
                </a>
              ))}
            </div>
          </details>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-semibold rounded-xl transition-all"
          >
            Create Another
          </button>
          <button
            onClick={() => {
              const url = `${window.location.origin}/podcast/${podcast.id}`;
              navigator.clipboard.writeText(url);
            }}
            className="px-4 py-3 glass-card hover:bg-surface-hover transition-colors text-gray-300 text-sm font-medium"
          >
            Share Link
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useFlow } from "./FlowContext";
import { SuggestedSource, VOICE_CATEGORIES } from "@/lib/types";

export default function SuggestedSourcesPage() {
  const { state, update, next, back } = useFlow();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const res = await fetch("/api/suggest-sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: state.topic,
            location: state.userLocation,
            origin: state.userOrigin,
            style: state.style,
          }),
        });
        const data = await res.json();
        if (data.sources && data.sources.length > 0) {
          update({
            suggestedSources: data.sources.map((s: SuggestedSource) => ({ ...s, selected: true })),
          });
        }
        if (data.suggestedAccent) {
          const cat = VOICE_CATEGORIES.find(
            (c) => c.key === data.suggestedAccent || c.label.toLowerCase() === data.suggestedAccent.toLowerCase()
          );
          if (cat) {
            update({ accent: cat.key });
          }
        }
      } catch (e) {
        console.error("Failed to fetch suggestions:", e);
        setError("Could not load suggestions, but you can continue.");
      } finally {
        setLoading(false);
      }
    }
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSource = (index: number) => {
    const updated = [...state.suggestedSources];
    updated[index] = { ...updated[index], selected: !updated[index].selected };
    update({ suggestedSources: updated });
  };

  const accentLabel = VOICE_CATEGORIES.find((c) => c.key === state.accent)?.label || state.accent;

  return (
    <div className="min-h-screen flex flex-col px-4 pt-6 pb-8">
      <div className="max-w-lg mx-auto w-full">
        <button onClick={back} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>

        <h2 className="text-xl font-bold text-white mb-2">Recommended sources</h2>
        <p className="text-gray-400 text-sm mb-6">
          Based on your interest in <span className="text-brand-400">{state.topic}</span>, here&apos;s what we&apos;ll use:
        </p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-4 animate-pulse">
                <div className="h-4 bg-surface-hover rounded w-3/4 mb-2" />
                <div className="h-3 bg-surface-hover rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {state.suggestedSources.length === 0 && !error && (
              <div className="glass-card p-4 text-gray-400 text-sm text-center">
                No specific sources suggested. We&apos;ll use our built-in content feeds.
              </div>
            )}
            {error && (
              <div className="glass-card p-4 text-yellow-400 text-sm">{error}</div>
            )}
            {state.suggestedSources.map((source, idx) => (
              <button
                key={idx}
                onClick={() => toggleSource(idx)}
                className={`w-full glass-card p-4 text-left transition-all ${
                  source.selected ? "border-brand-500/40" : "opacity-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                    source.selected ? "bg-brand-600 border-brand-500" : "border-gray-600"
                  }`}>
                    {source.selected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white">{source.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{source.reason}</div>
                    {source.url && (
                      <div className="text-xs text-brand-400 mt-1 truncate">{source.url}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Accent suggestion */}
        <div className="glass-card p-4 mb-6">
          <div className="text-sm text-gray-400 mb-1">Suggested accent</div>
          <div className="text-white font-medium">
            {accentLabel} <span className="text-gray-500 text-sm">(based on your origin)</span>
          </div>
        </div>

        <button
          onClick={next}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 disabled:from-gray-700 disabled:to-gray-600 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-brand-500/25"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

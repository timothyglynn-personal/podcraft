"use client";

import { useFlow } from "./FlowContext";
import { VOICE_OPTIONS, VOICE_CATEGORIES } from "@/lib/types";

export default function ExtraSourcesPage() {
  const { state, update, back, generate } = useFlow();

  const handleGenerate = () => {
    generate();
  };

  return (
    <div className="min-h-screen flex flex-col px-4 pt-6 pb-8">
      <div className="max-w-lg mx-auto w-full">
        <button onClick={back} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>

        {/* Selected sources summary */}
        {state.suggestedSources.filter((s) => s.selected).length > 0 && (
          <div className="glass-card p-4 mb-6">
            <div className="text-xs text-gray-400 mb-2">Using these sources:</div>
            <div className="flex flex-wrap gap-2">
              {state.suggestedSources.filter((s) => s.selected).map((s, i) => (
                <span key={i} className="px-2 py-1 bg-brand-600/20 text-brand-300 text-xs rounded-lg">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Additional sources */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-2">Add more sources</h2>
          <p className="text-xs text-gray-400 mb-3">
            Paste URLs or type source names (one per line). These help us find the best content.
          </p>
          <textarea
            value={state.additionalUrls}
            onChange={(e) => update({ additionalUrls: e.target.value })}
            placeholder={"https://espn.com/nfl/...\nhttps://youtube.com/watch?v=...\nSports Illustrated\nLocal newspaper name"}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-surface-dark border border-brand-500/20 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 outline-none transition-all text-white placeholder-gray-500 text-sm resize-none"
          />
        </div>

        {/* Additional context */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-2">Any specific requests?</h2>
          <p className="text-xs text-gray-400 mb-3">
            Tell us anything specific you want covered.
          </p>
          <textarea
            value={state.additionalContext}
            onChange={(e) => update({ additionalContext: e.target.value })}
            placeholder="e.g. Focus on second half results. Mention the new manager."
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-surface-dark border border-brand-500/20 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 outline-none transition-all text-white placeholder-gray-500 text-sm resize-none"
          />
        </div>

        {/* Voice / Accent selection */}
        <div className="glass-card p-4 mb-8">
          <h3 className="text-sm font-semibold text-white mb-3">Podcast voice</h3>
          <select
            value={state.voiceId}
            onChange={(e) => {
              const voice = VOICE_OPTIONS.find((v) => v.id === e.target.value);
              update({
                voiceId: e.target.value,
                accent: voice?.category || state.accent,
              });
            }}
            className="w-full px-4 py-3 rounded-xl bg-surface-dark border border-brand-500/20 focus:border-brand-500 outline-none transition-all text-white text-sm"
          >
            {VOICE_CATEGORIES.map((cat) => (
              <optgroup key={cat.key} label={`${cat.label} voices`}>
                {VOICE_OPTIONS.filter((v) => v.category === cat.key).map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} - {voice.description}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-400 hover:from-brand-700 hover:to-brand-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-brand-500/25 text-lg"
        >
          Confirm and Create Podcast
        </button>
      </div>
    </div>
  );
}

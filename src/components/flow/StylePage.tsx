"use client";

import { useFlow } from "./FlowContext";
import { STYLE_OPTIONS, PodcastRequest } from "@/lib/types";

export default function StylePage() {
  const { state, update, next, back } = useFlow();

  return (
    <div className="min-h-screen flex flex-col px-4 pt-6 pb-8">
      <div className="max-w-lg mx-auto w-full">
        {/* Back button */}
        <button onClick={back} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>

        {/* Topic summary */}
        <div className="glass-card p-3 px-4 mb-6 flex items-center gap-2">
          <span className="text-brand-400">🎙️</span>
          <span className="text-sm text-gray-300 truncate">{state.topic}</span>
        </div>

        {/* Style selection */}
        <h2 className="text-xl font-bold text-white mb-4">Choose a style</h2>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ style: opt.value as PodcastRequest["style"] })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                state.style === opt.value
                  ? "style-card-selected bg-brand-600/10"
                  : "border-surface-hover bg-surface-card hover:border-brand-500/30"
              }`}
            >
              <div className="text-2xl mb-2">{opt.icon}</div>
              <div className="text-sm font-semibold text-white">{opt.label}</div>
              <div className="text-xs text-gray-400 mt-1">{opt.description}</div>
            </button>
          ))}
        </div>

        {/* Length selection */}
        <h2 className="text-xl font-bold text-white mb-4">How long?</h2>
        <div className="flex gap-3 mb-8">
          {([3, 5, 10] as const).map((mins) => (
            <button
              key={mins}
              onClick={() => update({ lengthMinutes: mins })}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                state.lengthMinutes === mins
                  ? "border-brand-500 bg-brand-600/10 text-brand-300"
                  : "border-surface-hover text-gray-400 hover:border-brand-500/30"
              }`}
            >
              {mins} min
            </button>
          ))}
        </div>

        {/* Continue */}
        <button
          onClick={next}
          className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-brand-500/25"
        >
          Next
        </button>
      </div>
    </div>
  );
}

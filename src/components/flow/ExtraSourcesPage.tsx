"use client";

import { useFlow } from "./FlowContext";
import { VOICE_OPTIONS, VOICE_CATEGORIES, PodcastFrequency } from "@/lib/types";
import { useSession, signIn } from "next-auth/react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ExtraSourcesPage() {
  const { state, update, back, generate } = useFlow();
  const { data: session } = useSession();

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

        {/* Error message from failed generation */}
        {state.status.step === "error" && (
          <div className="glass-card p-4 mb-6 border border-red-500/30">
            <p className="text-red-400 text-sm">{state.status.message}</p>
            <button
              onClick={() => update({ status: { step: "idle", message: "" } })}
              className="text-xs text-gray-500 hover:text-gray-300 mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

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

        {/* Frequency selector */}
        <div className="glass-card p-4 mb-8">
          <h3 className="text-sm font-semibold text-white mb-3">How often?</h3>
          <div className="flex gap-2 mb-3">
            {([
              { value: "one-time" as PodcastFrequency, label: "One-time" },
              { value: "daily" as PodcastFrequency, label: "Daily" },
              { value: "weekly" as PodcastFrequency, label: "Weekly" },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => update({ frequency: opt.value })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  state.frequency === opt.value
                    ? "bg-brand-600 text-white shadow-md"
                    : "bg-surface-dark text-gray-400 hover:text-white border border-brand-500/20"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {state.frequency === "weekly" && (
            <select
              value={state.weeklyDay}
              onChange={(e) => update({ weeklyDay: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-xl bg-surface-dark border border-brand-500/20 focus:border-brand-500 outline-none transition-all text-white text-sm"
            >
              {DAYS.map((day, i) => (
                <option key={i} value={i}>{day}</option>
              ))}
            </select>
          )}
          {state.frequency !== "one-time" && !session && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-400 mb-2">
                Sign in to get {state.frequency} updates delivered to you.
              </p>
              <button
                onClick={() => signIn(undefined, { callbackUrl: window.location.href })}
                className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-sm font-medium rounded-lg transition-colors"
              >
                Sign in to subscribe
              </button>
            </div>
          )}
          {state.frequency !== "one-time" && session && (
            <p className="text-xs text-green-400 mt-2">
              {state.frequency === "daily"
                ? "A new episode will be generated every morning at 6am."
                : `A new episode will be generated every ${DAYS[state.weeklyDay]} at 6am.`}
            </p>
          )}
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-400 hover:from-brand-700 hover:to-brand-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-brand-500/25 text-lg"
        >
          {state.frequency === "one-time"
            ? "Confirm and Create Podcast"
            : !session
              ? "Create as one-time podcast"
              : `Create Podcast & Subscribe ${state.frequency === "daily" ? "Daily" : "Weekly"}`}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useFlow } from "./FlowContext";
import { useEffect, useState } from "react";

const STEPS = [
  { key: "ingesting", label: "Finding the best content", icon: "🔍" },
  { key: "scripting", label: "Writing your podcast script", icon: "✍️" },
  { key: "recording", label: "Recording with AI voice", icon: "🎙️" },
  { key: "done", label: "Your podcast is ready!", icon: "✅" },
];

const FUN_MESSAGES = [
  "Mixing your ingredients...",
  "Distilling the best bits...",
  "Fine-tuning the audio...",
  "Adding a dash of personality...",
  "Polishing the final cut...",
  "Almost there...",
  "Crafting something special...",
  "Brewing your podcast...",
];

export default function GeneratingPage() {
  const { state, generate, goTo } = useFlow();
  const [messageIdx, setMessageIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Cycle fun messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % FUN_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentStepIdx = STEPS.findIndex((s) => s.key === state.status.step);
  const estimatedTotal = state.lengthMinutes <= 3 ? 40 : state.lengthMinutes <= 5 ? 60 : 90;
  const progress = Math.min((elapsed / estimatedTotal) * 100, 95);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Animated beaker */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-brand-600/20 animate-pulse-slow" />
          <div className="absolute inset-4 rounded-full bg-brand-500/20 animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
          <div className="absolute inset-8 rounded-full bg-brand-400/30 animate-pulse-slow" style={{ animationDelay: "1s" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl animate-float">🧪</span>
          </div>

          {/* Bubbles */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-brand-400/60 bubble"
              style={{
                left: `${30 + Math.random() * 40}%`,
                bottom: "30%",
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${1.5 + Math.random()}s`,
              }}
            />
          ))}
        </div>

        {/* Fun message */}
        <p className="text-brand-300 font-medium text-lg mb-2 h-7 animate-fade-in" key={messageIdx}>
          {FUN_MESSAGES[messageIdx]}
        </p>

        {/* Progress bar */}
        <div className="w-full h-2 bg-surface-card rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Time estimate */}
        <p className="text-gray-500 text-xs mb-8">
          ~{Math.max(0, estimatedTotal - elapsed)}s remaining
        </p>

        {/* Step progress */}
        <div className="glass-card p-5 text-left">
          <div className="space-y-4">
            {STEPS.map((step, index) => {
              const isActive = step.key === state.status.step;
              const isDone = currentStepIdx > index || state.status.step === "done";
              const isPending = currentStepIdx < index && state.status.step !== "done";

              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    isPending ? "opacity-30" : "opacity-100"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                    isDone ? "bg-green-500/20" : isActive ? "bg-brand-500/20" : "bg-surface-hover"
                  }`}>
                    {isDone ? "✅" : isActive ? (
                      <span className="animate-pulse">{step.icon}</span>
                    ) : step.icon}
                  </div>
                  <span className={`text-sm font-medium ${
                    isActive ? "text-brand-300" : isDone ? "text-green-400" : "text-gray-500"
                  }`}>
                    {step.label}
                  </span>
                  {isActive && state.status.step !== "done" && (
                    <div className="ml-auto">
                      <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {state.status.step === "error" && (
          <div className="mt-4 glass-card p-4 border border-red-500/30">
            <p className="text-red-400 text-sm mb-4">{state.status.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => generate()}
                className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => goTo("extra-sources")}
                className="flex-1 py-2 border border-surface-hover text-gray-400 hover:text-white text-sm font-medium rounded-xl transition-colors"
              >
                Go back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

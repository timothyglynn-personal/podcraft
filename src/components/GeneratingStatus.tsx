"use client";

import { GenerationStatus } from "@/lib/types";

const STEPS = [
  { key: "ingesting", label: "Fetching articles", icon: "📡" },
  { key: "scripting", label: "Writing script", icon: "✍️" },
  { key: "recording", label: "Recording audio", icon: "🎙️" },
  { key: "done", label: "Ready to play", icon: "✅" },
];

export default function GeneratingStatus({
  status,
}: {
  status: GenerationStatus;
}) {
  if (status.step === "idle") return null;

  const currentIndex = STEPS.findIndex((s) => s.key === status.step);

  return (
    <div className="w-full max-w-md mx-auto mt-8 p-6 bg-white rounded-2xl shadow-lg">
      <div className="space-y-4">
        {STEPS.map((step, index) => {
          const isActive = step.key === status.step;
          const isDone = currentIndex > index || status.step === "done";
          const isPending = currentIndex < index && status.step !== "done";

          return (
            <div
              key={step.key}
              className={`flex items-center gap-3 transition-all duration-300 ${
                isPending ? "opacity-40" : "opacity-100"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  isDone
                    ? "bg-green-100"
                    : isActive
                    ? "bg-blue-100"
                    : "bg-gray-100"
                }`}
              >
                {isDone ? "✅" : isActive ? (
                  <span className="animate-pulse">{step.icon}</span>
                ) : (
                  step.icon
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isActive ? "text-blue-700" : isDone ? "text-green-700" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
              {isActive && status.step !== "done" && (
                <div className="ml-auto">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {status.step === "error" && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg text-sm text-red-700">
          {status.message}
        </div>
      )}
    </div>
  );
}

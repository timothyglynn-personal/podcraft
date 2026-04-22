"use client";

import { useState } from "react";
import { useFlow } from "./FlowContext";

export default function TopicPage() {
  const { state, update, next } = useFlow();
  const [topic, setTopic] = useState(state.topic);

  const handleContinue = () => {
    if (!topic.trim()) return;
    update({ topic: topic.trim() });
    next();
  };

  return (
    <div className="min-h-screen flex flex-col px-4 pt-6">
      {/* Top bar */}
      <div className="max-w-lg mx-auto w-full mb-8">
        <div className="text-sm text-gray-400">
          Hey <span className="text-brand-400 font-medium">{state.userName}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full -mt-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            What would you like to learn about?
          </h2>
          <p className="text-gray-400 text-sm">
            Describe your ideal podcast topic
          </p>
        </div>

        <div className="w-full space-y-6">
          <div className="glass-card p-1">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Hurling results and Limerick GAA, San Francisco 49ers football, Latest AI developments..."
              rows={3}
              className="w-full px-4 py-4 rounded-xl bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg resize-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleContinue();
                }
              }}
            />
          </div>

          <button
            onClick={handleContinue}
            disabled={!topic.trim()}
            className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 disabled:from-gray-700 disabled:to-gray-600 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-brand-500/25 disabled:shadow-none disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

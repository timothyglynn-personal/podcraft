"use client";

import { useState } from "react";
import type { Subscription } from "@/lib/types";
import PodcastCard from "./PodcastCard";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface SubscriptionCardProps {
  subscription: Subscription;
  onPause: (id: string) => void;
  onCancel: (id: string) => void;
}

export default function SubscriptionCard({ subscription, onPause, onCancel }: SubscriptionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const frequencyLabel = subscription.frequency === "daily"
    ? "Daily"
    : `Weekly (${DAYS[subscription.weeklyDay ?? 0]})`;

  const nextDue = subscription.nextDueAt
    ? new Date(subscription.nextDueAt).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "Unknown";

  const episodeLabel = (idx: number) => {
    const ep = subscription.episodes[idx];
    if (!ep) return "";
    const date = new Date(ep.createdAt);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }) + "'s edition";
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-white">{subscription.topic}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-brand-600/20 text-brand-300 text-xs rounded-full">
              {frequencyLabel}
            </span>
            <span className="px-2 py-0.5 bg-surface-dark text-gray-400 text-xs rounded-full">
              {subscription.style}
            </span>
            {!subscription.active && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full">
                Paused
              </span>
            )}
          </div>
        </div>
      </div>

      {subscription.active && (
        <p className="text-xs text-gray-400 mb-3">
          Next episode: {nextDue}
        </p>
      )}

      {/* Episodes list */}
      {subscription.episodes.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 mb-2"
          >
            <svg
              className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {subscription.episodes.length} episode{subscription.episodes.length !== 1 ? "s" : ""}
          </button>

          {expanded && (
            <div className="space-y-2 ml-4">
              {subscription.episodes.map((ep, i) => (
                <div key={ep.id}>
                  <p className="text-xs text-gray-500 mb-1">{episodeLabel(i)}</p>
                  <PodcastCard podcast={ep} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        {subscription.active ? (
          <button
            onClick={() => onPause(subscription.id)}
            className="flex-1 py-1.5 text-xs text-gray-400 hover:text-white border border-surface-hover rounded-lg hover:bg-surface-card transition-all"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={() => onPause(subscription.id)}
            className="flex-1 py-1.5 text-xs text-brand-400 hover:text-brand-300 border border-brand-500/20 rounded-lg hover:bg-brand-600/10 transition-all"
          >
            Resume
          </button>
        )}
        <button
          onClick={() => onCancel(subscription.id)}
          className="flex-1 py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg hover:bg-red-600/10 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

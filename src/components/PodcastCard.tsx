"use client";

import Link from "next/link";
import { Podcast } from "@/lib/types";

export default function PodcastCard({ podcast }: { podcast: Podcast }) {
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-IE", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Link href={`/podcast/${podcast.id}`}>
      <div className="glass-card p-4 cursor-pointer hover:bg-surface-hover transition-all">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0">
            🎙️
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white truncate text-sm">
              {podcast.title}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {formatDuration(podcast.durationSeconds)} &middot;{" "}
              {formatDate(podcast.createdAt)}
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-brand-600/20 text-brand-300 text-xs rounded-full">
              {podcast.style}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

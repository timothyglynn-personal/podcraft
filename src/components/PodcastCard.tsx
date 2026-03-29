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
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0">
            🎙️
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate text-sm">
              {podcast.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {formatDuration(podcast.durationSeconds)} &middot;{" "}
              {formatDate(podcast.createdAt)}
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
              {podcast.style}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

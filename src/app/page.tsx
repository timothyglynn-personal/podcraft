"use client";

import { useState, useEffect } from "react";
import PodcastForm from "@/components/PodcastForm";
import PodcastCard from "@/components/PodcastCard";
import { Podcast } from "@/lib/types";

export default function Home() {
  const [recentPodcasts, setRecentPodcasts] = useState<Podcast[]>([]);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("podcraft-podcasts") || "[]"
    );
    setRecentPodcasts(saved);
  }, []);

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white px-4 pt-12 pb-16">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-3xl font-bold tracking-tight">PodCraft</h1>
          <p className="mt-2 text-blue-100 text-sm">
            AI-generated podcasts, tailored to you
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-lg mx-auto">
          <PodcastForm />
        </div>
      </div>

      {/* Recent podcasts */}
      {recentPodcasts.length > 0 && (
        <div className="px-4 mt-8 max-w-lg mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Your podcasts
          </h2>
          <div className="space-y-3">
            {recentPodcasts.map((podcast) => (
              <PodcastCard key={podcast.id} podcast={podcast} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Podcast } from "@/lib/types";
import { getActiveProfile, clearActiveUser } from "@/lib/profile";
import PodcastCard from "./PodcastCard";

interface ProfileViewProps {
  onClose: () => void;
}

export default function ProfileView({ onClose }: ProfileViewProps) {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const profile = getActiveProfile();

  useEffect(() => {
    if (!profile) return;
    const allPodcasts: Podcast[] = JSON.parse(
      localStorage.getItem("podcraft-podcasts") || "[]"
    );
    // Filter to this user's podcasts
    const userPodcasts = allPodcasts.filter((p) =>
      profile.podcasts.includes(p.id)
    );
    // If no profile podcast IDs yet, show all (backward compat)
    setPodcasts(userPodcasts.length > 0 ? userPodcasts : allPodcasts);
  }, [profile]);

  const handleSwitchUser = () => {
    clearActiveUser();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-surface-mid border-t border-brand-500/20 rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-in">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-gray-600" />
        </div>

        <div className="px-5 pb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">
                {profile?.name || "Your Profile"}
              </h2>
              {profile && (
                <p className="text-sm text-gray-400">
                  {profile.location} &middot; From {profile.origin}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Podcasts */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              Your Podcasts ({podcasts.length})
            </h3>
            {podcasts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No podcasts yet. Create your first one!
              </div>
            ) : (
              <div className="space-y-3">
                {podcasts.map((podcast) => (
                  <PodcastCard key={podcast.id} podcast={podcast} />
                ))}
              </div>
            )}
          </div>

          {/* Switch user */}
          <button
            onClick={handleSwitchUser}
            className="w-full py-3 text-sm text-gray-400 hover:text-white border border-surface-hover rounded-xl hover:bg-surface-card transition-all"
          >
            Switch User
          </button>
        </div>
      </div>
    </div>
  );
}

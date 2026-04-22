"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Podcast, PodcastRequest, Subscription, STYLE_OPTIONS, VOICE_CATEGORIES, VOICE_OPTIONS } from "@/lib/types";
import { getActiveProfile, clearActiveUser, updatePreferences, getPreferences, deletePodcastFromProfile } from "@/lib/profile";
import { getAllFeedback } from "@/lib/feedback";
import PodcastCard from "./PodcastCard";
import SubscriptionCard from "./SubscriptionCard";

interface ProfileViewProps {
  onClose: () => void;
}

type Tab = "podcasts" | "subscriptions" | "preferences" | "feedback";

export default function ProfileView({ onClose }: ProfileViewProps) {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("podcasts");
  const { data: session } = useSession();
  const profile = getActiveProfile();
  const prefs = getPreferences();
  const feedback = getAllFeedback();

  // Load podcasts from localStorage + DB
  useEffect(() => {
    const localPodcasts: Podcast[] = JSON.parse(
      localStorage.getItem("podcraft-podcasts") || "[]"
    );

    if (profile) {
      const userPodcasts = localPodcasts.filter((p) => profile.podcasts.includes(p.id));
      setPodcasts(userPodcasts.length > 0 ? userPodcasts : localPodcasts);
    } else {
      setPodcasts(localPodcasts);
    }

    // Also fetch from server for signed-in users (subscription-generated podcasts)
    if (session?.user) {
      fetch("/api/podcasts")
        .then((r) => r.json())
        .then((data) => {
          if (data.podcasts?.length) {
            setPodcasts((prev) => {
              const ids = new Set(prev.map((p) => p.id));
              const serverOnly = data.podcasts.filter((p: Podcast) => !ids.has(p.id));
              return [...prev, ...serverOnly];
            });
          }
        })
        .catch(() => {});
    }
  }, [profile, session]);

  // Load subscriptions from server
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/subscriptions")
      .then((r) => r.json())
      .then((data) => setSubscriptions(data.subscriptions || []))
      .catch(() => {});
  }, [session]);

  const handleSwitchUser = () => {
    clearActiveUser();
    window.location.reload();
  };

  const handleDeletePodcast = (podcastId: string) => {
    deletePodcastFromProfile(podcastId);
    setPodcasts((prev) => prev.filter((p) => p.id !== podcastId));
  };

  const handlePauseSubscription = async (id: string) => {
    // Toggle active state — for now just deactivate
    await fetch(`/api/subscriptions?id=${id}`, { method: "DELETE" });
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const handleCancelSubscription = async (id: string) => {
    await fetch(`/api/subscriptions?id=${id}`, { method: "DELETE" });
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "podcasts", label: "Podcasts" },
    { key: "subscriptions", label: "Subs" },
    { key: "preferences", label: "Settings" },
    { key: "feedback", label: "Feedback" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface-mid border-t border-brand-500/20 rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-in">
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-gray-600" />
        </div>

        <div className="px-5 pb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">{profile?.name || "Profile"}</h2>
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

          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-surface-dark rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.key
                    ? "bg-brand-600/20 text-brand-300"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Podcasts tab */}
          {activeTab === "podcasts" && (
            <div>
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
                    <div key={podcast.id} className="relative group">
                      <PodcastCard podcast={podcast} />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeletePodcast(podcast.id);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        title="Delete podcast"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subscriptions tab */}
          {activeTab === "subscriptions" && (
            <div>
              {!session ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm mb-4">
                    Sign in to create daily or weekly podcast subscriptions and get notified when new episodes are ready.
                  </p>
                  <button
                    onClick={() => signIn(undefined, { callbackUrl: window.location.href })}
                    className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    Sign in
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">
                    Your Subscriptions ({subscriptions.length})
                  </h3>
                  {subscriptions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No subscriptions yet. Create a daily or weekly podcast to get started!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {subscriptions.map((sub) => (
                        <SubscriptionCard
                          key={sub.id}
                          subscription={sub}
                          onPause={handlePauseSubscription}
                          onCancel={handleCancelSubscription}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Preferences tab */}
          {activeTab === "preferences" && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Default style</label>
                <select
                  value={prefs.defaultStyle}
                  onChange={(e) => updatePreferences({ defaultStyle: e.target.value as PodcastRequest["style"] })}
                  className="w-full px-4 py-3 rounded-xl bg-surface-dark border border-brand-500/20 text-white text-sm outline-none"
                >
                  {STYLE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.icon} {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Default length</label>
                <div className="flex gap-3">
                  {([3, 5, 10] as const).map((mins) => (
                    <button
                      key={mins}
                      onClick={() => updatePreferences({ defaultLength: mins })}
                      className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                        prefs.defaultLength === mins
                          ? "border-brand-500 bg-brand-600/10 text-brand-300"
                          : "border-surface-hover text-gray-400"
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>

              {session && (
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Notifications</label>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-surface-dark border border-brand-500/20">
                      <span className="text-sm text-gray-300">Email notifications</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        onChange={(e) => {
                          fetch("/api/profile", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ preferences: { notifyEmail: e.target.checked } }),
                          }).catch(() => {});
                        }}
                        className="w-4 h-4 accent-brand-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-xl bg-surface-dark border border-brand-500/20">
                      <span className="text-sm text-gray-300">Push notifications</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        onChange={(e) => {
                          fetch("/api/profile", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ preferences: { notifyPush: e.target.checked } }),
                          }).catch(() => {});
                        }}
                        className="w-4 h-4 accent-brand-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Default voice</label>
                <select
                  value={prefs.defaultVoiceId || ""}
                  onChange={(e) => {
                    const voice = VOICE_OPTIONS.find((v) => v.id === e.target.value);
                    updatePreferences({
                      defaultVoiceId: e.target.value,
                      defaultAccent: voice?.category || prefs.defaultAccent,
                    });
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-surface-dark border border-brand-500/20 text-white text-sm outline-none"
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
            </div>
          )}

          {/* Feedback tab */}
          {activeTab === "feedback" && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                Your Feedback ({feedback.length})
              </h3>
              {feedback.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No feedback yet. Listen to a podcast and share your thoughts!
                </div>
              ) : (
                <div className="space-y-3">
                  {feedback.slice(0, 20).map((fb, i) => (
                    <div key={i} className="glass-card p-3">
                      {fb.quickTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {fb.quickTags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-brand-600/20 text-brand-300 text-xs rounded-full">
                              {tag.replace(/-/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}
                      {fb.textFeedback && (
                        <p className="text-sm text-gray-300">{fb.textFeedback}</p>
                      )}
                      {fb.voiceTranscript && (
                        <p className="text-sm text-gray-400 italic mt-1">
                          🎤 &ldquo;{fb.voiceTranscript}&rdquo;
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Switch user */}
          <button
            onClick={handleSwitchUser}
            className="w-full mt-6 py-3 text-sm text-gray-400 hover:text-white border border-surface-hover rounded-xl hover:bg-surface-card transition-all"
          >
            Switch User
          </button>
        </div>
      </div>
    </div>
  );
}

import { UserProfile, UserPreferences, PodcastFeedback } from "./types";

const PROFILE_PREFIX = "podcraft-user-";
const ACTIVE_USER_KEY = "podcraft-active-user";

function profileKey(name: string): string {
  return `${PROFILE_PREFIX}${name.toLowerCase().trim()}`;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultStyle: "news-briefing",
  defaultLength: 5,
  defaultAccent: "american",
  defaultVoiceId: "",
};

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  const key = profileKey(profile.name);
  const existing = getProfile(profile.name);
  if (existing) {
    const merged: UserProfile = {
      ...existing,
      location: profile.location,
      origin: profile.origin,
    };
    localStorage.setItem(key, JSON.stringify(merged));
  } else {
    // New profile with defaults
    const withDefaults: UserProfile = {
      ...profile,
      feedback: profile.feedback || [],
      preferences: profile.preferences || DEFAULT_PREFERENCES,
    };
    localStorage.setItem(key, JSON.stringify(withDefaults));
  }
  setActiveUser(profile.name);
}

export function getProfile(name: string): UserProfile | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(profileKey(name));
  if (!data) return null;
  try {
    const profile = JSON.parse(data);
    // Migrate old profiles missing new fields
    if (!profile.feedback) profile.feedback = [];
    if (!profile.preferences) profile.preferences = DEFAULT_PREFERENCES;
    return profile;
  } catch {
    return null;
  }
}

export function getActiveProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const activeName = localStorage.getItem(ACTIVE_USER_KEY);
  if (!activeName) return null;
  return getProfile(activeName);
}

export function setActiveUser(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_USER_KEY, name.toLowerCase().trim());
}

export function addPodcastToProfile(podcastId: string): void {
  if (typeof window === "undefined") return;
  const profile = getActiveProfile();
  if (!profile) return;
  if (!profile.podcasts.includes(podcastId)) {
    profile.podcasts.unshift(podcastId);
    localStorage.setItem(profileKey(profile.name), JSON.stringify(profile));
  }
}

export function addFeedbackToProfile(feedback: PodcastFeedback): void {
  if (typeof window === "undefined") return;
  const profile = getActiveProfile();
  if (!profile) return;
  if (!profile.feedback) profile.feedback = [];
  profile.feedback.unshift(feedback);
  localStorage.setItem(profileKey(profile.name), JSON.stringify(profile));
}

export function getPreferences(): UserPreferences {
  const profile = getActiveProfile();
  return profile?.preferences || DEFAULT_PREFERENCES;
}

export function updatePreferences(prefs: Partial<UserPreferences>): void {
  if (typeof window === "undefined") return;
  const profile = getActiveProfile();
  if (!profile) return;
  profile.preferences = { ...profile.preferences, ...prefs };
  localStorage.setItem(profileKey(profile.name), JSON.stringify(profile));
}

export function clearActiveUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACTIVE_USER_KEY);
}

export function deletePodcastFromProfile(podcastId: string): void {
  if (typeof window === "undefined") return;
  const profile = getActiveProfile();
  if (!profile) return;
  profile.podcasts = profile.podcasts.filter((id) => id !== podcastId);
  profile.feedback = (profile.feedback || []).filter((f) => f.podcastId !== podcastId);
  localStorage.setItem(profileKey(profile.name), JSON.stringify(profile));

  // Also remove from global podcast list
  const all = JSON.parse(localStorage.getItem("podcraft-podcasts") || "[]");
  const filtered = all.filter((p: { id: string }) => p.id !== podcastId);
  localStorage.setItem("podcraft-podcasts", JSON.stringify(filtered));
}

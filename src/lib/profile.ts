import { UserProfile } from "./types";

const PROFILE_PREFIX = "podcraft-user-";
const ACTIVE_USER_KEY = "podcraft-active-user";

function profileKey(name: string): string {
  return `${PROFILE_PREFIX}${name.toLowerCase().trim()}`;
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  const key = profileKey(profile.name);
  const existing = getProfile(profile.name);
  if (existing) {
    // Merge: keep existing podcasts, update other fields
    const merged = {
      ...existing,
      location: profile.location,
      origin: profile.origin,
    };
    localStorage.setItem(key, JSON.stringify(merged));
  } else {
    localStorage.setItem(key, JSON.stringify(profile));
  }
  setActiveUser(profile.name);
}

export function getProfile(name: string): UserProfile | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(profileKey(name));
  if (!data) return null;
  try {
    return JSON.parse(data);
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

export function clearActiveUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACTIVE_USER_KEY);
}

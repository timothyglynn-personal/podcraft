"use client";

import { useState } from "react";
import { useFlow, guessAccentFromOrigin, guessVoiceFromOrigin } from "./FlowContext";
import { saveProfile, setActiveUser } from "@/lib/profile";

export default function WelcomePage() {
  const { state, update, next } = useFlow();
  const [name, setName] = useState(state.userName);
  const [location, setLocation] = useState(state.userLocation);
  const [origin, setOrigin] = useState(state.userOrigin);

  const canContinue = name.trim() && location.trim() && origin.trim();

  const handleContinue = () => {
    if (!canContinue) return;

    const accent = guessAccentFromOrigin(origin);
    const voiceId = guessVoiceFromOrigin(origin);

    update({
      userName: name.trim(),
      userLocation: location.trim(),
      userOrigin: origin.trim(),
      accent,
      voiceId,
    });

    // Save profile
    saveProfile({
      name: name.trim(),
      location: location.trim(),
      origin: origin.trim(),
      podcasts: [],
      createdAt: new Date().toISOString(),
    });
    setActiveUser(name.trim());

    next();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and welcome */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 animate-glow">
            <span className="text-3xl">🎙️</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text">Welcome to PodCraft</h1>
          <p className="text-gray-400 text-sm">AI-powered podcasts, made just for you</p>
        </div>

        {/* Form */}
        <div className="glass-card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What&apos;s your name?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tim"
              className="w-full px-4 py-3 rounded-xl bg-surface-dark border border-brand-500/20 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 outline-none transition-all text-white placeholder-gray-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Where do you live?
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, Limerick, Tokyo"
              className="w-full px-4 py-3 rounded-xl bg-surface-dark border border-brand-500/20 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 outline-none transition-all text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Where are you originally from?
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Ireland, Nigeria, Michigan"
              className="w-full px-4 py-3 rounded-xl bg-surface-dark border border-brand-500/20 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 outline-none transition-all text-white placeholder-gray-500"
              onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            />
          </div>

          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 disabled:from-gray-700 disabled:to-gray-600 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-brand-500/25 disabled:shadow-none disabled:cursor-not-allowed"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

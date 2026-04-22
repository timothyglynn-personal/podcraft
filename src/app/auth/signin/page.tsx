"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("resend", { email, redirect: false });
      if (result?.error) {
        setError(`Sign-in failed: ${result.error}`);
      } else {
        setSent(true);
      }
    } catch (err) {
      setError(`Sign-in error: ${err instanceof Error ? err.message : String(err)}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">PodCraft</h1>
          <p className="text-gray-400">Sign in to save your podcasts and subscriptions</p>
        </div>

        <div className="glass-card p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Apple Sign In */}
          <button
            onClick={() => signIn("apple", { callbackUrl: "/" })}
            className="w-full py-3 bg-white text-black font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-500 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Email Magic Link */}
          {sent ? (
            <div className="text-center py-4">
              <div className="text-2xl mb-2">&#9993;</div>
              <p className="text-white font-semibold">Check your email</p>
              <p className="text-gray-400 text-sm mt-1">
                We sent a sign-in link to <span className="text-brand-400">{email}</span>
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-surface-dark border border-brand-500/20 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 outline-none transition-all text-white placeholder-gray-500 text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-400 hover:from-brand-700 hover:to-brand-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? "Sending..." : "Sign in with email"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          By signing in, you agree to our{" "}
          <a href="/terms" className="text-brand-400 hover:underline">Terms</a>
          {" "}and{" "}
          <a href="/privacy" className="text-brand-400 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

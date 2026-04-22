import NextAuth from "next-auth";
import type { NextAuthResult } from "next-auth";
import Apple from "next-auth/providers/apple";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb } from "@/lib/db";

let _authResult: NextAuthResult | null = null;

function getAuthResult(): NextAuthResult {
  if (_authResult) return _authResult;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providers: any[] = [];

  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
    providers.push(
      Apple({
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: process.env.APPLE_CLIENT_SECRET,
      })
    );
  }

  if (process.env.RESEND_API_KEY) {
    providers.push(
      Resend({
        apiKey: process.env.RESEND_API_KEY,
        from: "PodCraft <onboarding@resend.dev>",
      })
    );
  }

  _authResult = NextAuth({
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    adapter: DrizzleAdapter(getDb()),
    providers,
    session: {
      strategy: "database",
    },
    pages: {
      signIn: "/auth/signin",
      verifyRequest: "/auth/verify",
    },
    callbacks: {
      session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      },
    },
  });

  return _authResult;
}

// Lazy exports — only initialize when actually called at runtime, not at build time
export const handlers = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  GET: (...args: any[]) => (getAuthResult().handlers.GET as any)(...args),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  POST: (...args: any[]) => (getAuthResult().handlers.POST as any)(...args),
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth = (...args: any[]) => (getAuthResult().auth as any)(...args);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signIn = (...args: any[]) => (getAuthResult().signIn as any)(...args);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signOut = (...args: any[]) => (getAuthResult().signOut as any)(...args);

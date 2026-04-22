import NextAuth from "next-auth";
import type { NextAuthResult } from "next-auth";
import Apple from "next-auth/providers/apple";
import Email from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb } from "@/lib/db";
import { Resend } from "resend";

let _authResult: NextAuthResult | null = null;

function getAuthResult(): NextAuthResult {
  if (_authResult) return _authResult;

  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  const providers = [];

  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
    providers.push(
      Apple({
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: process.env.APPLE_CLIENT_SECRET,
      })
    );
  }

  providers.push({
    id: "email",
    name: "Email",
    type: "email" as const,
    maxAge: 60 * 60 * 24, // 24 hours
    sendVerificationRequest: async ({ identifier: email, url }: { identifier: string; url: string }) => {
      if (resend) {
        await resend.emails.send({
          from: "PodCraft <onboarding@resend.dev>",
          to: email,
          subject: "Sign in to PodCraft",
          html: `
            <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1a53eb;">Sign in to PodCraft</h2>
              <p>Click below to sign in to your PodCraft account:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #1a53eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Sign in
              </a>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          `,
        });
      } else {
        console.log(`[Auth] Magic link for ${email}: ${url}`);
      }
    },
  });

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

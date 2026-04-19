import NextAuth from "next-auth";
import Apple from "next-auth/providers/apple";
import Email from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Apple({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    Email({
      server: "smtp://placeholder", // Overridden by sendVerificationRequest
      from: "PodCraft <noreply@podcraft.app>",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        if (resend) {
          await resend.emails.send({
            from: "PodCraft <noreply@podcraft.app>",
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
    }),
  ],
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

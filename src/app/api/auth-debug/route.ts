import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    SUPABASE_DB_URL: !!process.env.SUPABASE_DB_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "not set",
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
  };

  // Try to initialize the database
  let dbStatus = "not tested";
  try {
    const { getDb } = await import("@/lib/db");
    const db = getDb();
    dbStatus = db ? "connected" : "null";
  } catch (e) {
    dbStatus = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Try to initialize auth
  let authStatus = "not tested";
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    authStatus = session ? "has session" : "no session (ok)";
  } catch (e) {
    authStatus = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({ checks, dbStatus, authStatus });
}

import { NextResponse } from "next/server";
import { handlers } from "@/lib/auth";

const dbConfigured = !!(process.env.SUPABASE_DB_URL || process.env.DATABASE_URL);
const secretConfigured = !!(process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET);

export async function GET(...args: Parameters<typeof handlers.GET>) {
  if (!dbConfigured || !secretConfigured) {
    const missing = [];
    if (!dbConfigured) missing.push("SUPABASE_DB_URL");
    if (!secretConfigured) missing.push("NEXTAUTH_SECRET");
    return NextResponse.json(
      { error: `Auth not configured. Missing: ${missing.join(", ")}` },
      { status: 503 }
    );
  }
  try {
    return await handlers.GET(...args);
  } catch (e) {
    console.error("[auth] GET error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(...args: Parameters<typeof handlers.POST>) {
  if (!dbConfigured || !secretConfigured) {
    const missing = [];
    if (!dbConfigured) missing.push("SUPABASE_DB_URL");
    if (!secretConfigured) missing.push("NEXTAUTH_SECRET");
    return NextResponse.json(
      { error: `Auth not configured. Missing: ${missing.join(", ")}` },
      { status: 503 }
    );
  }
  try {
    return await handlers.POST(...args);
  } catch (e) {
    console.error("[auth] POST error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

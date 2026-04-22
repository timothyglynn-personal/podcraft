import { NextResponse } from "next/server";
import { handlers } from "@/lib/auth";

const dbConfigured = !!(process.env.SUPABASE_DB_URL || process.env.DATABASE_URL);

export async function GET(...args: Parameters<typeof handlers.GET>) {
  if (!dbConfigured) {
    return NextResponse.json(
      { error: "Authentication is not configured yet. Database connection required." },
      { status: 503 }
    );
  }
  return handlers.GET(...args);
}

export async function POST(...args: Parameters<typeof handlers.POST>) {
  if (!dbConfigured) {
    return NextResponse.json(
      { error: "Authentication is not configured yet. Database connection required." },
      { status: 503 }
    );
  }
  return handlers.POST(...args);
}

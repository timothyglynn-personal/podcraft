import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserById, updateUserProfile, getPreferences, upsertPreferences } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await getUserById(session.user.id);
  const prefs = await getPreferences(session.user.id);

  return NextResponse.json({ user, preferences: prefs });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();

  if (body.name || body.location || body.origin) {
    await updateUserProfile(session.user.id, {
      name: body.name,
      location: body.location,
      origin: body.origin,
    });
  }

  if (body.preferences) {
    await upsertPreferences(session.user.id, body.preferences);
  }

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { safeAuth } from "@/lib/safe-auth";
import { saveDeviceToken, removeDeviceToken } from "@/lib/db/queries";

export async function POST(req: Request) {
  const session = await safeAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { token, platform } = await req.json();
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  await saveDeviceToken(session.user.id, token, platform || "ios");
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  await removeDeviceToken(token);
  return NextResponse.json({ success: true });
}

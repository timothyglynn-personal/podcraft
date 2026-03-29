import { NextResponse } from "next/server";
import { listPodcasts } from "@/lib/blob";

export async function GET() {
  try {
    const podcasts = await listPodcasts();
    return NextResponse.json({ podcasts });
  } catch (error) {
    console.error("List podcasts error:", error);
    return NextResponse.json(
      { error: "Failed to list podcasts" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { listPodcasts } from "@/lib/blob";
import { getPodcastById } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Fetch single podcast by ID (from database)
    if (id) {
      const podcast = await getPodcastById(id);
      if (podcast) {
        return NextResponse.json({
          podcast: {
            id: podcast.id,
            title: podcast.title,
            topic: podcast.topic,
            style: podcast.style,
            audioUrl: podcast.audioUrl,
            scriptText: podcast.scriptText,
            sources: podcast.sources || [],
            durationSeconds: podcast.durationSeconds || 0,
            createdAt: podcast.createdAt?.toISOString() || "",
          },
        });
      }
    }

    // List all podcasts (from blob storage)
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

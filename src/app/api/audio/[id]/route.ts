import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: `podcasts/${id}.mp3` });

    if (blobs.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const response = await fetch(blobs[0].url);
    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Audio proxy error:", error);
    return NextResponse.json({ error: "Failed to load audio" }, { status: 500 });
  }
}

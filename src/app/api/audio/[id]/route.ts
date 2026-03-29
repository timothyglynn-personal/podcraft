import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
    }

    const { head } = await import("@vercel/blob");

    let blobMeta;
    try {
      blobMeta = await head(`podcasts/${id}.mp3`);
    } catch {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Fetch the actual blob data using the URL with token
    const response = await fetch(`${blobMeta.url}?token=${token}`);

    if (!response.ok) {
      // Try alternative: fetch with Authorization header
      const response2 = await fetch(blobMeta.url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response2.ok) {
        return NextResponse.json({ error: "Failed to fetch audio" }, { status: 500 });
      }
      const audioBuffer = await response2.arrayBuffer();
      return new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": String(audioBuffer.byteLength),
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Audio proxy error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to load audio: ${message}` }, { status: 500 });
  }
}

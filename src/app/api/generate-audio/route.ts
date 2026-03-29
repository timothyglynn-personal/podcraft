import { NextRequest, NextResponse } from "next/server";
import { textToSpeech } from "@/lib/elevenlabs";
import { storeAudio, storeMetadata } from "@/lib/blob";
import { Podcast } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { script, title, topic, style, voiceId, sources } =
      await request.json();

    if (!script || !voiceId) {
      return NextResponse.json(
        { error: "Script and voiceId are required" },
        { status: 400 }
      );
    }

    const audioBuffer = await textToSpeech(script, voiceId);

    const id = generateId();
    const audioUrl = await storeAudio(id, audioBuffer);

    const wordCount = script.split(/\s+/).length;
    const durationSeconds = Math.round((wordCount / 150) * 60);

    const podcast: Podcast = {
      id,
      title: title || `Podcast: ${topic}`,
      topic: topic || "General",
      style: style || "casual-chat",
      audioUrl,
      scriptText: script,
      sources: sources || [],
      durationSeconds,
      createdAt: new Date().toISOString(),
    };

    await storeMetadata(podcast);

    return NextResponse.json({ podcast });
  } catch (error) {
    console.error("Audio generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}

function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `pod-${timestamp}-${random}`;
}

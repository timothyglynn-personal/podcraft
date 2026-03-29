import { NextRequest, NextResponse } from "next/server";
import { generateScript } from "@/lib/claude";
import { Article } from "@/lib/types";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { topic, style, lengthMinutes, articles } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const script = await generateScript(
      topic,
      style || "casual-chat",
      lengthMinutes || 5,
      (articles as Article[]) || []
    );

    return NextResponse.json({ script });
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate script" },
      { status: 500 }
    );
  }
}

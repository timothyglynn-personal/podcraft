import { put, list } from "@vercel/blob";
import { Podcast } from "./types";

export async function storeAudio(
  id: string,
  audioBuffer: Buffer
): Promise<string> {
  const blob = await put(`podcasts/${id}.mp3`, audioBuffer, {
    access: "public",
    contentType: "audio/mpeg",
  });
  return blob.url;
}

export async function storeMetadata(
  podcast: Podcast
): Promise<void> {
  await put(
    `podcasts/${podcast.id}.json`,
    JSON.stringify(podcast, null, 2),
    {
      access: "public",
      contentType: "application/json",
    }
  );
}

export async function listPodcasts(): Promise<Podcast[]> {
  try {
    const { blobs } = await list({ prefix: "podcasts/" });
    const jsonBlobs = blobs.filter((b) => b.pathname.endsWith(".json"));

    const podcasts: Podcast[] = [];
    for (const blob of jsonBlobs) {
      try {
        const response = await fetch(blob.url);
        const podcast = await response.json();
        podcasts.push(podcast);
      } catch {
        continue;
      }
    }

    return podcasts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function getPodcast(id: string): Promise<Podcast | null> {
  try {
    const { blobs } = await list({ prefix: `podcasts/${id}.json` });
    if (blobs.length === 0) return null;

    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch {
    return null;
  }
}

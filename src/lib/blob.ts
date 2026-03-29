import { Podcast } from "./types";

const useVercelBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

// --- Vercel Blob storage (production) ---

async function blobStoreAudio(id: string, audioBuffer: Buffer): Promise<string> {
  const { put } = await import("@vercel/blob");
  const blob = await put(`podcasts/${id}.mp3`, audioBuffer, {
    access: "public",
    contentType: "audio/mpeg",
    addRandomSuffix: false,
  });
  return blob.url;
}

async function blobStoreMetadata(podcast: Podcast): Promise<void> {
  const { put } = await import("@vercel/blob");
  await put(`podcasts/${podcast.id}.json`, JSON.stringify(podcast, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

async function blobListPodcasts(): Promise<Podcast[]> {
  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: "podcasts/" });
  const jsonBlobs = blobs.filter((b) => b.pathname.endsWith(".json"));

  const podcasts: Podcast[] = [];
  for (const blob of jsonBlobs) {
    try {
      const response = await fetch(blob.url);
      podcasts.push(await response.json());
    } catch {
      continue;
    }
  }
  return podcasts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// --- Local filesystem storage (development) ---

async function localStoreAudio(id: string, audioBuffer: Buffer): Promise<string> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(process.cwd(), "public", "podcasts");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${id}.mp3`), audioBuffer);
  return `/podcasts/${id}.mp3`;
}

async function localStoreMetadata(podcast: Podcast): Promise<void> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(process.cwd(), "public", "podcasts");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${podcast.id}.json`), JSON.stringify(podcast, null, 2));
}

async function localListPodcasts(): Promise<Podcast[]> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(process.cwd(), "public", "podcasts");
  try {
    await fs.mkdir(dir, { recursive: true });
    const files = await fs.readdir(dir);
    const podcasts: Podcast[] = [];
    for (const file of files.filter((f) => f.endsWith(".json"))) {
      try {
        const content = await fs.readFile(path.join(dir, file), "utf-8");
        podcasts.push(JSON.parse(content));
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

// --- Public API (auto-detects environment) ---

export const storeAudio = useVercelBlob ? blobStoreAudio : localStoreAudio;
export const storeMetadata = useVercelBlob ? blobStoreMetadata : localStoreMetadata;
export const listPodcasts = useVercelBlob ? blobListPodcasts : localListPodcasts;

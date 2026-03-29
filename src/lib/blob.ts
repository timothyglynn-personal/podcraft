import fs from "fs/promises";
import path from "path";
import { Podcast } from "./types";

const STORAGE_DIR = path.join(process.cwd(), "public", "podcasts");

async function ensureDir() {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
}

export async function storeAudio(
  id: string,
  audioBuffer: Buffer
): Promise<string> {
  await ensureDir();
  const filePath = path.join(STORAGE_DIR, `${id}.mp3`);
  await fs.writeFile(filePath, audioBuffer);
  return `/podcasts/${id}.mp3`;
}

export async function storeMetadata(podcast: Podcast): Promise<void> {
  await ensureDir();
  const filePath = path.join(STORAGE_DIR, `${podcast.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(podcast, null, 2));
}

export async function listPodcasts(): Promise<Podcast[]> {
  try {
    await ensureDir();
    const files = await fs.readdir(STORAGE_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const podcasts: Podcast[] = [];
    for (const file of jsonFiles) {
      try {
        const content = await fs.readFile(path.join(STORAGE_DIR, file), "utf-8");
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

export async function getPodcast(id: string): Promise<Podcast | null> {
  try {
    const filePath = path.join(STORAGE_DIR, `${id}.json`);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

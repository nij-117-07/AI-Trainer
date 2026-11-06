// src/features/tools/rss/lib/store.ts
/**
 * JSON file persistence for the RSS feed provider configuration.
 * Mirrors the pages-db.ts pattern: reads/writes an array of RssFeedConfig
 * from a server-side JSON file whose path comes from RSS_FEEDS_JSON_PATH
 * (default: data/rss-feeds.json) and is never exposed to the browser.
 */
import { promises as fs } from "fs";
import path from "path";
import { RssFeedConfigSchema, type RssFeedConfig } from "../types";

function storePath(): string {
  const configured = process.env.RSS_FEEDS_JSON_PATH;
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), "data", "rss-feeds.json");
}

/** Reads all configured feed providers; returns [] when absent or corrupt. */
export async function readFeeds(): Promise<RssFeedConfig[]> {
  const filePath = storePath();
  try {
    await fs.access(filePath);
    const raw = await fs.readFile(filePath, "utf8");
    if (!raw.trim()) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is RssFeedConfig => {
      const result = RssFeedConfigSchema.safeParse(entry);
      return result.success;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("[RSS] Failed to read feed config:", message);
    return [];
  }
}

/** Atomically writes the full list of feed providers. */
export async function writeFeeds(configs: RssFeedConfig[]): Promise<void> {
  const filePath = storePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(configs, null, 2), "utf8");
}

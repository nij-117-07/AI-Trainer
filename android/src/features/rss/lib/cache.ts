// src/features/rss/lib/cache.ts
/**
 * On-device feed cache. The webui kept fetched items in server memory; the app stores them under one
 * key so a restart still serves fresh feeds. Writes run one at a time so parallel fetches cannot
 * overwrite each other's entries.
 */
import { loadDocument, removeDocument, saveDocument } from "@/lib/document-store";
import type { RssFetchResult } from "../types";
import {
  getFreshCachedFeed,
  normalizeCache,
  withCachedFeed,
  withoutCachedFeed,
  type FeedCache,
} from "./cache-policy";

export const RSS_CACHE_KEY = "tools.rss.cache.v1";

let writeQueue: Promise<unknown> = Promise.resolve();

function queueWrite(task: () => Promise<void>): Promise<void> {
  const run = writeQueue.then(task);
  writeQueue = run.catch(() => undefined);
  return run;
}

async function readCache(): Promise<FeedCache> {
  return normalizeCache(await loadDocument<unknown>(RSS_CACHE_KEY, {}));
}

export async function readFreshFeed(url: string, now = Date.now()): Promise<RssFetchResult | undefined> {
  return getFreshCachedFeed(await readCache(), url, now);
}

export function writeFeedToCache(url: string, result: RssFetchResult, ttlMinutes: number): Promise<void> {
  return queueWrite(async () => {
    const cache = await readCache();
    await saveDocument(RSS_CACHE_KEY, withCachedFeed(cache, url, result, ttlMinutes, Date.now()));
  });
}

export function dropCachedFeed(url: string): Promise<void> {
  return queueWrite(async () => {
    const cache = await readCache();
    await saveDocument(RSS_CACHE_KEY, withoutCachedFeed(cache, url));
  });
}

export function clearFeedCache(): Promise<void> {
  return queueWrite(() => removeDocument(RSS_CACHE_KEY));
}

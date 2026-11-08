// src/features/rss/lib/store.ts
/**
 * On-device list of feed providers. The webui kept this in a server JSON file; the app stores one
 * versioned key. Each write is validated and queued so overlapping saves cannot drop each other.
 */
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { RssFeedConfig, RssFeedInput } from "../types";
import { dropCachedFeed } from "./cache";
import { normalizeFeeds, validateFeedInput, type FeedInputErrors } from "./validation";

export const RSS_FEEDS_KEY = "tools.rss.feeds.v1";

let writeQueue: Promise<unknown> = Promise.resolve();

function queueWrite<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task);
  writeQueue = run.catch(() => undefined);
  return run;
}

function firstError(errors: FeedInputErrors): string {
  return Object.values(errors).find((message) => Boolean(message)) ?? "Check the feed details.";
}

export async function loadFeeds(): Promise<RssFeedConfig[]> {
  return normalizeFeeds(await loadDocument<unknown>(RSS_FEEDS_KEY, []));
}

export function createFeed(input: RssFeedInput): Promise<RssFeedConfig> {
  return queueWrite(async () => {
    const checked = validateFeedInput(input);
    if (!checked.ok) throw new Error(firstError(checked.errors));
    const stamp = new Date().toISOString();
    const feed: RssFeedConfig = {
      ...checked.value,
      id: globalThis.crypto.randomUUID(),
      createdAt: stamp,
      updatedAt: stamp,
    };
    await saveDocument(RSS_FEEDS_KEY, [...(await loadFeeds()), feed]);
    return feed;
  });
}

export function updateFeed(id: string, patch: Partial<RssFeedInput>): Promise<RssFeedConfig> {
  return queueWrite(async () => {
    const feeds = await loadFeeds();
    const previous = feeds.find((feed) => feed.id === id);
    if (!previous) throw new Error("Feed provider not found.");
    const checked = validateFeedInput({ ...previous, ...patch });
    if (!checked.ok) throw new Error(firstError(checked.errors));
    const updated: RssFeedConfig = { ...previous, ...checked.value, updatedAt: new Date().toISOString() };
    await saveDocument(
      RSS_FEEDS_KEY,
      feeds.map((feed) => (feed.id === id ? updated : feed)),
    );
    if (updated.url !== previous.url) await dropCachedFeed(previous.url);
    return updated;
  });
}

export function deleteFeed(id: string): Promise<void> {
  return queueWrite(async () => {
    const feeds = await loadFeeds();
    const target = feeds.find((feed) => feed.id === id);
    await saveDocument(
      RSS_FEEDS_KEY,
      feeds.filter((feed) => feed.id !== id),
    );
    if (target) await dropCachedFeed(target.url);
  });
}

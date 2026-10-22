// src/features/tools/rss/actions/fetch.ts
/**
 * Server Actions for fetching feed content.
 * fetchFeedAction returns cached results when fresh; refreshFeedAction forces
 * a live fetch; fetchFeedUrlAction is used by the Manager form to preview a
 * candidate feed URL before saving. All results are Zod-validated.
 */
"use server";

import { z } from "zod";
import type { RssFeedConfig, RssFetchResult } from "../types";
import { RssFetchResultSchema } from "../types";
import { readFeeds } from "../lib/store";
import { fetchFeed } from "../lib/fetch-feed";
import { invalidateFeed, setCachedFeed } from "../lib/cache";

function safeParseResult(value: unknown): RssFetchResult {
  const parsed = RssFetchResultSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(`Invalid feed response: ${parsed.error.issues.map((i) => i.message).join(", ")}`);
  }
  return parsed.data;
}

function requireFeed(feeds: RssFeedConfig[], id: string): RssFeedConfig {
  const feed = feeds.find((item) => item.id === id);
  if (!feed) throw new Error("Feed provider not found.");
  return feed;
}

/** Fetches a single feed by id, serving from the TTL cache when possible. */
export async function fetchFeedAction(id: string): Promise<RssFetchResult> {
  const feeds = await readFeeds();
  const feed = requireFeed(feeds, id);
  return safeParseResult(await fetchFeed(feed, false));
}

/** Forces a live refetch of a single feed and updates the cache. */
export async function refreshFeedAction(id: string): Promise<RssFetchResult> {
  const feeds = await readFeeds();
  const feed = requireFeed(feeds, id);
  invalidateFeed(feed.url);
  const result = safeParseResult(await fetchFeed(feed, true));
  setCachedFeed(feed.url, result, feed.refreshIntervalMinutes);
  return result;
}

/** Fetches and merges items from every enabled feed, cached per provider. */
export async function fetchAllFeedsAction(): Promise<RssFetchResult> {
  const feeds = await readFeeds();
  const enabled = feeds.filter((feed) => feed.enabled);
  const results = await Promise.all(
    enabled.map(async (feed) => {
      try {
        return await fetchFeed(feed, false);
      } catch (error) {
        console.error("[RSS] Skipping failed feed:", feed.name, error);
        return null;
      }
    })
  );
  const valid = results.filter((result): result is RssFetchResult => result !== null);
  const items = valid.flatMap((result) => result.items);
  return safeParseResult({
    source: { title: "All feeds", link: "", description: "Merged stream of enabled providers." },
    items,
    fetchedAt: new Date().toISOString(),
    fromCache: valid.every((result) => result.fromCache),
  });
}

/** Fetches a raw URL (Manager preview) without persisting anything. */
export async function fetchFeedUrlAction(url: string): Promise<RssFetchResult> {
  const parsed = z.string().url("Enter a valid feed URL.").parse(url);
  const previewConfig: RssFeedConfig = {
    id: "preview",
    name: "Preview",
    url: parsed,
    category: "Preview",
    enabled: true,
    refreshIntervalMinutes: 5,
    createdAt: now(),
    updatedAt: now(),
  };
  return safeParseResult(await fetchFeed(previewConfig, true));
}

function now(): string {
  return new Date().toISOString();
}

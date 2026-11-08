// src/features/rss/lib/fetch-feed.ts
/**
 * Downloads feeds from the device, parses them, and applies the on-device cache. The webui did this
 * on the server behind SSRF guards; a phone has no server, so only the http(s) check remains. On
 * web, cross-origin feeds can fail with a CORS error, which is reported as such.
 */
import { Platform } from "react-native";
import { ALL_FEEDS, MAX_ITEMS_PER_FEED } from "../options";
import type { FeedLoadFailure, FeedLoadResult, RssFeedConfig, RssFeedItem, RssFetchResult } from "../types";
import { readFreshFeed, writeFeedToCache } from "./cache";
import { messageOf } from "./errors";
import { parseFeedXml } from "./rss-parser";
import { isHttpUrl } from "./validation";

const MAX_CHARS = 2 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;

export type FeedTarget = Pick<RssFeedConfig, "id" | "name" | "url" | "refreshIntervalMinutes">;

export interface FetchOptions {
  bypassCache?: boolean;
  persist?: boolean;
}

export async function fetchFeed(target: FeedTarget, options: FetchOptions = {}): Promise<RssFetchResult> {
  if (!isHttpUrl(target.url)) throw new Error("Only http(s) feed URLs are allowed.");
  if (!options.bypassCache) {
    const cached = await readFreshFeed(target.url);
    if (cached) return cached;
  }
  const xml = await download(target);
  const parsed = parseFeedXml(xml, target.id, target.name);
  const result: RssFetchResult = { ...parsed, items: parsed.items.slice(0, MAX_ITEMS_PER_FEED) };
  if (options.persist !== false) await writeFeedToCache(target.url, result, target.refreshIntervalMinutes);
  return result;
}

/** Fetches every enabled feed (or one feed) and merges the items. Failures are reported per feed. */
export async function loadFeedItems(
  feeds: RssFeedConfig[],
  feedId: string,
  bypassCache: boolean,
): Promise<FeedLoadResult> {
  const targets = feedId === ALL_FEEDS ? feeds.filter((feed) => feed.enabled) : feeds.filter((feed) => feed.id === feedId);
  const outcomes = await Promise.allSettled(targets.map((target) => fetchFeed(target, { bypassCache })));
  const items: RssFeedItem[] = [];
  const failures: FeedLoadFailure[] = [];
  outcomes.forEach((outcome, index) => {
    const target = targets[index];
    if (outcome.status === "fulfilled") {
      for (const item of outcome.value.items) items.push(item);
      return;
    }
    failures.push({
      feedId: target.id,
      feedName: target.name,
      message: messageOf(outcome.reason, "Could not fetch the feed."),
    });
  });
  return { items, failures };
}

async function download(target: FeedTarget): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    let response: Response;
    try {
      response = await fetch(target.url, { signal: controller.signal });
    } catch (cause) {
      throw new Error(networkMessage(cause));
    }
    if (!response.ok) throw new Error(`Feed request failed (${response.status}) for ${target.name}.`);
    const xml = await response.text();
    if (xml.length > MAX_CHARS) throw new Error(`Feed for ${target.name} exceeds the 2MB size limit.`);
    return xml;
  } finally {
    clearTimeout(timer);
  }
}

function networkMessage(cause: unknown): string {
  const name = typeof cause === "object" && cause !== null && "name" in cause ? cause.name : "";
  if (name === "AbortError") return "Unable to fetch feed: the request timed out.";
  if (Platform.OS === "web") {
    return "Unable to fetch feed: the browser blocked the request. The feed server may not allow cross-origin (CORS) requests. The Android app does not have this limit.";
  }
  return `Unable to fetch feed: ${messageOf(cause, "network error")}`;
}

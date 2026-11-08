// src/features/rss/lib/cache-policy.ts
/**
 * Pure freshness rules for the feed cache. Each entry lives for its feed's refresh interval, with a
 * one-minute floor. Stored data is re-checked on read so a damaged entry is dropped, not trusted.
 */
import { DEFAULT_REFRESH_MINUTES } from "../options";
import type { RssFeedItem, RssFetchResult } from "../types";
import { asText, isRecord, normalizeFeedItem } from "./validation";

export interface FeedCacheEntry {
  result: RssFetchResult;
  expiresAt: number;
}

export type FeedCache = Record<string, FeedCacheEntry>;

const MINUTE_MS = 60_000;

export function getFreshCachedFeed(cache: FeedCache, url: string, now: number): RssFetchResult | undefined {
  const entry = cache[url];
  if (!entry || now >= entry.expiresAt) return undefined;
  return { ...entry.result, fromCache: true };
}

export function withCachedFeed(
  cache: FeedCache,
  url: string,
  result: RssFetchResult,
  ttlMinutes: number,
  now: number,
): FeedCache {
  const minutes = Number.isFinite(ttlMinutes) ? Math.max(1, ttlMinutes) : DEFAULT_REFRESH_MINUTES;
  const next = pruneExpired(cache, now);
  next[url] = { result: { ...result, fromCache: false }, expiresAt: now + minutes * MINUTE_MS };
  return next;
}

export function withoutCachedFeed(cache: FeedCache, url: string): FeedCache {
  const next: FeedCache = { ...cache };
  delete next[url];
  return next;
}

function pruneExpired(cache: FeedCache, now: number): FeedCache {
  const next: FeedCache = {};
  for (const url of Object.keys(cache)) {
    const entry = cache[url];
    if (entry.expiresAt > now) next[url] = entry;
  }
  return next;
}

export function normalizeCache(raw: unknown): FeedCache {
  if (!isRecord(raw)) return {};
  const cache: FeedCache = {};
  for (const url of Object.keys(raw)) {
    const entry = raw[url];
    if (!isRecord(entry) || typeof entry.expiresAt !== "number" || !isRecord(entry.result)) continue;
    cache[url] = { expiresAt: entry.expiresAt, result: normalizeResult(entry.result) };
  }
  return cache;
}

function normalizeResult(raw: Record<string, unknown>): RssFetchResult {
  const source: Record<string, unknown> = isRecord(raw.source) ? raw.source : {};
  const items: RssFeedItem[] = [];
  if (Array.isArray(raw.items)) {
    for (const entry of raw.items) {
      const item = normalizeFeedItem(entry);
      if (item) items.push(item);
    }
  }
  return {
    source: {
      title: asText(source.title),
      link: asText(source.link),
      description: asText(source.description),
    },
    items,
    fetchedAt: asText(raw.fetchedAt),
    fromCache: false,
  };
}

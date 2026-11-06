// src/features/tools/rss/lib/cache.ts
/**
 * In-memory TTL cache for fetched feed items.
 * Keyed by feed URL so the Viewer never hammers external RSS endpoints on
 * every navigation; each feed uses its configured refresh interval as TTL.
 */
import type { RssFetchResult } from "../types";

interface CacheEntry {
  result: RssFetchResult;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

/** Returns the cached result when still fresh, otherwise undefined. */
export function getCachedFeed(url: string): RssFetchResult | undefined {
  const entry = cache.get(url);
  if (!entry) return undefined;
  if (Date.now() >= entry.expiresAt) {
    cache.delete(url);
    return undefined;
  }
  return { ...entry.result, fromCache: true };
}

/** Stores a feed result with the given TTL in minutes. */
export function setCachedFeed(url: string, result: RssFetchResult, ttlMinutes: number): void {
  const ttlMs = Math.max(1, ttlMinutes) * 60_000;
  cache.set(url, { result, expiresAt: Date.now() + ttlMs });
}

/** Drops a single entry (used by manual refresh / delete). */
export function invalidateFeed(url: string): void {
  cache.delete(url);
}

/** Drops every cached entry. */
export function clearFeedCache(): void {
  cache.clear();
}

// src/features/rss/lib/cache-policy.test.ts
import { getFreshCachedFeed, normalizeCache, withCachedFeed, withoutCachedFeed } from "./cache-policy";
import type { RssFetchResult } from "../types";

const NOW = Date.parse("2026-11-08T12:00:00.000Z");
const MINUTE = 60_000;
const URL_A = "https://a.example/feed.xml";
const URL_B = "https://b.example/feed.xml";

function result(title: string): RssFetchResult {
  return {
    source: { title, link: "", description: "" },
    items: [],
    fetchedAt: new Date(NOW).toISOString(),
    fromCache: false,
  };
}

describe("feed cache freshness", () => {
  it("serves an entry as cached until its refresh interval has passed", () => {
    const cache = withCachedFeed({}, URL_A, result("A"), 30, NOW);
    expect(getFreshCachedFeed(cache, URL_A, NOW + 29 * MINUTE)?.fromCache).toBe(true);
    expect(getFreshCachedFeed(cache, URL_A, NOW + 30 * MINUTE)).toBeUndefined();
  });

  it("treats unknown URLs as a miss", () => {
    expect(getFreshCachedFeed({}, URL_A, NOW)).toBeUndefined();
  });

  it("floors the TTL at one minute and falls back to 60 minutes for invalid intervals", () => {
    const short = withCachedFeed({}, URL_A, result("A"), 0, NOW);
    expect(getFreshCachedFeed(short, URL_A, NOW + MINUTE)).toBeUndefined();

    const invalid = withCachedFeed({}, URL_A, result("A"), Number.NaN, NOW);
    expect(getFreshCachedFeed(invalid, URL_A, NOW + 59 * MINUTE)).toBeDefined();
    expect(getFreshCachedFeed(invalid, URL_A, NOW + 60 * MINUTE)).toBeUndefined();
  });

  it("prunes expired entries for other feeds when writing", () => {
    const first = withCachedFeed({}, URL_A, result("A"), 5, NOW);
    const second = withCachedFeed(first, URL_B, result("B"), 60, NOW + 10 * MINUTE);
    expect(Object.keys(second)).toEqual([URL_B]);
  });

  it("removes a single feed from the cache", () => {
    const cache = withCachedFeed(withCachedFeed({}, URL_A, result("A"), 60, NOW), URL_B, result("B"), 60, NOW);
    expect(Object.keys(withoutCachedFeed(cache, URL_A))).toEqual([URL_B]);
  });
});

describe("normalizeCache", () => {
  it("drops damaged entries and guards item lists", () => {
    const cache = normalizeCache({
      [URL_A]: {
        expiresAt: NOW + MINUTE,
        result: {
          source: { title: "A" },
          items: [{ guid: "g1", title: "Kept" }, { title: "no guid" }, 42],
          fetchedAt: "x",
        },
      },
      [URL_B]: { expiresAt: "soon", result: {} },
      broken: null,
    });
    expect(Object.keys(cache)).toEqual([URL_A]);
    expect(cache[URL_A].result.source).toEqual({ title: "A", link: "", description: "" });
    expect(cache[URL_A].result.items.map((item) => item.guid)).toEqual(["g1"]);
  });

  it("returns an empty cache for non-object storage", () => {
    expect(normalizeCache([])).toEqual({});
    expect(normalizeCache("nope")).toEqual({});
  });
});

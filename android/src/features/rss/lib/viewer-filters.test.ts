// src/features/rss/lib/viewer-filters.test.ts
import type { RssFeedConfig, RssFeedItem } from "../types";
import { collectCategories, DEFAULT_VIEWER_FILTERS, filterFeedItems } from "./viewer-filters";

const NOW = Date.parse("2026-11-08T12:00:00.000Z");

function feed(id: string, name: string, category: string): RssFeedConfig {
  return {
    id,
    name,
    url: `https://${id}.example/feed`,
    category,
    enabled: true,
    refreshIntervalMinutes: 60,
    createdAt: "",
    updatedAt: "",
  };
}

function item(overrides: Partial<RssFeedItem>): RssFeedItem {
  return {
    guid: overrides.guid ?? overrides.title ?? "g",
    title: "",
    link: "",
    description: "",
    content: "",
    pubDate: "",
    author: "",
    categories: [],
    feedId: "f1",
    feedName: "Feed One",
    ...overrides,
  };
}

const FEEDS = [feed("f1", "Feed One", "News"), feed("f2", "Feed Two", "Tech")];

const ITEMS = [
  item({ guid: "a", title: "Alpha", pubDate: "2026-11-08T11:00:00.000Z", categories: ["AI"], author: "Ann" }),
  item({
    guid: "b",
    title: "Bravo",
    feedId: "f2",
    feedName: "Feed Two",
    pubDate: "2026-11-01T12:00:00.000Z",
    author: "Ben",
    description: "the kernel",
  }),
  item({ guid: "c", title: "Charlie", pubDate: "", categories: ["Tech"] }),
];

function guids(list: RssFeedItem[]): string[] {
  return list.map((entry) => entry.guid);
}

describe("filterFeedItems", () => {
  it("sorts newest first and keeps undated items last", () => {
    expect(guids(filterFeedItems(ITEMS, DEFAULT_VIEWER_FILTERS, FEEDS, NOW))).toEqual(["a", "b", "c"]);
  });

  it("applies the 24-hour window but keeps undated items", () => {
    const filters = { ...DEFAULT_VIEWER_FILTERS, timeRange: "24h" as const };
    expect(guids(filterFeedItems(ITEMS, filters, FEEDS, NOW))).toEqual(["a", "c"]);
  });

  it("includes items published exactly at the edge of the 7-day window", () => {
    const filters = { ...DEFAULT_VIEWER_FILTERS, timeRange: "7d" as const };
    expect(guids(filterFeedItems(ITEMS, filters, FEEDS, NOW))).toEqual(["a", "b", "c"]);
  });

  it("searches title, author, description, feed name, and categories case-insensitively", () => {
    const search = (query: string) =>
      guids(filterFeedItems(ITEMS, { ...DEFAULT_VIEWER_FILTERS, search: query }, FEEDS, NOW));
    expect(search("  BEN ")).toEqual(["b"]);
    expect(search("kernel")).toEqual(["b"]);
    expect(search("feed two")).toEqual(["b"]);
    expect(search("ai")).toEqual(["a"]);
    expect(search("")).toEqual(["a", "b", "c"]);
  });

  it("matches a category from the channel or from the item", () => {
    const filters = { ...DEFAULT_VIEWER_FILTERS, category: "Tech" };
    expect(guids(filterFeedItems(ITEMS, filters, FEEDS, NOW))).toEqual(["b", "c"]);
  });

  it("limits results to the selected channel", () => {
    const filters = { ...DEFAULT_VIEWER_FILTERS, feedId: "f1" };
    expect(guids(filterFeedItems(ITEMS, filters, FEEDS, NOW))).toEqual(["a", "c"]);
  });
});

describe("collectCategories", () => {
  it("merges channel and item categories into a sorted unique list", () => {
    expect(collectCategories(FEEDS, ITEMS)).toEqual(["AI", "News", "Tech"]);
  });

  it("tolerates empty input", () => {
    expect(collectCategories([], [])).toEqual([]);
  });
});

// src/features/rss/lib/viewer-filters.ts
/** Pure filtering, sorting, and category collection for the RSS viewer. */
import { ALL_CATEGORIES, ALL_FEEDS } from "../options";
import { RSS_TIME_RANGES, type RssFeedConfig, type RssFeedItem, type RssTimeRange, type RssViewerFilters } from "../types";
import { asText } from "./validation";

export const DEFAULT_VIEWER_FILTERS: RssViewerFilters = {
  feedId: ALL_FEEDS,
  category: ALL_CATEGORIES,
  search: "",
  timeRange: "all",
};

const WINDOW_MS: Record<Exclude<RssTimeRange, "all">, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

/** Keeps saved filters only when they have the right type. An unknown time range falls back to "all time". */
export function sanitizeViewerFilters(raw: RssViewerFilters): RssViewerFilters {
  const timeRange = (RSS_TIME_RANGES as readonly string[]).includes(raw.timeRange) ? raw.timeRange : DEFAULT_VIEWER_FILTERS.timeRange;
  return {
    feedId: typeof raw.feedId === "string" ? raw.feedId : DEFAULT_VIEWER_FILTERS.feedId,
    category: typeof raw.category === "string" ? raw.category : DEFAULT_VIEWER_FILTERS.category,
    search: typeof raw.search === "string" ? raw.search : DEFAULT_VIEWER_FILTERS.search,
    timeRange: timeRange as RssTimeRange,
  };
}

function itemCategories(item: RssFeedItem): string[] {
  return Array.isArray(item.categories) ? item.categories.filter((category) => asText(category) !== "") : [];
}

function timestampOf(item: RssFeedItem): number {
  const time = Date.parse(asText(item.pubDate));
  return Number.isNaN(time) ? 0 : time;
}

export function matchesSearch(item: RssFeedItem, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [item.title, item.description, item.content, item.author, item.feedName, ...itemCategories(item)]
    .map(asText)
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

function matchesCategory(item: RssFeedItem, category: string, feedCategories: Map<string, string>): boolean {
  if (category === ALL_CATEGORIES) return true;
  return feedCategories.get(item.feedId) === category || itemCategories(item).includes(category);
}

function withinTimeRange(item: RssFeedItem, timeRange: RssTimeRange, now: number): boolean {
  if (timeRange === "all") return true;
  const published = Date.parse(asText(item.pubDate));
  if (Number.isNaN(published)) return true;
  return now - published <= WINDOW_MS[timeRange];
}

/** Applies the viewer filters and returns the matching items, newest first. Undated items sort last. */
export function filterFeedItems(
  items: RssFeedItem[],
  filters: RssViewerFilters,
  feeds: RssFeedConfig[],
  now: number,
): RssFeedItem[] {
  const feedCategories = new Map(feeds.map((feed) => [feed.id, feed.category] as const));
  return items
    .filter((item) => filters.feedId === ALL_FEEDS || item.feedId === filters.feedId)
    .filter((item) => matchesCategory(item, filters.category, feedCategories))
    .filter((item) => withinTimeRange(item, filters.timeRange, now))
    .filter((item) => matchesSearch(item, filters.search))
    .sort((a, b) => timestampOf(b) - timestampOf(a));
}

/** Every channel category plus every item category, sorted alphabetically. */
export function collectCategories(feeds: RssFeedConfig[], items: RssFeedItem[]): string[] {
  const categories = new Set<string>();
  for (const feed of feeds) {
    if (feed.category) categories.add(feed.category);
  }
  for (const item of items) {
    for (const category of itemCategories(item)) categories.add(category);
  }
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}

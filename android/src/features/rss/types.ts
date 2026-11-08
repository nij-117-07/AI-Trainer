// src/features/rss/types.ts
/** Feed provider configs, normalized feed items, fetch results, and viewer filters for the RSS tool. */

export const RSS_TIME_RANGES = ["all", "24h", "7d", "30d"] as const;
export type RssTimeRange = (typeof RSS_TIME_RANGES)[number];

export interface RssFeedConfig {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled: boolean;
  refreshIntervalMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export type RssFeedInput = Pick<RssFeedConfig, "name" | "url" | "category" | "enabled" | "refreshIntervalMinutes">;

export interface RssFeedItem {
  guid: string;
  title: string;
  link: string;
  description: string;
  content: string;
  pubDate: string;
  author: string;
  categories: string[];
  media?: { url: string; type: string };
  feedId: string;
  feedName: string;
}

export interface RssSource {
  title: string;
  link: string;
  description: string;
}

export interface RssFetchResult {
  source: RssSource;
  items: RssFeedItem[];
  fetchedAt: string;
  fromCache: boolean;
}

export interface RssViewerFilters {
  feedId: string;
  category: string;
  search: string;
  timeRange: RssTimeRange;
}

export interface FeedLoadFailure {
  feedId: string;
  feedName: string;
  message: string;
}

export interface FeedLoadResult {
  items: RssFeedItem[];
  failures: FeedLoadFailure[];
}

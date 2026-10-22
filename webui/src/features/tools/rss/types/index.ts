// src/features/tools/rss/types/index.ts
/**
 * Shared types and Zod schemas for the RSS Feed tool.
 * Defines feed provider configuration, normalized feed items, fetch results,
 * and the Viewer filter state used across actions, hooks, and components.
 */
import { z } from "zod";

/** Full persisted feed provider configuration. */
export const RssFeedConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").max(120),
  url: z.string().url("Enter a valid URL"),
  category: z.string().trim().min(1, "Category is required").max(80),
  enabled: z.boolean().default(true),
  refreshIntervalMinutes: z.number().int().min(1).max(1440).default(60),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Writable fields for creating or updating a feed provider. */
export const RssFeedInputSchema = RssFeedConfigSchema.pick({
  name: true,
  url: true,
  category: true,
  enabled: true,
  refreshIntervalMinutes: true,
});

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

export type RssFeedInput = z.infer<typeof RssFeedInputSchema>;

/** One normalized entry from a feed. */
export const RssFeedItemSchema = z.object({
  guid: z.string(),
  title: z.string(),
  link: z.string().default(""),
  description: z.string().default(""),
  content: z.string().default(""),
  pubDate: z.string().default(""),
  author: z.string().default(""),
  categories: z.array(z.string()).default([]),
  media: z.object({ url: z.string(), type: z.string().default("") }).optional(),
  feedId: z.string().default(""),
  feedName: z.string().default(""),
});

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

/** Feed channel metadata returned alongside its items. */
export const RssSourceSchema = z.object({
  title: z.string().default(""),
  link: z.string().default(""),
  description: z.string().default(""),
});

export const RssFetchResultSchema = z.object({
  source: RssSourceSchema,
  items: z.array(RssFeedItemSchema).default([]),
  fetchedAt: z.string(),
  fromCache: z.boolean().default(false),
});

export interface RssFetchResult {
  source: { title: string; link: string; description: string };
  items: RssFeedItem[];
  fetchedAt: string;
  fromCache: boolean;
}

/** Time-range filter options for the Viewer. */
export const RSS_TIME_RANGES = ["all", "24h", "7d", "30d"] as const;
export type RssTimeRange = (typeof RSS_TIME_RANGES)[number];

export interface RssViewerFilters {
  feedId: string;
  category: string;
  search: string;
  timeRange: RssTimeRange;
}

export const DEFAULT_FILTERS: RssViewerFilters = {
  feedId: "all",
  category: "all",
  search: "",
  timeRange: "all",
};

// src/features/rss/options.ts
/** Fixed choices and limits for the RSS manager and viewer. */
import { RSS_TIME_RANGES, type RssTimeRange } from "./types";

export const ALL_FEEDS = "all";
export const ALL_CATEGORIES = "all";
export const DEFAULT_REFRESH_MINUTES = 60;
export const MAX_ITEMS_PER_FEED = 200;
export const VIEWER_PAGE_SIZE = 50;

export const REFRESH_OPTIONS: { value: string; label: string }[] = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "360", label: "6 hours" },
  { value: "720", label: "12 hours" },
  { value: "1440", label: "24 hours" },
];

const TIME_RANGE_LABELS: Record<RssTimeRange, string> = {
  all: "All time",
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

export const TIME_RANGE_OPTIONS: { value: RssTimeRange; label: string }[] = RSS_TIME_RANGES.map((range) => ({
  value: range,
  label: TIME_RANGE_LABELS[range],
}));

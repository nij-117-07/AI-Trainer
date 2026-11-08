// src/features/rss/lib/validation.ts
/**
 * Pure checks for feed input from the manager form and for records read back from storage. The
 * webui used Zod schemas; the app has no Zod, so the same rules are written out here.
 */
import { DEFAULT_REFRESH_MINUTES } from "../options";
import type { RssFeedConfig, RssFeedInput, RssFeedItem } from "../types";

export const FEED_LIMITS = { name: 120, category: 80, refreshMin: 1, refreshMax: 1440 } as const;

export type FeedInputErrors = Partial<Record<keyof RssFeedInput, string>>;
export type FeedInputResult = { ok: true; value: RssFeedInput } | { ok: false; errors: FeedInputErrors };

const HTTP_URL = /^https?:\/\/[^\s/?#]+\S*$/i;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

export function isHttpUrl(value: string): boolean {
  return HTTP_URL.test(value.trim());
}

export function validateFeedInput(raw: unknown): FeedInputResult {
  const source: Record<string, unknown> = isRecord(raw) ? raw : {};
  const name = asText(source.name).trim();
  const url = asText(source.url).trim();
  const category = asText(source.category).trim();
  const interval =
    source.refreshIntervalMinutes === undefined ? DEFAULT_REFRESH_MINUTES : Number(source.refreshIntervalMinutes);
  const errors: FeedInputErrors = {};

  if (!name) {
    errors.name = "Name is required";
  } else if (name.length > FEED_LIMITS.name) {
    errors.name = `Name must be ${FEED_LIMITS.name} characters or fewer`;
  }
  if (!isHttpUrl(url)) errors.url = "Enter a valid URL";
  if (!category) {
    errors.category = "Category is required";
  } else if (category.length > FEED_LIMITS.category) {
    errors.category = `Category must be ${FEED_LIMITS.category} characters or fewer`;
  }
  if (!Number.isInteger(interval) || interval < FEED_LIMITS.refreshMin || interval > FEED_LIMITS.refreshMax) {
    errors.refreshIntervalMinutes = "Choose an interval between 1 and 1440 minutes";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: { name, url, category, enabled: source.enabled !== false, refreshIntervalMinutes: interval },
  };
}

export function normalizeFeedConfig(raw: unknown): RssFeedConfig | null {
  if (!isRecord(raw)) return null;
  const id = asText(raw.id);
  if (!id) return null;
  const checked = validateFeedInput(raw);
  if (!checked.ok) return null;
  return {
    id,
    ...checked.value,
    createdAt: asText(raw.createdAt),
    updatedAt: asText(raw.updatedAt),
  };
}

export function normalizeFeeds(raw: unknown): RssFeedConfig[] {
  if (!Array.isArray(raw)) return [];
  const feeds: RssFeedConfig[] = [];
  for (const entry of raw) {
    const feed = normalizeFeedConfig(entry);
    if (feed) feeds.push(feed);
  }
  return feeds;
}

export function normalizeFeedItem(raw: unknown): RssFeedItem | null {
  if (!isRecord(raw) || typeof raw.guid !== "string") return null;
  const media =
    isRecord(raw.media) && typeof raw.media.url === "string"
      ? { url: raw.media.url, type: asText(raw.media.type) }
      : undefined;
  return {
    guid: raw.guid,
    title: asText(raw.title) || "Untitled",
    link: asText(raw.link),
    description: asText(raw.description),
    content: asText(raw.content),
    pubDate: asText(raw.pubDate),
    author: asText(raw.author),
    categories: asStringList(raw.categories),
    media,
    feedId: asText(raw.feedId),
    feedName: asText(raw.feedName),
  };
}

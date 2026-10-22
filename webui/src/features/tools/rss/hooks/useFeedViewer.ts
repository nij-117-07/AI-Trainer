// src/features/tools/rss/hooks/useFeedViewer.ts
/**
 * Client hook powering the RSS Viewer. Owns the active channel, category,
 * search, and time-range filters, fetches feed items from the fetch server
 * actions (all feeds or a single channel), and memoizes the filtered results.
 * Loading is derived (items empty + no error) so initial fetches show
 * skeletons without synchronously setting state inside effects.
 */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { fetchAllFeedsAction, fetchFeedAction, refreshFeedAction } from "../actions/fetch";
import type { RssFeedConfig, RssFeedItem, RssTimeRange, RssViewerFilters } from "../types";
import { DEFAULT_FILTERS } from "../types";
import { errorMessage } from "./useRssFeeds";

const TIME_WINDOW_MS: Record<Exclude<RssTimeRange, "all">, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

function matchesSearch(item: RssFeedItem, query: string): boolean {
  const q = query.toLowerCase();
  const haystack = [
    item.title,
    item.description,
    item.content,
    item.author,
    item.feedName,
    ...item.categories,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function withinWindow(item: RssFeedItem, timeRange: RssTimeRange): boolean {
  if (timeRange === "all" || !item.pubDate) return true;
  const published = new Date(item.pubDate).getTime();
  if (Number.isNaN(published)) return true;
  const limit = TIME_WINDOW_MS[timeRange];
  return Date.now() - published <= limit;
}

export function useFeedViewer(feeds: RssFeedConfig[] | null) {
  const [filters, setFilters] = useState<RssViewerFilters>(DEFAULT_FILTERS);
  const [items, setItems] = useState<RssFeedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const setFilter = useCallback(
    <K extends keyof RssViewerFilters>(key: K, value: RssViewerFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      if (key === "feedId") {
        setItems([]);
        setError(null);
      }
    },
    []
  );

  useEffect(() => {
    if (!feeds || feeds.length === 0) return;
    let cancelled = false;
    const feedId = filters.feedId;
    const request = feedId === "all" ? fetchAllFeedsAction() : fetchFeedAction(feedId);
    request
      .then((result) => {
        if (!cancelled) setItems(result.items);
      })
      .catch((cause) => {
        if (!cancelled) {
          const message = errorMessage(cause);
          setError(message);
          toast.error("Could not load feed items", { description: message });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [feeds, filters.feedId]);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const result =
        filters.feedId === "all" ? await fetchAllFeedsAction() : await refreshFeedAction(filters.feedId);
      setItems(result.items);
      toast.success("Feeds refreshed");
    } catch (cause) {
      toast.error("Could not refresh feeds", { description: errorMessage(cause) });
    } finally {
      setRefreshing(false);
    }
  }, [filters.feedId]);

  const availableCategories = useMemo(() => {
    const fromConfigs = new Set((feeds ?? []).map((feed) => feed.category));
    for (const item of items) {
      for (const category of item.categories) {
        if (category) fromConfigs.add(category);
      }
    }
    return Array.from(fromConfigs).sort((a, b) => a.localeCompare(b));
  }, [feeds, items]);

  const hasFeeds = (feeds?.length ?? 0) > 0;
  const visibleItems = useMemo(() => (hasFeeds ? items : []), [hasFeeds, items]);
  const loading = hasFeeds && items.length === 0 && error === null;

  const filteredItems = useMemo(() => {
    return visibleItems
      .filter((item) => withinWindow(item, filters.timeRange))
      .filter((item) => !filters.search.trim() || matchesSearch(item, filters.search.trim()))
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  }, [visibleItems, filters.timeRange, filters.search]);

  return {
    filters,
    setFilter,
    items: visibleItems,
    filteredItems,
    loading,
    refreshing,
    error,
    availableCategories,
    refreshAll,
  };
}

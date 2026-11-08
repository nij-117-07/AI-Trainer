// src/features/rss/hooks/useFeedViewer.ts
/** Viewer state: channel, category, search, and time filters, the items loaded for the active channel, and refresh. */
import { useCallback, useEffect, useMemo, useState } from "react";
import { messageOf } from "../lib/errors";
import { loadFeedItems } from "../lib/fetch-feed";
import { ALL_CATEGORIES, ALL_FEEDS } from "../options";
import { collectCategories, DEFAULT_VIEWER_FILTERS, filterFeedItems } from "../lib/viewer-filters";
import type { FeedLoadFailure, RssFeedConfig, RssFeedItem, RssViewerFilters } from "../types";

interface LoadedItems {
  feedId: string | null;
  items: RssFeedItem[];
  failures: FeedLoadFailure[];
}

const NOTHING_LOADED: LoadedItems = { feedId: null, items: [], failures: [] };

export function useFeedViewer(feeds: RssFeedConfig[] | null) {
  const [filters, setFilters] = useState<RssViewerFilters>(DEFAULT_VIEWER_FILTERS);
  const [loaded, setLoaded] = useState<LoadedItems>(NOTHING_LOADED);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const hasFeeds = (feeds?.length ?? 0) > 0;
  const feedId = feeds?.some((feed) => feed.id === filters.feedId) ? filters.feedId : ALL_FEEDS;

  const categories = useMemo(() => collectCategories(feeds ?? [], loaded.items), [feeds, loaded.items]);
  const category = categories.includes(filters.category) ? filters.category : ALL_CATEGORIES;
  const activeFilters = useMemo<RssViewerFilters>(
    () => ({ ...filters, feedId, category }),
    [filters, feedId, category],
  );

  const items = useMemo(
    () => filterFeedItems(loaded.items, activeFilters, feeds ?? [], Date.now()),
    [loaded.items, activeFilters, feeds],
  );

  const setFilter = useCallback(<K extends keyof RssViewerFilters>(key: K, value: RssViewerFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    if (!feeds || feeds.length === 0) return;
    let cancelled = false;
    loadFeedItems(feeds, feedId, false)
      .then((result) => {
        if (cancelled) return;
        setLoaded({ feedId, items: result.items, failures: result.failures });
        setError(null);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setLoaded({ feedId, items: [], failures: [] });
        setError(messageOf(cause, "Could not load articles."));
      });
    return () => {
      cancelled = true;
    };
  }, [feeds, feedId]);

  const refresh = useCallback(async () => {
    if (!feeds || feeds.length === 0) return;
    setRefreshing(true);
    try {
      const result = await loadFeedItems(feeds, feedId, true);
      setLoaded({ feedId, items: result.items, failures: result.failures });
      setError(null);
    } catch (cause) {
      setError(messageOf(cause, "Could not refresh feeds."));
    } finally {
      setRefreshing(false);
    }
  }, [feeds, feedId]);

  return {
    hasFeeds,
    filters: activeFilters,
    setFilter,
    items,
    categories,
    failures: loaded.failures,
    loading: hasFeeds && loaded.feedId !== feedId,
    refreshing,
    error,
    refresh,
  };
}

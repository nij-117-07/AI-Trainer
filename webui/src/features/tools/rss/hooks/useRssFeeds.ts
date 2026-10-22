// src/features/tools/rss/hooks/useRssFeeds.ts
/**
 * Client hook that owns the feed provider list and all CRUD mutations.
 * Loads feeds from the listFeedsAction server action, exposes typed
 * create/update/delete callbacks with per-feed busy state and sonner toasts,
 * and returns the loaded configs for the Manager and Viewer pages.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createFeedAction,
  deleteFeedAction,
  listFeedsAction,
  updateFeedAction,
} from "../actions/feeds";
import type { RssFeedConfig, RssFeedInput } from "../types";

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function useRssFeeds() {
  const [feeds, setFeeds] = useState<RssFeedConfig[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (options?: { showLoading: boolean }) => {
    if (options?.showLoading !== false) setLoading(true);
    try {
      setFeeds(await listFeedsAction());
    } catch (error) {
      toast.error("Failed to load feeds", { description: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    listFeedsAction()
      .then((data) => {
        if (!cancelled) setFeeds(data);
      })
      .catch((error) => {
        if (!cancelled) toast.error("Failed to load feeds", { description: errorMessage(error) });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const createFeed = useCallback(async (input: RssFeedInput) => {
    setBusyId("new");
    try {
      const created = await createFeedAction(input);
      setFeeds((prev) => [...(prev ?? []), created]);
      toast.success("Feed added", { description: `"${created.name}" is ready.` });
      return created;
    } catch (error) {
      toast.error("Could not add feed", { description: errorMessage(error) });
      return null;
    } finally {
      setBusyId(null);
    }
  }, []);

  const updateFeed = useCallback(async (id: string, input: Partial<RssFeedInput>) => {
    setBusyId(id);
    try {
      const updated = await updateFeedAction(id, input);
      setFeeds((prev) => (prev ?? []).map((feed) => (feed.id === id ? updated : feed)));
      toast.success("Feed updated", { description: `"${updated.name}" saved.` });
      return updated;
    } catch (error) {
      toast.error("Could not update feed", { description: errorMessage(error) });
      return null;
    } finally {
      setBusyId(null);
    }
  }, []);

  const deleteFeed = useCallback(async (id: string) => {
    setBusyId(id);
    try {
      await deleteFeedAction(id);
      setFeeds((prev) => (prev ?? []).filter((feed) => feed.id !== id));
      toast.success("Feed removed");
    } catch (error) {
      toast.error("Could not delete feed", { description: errorMessage(error) });
    } finally {
      setBusyId(null);
    }
  }, []);

  return { feeds, loading, busyId, load, createFeed, updateFeed, deleteFeed };
}

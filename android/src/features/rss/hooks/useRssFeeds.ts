// src/features/rss/hooks/useRssFeeds.ts
/** Owns the on-device feed list. Screens reload on focus; create, update, and remove track which row is busy. */
import { useCallback, useState } from "react";
import { messageOf } from "../lib/errors";
import { createFeed, deleteFeed, loadFeeds, updateFeed } from "../lib/store";
import type { RssFeedConfig, RssFeedInput } from "../types";

export function useRssFeeds() {
  const [feeds, setFeeds] = useState<RssFeedConfig[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setFeeds(await loadFeeds());
      setError(null);
    } catch (cause) {
      setError(messageOf(cause, "Could not load your feeds."));
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (input: RssFeedInput) => {
    setBusyId("new");
    try {
      const created = await createFeed(input);
      setFeeds((prev) => [...(prev ?? []), created]);
      return created;
    } finally {
      setBusyId(null);
    }
  }, []);

  const update = useCallback(async (id: string, patch: Partial<RssFeedInput>) => {
    setBusyId(id);
    try {
      const updated = await updateFeed(id, patch);
      setFeeds((prev) => (prev ?? []).map((feed) => (feed.id === id ? updated : feed)));
      return updated;
    } finally {
      setBusyId(null);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setBusyId(id);
    try {
      await deleteFeed(id);
      setFeeds((prev) => (prev ?? []).filter((feed) => feed.id !== id));
    } finally {
      setBusyId(null);
    }
  }, []);

  return { feeds, loading, busyId, error, reload, create, update, remove };
}

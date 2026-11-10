/** Loads one saved feed provider by id for the edit page. `undefined` while loading, `null` when it does not exist. */
import { useEffect, useState } from "react";
import { loadFeeds } from "../lib/store";
import type { RssFeedConfig } from "../types";

export function useStoredFeed(id: string): RssFeedConfig | null | undefined {
  const [feed, setFeed] = useState<RssFeedConfig | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    loadFeeds()
      .then((list) => {
        if (active) setFeed(list.find((item) => item.id === id) ?? null);
      })
      .catch(() => {
        if (active) setFeed(null);
      });
    return () => {
      active = false;
    };
  }, [id]);

  return feed;
}

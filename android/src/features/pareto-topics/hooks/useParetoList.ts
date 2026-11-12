// src/features/pareto-topics/hooks/useParetoList.ts
/**
 * State for one saved topic list. Ticking a topic saves at once. Find more topics runs the list's
 * own form again and keeps the topics the user ticked.
 */
import { useCallback, useEffect, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { keptCount, mergeKept } from "@/lib/kept";
import { coverageOf } from "../lib/coverage";
import { findParetoTopics } from "../lib/generators";
import { deleteParetoList, getParetoList, saveParetoList } from "../lib/pareto-store";
import type { ParetoList, ParetoTopic } from "../types";

const keyOf = (topic: ParetoTopic) => topic.title.trim().toLowerCase();

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function useParetoList(listId: string) {
  const { settings } = useAiSettings();
  const [list, setList] = useState<ParetoList | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const request = useRequest(findParetoTopics);

  useEffect(() => {
    let active = true;
    getParetoList(listId)
      .then((found) => {
        if (active) setList(found);
      })
      .catch((err: unknown) => {
        if (active) setLoadError(messageOf(err, "Could not load this list."));
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [listId]);

  const commit = useCallback((next: ParetoList) => {
    setList(next);
    setSaveError(null);
    saveParetoList(next).catch((err: unknown) => setSaveError(messageOf(err, "Failed to save changes.")));
  }, []);

  async function findMore() {
    if (!list) return;
    const next = await request.run(settings, list.form);
    if (!next) return;
    const now = new Date().toISOString();
    commit({
      ...list,
      result: { ...next, topics: mergeKept(list.result.topics, next.topics, keyOf) },
      updatedAt: now,
    });
  }

  function toggleKept(index: number) {
    if (!list) return;
    commit({
      ...list,
      result: {
        ...list.result,
        topics: list.result.topics.map((topic, i) => (i === index ? { ...topic, kept: !topic.kept } : topic)),
      },
      updatedAt: new Date().toISOString(),
    });
  }

  async function remove(onRemoved: () => void) {
    try {
      await deleteParetoList(listId);
      onRemoved();
    } catch (err) {
      setSaveError(messageOf(err, "Could not delete this list."));
    }
  }

  const topics = list?.result.topics ?? [];

  return {
    list,
    loaded,
    loadError,
    pending: request.pending,
    error: request.error,
    saveError,
    keptCount: keptCount(topics),
    coverage: coverageOf(topics),
    findMore,
    toggleKept,
    remove,
  };
}

export type ParetoListState = ReturnType<typeof useParetoList>;

// src/features/topic-suggestions/hooks/useTopicList.ts
/** The saved topic list. It reloads whenever the list screen comes into view. */
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { removeTopic, toggleTopic } from "../lib/topics";
import { loadTopics, saveTopics } from "../lib/store";
import type { SavedTopic } from "../types";

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function useTopicList() {
  const [topics, setTopics] = useState<SavedTopic[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setTopics(await loadTopics());
      setError(null);
    } catch (err) {
      setError(messageOf(err, "Could not load your topics."));
    } finally {
      setLoaded(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  function commit(next: SavedTopic[]) {
    setTopics(next);
    saveTopics(next).catch((err: unknown) => setError(messageOf(err, "Failed to save changes.")));
  }

  return {
    topics,
    loaded,
    error,
    toggle: (id: string) => commit(toggleTopic(topics, id)),
    remove: (id: string) => commit(removeTopic(topics, id)),
  };
}

export type TopicListState = ReturnType<typeof useTopicList>;

// src/features/learning-tasks/hooks/useLearningTaskList.ts
/** The saved Learning Tasks list. It reloads whenever the list screen comes into view. */
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadLearningTasks, saveLearningTasks } from "../lib/store";
import { removeTask, toggleTask } from "../lib/learning-tasks";
import type { LearningTask } from "../types";

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function useLearningTaskList() {
  const [tasks, setTasks] = useState<LearningTask[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setTasks(await loadLearningTasks());
      setError(null);
    } catch (err) {
      setError(messageOf(err, "Could not load your tasks."));
    } finally {
      setLoaded(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  function commit(next: LearningTask[]) {
    setTasks(next);
    saveLearningTasks(next).catch((err: unknown) => setError(messageOf(err, "Failed to save changes.")));
  }

  return {
    tasks,
    loaded,
    error,
    toggle: (id: string) => commit(toggleTask(tasks, id)),
    remove: (id: string) => commit(removeTask(tasks, id)),
  };
}

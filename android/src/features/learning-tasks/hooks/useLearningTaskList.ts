// src/features/learning-tasks/hooks/useLearningTaskList.ts
/**
 * The saved Learning Tasks list. It reloads whenever the list screen comes into view. A removed task
 * is hidden at once and kept as pending; it is deleted for real when the undo snackbar dismisses, a
 * new delete replaces it, or the screen loses focus.
 */
import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadLearningTasks, saveLearningTasks } from "../lib/store";
import { removeTask, toggleTask } from "../lib/learning-tasks";
import type { LearningTask } from "../types";

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function useLearningTaskList() {
  const [tasks, setTasks] = useState<LearningTask[]>([]);
  const [pending, setPending] = useState<LearningTask | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef<LearningTask[]>([]);
  const pendingRef = useRef<LearningTask | null>(null);
  const writes = useRef<Promise<void>>(Promise.resolve());

  const save = useCallback((next: LearningTask[]) => {
    latest.current = next;
    setTasks(next);
    writes.current = saveLearningTasks(next).catch((err: unknown) => setError(messageOf(err, "Failed to save changes.")));
  }, []);

  const reload = useCallback(async () => {
    try {
      await writes.current;
      const next = await loadLearningTasks();
      latest.current = next;
      setTasks(next);
      setError(null);
    } catch (err) {
      setError(messageOf(err, "Could not load your tasks."));
    } finally {
      setLoaded(true);
    }
  }, []);

  const commitPending = useCallback(() => {
    const task = pendingRef.current;
    if (!task) return;
    pendingRef.current = null;
    setPending(null);
    save(removeTask(latest.current, task.id));
  }, [save]);

  useFocusEffect(
    useCallback(() => {
      void reload();
      return commitPending;
    }, [reload, commitPending]),
  );

  const remove = useCallback(
    (id: string) => {
      const task = latest.current.find((item) => item.id === id);
      if (!task || pendingRef.current?.id === id) return;
      commitPending();
      pendingRef.current = task;
      setPending(task);
    },
    [commitPending],
  );

  const undo = useCallback(() => {
    pendingRef.current = null;
    setPending(null);
  }, []);

  return {
    tasks: pending ? tasks.filter((task) => task.id !== pending.id) : tasks,
    loaded,
    error,
    pending,
    toggle: (id: string) => save(toggleTask(latest.current, id)),
    remove,
    undo,
    dismiss: commitPending,
  };
}

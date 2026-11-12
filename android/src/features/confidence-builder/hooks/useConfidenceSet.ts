// src/features/confidence-builder/hooks/useConfidenceSet.ts
/**
 * State for one saved set: its tasks, Create more tasks (which reuses the set's form), and delete.
 * Starting a task goes through the practice log, which the list page shows.
 */
import { useEffect, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { generateConfidenceTasks } from "../lib/generators";
import { deleteConfidenceSet, getConfidenceSet, saveConfidenceSet } from "../lib/store";
import type { ConfidenceSet, ConfidenceTask } from "../types";
import { useConfidenceLog } from "./useConfidenceLog";

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function useConfidenceSet(setId: string) {
  const { settings } = useAiSettings();
  const [set, setSet] = useState<ConfidenceSet | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const request = useRequest(generateConfidenceTasks);
  const log = useConfidenceLog();

  useEffect(() => {
    let active = true;
    getConfidenceSet(setId)
      .then((found) => {
        if (active) setSet(found);
      })
      .catch((err: unknown) => {
        if (active) setLoadError(messageOf(err, "Could not load this set."));
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [setId]);

  async function regenerate() {
    if (!set) return;
    const result = await request.run(settings, set.form);
    if (!result) return;
    const next = { ...set, result, updatedAt: new Date().toISOString() };
    setSet(next);
    setSaveError(null);
    saveConfidenceSet(next).catch((err: unknown) => setSaveError(messageOf(err, "Failed to save changes.")));
  }

  function startTask(task: ConfidenceTask) {
    if (!set) return;
    log.startTask(task, set.form.focus);
  }

  async function remove(onRemoved: () => void) {
    try {
      await deleteConfidenceSet(setId);
      onRemoved();
    } catch (err) {
      setSaveError(messageOf(err, "Could not delete this set."));
    }
  }

  return {
    set,
    loaded,
    loadError,
    pending: request.pending,
    error: request.error,
    saveError: saveError ?? log.saveError,
    regenerate,
    startTask,
    remove,
    log,
  };
}

export type ConfidenceSetState = ReturnType<typeof useConfidenceSet>;

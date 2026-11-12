// src/features/confidence-builder/hooks/useConfidenceLog.ts
/**
 * The practice log: finished tasks and the round in progress. Every change is saved at once, so a
 * round started on a set page is already saved when the list page opens. Nothing changes until the
 * saved log has loaded, so an early tap can never overwrite the history.
 */
import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { SAVE_FAILED_MESSAGE } from "@/features/projects/hooks/useSavedDraft";
import { dropRound, EMPTY_LOG, finishRound, markDone, rateAfter, rateBefore, setReflection, startRound, summarise } from "../lib/log";
import { loadConfidenceLog, saveConfidenceLog } from "../lib/store";
import type { ConfidenceFocus, ConfidenceLog, ConfidenceTask, Rating } from "../types";

function newId(): string {
  return globalThis.crypto.randomUUID();
}

export function useConfidenceLog() {
  const [log, setLog] = useState<ConfidenceLog>(EMPTY_LOG);
  const [loaded, setLoaded] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const latest = useRef<ConfidenceLog>(EMPTY_LOG);
  const ready = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadConfidenceLog()
        .then((next) => {
          if (!active) return;
          latest.current = next;
          ready.current = true;
          setLog(next);
        })
        .catch(() => undefined)
        .finally(() => {
          if (active) setLoaded(true);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const commit = useCallback((change: (current: ConfidenceLog) => ConfidenceLog) => {
    if (!ready.current) return;
    const next = change(latest.current);
    if (next === latest.current) return;
    latest.current = next;
    setLog(next);
    saveConfidenceLog(next)
      .then(() => setSaveFailed(false))
      .catch(() => setSaveFailed(true));
  }, []);

  const startTask = useCallback(
    (task: ConfidenceTask, focus: ConfidenceFocus) => {
      commit((prev) => (prev.active ? prev : startRound(prev, task, focus, new Date().toISOString())));
    },
    [commit],
  );

  const rate = useCallback(
    (rating: Rating) => {
      commit((prev) => (prev.active && prev.active.before === null ? rateBefore(prev, rating) : rateAfter(prev, rating)));
    },
    [commit],
  );

  const markTaskDone = useCallback(() => {
    commit((prev) => markDone(prev, new Date().toISOString()));
  }, [commit]);

  const changeReflection = useCallback(
    (text: string) => {
      commit((prev) => setReflection(prev, text));
    },
    [commit],
  );

  const saveRound = useCallback(() => {
    commit((prev) => finishRound(prev, newId(), new Date().toISOString()));
  }, [commit]);

  const dropTask = useCallback(() => {
    commit((prev) => dropRound(prev));
  }, [commit]);

  return {
    loaded,
    active: log.active,
    entries: log.entries,
    summary: summarise(log.entries),
    saveError: saveFailed ? SAVE_FAILED_MESSAGE : null,
    startTask,
    rate,
    markTaskDone,
    changeReflection,
    saveRound,
    dropTask,
  };
}

export type ConfidenceLogState = ReturnType<typeof useConfidenceLog>;

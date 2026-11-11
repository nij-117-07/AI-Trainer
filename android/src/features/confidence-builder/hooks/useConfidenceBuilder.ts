// src/features/confidence-builder/hooks/useConfidenceBuilder.ts
/**
 * Holds the task form and the generated tasks (saved by useSavedDraft), and the practice history and
 * the round in progress (saved in the confidence log). Every change is saved shortly after it is made.
 */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { SAVE_FAILED_MESSAGE, useSavedDraft } from "@/features/projects/hooks/useSavedDraft";
import { useRequest } from "@/hooks/useRequest";
import { generateConfidenceTasks } from "../lib/generators";
import { toConfidenceDraft } from "../lib/normalise";
import { dropRound, EMPTY_LOG, finishRound, markDone, rateAfter, rateBefore, setReflection, startRound, summarise } from "../lib/log";
import { CONFIDENCE_FORM_KEY, loadConfidenceLog, saveConfidenceLog } from "../lib/store";
import { DEFAULT_TASKS } from "../lib/validate";
import type { ConfidenceFormValues, ConfidenceLog, ConfidenceTask, ConfidenceTaskResult, Rating } from "../types";

const SAVE_DELAY_MS = 300;

const DEFAULTS: ConfidenceFormValues = {
  focus: "speak-up",
  situation: "",
  comfort: "low",
  numTasks: DEFAULT_TASKS,
  instructions: "",
};

const parseDraft = (raw: unknown) => toConfidenceDraft(raw, DEFAULTS);

function newId(): string {
  return globalThis.crypto.randomUUID();
}

export function useConfidenceBuilder() {
  const { settings } = useAiSettings();
  const draft = useSavedDraft<ConfidenceFormValues, ConfidenceTaskResult>(CONFIDENCE_FORM_KEY, DEFAULTS, parseDraft);
  const request = useRequest(generateConfidenceTasks);
  const [log, setLog] = useState<ConfidenceLog>(EMPTY_LOG);
  const [loaded, setLoaded] = useState(false);
  const [logSaveFailed, setLogSaveFailed] = useState(false);
  const { form, setForm, result, setResult } = draft;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadConfidenceLog()
        .then((next) => {
          if (active) setLog(next);
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

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      saveConfidenceLog(log)
        .then(() => setLogSaveFailed(false))
        .catch(() => setLogSaveFailed(true));
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [loaded, log]);

  function update<K extends keyof ConfidenceFormValues>(key: K, value: ConfidenceFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function generate() {
    const next = await request.run(settings, form);
    if (next) setResult(next);
  }

  function startTask(task: ConfidenceTask) {
    setLog((prev) => startRound(prev, task, form.focus, new Date().toISOString()));
  }

  function rate(rating: Rating) {
    setLog((prev) => (prev.active && prev.active.before === null ? rateBefore(prev, rating) : rateAfter(prev, rating)));
  }

  function markTaskDone() {
    setLog((prev) => markDone(prev, new Date().toISOString()));
  }

  function changeReflection(text: string) {
    setLog((prev) => setReflection(prev, text));
  }

  function saveRound() {
    setLog((prev) => finishRound(prev, newId(), new Date().toISOString()));
  }

  function dropTask() {
    setLog((prev) => dropRound(prev));
  }

  function reset() {
    draft.reset();
    request.reset();
  }

  return {
    form,
    tasks: result,
    loaded,
    active: log.active,
    entries: log.entries,
    summary: summarise(log.entries),
    pending: request.pending,
    error: request.error,
    saveError: draft.saveFailed || logSaveFailed ? SAVE_FAILED_MESSAGE : null,
    update,
    generate,
    startTask,
    rate,
    markTaskDone,
    changeReflection,
    saveRound,
    dropTask,
    reset,
  };
}

export type ConfidenceBuilderState = ReturnType<typeof useConfidenceBuilder>;

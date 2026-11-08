// src/features/joke-coach/hooks/useJokeMode.ts
/**
 * Shared state for one Joke Coach mode: the saved draft, the last result, and an abortable AI
 * request. Starting a new request or resetting cancels the one in flight.
 */
import { useEffect, useRef } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import type { AiSettings } from "@/features/ai-settings/types";
import { useRequest } from "@/hooks/useRequest";
import { usePersistedMode } from "./usePersistedMode";

type ModeTask<TForm, TResult> = (settings: AiSettings, values: TForm, signal: AbortSignal) => Promise<TResult>;

export function useJokeMode<TForm extends object, TResult>(
  storageKey: string,
  defaults: TForm,
  task: ModeTask<TForm, TResult>,
) {
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedMode<TForm, TResult>(storageKey, defaults);
  const request = useRequest(task);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof TForm>(key: K, value: TForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function run() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const next = await request.run(settings, form, controller.signal);
    if (next && !controller.signal.aborted) setResult(next);
  }

  function clear() {
    controllerRef.current?.abort();
    reset();
    request.reset();
  }

  return {
    form,
    update,
    result,
    pending: request.pending,
    error: controllerRef.current?.signal.aborted ? null : request.error,
    run,
    reset: clear,
  };
}

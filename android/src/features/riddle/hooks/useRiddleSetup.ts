// src/features/riddle/hooks/useRiddleSetup.ts
/**
 * Riddle setup form, used on the New riddle page. The form is kept on the device. A successful
 * generate saves the new round (replacing the old one) before calling onGenerated.
 */
import { useEffect, useRef } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { saveDocument } from "@/lib/document-store";
import { DEFAULT_FORM } from "../options";
import { generateRiddle } from "../lib/generators";
import { RIDDLE_STORAGE_KEYS } from "../lib/persistence";
import { sanitizeForm } from "../lib/normalize";
import type { RiddleFormValues } from "../types";
import { usePersistedDocument } from "./usePersistedDocument";

export function useRiddleSetup(onGenerated: () => void) {
  const { settings } = useAiSettings();
  const form = usePersistedDocument<RiddleFormValues>(RIDDLE_STORAGE_KEYS.form, DEFAULT_FORM, sanitizeForm);
  const generate = useRequest(generateRiddle);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  function update<K extends keyof RiddleFormValues>(key: K, value: RiddleFormValues[K]) {
    form.setValue((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const riddle = await generate.run(settings, form.value, controller.signal);
    if (!riddle || controller.signal.aborted) return;
    await saveDocument(RIDDLE_STORAGE_KEYS.round, { riddle, attempts: [], userAnswer: "" }).catch(() => undefined);
    onGenerated();
  }

  function reset() {
    activeRequest.current?.abort();
    form.setValue(DEFAULT_FORM);
    generate.reset();
  }

  return {
    form: form.value,
    update,
    pending: generate.pending,
    error: generate.error,
    submit,
    reset,
  };
}

export type RiddleSetupState = ReturnType<typeof useRiddleSetup>;

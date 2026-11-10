// src/features/foresight-trainer/hooks/useForesightSetup.ts
/**
 * New scenario page: the saved setup form and the start action. A successful start saves the new
 * session before calling onStarted, so the session page shows it when it is focused again.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { FORM_DEFAULTS } from "../options";
import { startScenario } from "../lib/generators";
import { FORESIGHT_STORAGE_KEYS, restoreForm } from "../lib/persistence";
import { createSession } from "../lib/session";
import type { StartFormValues } from "../types";
import { usePersistedDocument } from "./usePersistedDocument";

const restoreFormDraft = (saved: unknown) => restoreForm(FORM_DEFAULTS, saved);

export function useForesightSetup(onStarted: () => void) {
  const { settings } = useAiSettings();
  const form = usePersistedDocument<StartFormValues>(FORESIGHT_STORAGE_KEYS.form, FORM_DEFAULTS, restoreFormDraft);
  const start = useRequest(startScenario);
  const [hasSession, setHasSession] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDocument<unknown>(FORESIGHT_STORAGE_KEYS.session, null)
        .then((saved) => {
          if (active) setHasSession(saved !== null);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  function update<K extends keyof StartFormValues>(key: K, value: StartFormValues[K]) {
    form.setValue((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const result = await start.run(settings, form.value, controller.signal);
    if (!result || controller.signal.aborted) return;
    const session = createSession(form.value.mainTheme.trim(), result);
    await saveDocument(FORESIGHT_STORAGE_KEYS.session, session).catch(() => undefined);
    onStarted();
  }

  function reset() {
    activeRequest.current?.abort();
    form.setValue(FORM_DEFAULTS);
    start.reset();
  }

  return {
    form: form.value,
    update,
    hasSession,
    pending: start.pending,
    error: start.error,
    submit,
    reset,
  };
}

export type ForesightSetupState = ReturnType<typeof useForesightSetup>;

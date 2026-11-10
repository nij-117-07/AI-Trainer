// src/features/guess-game/hooks/useGuessGameSetup.ts
/**
 * Guess Game setup form, used on the New game page. The form is kept on the device. A successful
 * start saves the new game (replacing the old one) before calling onGenerated.
 */
import { useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { DEFAULT_FORM } from "../options";
import { startGame } from "../lib/generators";
import { GUESS_GAME_KEYS, mergeSavedForm } from "../lib/persistence";
import { startSession } from "../lib/session-model";
import { resolveCategory } from "../lib/validate";
import type { GameSetupFormValues } from "../types";

export function useGuessGameSetup(onGenerated: () => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<GameSetupFormValues>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const start = useRequest(startGame);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(GUESS_GAME_KEYS.form, null)
      .then((saved) => {
        if (active) setForm(mergeSavedForm(DEFAULT_FORM, saved));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(GUESS_GAME_KEYS.form, form).catch(() => undefined);
  }, [loaded, form]);

  useEffect(() => () => activeRequest.current?.abort(), []);

  function update<K extends keyof GameSetupFormValues>(key: K, value: GameSetupFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const setup = await start.run(settings, form, controller.signal);
    if (!setup || controller.signal.aborted) return;
    const session = startSession(setup, resolveCategory(form), form.difficulty);
    await saveDocument(GUESS_GAME_KEYS.session, session).catch(() => undefined);
    onGenerated();
  }

  function reset() {
    activeRequest.current?.abort();
    setForm(DEFAULT_FORM);
    start.reset();
  }

  return {
    form,
    update,
    pending: start.pending,
    error: start.error,
    submit,
    reset,
  };
}

export type GuessGameSetupState = ReturnType<typeof useGuessGameSetup>;

// src/features/battleground/hooks/useBattleSetup.ts
/**
 * The battle form on the New battle page. The form is kept on the device. A successful start saves
 * the new battle, replacing the old one, before calling onStarted.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { BATTLE_FORM_DEFAULTS } from "../options";
import { startBattle } from "../lib/generators";
import { BATTLE_STORAGE_KEYS, mergeSavedForm } from "../lib/persistence";
import type { BattleFormValues } from "../types";

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}

export function useBattleSetup(onStarted: () => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<BattleFormValues>(BATTLE_FORM_DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const runId = useRef(0);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(BATTLE_STORAGE_KEYS.form, null)
      .then((saved) => {
        if (active) setForm(mergeSavedForm(BATTLE_FORM_DEFAULTS, saved));
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
    if (loaded) saveDocument(BATTLE_STORAGE_KEYS.form, form).catch(() => undefined);
  }, [loaded, form]);

  useEffect(() => () => controller.current?.abort(), []);

  function update<K extends keyof BattleFormValues>(key: K, value: BattleFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const submit = useCallback(async () => {
    if (pending) return;
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    runId.current += 1;
    const id = runId.current;
    setPending(true);
    setError(null);
    try {
      const session = await startBattle(settings, form, next.signal);
      if (id !== runId.current) return;
      await saveDocument(BATTLE_STORAGE_KEYS.session, session).catch(() => undefined);
      onStarted();
    } catch (err) {
      if (id === runId.current) setError(messageOf(err));
    } finally {
      if (id === runId.current) setPending(false);
    }
  }, [form, onStarted, pending, settings]);

  function reset() {
    controller.current?.abort();
    runId.current += 1;
    setPending(false);
    setError(null);
    setForm(BATTLE_FORM_DEFAULTS);
  }

  return { form, update, pending, error, submit, reset };
}

export type BattleSetupState = ReturnType<typeof useBattleSetup>;

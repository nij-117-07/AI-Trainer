// src/features/battleground/hooks/useBattleSession.ts
/**
 * Owns the Battleground Simulator state: the saved setup form, the running session, and the
 * start / answer / reset actions. Requests run with an AbortController, and a reset ignores any
 * result that arrives after it.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { BATTLE_FORM_DEFAULTS } from "../options";
import { playRound, startBattle } from "../lib/generators";
import { finishRound } from "../lib/game";
import { asSavedSession, BATTLE_STORAGE_KEYS, mergeSavedForm } from "../lib/persistence";
import type { BattleFormValues, BattleSession } from "../types";

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}

export function useBattleSession() {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<BattleFormValues>(BATTLE_FORM_DEFAULTS);
  const [session, setSession] = useState<BattleSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const runId = useRef(0);

  useEffect(() => {
    let active = true;
    Promise.all([loadDocument<unknown>(BATTLE_STORAGE_KEYS.form, null), loadDocument<unknown>(BATTLE_STORAGE_KEYS.session, null)])
      .then(([savedForm, savedSession]) => {
        if (!active) return;
        setForm(mergeSavedForm(BATTLE_FORM_DEFAULTS, savedForm));
        setSession(asSavedSession(savedSession));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
      controller.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (loaded) saveDocument(BATTLE_STORAGE_KEYS.form, form).catch(() => undefined);
  }, [loaded, form]);

  useEffect(() => {
    if (loaded) saveDocument(BATTLE_STORAGE_KEYS.session, session).catch(() => undefined);
  }, [loaded, session]);

  const beginRun = useCallback(() => {
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    runId.current += 1;
    setPending(true);
    setError(null);
    return { id: runId.current, signal: next.signal };
  }, []);

  const start = useCallback(async () => {
    const run = beginRun();
    try {
      const created = await startBattle(settings, form, run.signal);
      if (run.id === runId.current) setSession(created);
    } catch (err) {
      if (run.id === runId.current) setError(messageOf(err));
    } finally {
      if (run.id === runId.current) setPending(false);
    }
  }, [beginRun, form, settings]);

  const commit = useCallback(
    async (answer: string) => {
      if (!session || pending) return;
      const current = session;
      const run = beginRun();
      try {
        const round = await playRound(settings, current, answer, run.signal);
        if (run.id === runId.current) setSession(finishRound(current, answer.trim(), round));
      } catch (err) {
        if (run.id === runId.current) setError(messageOf(err));
      } finally {
        if (run.id === runId.current) setPending(false);
      }
    },
    [beginRun, pending, session, settings],
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    runId.current += 1;
    setPending(false);
    setError(null);
    setSession(null);
    setForm(BATTLE_FORM_DEFAULTS);
  }, []);

  return { form, setForm, session, pending, error, start, commit, reset };
}

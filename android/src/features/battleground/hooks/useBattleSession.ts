// src/features/battleground/hooks/useBattleSession.ts
/**
 * The battle on the practice page: the saved session, the move action, and the reset. The battle
 * is kept on the device and reloaded each time the page is focused, so a battle started on the New
 * battle page appears when the user comes back. Requests run with an AbortController, and a reset
 * ignores any result that arrives after it.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { finishRound } from "../lib/game";
import { playRound } from "../lib/generators";
import { asSavedSession, BATTLE_STORAGE_KEYS } from "../lib/persistence";
import type { BattleSession } from "../types";

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}

export function useBattleSession() {
  const { settings } = useAiSettings();
  const [session, setSession] = useState<BattleSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const runId = useRef(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDocument<unknown>(BATTLE_STORAGE_KEYS.session, null)
        .then((saved) => {
          if (active) setSession(asSavedSession(saved));
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
    saveDocument(BATTLE_STORAGE_KEYS.session, session).catch(() => undefined);
  }, [loaded, session]);

  useEffect(() => () => controller.current?.abort(), []);

  /** Plays one move. Returns true when the round was resolved, so the caller can clear its box. */
  const commit = useCallback(
    async (answer: string): Promise<boolean> => {
      if (!session || pending) return false;
      const current = session;
      controller.current?.abort();
      const next = new AbortController();
      controller.current = next;
      runId.current += 1;
      const id = runId.current;
      setPending(true);
      setError(null);
      try {
        const round = await playRound(settings, current, answer, next.signal);
        if (id !== runId.current) return false;
        setSession(finishRound(current, answer.trim(), round));
        return true;
      } catch (err) {
        if (id === runId.current) setError(messageOf(err));
        return false;
      } finally {
        if (id === runId.current) setPending(false);
      }
    },
    [pending, session, settings],
  );

  /** Clears the current battle. The New battle form is kept. */
  const reset = useCallback(() => {
    controller.current?.abort();
    runId.current += 1;
    setPending(false);
    setError(null);
    setSession(null);
  }, []);

  return { loaded, session, pending, error, commit, reset };
}

export type BattleSessionState = ReturnType<typeof useBattleSession>;

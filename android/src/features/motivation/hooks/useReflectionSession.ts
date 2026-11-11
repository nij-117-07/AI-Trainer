// src/features/motivation/hooks/useReflectionSession.ts
/**
 * Keeps the step-by-step reflection round on the device under its own key. Typing is saved after
 * a short pause. Submit, step changes, and leaving the screen save at once. A failed save keeps
 * the value in memory and is retried on the next change.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import {
  advance,
  emptyReflectionSession,
  REFLECTION_SESSION_KEY,
  restoreReflectionSession,
  roundFor,
  submitAnswer,
  withAnswer,
  type ReflectionSession,
} from "../lib/reflection-session";

const SAVE_DELAY_MS = 400;
export const REFLECTION_SAVE_ERROR = "Changes couldn't be saved. They'll try again.";

export function useReflectionSession(prompts: string[]) {
  const [stored, setStored] = useState<ReflectionSession>(() => emptyReflectionSession());
  const [saveError, setSaveError] = useState<string | null>(null);
  const ready = useRef(false);
  const pending = useRef<ReflectionSession | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const session = roundFor(stored, prompts);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const next = pending.current;
    if (!ready.current || !next) return;
    pending.current = null;
    saveDocument(REFLECTION_SESSION_KEY, { session: next, savedAt: new Date().toISOString() })
      .then(() => setSaveError(null))
      .catch(() => {
        if (!pending.current) pending.current = next;
        setSaveError(REFLECTION_SAVE_ERROR);
      });
  }, []);

  useEffect(() => {
    loadDocument<unknown>(REFLECTION_SESSION_KEY, null)
      .then((raw) => {
        const latest = pending.current ?? (raw !== null ? restoreReflectionSession(raw) : null);
        if (latest) setStored(latest);
      })
      .catch(() => undefined)
      .finally(() => {
        ready.current = true;
        flush();
      });
  }, [flush]);

  useEffect(() => () => flush(), [flush]);

  const commit = useCallback(
    (next: ReflectionSession, now = false) => {
      setStored(next);
      pending.current = next;
      if (timer.current) clearTimeout(timer.current);
      if (now) {
        flush();
      } else {
        timer.current = setTimeout(flush, SAVE_DELAY_MS);
      }
    },
    [flush],
  );

  return {
    session,
    saveError,
    writeAnswer: (text: string) => commit(withAnswer(session, text)),
    flush,
    submit: () => commit(submitAnswer(session), true),
    advance: () => commit(advance(session), true),
    reset: () => commit(emptyReflectionSession(), true),
  };
}

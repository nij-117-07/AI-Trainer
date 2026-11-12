// src/features/debate/hooks/useDebateSession.ts
/**
 * Debate state for the practice page: the saved debate, the next-turn draft (side, mode, text,
 * strategy, and evidence), and the calls for a turn, a persona regeneration, and the judge. The
 * debate is kept on the device and reloaded each time the page is focused, so a debate built on
 * the New debate page appears when the user comes back.
 */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { createPersonas, judgeDebate, takeTurn } from "../lib/generators";
import { DEBATE_STORAGE_KEYS, restoreSession } from "../lib/persistence";
import { appendStatement, buildJudgeInput, buildTurnInput, lastSpeakerOf, nextSideOf } from "../lib/session";
import { buildPersonaInput, requireText } from "../lib/validate";
import { LIMITS } from "../options";
import type {
  DebateSession,
  DebateSide,
  JudgeInput,
  PersonaInput,
  PersonaProfile,
  TurnInput,
  TurnMode,
  TurnStrategy,
} from "../types";
import { useAbortableTask } from "./useAbortableTask";

export interface TurnDraft {
  mode: TurnMode;
  text: string;
  strategy: TurnStrategy;
  evidence: string;
}

const EMPTY_DRAFT: TurnDraft = { mode: "type", text: "", strategy: "counter", evidence: "" };

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}

export function useDebateSession() {
  const { settings } = useAiSettings();
  const [session, setSession] = useState<DebateSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<TurnDraft>(EMPTY_DRAFT);
  const [localError, setLocalError] = useState<string | null>(null);
  const turn = useAbortableTask(takeTurn);
  const judge = useAbortableTask(judgeDebate);
  const regen = useAbortableTask(createPersonas);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDocument<unknown>(DEBATE_STORAGE_KEYS.session, null)
        .then((saved) => {
          if (active) setSession(restoreSession(saved));
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
    saveDocument(DEBATE_STORAGE_KEYS.session, session).catch(() => undefined);
  }, [loaded, session]);

  const busy = turn.pending || judge.pending || regen.pending;
  const error = localError ?? turn.error ?? regen.error ?? judge.error;
  const side: DebateSide = session ? nextSideOf(session) : "pro";
  const lastSpeaker = session ? lastSpeakerOf(session) : null;

  function changeDraft<K extends keyof TurnDraft>(key: K, value: TurnDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function addTurn() {
    const snapshot = session;
    if (!snapshot || busy) return;
    const { mode, text, strategy, evidence } = draft;
    setLocalError(null);
    if (mode === "type") {
      let statement: string;
      try {
        statement = requireText(text, "Statement", LIMITS.statement);
      } catch (err) {
        setLocalError(messageOf(err));
        return;
      }
      setSession((prev) => (prev ? appendStatement(prev, side, statement, null) : prev));
      setDraft((prev) => ({ ...prev, text: "" }));
      return;
    }
    let input: TurnInput;
    try {
      input = buildTurnInput(snapshot, { side, mode, text: text.trim(), strategy, evidence: evidence.trim() });
    } catch (err) {
      setLocalError(messageOf(err));
      return;
    }
    const response = await turn.run(settings, input);
    if (!response) return;
    setSession((prev) => (prev ? appendStatement(prev, side, response.spokenArgument, response) : prev));
    setDraft((prev) => ({ ...prev, text: "", evidence: "" }));
  }

  async function regeneratePersona(side: DebateSide) {
    const snapshot = session;
    if (!snapshot || busy) return;
    setLocalError(null);
    if (!snapshot.setup) {
      setLocalError("Start a new debate to regenerate the personas.");
      return;
    }
    let input: PersonaInput;
    try {
      input = buildPersonaInput(snapshot.setup, side);
    } catch (err) {
      setLocalError(messageOf(err));
      return;
    }
    const personas = await regen.run(settings, [input]);
    const persona = personas?.[0];
    if (persona) savePersona(side, persona);
  }

  function savePersona(side: DebateSide, persona: PersonaProfile) {
    setSession((prev) => {
      if (!prev) return prev;
      return side === "pro" ? { ...prev, proPersona: persona } : { ...prev, conPersona: persona };
    });
  }

  async function endAndJudge() {
    const snapshot = session;
    if (!snapshot || busy) return;
    setLocalError(null);
    let input: JudgeInput;
    try {
      input = buildJudgeInput(snapshot);
    } catch (err) {
      setLocalError(messageOf(err));
      return;
    }
    const verdict = await judge.run(settings, input);
    if (verdict) setSession((prev) => (prev ? { ...prev, complete: true, verdict } : prev));
  }

  /** Clears the current debate. The New debate form is kept. */
  function resetDebate() {
    turn.cancel();
    judge.cancel();
    regen.cancel();
    setLocalError(null);
    setDraft(EMPTY_DRAFT);
    setSession(null);
  }

  return {
    loaded,
    session,
    draft,
    side,
    lastSpeaker,
    changeDraft,
    busy,
    regenerating: regen.pending,
    judging: judge.pending,
    error,
    addTurn,
    regeneratePersona,
    savePersona,
    endAndJudge,
    resetDebate,
  };
}

export type DebateSessionState = ReturnType<typeof useDebateSession>;

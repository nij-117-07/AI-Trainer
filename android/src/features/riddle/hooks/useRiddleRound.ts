// src/features/riddle/hooks/useRiddleRound.ts
/**
 * Riddle game state: the active round, the answer attempts, and the solution toggle. The round is
 * saved on the device and reloaded each time the game page is focused, so a riddle generated on
 * the New riddle page appears when the user comes back.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { evaluateRiddleAnswer } from "../lib/generators";
import { sanitizeRound } from "../lib/normalize";
import { RIDDLE_STORAGE_KEYS } from "../lib/persistence";
import type { RiddleRound } from "../types";

export function useRiddleRound() {
  const { settings } = useAiSettings();
  const [round, setRound] = useState<RiddleRound | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const evaluate = useRequest(evaluateRiddleAnswer);
  const { reset: resetEvaluation } = evaluate;
  const activeRequest = useRef<AbortController | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDocument<unknown>(RIDDLE_STORAGE_KEYS.round, null)
        .then((saved) => {
          if (!active) return;
          setRound(sanitizeRound(saved));
          setShowSolution(false);
          resetEvaluation();
        })
        .catch(() => undefined)
        .finally(() => {
          if (active) setLoaded(true);
        });
      return () => {
        active = false;
      };
    }, [resetEvaluation]),
  );

  useEffect(() => {
    if (!loaded) return;
    saveDocument(RIDDLE_STORAGE_KEYS.round, round).catch(() => undefined);
  }, [loaded, round]);

  useEffect(() => () => activeRequest.current?.abort(), []);

  async function submitAnswer() {
    const current = round;
    if (!current) return;
    const answer = current.userAnswer.trim();
    if (!answer) return;
    setRound({ ...current, userAnswer: answer });
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const evaluation = await evaluate.run(settings, current.riddle, answer, controller.signal);
    if (!evaluation || controller.signal.aborted) return;
    setRound((latest) =>
      latest && latest.riddle === current.riddle
        ? { ...latest, attempts: [...latest.attempts, { answer, evaluation }], userAnswer: "" }
        : latest,
    );
  }

  function changeAnswer(text: string) {
    setRound((latest) => (latest ? { ...latest, userAnswer: text } : latest));
  }

  return {
    loaded,
    round,
    showSolution,
    toggleSolution: () => setShowSolution((value) => !value),
    evaluate,
    submitAnswer,
    changeAnswer,
  };
}

export type RiddleRoundState = ReturnType<typeof useRiddleRound>;

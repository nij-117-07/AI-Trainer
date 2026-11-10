// src/features/puzzle/hooks/usePuzzleRound.ts
/**
 * Puzzle game state: the active round, its attempts, and the answer draft. The round is saved on
 * the device and reloaded each time the game page is focused, so a puzzle generated on the New
 * puzzle page appears when the user comes back.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, removeDocument, saveDocument } from "@/lib/document-store";
import { evaluatePuzzleAttempt } from "../lib/generators";
import { PUZZLE_ROUND_KEY } from "../lib/persistence";
import { readRound } from "../lib/normalize";
import type { PuzzleRound } from "../types";

export function usePuzzleRound() {
  const { settings } = useAiSettings();
  const [round, setRound] = useState<PuzzleRound | null>(null);
  const [loaded, setLoaded] = useState(false);
  const evaluate = useRequest(evaluatePuzzleAttempt);
  const { reset: resetEvaluation } = evaluate;
  const activeRequest = useRef<AbortController | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDocument<unknown>(PUZZLE_ROUND_KEY, null)
        .then((saved) => {
          if (!active) return;
          setRound(readRound(saved));
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
    const write = round ? saveDocument(PUZZLE_ROUND_KEY, round) : removeDocument(PUZZLE_ROUND_KEY);
    write.catch(() => undefined);
  }, [loaded, round]);

  useEffect(() => () => activeRequest.current?.abort(), []);

  async function submitAnswer() {
    const current = round;
    if (!current) return;
    const answer = current.userAnswer.trim();
    if (!answer) return;
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const evaluation = await evaluate.run(
      settings,
      { puzzle: current.puzzle, puzzleType: current.puzzleType, answer },
      controller.signal,
    );
    if (!evaluation || controller.signal.aborted) return;
    setRound((latest) =>
      latest && latest.puzzle === current.puzzle
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
    evaluate,
    submitAnswer,
    changeAnswer,
  };
}

export type PuzzleRoundState = ReturnType<typeof usePuzzleRound>;

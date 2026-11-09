// src/features/puzzle/hooks/usePuzzleGame.ts
/** Puzzle Generator state: the saved form and round, and the model calls that change them. */
import { useEffect, useRef } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import type { PuzzleFormValues } from "../types";
import { evaluatePuzzleAttempt, generatePuzzle } from "../lib/generators";
import { usePersistedPuzzle } from "./usePersistedPuzzle";

export function usePuzzleGame() {
  const { settings } = useAiSettings();
  const { form, setForm, round, setRound, reset } = usePersistedPuzzle();
  const generate = useRequest(generatePuzzle);
  const evaluate = useRequest(evaluatePuzzleAttempt);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof PuzzleFormValues>(key: K, value: PuzzleFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function nextSignal(): AbortSignal {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller.signal;
  }

  async function handleGenerate() {
    const puzzle = await generate.run(settings, form, nextSignal());
    if (!puzzle) return;
    evaluate.reset();
    setRound({ puzzle, puzzleType: form.puzzleType, attempts: [], userAnswer: "" });
  }

  function handleAnswerChange(answer: string) {
    setRound((current) => (current ? { ...current, userAnswer: answer } : current));
  }

  async function handleSubmit() {
    if (!round) return;
    const answer = round.userAnswer.trim();
    if (!answer) return;
    const evaluation = await evaluate.run(
      settings,
      { puzzle: round.puzzle, puzzleType: round.puzzleType, answer },
      nextSignal(),
    );
    if (!evaluation) return;
    setRound((current) =>
      current ? { ...current, attempts: [...current.attempts, { answer, evaluation }], userAnswer: "" } : current,
    );
  }

  function handleReset() {
    controllerRef.current?.abort();
    reset();
    generate.reset();
    evaluate.reset();
  }

  return {
    form,
    update,
    round,
    generate,
    evaluate,
    handleGenerate,
    handleAnswerChange,
    handleSubmit,
    handleReset,
  };
}

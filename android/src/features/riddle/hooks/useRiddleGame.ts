// src/features/riddle/hooks/useRiddleGame.ts
/** Riddle Generator state: the form and the active round, both kept on the device, and the model calls. */
import { useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { DEFAULT_FORM } from "../options";
import { evaluateRiddleAnswer, generateRiddle } from "../lib/generators";
import { sanitizeForm, sanitizeRound } from "../lib/normalize";
import type { RiddleFormValues, RiddleRound } from "../types";
import { usePersistedDocument } from "./usePersistedDocument";

export const RIDDLE_STORAGE_KEYS = {
  form: "practice.riddle.form.v1",
  round: "practice.riddle.round.v1",
} as const;

export function useRiddleGame() {
  const { settings } = useAiSettings();
  const form = usePersistedDocument<RiddleFormValues>(RIDDLE_STORAGE_KEYS.form, DEFAULT_FORM, sanitizeForm);
  const round = usePersistedDocument<RiddleRound | null>(RIDDLE_STORAGE_KEYS.round, null, sanitizeRound);
  const [showSolution, setShowSolution] = useState(false);
  const generate = useRequest(generateRiddle);
  const evaluate = useRequest(evaluateRiddleAnswer);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  function startRequest(): AbortSignal {
    const controller = new AbortController();
    activeRequest.current = controller;
    return controller.signal;
  }

  function updateForm<K extends keyof RiddleFormValues>(key: K, value: RiddleFormValues[K]) {
    form.setValue((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate() {
    const signal = startRequest();
    const riddle = await generate.run(settings, form.value, signal);
    if (!riddle || signal.aborted) return;
    setShowSolution(false);
    round.setValue({ riddle, attempts: [], userAnswer: "" });
  }

  async function handleSubmitAnswer() {
    const current = round.value;
    if (!current) return;
    const answer = current.userAnswer.trim();
    if (!answer) return;
    round.setValue({ ...current, userAnswer: answer });
    const signal = startRequest();
    const evaluation = await evaluate.run(settings, current.riddle, answer, signal);
    if (!evaluation || signal.aborted) return;
    round.setValue((latest) =>
      latest && latest.riddle === current.riddle
        ? { ...latest, attempts: [...latest.attempts, { answer, evaluation }], userAnswer: "" }
        : latest,
    );
  }

  function handleAnswerChange(text: string) {
    round.setValue((latest) => (latest ? { ...latest, userAnswer: text } : latest));
  }

  function handleReset() {
    form.setValue(DEFAULT_FORM);
    round.setValue(null);
    setShowSolution(false);
    generate.reset();
    evaluate.reset();
  }

  return {
    form: form.value,
    updateForm,
    round: round.value,
    showSolution,
    toggleSolution: () => setShowSolution((value) => !value),
    generate,
    evaluate,
    handleGenerate,
    handleSubmitAnswer,
    handleAnswerChange,
    handleReset,
  };
}

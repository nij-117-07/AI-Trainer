// src/features/language-tester/components/FibPractice.ts
/** State for the fill-in-the-blank screens: the setup form, the generated run, and the answer for each sentence. */
import { useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useLanguageProfiles } from "@/features/language-profiles/providers/LanguageProfilesProvider";
import { languagePair } from "@/features/language-profiles/lib/profiles";
import { useRequest } from "@/hooks/useRequest";
import { usePersistedRunState } from "@/hooks/usePersistedRunState";
import { evaluateFibAnswer, generateFibQuestions } from "../lib/generators";
import { LANGUAGE_TESTER_STORAGE_KEYS } from "../lib/persistence";
import { errorMessage } from "../lib/text";
import { useRunSignal } from "../hooks/useRunSignal";
import { usePersistedTool } from "../hooks/usePersistedValue";
import type { FibEvaluation, FibFormValues, FibResult } from "../types";

const DEFAULTS: FibFormValues = {
  targetLanguage: "German",
  level: "A2",
  numQuestions: 3,
  scenario: "At the pharmacy",
  userDetails: "A nurse",
  seed: "",
};

const RUN_STORAGE_KEY = "language-learner.language-tester.fib.run.v1";

export type FibMode = "step" | "list";

export function useFibSetup() {
  const { settings } = useAiSettings();
  const { activeProfile } = useLanguageProfiles();
  const { form, setForm, result, setResult, reset, saveError } = usePersistedTool<FibFormValues, FibResult>(
    LANGUAGE_TESTER_STORAGE_KEYS.fib,
    DEFAULTS,
  );
  const request = useRequest(generateFibQuestions);
  const nextSignal = useRunSignal();
  const [runKey, setRunKey] = useState(0);
  const [setupOpen, setSetupOpen] = useState(false);

  function update<K extends keyof FibFormValues>(key: K, value: FibFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    reset();
    request.reset();
  }

  async function generate() {
    const next = await request.run(settings, { ...form, ...languagePair(activeProfile) }, nextSignal());
    if (next) {
      setResult(next);
      setRunKey((key) => key + 1);
      setSetupOpen(false);
    }
  }

  return {
    form,
    update,
    result,
    pending: request.pending,
    error: request.error,
    saveError,
    generate,
    reset: handleReset,
    runKey,
    setupOpen,
    setSetupOpen,
  };
}

export type FibSetup = ReturnType<typeof useFibSetup>;

/** State for one generated run. Mounted per run, so saved answers always belong to the run on screen. */
export function useFibRound(result: FibResult) {
  const { settings } = useAiSettings();
  const nextSignal = useRunSignal();
  const [mode, setMode] = useState<FibMode>("step");
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);
  const [hintsOpen, setHintsOpen] = useState<Record<number, boolean>>({});
  const runId = JSON.stringify(result);
  const [answers, setAnswers, answersSaveError] = usePersistedRunState<Record<number, string>>(`${RUN_STORAGE_KEY}.answers`, runId, {});
  const [feedback, setFeedback] = usePersistedRunState<Record<number, FibEvaluation>>(
    `${RUN_STORAGE_KEY}.feedback`,
    runId,
    {},
  );
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = result.questions.length;
  const checkedCount = Object.keys(feedback).length;
  const firstOpen = result.questions.findIndex((_, position) => !feedback[position]);
  const index = Math.min(chosenIndex ?? Math.max(firstOpen, 0), Math.max(total - 1, 0));

  function goTo(next: number) {
    setChosenIndex(Math.min(Math.max(next, 0), Math.max(total - 1, 0)));
  }

  function changeAnswer(position: number, text: string) {
    setAnswers((current) => ({ ...current, [position]: text }));
  }

  function toggleHint(position: number) {
    setHintsOpen((current) => ({ ...current, [position]: !current[position] }));
  }

  async function check(position: number) {
    const question = result.questions[position];
    const userAnswer = (answers[position] ?? "").trim();
    if (!question || !userAnswer || pendingIndex !== null || feedback[position]) return;
    setChosenIndex(position);
    setPendingIndex(position);
    setError(null);
    try {
      const evaluation = await evaluateFibAnswer(
        settings,
        { sentenceContext: question.sentence, correctWord: question.correctWord, userAnswer },
        nextSignal(),
      );
      setFeedback((current) => ({ ...current, [position]: evaluation }));
    } catch (err) {
      setError(errorMessage(err, "Failed to check your answer."));
    } finally {
      setPendingIndex(null);
    }
  }

  return {
    questions: result.questions,
    mode,
    setMode,
    total,
    checkedCount,
    index,
    answers,
    feedback,
    hintsOpen,
    toggleHint,
    pendingIndex,
    error,
    saveError: answersSaveError,
    goTo,
    changeAnswer,
    check,
  };
}

export type FibRound = ReturnType<typeof useFibRound>;

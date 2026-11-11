// src/features/testing-portal/hooks/useSolverSetup.ts
/**
 * The MCQ form on the New question page. The form is kept on the device. A solve replaces the saved
 * solution, then calls onSolved.
 */
import { useEffect, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useRequest } from "@/hooks/useRequest";
import { saveDocument } from "@/lib/document-store";
import { solveMcq } from "../lib/generators";
import { loadSolverResult, SOLVER_STORAGE_KEYS, type SavedSolve } from "../lib/persistence";
import { EMPTY_OPTIONS } from "../options";
import { OPTION_KEYS, type Options, type SolverFormValues } from "../types";

export function useSolverSetup(onSolved: () => void) {
  const { settings } = useAiSettings();
  const [question, setQuestion] = usePersistedState(SOLVER_STORAGE_KEYS.question, "");
  const [context, setContext] = usePersistedState(SOLVER_STORAGE_KEYS.context, "");
  const [options, setOptions] = usePersistedState<Options>(SOLVER_STORAGE_KEYS.options, EMPTY_OPTIONS);
  const [hasSolution, setHasSolution] = useState(false);
  const [unsaved, setUnsaved] = useState<SavedSolve | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const solve = useRequest(solveMcq);

  useEffect(() => {
    let active = true;
    loadSolverResult().then((saved) => {
      if (active) setHasSolution(saved !== null);
    });
    return () => {
      active = false;
    };
  }, []);

  function updateOption(key: keyof Options, text: string) {
    setOptions((prev) => ({ ...prev, [key]: text }));
  }

  async function submit() {
    const values: SolverFormValues = { question, context, options };
    const result = await solve.run(settings, values);
    if (!result) return;
    const trimmed = {} as Options;
    for (const key of OPTION_KEYS) trimmed[key] = options[key].trim();
    const saved: SavedSolve = {
      question: question.trim(),
      context: context.trim(),
      options: trimmed,
      correctOption: result.correctOption,
      reasoning: result.reasoning,
    };
    try {
      await saveDocument(SOLVER_STORAGE_KEYS.result, saved);
    } catch {
      setUnsaved(saved);
      setSaveFailed(true);
      return;
    }
    setUnsaved(null);
    setSaveFailed(false);
    onSolved();
  }

  function reset() {
    setQuestion("");
    setContext("");
    setOptions(EMPTY_OPTIONS);
    setUnsaved(null);
    setSaveFailed(false);
    solve.reset();
  }

  return {
    question,
    setQuestion,
    context,
    setContext,
    options,
    updateOption,
    pending: solve.pending,
    error: solve.error,
    hasSolution,
    unsaved,
    saveFailed,
    submit,
    reset,
  };
}

export type SolverSetupState = ReturnType<typeof useSolverSetup>;

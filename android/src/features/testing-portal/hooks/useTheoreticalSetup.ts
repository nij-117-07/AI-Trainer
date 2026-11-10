// src/features/testing-portal/hooks/useTheoreticalSetup.ts
/**
 * The theoretical question form on the New questions page. The form is kept on the device. A
 * generate appends the new questions to the saved list, then calls onGenerated. The saved list is
 * read at submit time, so nothing is lost if the user generates more than once.
 */
import { useEffect, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useRequest } from "@/hooks/useRequest";
import { saveDocument } from "@/lib/document-store";
import { generateTheoretical } from "../lib/generators";
import { loadTheoreticalResult, THEORETICAL_STORAGE_KEYS } from "../lib/persistence";
import { PAST_QUESTIONS_LIMIT } from "../lib/past-questions";
import { THEORETICAL_FORM_DEFAULTS } from "../options";
import type { TheoreticalFormValues } from "../types";

export function useTheoreticalSetup(onGenerated: () => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = usePersistedState<TheoreticalFormValues>(
    THEORETICAL_STORAGE_KEYS.form,
    THEORETICAL_FORM_DEFAULTS,
  );
  const [saved, setSaved] = useState({ count: 0, history: [] as string[] });
  const generate = useRequest(generateTheoretical);

  useEffect(() => {
    let active = true;
    loadTheoreticalResult().then((result) => {
      if (active) setSaved({ count: result.questions.length, history: result.history });
    });
    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof TheoreticalFormValues>(key: K, value: TheoreticalFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    const current = await loadTheoreticalResult();
    const questions = await generate.run(settings, { ...form, pastQuestions: current.history.join("\n") });
    if (!questions) return;
    await saveDocument(THEORETICAL_STORAGE_KEYS.result, {
      questions: [...current.questions, ...questions],
      history: [...current.history, ...questions.map((item) => item.questionText)].slice(-PAST_QUESTIONS_LIMIT),
      contextSetting: form.contextSetting.trim(),
      difficultyLevel: form.difficultyLevel.trim(),
    }).catch(() => undefined);
    onGenerated();
  }

  function reset() {
    setForm(THEORETICAL_FORM_DEFAULTS);
    generate.reset();
  }

  return {
    form,
    update,
    pending: generate.pending,
    error: generate.error,
    existingCount: saved.count,
    history: saved.history,
    submit,
    reset,
  };
}

export type TheoreticalSetupState = ReturnType<typeof useTheoreticalSetup>;

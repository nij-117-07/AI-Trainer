// src/features/testing-portal/hooks/useMcqSetup.ts
/**
 * The MCQ form on the New MCQs page. The form is kept on the device. A generate appends the new
 * questions to the saved list, then calls onGenerated. The saved list is read at submit time, so
 * nothing is lost if the user generates more than once.
 */
import { useEffect, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useRequest } from "@/hooks/useRequest";
import { saveDocument } from "@/lib/document-store";
import { generateMcqs } from "../lib/generators";
import { loadMcqResult, MCQ_STORAGE_KEYS } from "../lib/persistence";
import { PAST_QUESTIONS_LIMIT } from "../lib/past-questions";
import { MCQ_FORM_DEFAULTS } from "../options";
import type { McqFormValues } from "../types";

export function useMcqSetup(onGenerated: () => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = usePersistedState<McqFormValues>(MCQ_STORAGE_KEYS.form, MCQ_FORM_DEFAULTS);
  const [saved, setSaved] = useState({ count: 0, history: [] as string[] });
  const generate = useRequest(generateMcqs);

  useEffect(() => {
    let active = true;
    loadMcqResult().then((result) => {
      if (active) setSaved({ count: result.questions.length, history: result.history });
    });
    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof McqFormValues>(key: K, value: McqFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    const current = await loadMcqResult();
    const questions = await generate.run(settings, { ...form, pastQuestions: current.history.join("\n") });
    if (!questions) return;
    await saveDocument(MCQ_STORAGE_KEYS.result, {
      questions: [...current.questions, ...questions],
      history: [...current.history, ...questions.map((question) => question.questionText)].slice(-PAST_QUESTIONS_LIMIT),
      contextSetting: form.contextSetting.trim(),
    }).catch(() => undefined);
    onGenerated();
  }

  function reset() {
    setForm(MCQ_FORM_DEFAULTS);
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

export type McqSetupState = ReturnType<typeof useMcqSetup>;

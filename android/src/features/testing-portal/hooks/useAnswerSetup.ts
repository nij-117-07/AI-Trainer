// src/features/testing-portal/hooks/useAnswerSetup.ts
/**
 * The expert answer form on the New answer page. The form is kept on the device. A generate
 * replaces the saved answer, then calls onGenerated.
 */
import { useEffect, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useRequest } from "@/hooks/useRequest";
import { saveDocument } from "@/lib/document-store";
import { generateAnswer } from "../lib/generators";
import { ANSWER_STORAGE_KEYS, loadAnswerResult } from "../lib/persistence";
import { ANSWER_FORM_DEFAULTS } from "../options";
import type { AnswerFormValues } from "../types";

export function useAnswerSetup(onGenerated: () => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = usePersistedState<AnswerFormValues>(ANSWER_STORAGE_KEYS.form, ANSWER_FORM_DEFAULTS);
  const [hasAnswer, setHasAnswer] = useState(false);
  const generate = useRequest(generateAnswer);

  useEffect(() => {
    let active = true;
    loadAnswerResult().then((answer) => {
      if (active) setHasAnswer(answer !== null);
    });
    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof AnswerFormValues>(key: K, value: AnswerFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    const result = await generate.run(settings, form);
    if (!result) return;
    await saveDocument(ANSWER_STORAGE_KEYS.result, {
      question: form.question.trim(),
      answerText: result.answerText,
      keyConceptsCovered: result.keyConceptsCovered,
    }).catch(() => undefined);
    onGenerated();
  }

  function reset() {
    setForm(ANSWER_FORM_DEFAULTS);
    generate.reset();
  }

  return {
    form,
    update,
    pending: generate.pending,
    error: generate.error,
    hasAnswer,
    submit,
    reset,
  };
}

export type AnswerSetupState = ReturnType<typeof useAnswerSetup>;

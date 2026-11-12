// src/features/testing-portal/hooks/useMcqSetup.ts
/**
 * The MCQ form on the New MCQs page. The form is kept on the device. A generate appends the new
 * questions to the open session, then calls onGenerated. The session's saved list is read at submit
 * time, so nothing is lost if the user generates more than once. The first generate in a session
 * names it after the topic.
 */
import { useEffect, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useRequest } from "@/hooks/useRequest";
import { generateMcqs } from "../lib/generators";
import { loadMcqResult, MCQ_STORAGE_KEYS } from "../lib/persistence";
import { PAST_QUESTIONS_LIMIT } from "../lib/past-questions";
import { ensureActiveMcqSession, loadActiveMcqResult, saveMcqSessionResult } from "../lib/mcq-sessions";
import { MCQ_FORM_DEFAULTS } from "../options";
import type { McqFormValues } from "../types";

export function useMcqSetup(onGenerated: () => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = usePersistedState<McqFormValues>(MCQ_STORAGE_KEYS.form, MCQ_FORM_DEFAULTS);
  const [saved, setSaved] = useState({ count: 0, history: [] as string[] });
  const generate = useRequest(generateMcqs);

  useEffect(() => {
    let active = true;
    loadActiveMcqResult().then((result) => {
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
    const sessionId = await ensureActiveMcqSession();
    const current = await loadMcqResult(sessionId);
    const questions = await generate.run(settings, { ...form, pastQuestions: current.history.join("\n") });
    if (!questions) return;
    const topic = form.topic.trim();
    await saveMcqSessionResult(
      sessionId,
      {
        questions: [...current.questions, ...questions],
        history: [...current.history, ...questions.map((question) => question.questionText)].slice(-PAST_QUESTIONS_LIMIT),
        contextSetting: form.contextSetting.trim(),
      },
      current.questions.length === 0 && topic ? topic : undefined,
    ).catch(() => undefined);
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

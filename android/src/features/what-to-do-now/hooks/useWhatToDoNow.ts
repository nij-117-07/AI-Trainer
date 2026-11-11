// src/features/what-to-do-now/hooks/useWhatToDoNow.ts
/** Holds the form and last result, saved on the device, and runs the request. */
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { whatToDoNow } from "../lib/generators";
import { toWhatToDoNowDraft } from "../lib/normalise";
import type { WhatToDoNowFormValues, WhatToDoNowResult } from "../types";
import { useSavedDraft } from "./useSavedDraft";

const STORAGE_KEY = "learning.what-to-do-now.v1";

const DEFAULTS: WhatToDoNowFormValues = {
  goals: "",
  dateTime: "",
  situation: "",
  extraInfo: "",
};

const parseDraft = (raw: unknown) => toWhatToDoNowDraft(raw);

export function useWhatToDoNow() {
  const { settings } = useAiSettings();
  const draft = useSavedDraft<WhatToDoNowFormValues, WhatToDoNowResult>(STORAGE_KEY, DEFAULTS, parseDraft);
  const request = useRequest(whatToDoNow);
  const { form, setForm, setResult, saveResultNow } = draft;

  function update<K extends keyof WhatToDoNowFormValues>(key: K, value: WhatToDoNowFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    const next = await request.run(settings, form);
    if (next) setResult(next);
  }

  function toggleDone(index: number) {
    if (!draft.result) return;
    const doNow = draft.result.doNow.map((item, i) => (i === index ? { ...item, done: !item.done } : item));
    saveResultNow({ ...draft.result, doNow });
  }

  function reset() {
    draft.reset();
    request.reset();
  }

  return {
    form,
    pending: request.pending,
    error: request.error,
    result: draft.result,
    update,
    submit,
    toggleDone,
    reset,
  };
}

export type WhatToDoNowState = ReturnType<typeof useWhatToDoNow>;

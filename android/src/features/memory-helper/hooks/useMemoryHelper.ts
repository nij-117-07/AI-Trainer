// src/features/memory-helper/hooks/useMemoryHelper.ts
/** Holds the form and last result, saved on the device, and runs the request. */
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { MEMORY_DEFAULTS, MEMORY_DRAFT_KEY, restoreMemoryDraft } from "../lib/drafts";
import { generateMemoryAids } from "../lib/generators";
import type { MemoryFormValues, MemoryResult } from "../lib/types";
import { useDraft } from "./useDraft";

export function useMemoryHelper() {
  const { settings } = useAiSettings();
  const draft = useDraft<MemoryFormValues, MemoryResult>(MEMORY_DRAFT_KEY, MEMORY_DEFAULTS, restoreMemoryDraft);
  const request = useRequest(generateMemoryAids);
  const { form, setForm, result, setResult } = draft;

  function update<K extends keyof MemoryFormValues>(key: K, value: MemoryFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    const next = await request.run(settings, form);
    if (next) setResult(next);
  }

  function reset() {
    draft.reset();
    request.reset();
  }

  return {
    form,
    pending: request.pending,
    error: request.error,
    result,
    update,
    submit,
    reset,
  };
}

export type MemoryHelperState = ReturnType<typeof useMemoryHelper>;

// src/features/confidence-builder/hooks/useConfidenceCreate.ts
/**
 * State for the new-set page. The form draft is kept on the device. A set is saved only when the
 * tasks come back, and then the page opens that set.
 */
import { useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useRequest } from "@/hooks/useRequest";
import { CONFIDENCE_DEFAULTS } from "../options";
import { generateConfidenceTasks } from "../lib/generators";
import { CONFIDENCE_DRAFT_KEY, newSetId, saveConfidenceSet } from "../lib/store";
import type { ConfidenceFormValues, ConfidenceSet } from "../types";

export function useConfidenceCreate(onCreated: (setId: string) => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = usePersistedState<ConfidenceFormValues>(CONFIDENCE_DRAFT_KEY, CONFIDENCE_DEFAULTS);
  const [saveError, setSaveError] = useState<string | null>(null);
  const request = useRequest(generateConfidenceTasks);

  function update<K extends keyof ConfidenceFormValues>(key: K, value: ConfidenceFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function generate() {
    const result = await request.run(settings, form);
    if (!result) return;
    const now = new Date().toISOString();
    const set: ConfidenceSet = { id: newSetId(), form, result, createdAt: now, updatedAt: now };
    setSaveError(null);
    try {
      await saveConfidenceSet(set);
    } catch {
      setSaveError("Could not save these tasks. Try again.");
      return;
    }
    setForm(CONFIDENCE_DEFAULTS);
    onCreated(set.id);
  }

  function reset() {
    setForm(CONFIDENCE_DEFAULTS);
    setSaveError(null);
    request.reset();
  }

  return {
    form,
    pending: request.pending,
    error: request.error ?? saveError,
    update,
    generate,
    reset,
  };
}

export type ConfidenceCreateState = ReturnType<typeof useConfidenceCreate>;

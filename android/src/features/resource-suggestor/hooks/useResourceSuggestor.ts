// src/features/resource-suggestor/hooks/useResourceSuggestor.ts
/** Holds the suggestion form and last result, saved on the device, and runs the request. */
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { ANY_RESOURCE_TYPE } from "../options";
import { suggestResources } from "../lib/generators";
import { toResourceDraft } from "../lib/normalise";
import type { ResourceSuggestorFormValues, ResourceSuggestorResult } from "../types";
import { useSavedDraft } from "./useSavedDraft";

const STORAGE_KEY = "learning.resource-suggestor.v1";

const DEFAULTS: ResourceSuggestorFormValues = {
  backgroundSubject: "",
  targetTopic: "",
  resourceType: ANY_RESOURCE_TYPE,
  additionalPreferences: "",
};

const parseDraft = (raw: unknown) => toResourceDraft(raw, DEFAULTS);

export function useResourceSuggestor() {
  const { settings } = useAiSettings();
  const draft = useSavedDraft<ResourceSuggestorFormValues, ResourceSuggestorResult>(STORAGE_KEY, DEFAULTS, parseDraft);
  const request = useRequest(suggestResources);
  const { form, setForm, setResult } = draft;

  function update<K extends keyof ResourceSuggestorFormValues>(key: K, value: ResourceSuggestorFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function suggest() {
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
    result: request.data ?? draft.result,
    update,
    suggest,
    reset,
  };
}

export type ResourceSuggestorState = ReturnType<typeof useResourceSuggestor>;

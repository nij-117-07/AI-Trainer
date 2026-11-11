/** Holds the suggestion form and last result, saved on the device, and runs the request. */
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { keptCount, mergeKept } from "@/lib/kept";
import { ANY_RESOURCE_TYPE } from "../options";
import { suggestResources } from "../lib/generators";
import { toResourceDraft } from "../lib/normalise";
import type { ResourceItem, ResourceSuggestorFormValues, ResourceSuggestorResult } from "../types";
import { SAVE_FAILED_MESSAGE, useSavedDraft } from "./useSavedDraft";

const STORAGE_KEY = "learning.resource-suggestor.v1";

const DEFAULTS: ResourceSuggestorFormValues = {
  backgroundSubject: "",
  targetTopic: "",
  resourceType: ANY_RESOURCE_TYPE,
  additionalPreferences: "",
};

const parseDraft = (raw: unknown) => toResourceDraft(raw, DEFAULTS);

const keyOf = (resource: ResourceItem) => resource.title.trim().toLowerCase();

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
    if (!next) return;
    setResult((prev) => ({
      ...next,
      recommendedResources: mergeKept(prev?.recommendedResources ?? [], next.recommendedResources, keyOf),
    }));
  }

  function toggleKept(index: number) {
    setResult((prev) =>
      prev && {
        ...prev,
        recommendedResources: prev.recommendedResources.map((resource, i) =>
          i === index ? { ...resource, kept: !resource.kept } : resource,
        ),
      },
    );
  }

  function reset() {
    draft.reset();
    request.reset();
  }

  return {
    form,
    pending: request.pending,
    error: request.error,
    saveError: draft.saveFailed ? SAVE_FAILED_MESSAGE : null,
    result: draft.result,
    keptCount: keptCount(draft.result?.recommendedResources ?? []),
    update,
    suggest,
    toggleKept,
    reset,
  };
}

export type ResourceSuggestorState = ReturnType<typeof useResourceSuggestor>;

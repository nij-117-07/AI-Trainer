// src/features/projects/hooks/useProjectRecommender.ts
/** Holds the project form and last result, saved on the device, and runs the request. */
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { recommendProjects } from "../lib/generators";
import { toProjectDraft } from "../lib/normalise";
import { DEFAULT_RECOMMENDATIONS } from "../lib/validate";
import type { ProjectFormValues, ProjectResult } from "../types";
import { useSavedDraft } from "./useSavedDraft";

const STORAGE_KEY = "learning.projects.v1";

const DEFAULTS: ProjectFormValues = {
  topic: "",
  projectSize: "medium",
  difficultyLevel: "intermediate",
  numRecommendations: DEFAULT_RECOMMENDATIONS,
};

const parseDraft = (raw: unknown) => toProjectDraft(raw, DEFAULTS);

export function useProjectRecommender() {
  const { settings } = useAiSettings();
  const draft = useSavedDraft<ProjectFormValues, ProjectResult>(STORAGE_KEY, DEFAULTS, parseDraft);
  const request = useRequest(recommendProjects);
  const { form, setForm, setResult } = draft;

  function update<K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function recommend() {
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
    recommend,
    reset,
  };
}

export type ProjectRecommenderState = ReturnType<typeof useProjectRecommender>;

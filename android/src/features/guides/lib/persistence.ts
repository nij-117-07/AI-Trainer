// src/features/guides/lib/persistence.ts
/** Storage keys and saved-draft helpers for the Learning Guides tools. */
import { isRecord } from "./text";

export interface SavedGuideState<TForm, TResult> {
  form: TForm;
  result: TResult | null;
}

export const GUIDE_STORAGE_KEYS = {
  task: "learning.guides.task.v1",
  dailyPlan: "learning.guides.daily-plan.v1",
  projectBlueprint: "learning.guides.project-blueprint.v1",
  suggestTopics: "learning.guides.suggest-topics.v1",
  suggestProjects: "learning.guides.suggest-projects.v1",
} as const;

/**
 * Takes each saved field only when its type matches the default, so an old or damaged draft
 * falls back to the default for that field.
 */
export function mergeSavedForm<T extends object>(defaults: T, saved: unknown): T {
  if (!isRecord(saved)) return defaults;
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const value = saved[key];
    if (typeof value === typeof defaults[key]) merged[key] = value as T[typeof key];
  }
  return merged;
}

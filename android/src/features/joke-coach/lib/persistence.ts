// src/features/joke-coach/lib/persistence.ts
/** Storage keys and saved-draft helpers for the Joke Coach modes. */
import { DEFAULT_LAB_STATE } from "../options";
import type { JokeLabAttempt, JokeLabExtra, JokeLabState, JokeScenario } from "../types";
import { isRecord } from "./text";

export interface SavedModeState<TForm, TResult> {
  form: TForm;
  result: TResult | null;
}

export const JOKE_LAB_STORAGE_KEY = "practice.joke-coach.lab.v1";

export const JOKE_COACH_STORAGE_KEYS = {
  classify: "practice.joke-coach.classify.v1",
  practice: "practice.joke-coach.practice.v1",
  crowd: "practice.joke-coach.crowd.v1",
} as const;

/** Reads the saved Joke Lab. Each field falls back to its default when the saved value is damaged. */
export function parseSavedLab(saved: unknown): JokeLabState {
  if (!isRecord(saved)) return DEFAULT_LAB_STATE;
  const text = (value: unknown, fallback: string) => (typeof value === "string" ? value : fallback);
  return {
    language: text(saved.language, DEFAULT_LAB_STATE.language),
    theme: text(saved.theme, DEFAULT_LAB_STATE.theme),
    jokeStyle: text(saved.jokeStyle, DEFAULT_LAB_STATE.jokeStyle),
    improvementGoal: text(saved.improvementGoal, DEFAULT_LAB_STATE.improvementGoal),
    scenario: isRecord(saved.scenario) ? (saved.scenario as unknown as JokeScenario) : null,
    draft: text(saved.draft, ""),
    attempts: Array.isArray(saved.attempts) ? (saved.attempts.filter(isRecord) as unknown as JokeLabAttempt[]) : [],
    extra: isRecord(saved.extra) ? (saved.extra as unknown as JokeLabExtra) : null,
  };
}

/** Takes each saved field only when its type matches the default, so a damaged draft falls back per field. */
export function mergeSavedForm<T extends object>(defaults: T, saved: unknown): T {
  if (!isRecord(saved)) return defaults;
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const value = saved[key];
    if (typeof value === typeof defaults[key]) merged[key] = value as T[typeof key];
  }
  return merged;
}

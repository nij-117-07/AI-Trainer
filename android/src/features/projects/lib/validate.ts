// src/features/projects/lib/validate.ts
/** Input checks for the Project Recommender. Limits follow the webui schema. */
import type { ProjectDifficulty, ProjectSize } from "../types";

export const TOPIC_MAX = 200;
export const MIN_RECOMMENDATIONS = 1;
export const MAX_RECOMMENDATIONS = 10;
export const DEFAULT_RECOMMENDATIONS = 3;

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

export function clampCount(value: unknown, fallback = DEFAULT_RECOMMENDATIONS): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.round(Math.min(MAX_RECOMMENDATIONS, Math.max(MIN_RECOMMENDATIONS, value)));
}

export function isProjectSize(value: unknown): value is ProjectSize {
  return value === "small" || value === "medium" || value === "large";
}

export function isProjectDifficulty(value: unknown): value is ProjectDifficulty {
  return value === "beginner" || value === "intermediate" || value === "advanced";
}

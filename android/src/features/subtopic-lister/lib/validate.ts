// src/features/subtopic-lister/lib/validate.ts
/** Input checks for the Subtopic Lister. */
import type { SubtopicLevel } from "../types";

export const TOPIC_MAX = 200;
export const MIN_COUNT = 3;
export const MAX_COUNT = 20;
export const DEFAULT_COUNT = 8;

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

export function clampCount(value: unknown, fallback = DEFAULT_COUNT): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.round(Math.min(MAX_COUNT, Math.max(MIN_COUNT, value)));
}

export function isSubtopicLevel(value: unknown): value is SubtopicLevel {
  return value === "beginner" || value === "intermediate" || value === "advanced";
}

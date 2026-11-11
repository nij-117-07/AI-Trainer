// src/features/challenges/lib/validate.ts
/** Input checks for the Challenge Giver. Limits match the form fields. */
import type { ChallengeLevel, ChallengeType } from "../types";
import { challengeLevelOptions, challengeTimeOptions, challengeTypeOptions } from "../options";

export const TOPIC_MAX = 200;
export const INSTRUCTIONS_MAX = 1000;
export const MIN_CHALLENGES = 1;
export const MAX_CHALLENGES = 5;
export const DEFAULT_CHALLENGES = 3;

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

export function clampCount(value: unknown, fallback = DEFAULT_CHALLENGES): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.round(Math.min(MAX_CHALLENGES, Math.max(MIN_CHALLENGES, value)));
}

export function isChallengeType(value: unknown): value is ChallengeType {
  return challengeTypeOptions.some((option) => option.value === value);
}

export function isChallengeLevel(value: unknown): value is ChallengeLevel {
  return challengeLevelOptions.some((option) => option.value === value);
}

export function isChallengeTime(value: unknown): value is number {
  return challengeTimeOptions.some((option) => option.value === value);
}

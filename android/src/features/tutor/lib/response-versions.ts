// src/features/tutor/lib/response-versions.ts
/** Pure helpers for the device-saved response history. */
import type { TutorResponse } from "../types";
import { isRecord, textOf } from "./values";

export function normalizeTutorResponse(raw: unknown): TutorResponse {
  const item = isRecord(raw) ? raw : {};
  return {
    adaptedExplanation: textOf(item.adaptedExplanation),
    conceptAnalogy: textOf(item.conceptAnalogy),
    tutorFeedback: textOf(item.tutorFeedback),
  };
}

export function parseStoredVersions(raw: unknown): TutorResponse[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeTutorResponse)
    .filter((item) => item.adaptedExplanation || item.conceptAnalogy || item.tutorFeedback);
}

/** Returns -1 when there are no versions, otherwise an index inside the list. */
export function clampVersionIndex(index: number, length: number): number {
  if (length === 0) return -1;
  return Math.min(Math.max(index, 0), length - 1);
}

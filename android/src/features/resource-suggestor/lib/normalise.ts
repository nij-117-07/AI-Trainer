// src/features/resource-suggestor/lib/normalise.ts
/**
 * Turns raw model output and stored drafts into typed values. Missing or mistyped fields fall
 * back to empty strings and lists, so the screen never reads .length or .map on an unchecked field.
 */
import type {
  ResourceItem,
  ResourceSuggestorDraft,
  ResourceSuggestorFormValues,
  ResourceSuggestorResult,
} from "../types";
import { PREFERENCES_MAX, SUBJECT_MAX } from "./validate";

export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function listOf<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

export function textOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

export function toResourceItem(raw: unknown): ResourceItem {
  const item = asRecord(raw);
  return {
    title: textOf(item.title),
    type: textOf(item.type),
    authorOrCreator: textOf(item.authorOrCreator),
    description: textOf(item.description),
    difficultyLevel: textOf(item.difficultyLevel),
    estimatedTime: textOf(item.estimatedTime),
    whyRecommended: textOf(item.whyRecommended),
    prerequisiteKnowledge: textOf(item.prerequisiteKnowledge),
    accessInfo: textOf(item.accessInfo),
  };
}

export function toResourceResult(raw: unknown): ResourceSuggestorResult {
  const record = asRecord(raw);
  return {
    learningPathSummary: textOf(record.learningPathSummary),
    recommendedResources: listOf(record.recommendedResources as unknown[]).map(toResourceItem),
    nextSteps: textOf(record.nextSteps),
  };
}

export function toResourceForm(raw: unknown, defaults: ResourceSuggestorFormValues): ResourceSuggestorFormValues {
  const record = asRecord(raw);
  const pick = (value: unknown, fallback: string, max: number) =>
    typeof value === "string" ? value.slice(0, max) : fallback;
  return {
    backgroundSubject: pick(record.backgroundSubject, defaults.backgroundSubject, SUBJECT_MAX),
    targetTopic: pick(record.targetTopic, defaults.targetTopic, SUBJECT_MAX),
    additionalPreferences: pick(record.additionalPreferences, defaults.additionalPreferences, PREFERENCES_MAX),
  };
}

export function toResourceDraft(raw: unknown, defaults: ResourceSuggestorFormValues): ResourceSuggestorDraft {
  const record = asRecord(raw);
  const hasResult = typeof record.result === "object" && record.result !== null;
  return {
    form: toResourceForm(record.form, defaults),
    result: hasResult ? toResourceResult(record.result) : null,
  };
}

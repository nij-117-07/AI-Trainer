// src/features/projects/lib/normalise.ts
/**
 * Turns raw model output and stored drafts into typed values. Missing or mistyped fields fall
 * back to empty values, so the screen never reads .length or .map on an unchecked field.
 */
import type { ProjectDraft, ProjectFormValues, ProjectIdea, ProjectResult } from "../types";
import { clampCount, isProjectDifficulty, isProjectSize, TOPIC_MAX } from "./validate";

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

function numberOf(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function toProjectIdea(raw: unknown): ProjectIdea {
  const item = asRecord(raw);
  return {
    title: textOf(item.title),
    description: textOf(item.description),
    keyConcepts: listOf(item.keyConcepts as unknown[]).map(textOf),
    estimatedHours: numberOf(item.estimatedHours),
    prerequisites: listOf(item.prerequisites as unknown[]).map(textOf),
    deliverables: listOf(item.deliverables as unknown[]).map(textOf),
    stretchGoals: listOf(item.stretchGoals as unknown[]).map(textOf),
  };
}

export function toProjectResult(raw: unknown): ProjectResult {
  const record = asRecord(raw);
  return {
    projects: listOf(record.projects as unknown[]).map(toProjectIdea),
    advice: textOf(record.advice),
  };
}

export function toProjectForm(raw: unknown, defaults: ProjectFormValues): ProjectFormValues {
  const record = asRecord(raw);
  return {
    topic: typeof record.topic === "string" ? record.topic.slice(0, TOPIC_MAX) : defaults.topic,
    projectSize: isProjectSize(record.projectSize) ? record.projectSize : defaults.projectSize,
    difficultyLevel: isProjectDifficulty(record.difficultyLevel) ? record.difficultyLevel : defaults.difficultyLevel,
    numRecommendations: clampCount(record.numRecommendations, defaults.numRecommendations),
  };
}

export function toProjectDraft(raw: unknown, defaults: ProjectFormValues): ProjectDraft {
  const record = asRecord(raw);
  const hasResult = typeof record.result === "object" && record.result !== null;
  return {
    form: toProjectForm(record.form, defaults),
    result: hasResult ? toProjectResult(record.result) : null,
  };
}

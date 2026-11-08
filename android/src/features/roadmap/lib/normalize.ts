// src/features/roadmap/lib/normalize.ts
/**
 * Guards for data read back from the device. Saved JSON can be partial or edited by hand, so
 * every field is checked before the screens use it. Items without an id or title are dropped.
 */
import type { CreateDraft, Roadmap, RoadmapFormValues, RoadmapMainPoint, RoadmapSubtopic } from "../types";
import { normalizeMode } from "./validation";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function listOf<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function compact<T>(items: (T | null)[]): T[] {
  return items.filter((item): item is T => item !== null);
}

export function normalizeSubtopic(raw: unknown): RoadmapSubtopic | null {
  if (!isRecord(raw)) return null;
  const id = textOf(raw.id);
  const title = textOf(raw.title).trim();
  if (!id || !title) return null;
  return { id, title, done: raw.done === true };
}

export function normalizeMainPoint(raw: unknown): RoadmapMainPoint | null {
  if (!isRecord(raw)) return null;
  const id = textOf(raw.id);
  const title = textOf(raw.title).trim();
  if (!id || !title) return null;
  return {
    id,
    title,
    done: raw.done === true,
    milestone: textOf(raw.milestone),
    subtopics: compact(listOf(raw.subtopics).map(normalizeSubtopic)),
  };
}

export function normalizeRoadmap(raw: unknown): Roadmap | null {
  if (!isRecord(raw)) return null;
  const id = textOf(raw.id);
  const subject = textOf(raw.subject).trim();
  if (!id || !subject) return null;
  return {
    id,
    subject,
    startLevel: textOf(raw.startLevel),
    targetLevel: textOf(raw.targetLevel),
    mode: normalizeMode(raw.mode),
    personaStyle: textOf(raw.personaStyle),
    userInstructions: textOf(raw.userInstructions),
    persona: textOf(raw.persona),
    mainPoints: compact(listOf(raw.mainPoints).map(normalizeMainPoint)),
    createdAt: textOf(raw.createdAt),
    updatedAt: textOf(raw.updatedAt),
  };
}

export function normalizeRoadmaps(raw: unknown): Roadmap[] {
  return compact(listOf(raw).map(normalizeRoadmap));
}

function normalizeForm(raw: unknown): RoadmapFormValues {
  const source = isRecord(raw) ? raw : {};
  return {
    subject: textOf(source.subject),
    startLevel: textOf(source.startLevel),
    targetLevel: textOf(source.targetLevel),
    mode: normalizeMode(source.mode),
    personaStyle: textOf(source.personaStyle),
    userInstructions: textOf(source.userInstructions),
  };
}

export function normalizeDraft(raw: unknown): CreateDraft | null {
  if (!isRecord(raw)) return null;
  return {
    form: normalizeForm(raw.form),
    persona: textOf(raw.persona),
    topics: listOf<unknown>(raw.topics).map(textOf).filter((topic) => topic.trim() !== ""),
  };
}

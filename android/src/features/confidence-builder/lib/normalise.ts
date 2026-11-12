// src/features/confidence-builder/lib/normalise.ts
/**
 * Turns model output and stored data into typed values. Missing or mistyped fields fall back to
 * empty values or defaults, so the screen never reads .length or .map on an unchecked field.
 */
import { isRecord, listOf, textOf } from "@/features/guides/lib/text";
import type {
  ActiveRound,
  ConfidenceEntry,
  ConfidenceFormValues,
  ConfidenceLog,
  ConfidenceSet,
  ConfidenceTask,
  ConfidenceTaskResult,
} from "../types";
import { INSTRUCTIONS_MAX, isComfort, isFocus, isRating, REFLECTION_MAX, SITUATION_MAX } from "./validate";

function textList(value: unknown): string[] {
  return listOf(value).map(textOf).filter((item) => item !== "");
}

function timestampOf(value: unknown): string | null {
  const text = textOf(value);
  return text === "" || Number.isNaN(Date.parse(text)) ? null : text;
}

export function toConfidenceTask(raw: unknown): ConfidenceTask {
  const item = isRecord(raw) ? raw : {};
  return {
    title: textOf(item.title),
    why: textOf(item.why),
    steps: textList(item.steps),
    successSign: textOf(item.successSign),
  };
}

export function toConfidenceTaskResult(raw: unknown): ConfidenceTaskResult {
  const record = isRecord(raw) ? raw : {};
  return {
    tasks: listOf(record.tasks).map(toConfidenceTask).filter((task) => task.title !== ""),
    coachNote: textOf(record.coachNote),
  };
}

export function toConfidenceForm(raw: unknown, defaults: ConfidenceFormValues): ConfidenceFormValues {
  const record = isRecord(raw) ? raw : {};
  return {
    focus: isFocus(record.focus) ? record.focus : defaults.focus,
    situation: typeof record.situation === "string" ? record.situation.slice(0, SITUATION_MAX) : defaults.situation,
    comfort: isComfort(record.comfort) ? record.comfort : defaults.comfort,
    instructions:
      typeof record.instructions === "string" ? record.instructions.slice(0, INSTRUCTIONS_MAX) : defaults.instructions,
  };
}

/** Returns null when the stored item has no id, so broken entries are dropped from the list. */
export function toConfidenceSet(raw: unknown, defaults: ConfidenceFormValues): ConfidenceSet | null {
  const record = isRecord(raw) ? raw : {};
  const id = textOf(record.id);
  if (id === "") return null;
  const updatedAt = timestampOf(record.updatedAt) ?? new Date().toISOString();
  return {
    id,
    form: toConfidenceForm(record.form, defaults),
    result: toConfidenceTaskResult(record.result),
    createdAt: timestampOf(record.createdAt) ?? updatedAt,
    updatedAt,
  };
}

function toActiveRound(raw: unknown): ActiveRound | null {
  if (!isRecord(raw)) return null;
  const task = toConfidenceTask(raw.task);
  const startedAt = timestampOf(raw.startedAt);
  if (task.title === "" || !isFocus(raw.focus) || startedAt === null) return null;
  const doneAt = timestampOf(raw.doneAt);
  return {
    task,
    focus: raw.focus,
    before: isRating(raw.before) ? raw.before : null,
    startedAt,
    doneAt,
    after: isRating(raw.after) ? raw.after : null,
    reflection: typeof raw.reflection === "string" ? raw.reflection.slice(0, REFLECTION_MAX) : "",
  };
}

function toEntry(raw: unknown): ConfidenceEntry | null {
  if (!isRecord(raw)) return null;
  const id = textOf(raw.id);
  const title = textOf(raw.title);
  const completedAt = timestampOf(raw.completedAt);
  if (!id || !title || !isFocus(raw.focus) || !isRating(raw.before) || !isRating(raw.after) || completedAt === null) {
    return null;
  }
  return {
    id,
    title,
    focus: raw.focus,
    before: raw.before,
    after: raw.after,
    reflection: typeof raw.reflection === "string" ? raw.reflection.slice(0, REFLECTION_MAX) : "",
    completedAt,
  };
}

export function toConfidenceLog(raw: unknown): ConfidenceLog {
  const record = isRecord(raw) ? raw : {};
  return {
    entries: listOf(record.entries).flatMap((item) => {
      const entry = toEntry(item);
      return entry ? [entry] : [];
    }),
    active: toActiveRound(record.active),
  };
}

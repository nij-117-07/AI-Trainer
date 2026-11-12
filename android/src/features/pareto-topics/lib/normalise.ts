// src/features/pareto-topics/lib/normalise.ts
/**
 * Turns raw model output and stored lists into typed values. Missing or mistyped fields fall
 * back to empty values, so the screen never reads .length or .map on an unchecked field.
 */
import { isRecord, listOf, numberOf, textOf } from "@/features/guides/lib/text";
import type { ParetoFormValues, ParetoList, ParetoResult, ParetoTopic } from "../types";
import { FIELD_MAX, GOAL_MAX, INSTRUCTIONS_MAX, LEVEL_MAX } from "./validate";

function textList(value: unknown): string[] {
  return listOf(value).map(textOf).filter((item) => item !== "");
}

/** Keeps a saved text value within its limit. Blank or non-text values use the default. */
function textField(value: unknown, max: number, fallback: string): string {
  if (typeof value !== "string" || value.trim() === "") return fallback;
  return value.trim().slice(0, max);
}

function toWorkShare(value: unknown): number | null {
  const share = numberOf(value);
  return share === null ? null : Math.round(Math.min(100, Math.max(0, share)));
}

export function toParetoTopic(raw: unknown): ParetoTopic {
  const item = isRecord(raw) ? raw : {};
  return {
    kept: item.kept === true,
    title: textOf(item.title),
    why: textOf(item.why),
    keyIdeas: textList(item.keyIdeas),
    workShare: toWorkShare(item.workShare),
  };
}

export function toParetoResult(raw: unknown): ParetoResult {
  const record = isRecord(raw) ? raw : {};
  return {
    topics: listOf(record.topics).map(toParetoTopic).filter((topic) => topic.title !== ""),
    skipForNow: textList(record.skipForNow),
    coachNote: textOf(record.coachNote),
  };
}

export function toParetoForm(raw: unknown, defaults: ParetoFormValues): ParetoFormValues {
  const record = isRecord(raw) ? raw : {};
  return {
    field: typeof record.field === "string" ? record.field.slice(0, FIELD_MAX) : defaults.field,
    goal: textField(record.goal, GOAL_MAX, defaults.goal),
    level: textField(record.level, LEVEL_MAX, defaults.level),
    instructions:
      typeof record.instructions === "string" ? record.instructions.slice(0, INSTRUCTIONS_MAX) : defaults.instructions,
  };
}

/** Returns null when the stored item has no id, so broken entries are dropped from the list. */
export function toParetoList(raw: unknown, defaults: ParetoFormValues): ParetoList | null {
  const record = isRecord(raw) ? raw : {};
  const id = textOf(record.id);
  if (id === "") return null;
  const updatedAt = typeof record.updatedAt === "string" ? record.updatedAt : new Date().toISOString();
  return {
    id,
    form: toParetoForm(record.form, defaults),
    result: toParetoResult(record.result),
    createdAt: typeof record.createdAt === "string" ? record.createdAt : updatedAt,
    updatedAt,
  };
}

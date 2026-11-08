// src/features/memory-helper/lib/drafts.ts
/**
 * Defaults, storage key, and restore rules for the saved form and last result. A stored draft is
 * rebuilt field by field, so a damaged or outdated draft falls back to defaults.
 */
import { isRecord, listOf, stringOr, textOf } from "./normalise";
import { isMemoryTechnique, type MemoryFormValues, type MemoryHook, type MemoryResult } from "./types";

export const MEMORY_DRAFT_KEY = "learning.memory-helper.process.v1";

export const MEMORY_DEFAULTS: MemoryFormValues = {
  topic: "Photosynthesis produces glucose from CO2, water, and sunlight",
  technique: "Method of Loci",
};

export interface Draft {
  form: MemoryFormValues;
  result: MemoryResult | null;
}

export function restoreMemoryDraft(raw: unknown): Draft {
  const record = isRecord(raw) ? raw : {};
  const form = isRecord(record.form) ? record.form : {};
  return {
    form: {
      topic: stringOr(form.topic, MEMORY_DEFAULTS.topic),
      technique: isMemoryTechnique(form.technique) ? form.technique : MEMORY_DEFAULTS.technique,
    },
    result: readMemoryResult(record.result),
  };
}

function readMemoryResult(raw: unknown): MemoryResult | null {
  if (!isRecord(raw)) return null;
  return {
    explanation: textOf(raw.explanation),
    memoryHooks: listOf<unknown>(raw.memoryHooks).filter(isRecord).map(readHook),
    retentionPlan: textOf(raw.retentionPlan),
  };
}

function readHook(raw: Record<string, unknown>): MemoryHook {
  return { concept: textOf(raw.concept), hook: textOf(raw.hook) };
}

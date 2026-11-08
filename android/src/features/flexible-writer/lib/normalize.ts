// src/features/flexible-writer/lib/normalize.ts
/**
 * Turns raw model output into the typed result the screen renders. Missing or wrongly typed
 * fields become empty text instead of a crash.
 */
import type { FlexibleWriterResult } from "../types";

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Plain text is shown as-is; structured values are pretty-printed as JSON. */
export function stringifyData(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value === null || value === undefined) return "";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

export function normalizeFlexibleWriter(raw: { answerMessage?: unknown; updatedData?: unknown }): FlexibleWriterResult {
  return {
    answerMessage: textOf(raw.answerMessage),
    updatedData: stringifyData(raw.updatedData),
  };
}

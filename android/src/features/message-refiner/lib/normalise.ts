// src/features/message-refiner/lib/normalise.ts
/** Turns raw model output into typed values so the screen never reads an unchecked field. */
import { asRecord, listOf, textOf } from "@/features/projects/lib/normalise";
import type { MessageRefinerResult } from "../types";

export function toMessageRefinerResult(raw: unknown): MessageRefinerResult {
  const record = asRecord(raw);
  return {
    refinedMessage: textOf(record.refinedMessage),
    subjectLine: textOf(record.subjectLine),
    changes: listOf(record.changes as unknown[]).map(textOf).filter((item) => item.trim() !== ""),
  };
}

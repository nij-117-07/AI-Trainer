// src/features/prompt-refiner/lib/normalise.ts
/** Turns raw model output into typed values so the screen never reads an unchecked field. */
import { asRecord, listOf, textOf } from "@/features/projects/lib/normalise";
import type { PromptRefinerResult } from "../types";

export function toPromptRefinerResult(raw: unknown): PromptRefinerResult {
  const record = asRecord(raw);
  return {
    refinedPrompt: textOf(record.refinedPrompt),
    changes: listOf(record.changes as unknown[]).map(textOf).filter((item) => item.trim() !== ""),
    clarifyingQuestions: listOf(record.clarifyingQuestions as unknown[])
      .map(textOf)
      .filter((item) => item.trim() !== ""),
  };
}

// src/features/subtopic-lister/lib/normalise.ts
/** Turns raw model output into typed values so the screen never reads an unchecked field. */
import { asRecord, listOf, textOf } from "@/features/projects/lib/normalise";
import type { Subtopic, SubtopicResult } from "../types";

function toSubtopic(raw: unknown): Subtopic {
  const item = asRecord(raw);
  return { name: textOf(item.name), description: textOf(item.description) };
}

export function toSubtopicResult(topic: string, raw: unknown): SubtopicResult {
  const record = asRecord(raw);
  return {
    topic,
    subtopics: listOf(record.subtopics as unknown[]).map(toSubtopic).filter((item) => item.name.trim() !== ""),
  };
}

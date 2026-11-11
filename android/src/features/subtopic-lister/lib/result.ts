// src/features/subtopic-lister/lib/result.ts
/** Kept-state helpers for the saved Subtopic Lister result (DESIGN.md section 9.4). */
import { mergeKept } from "@/lib/kept";
import type { Subtopic, SubtopicResult } from "../types";

export function subtopicKey(item: Subtopic): string {
  return item.name.trim().toLowerCase();
}

export function mergeSubtopicBatch(previous: SubtopicResult | null, generated: SubtopicResult): SubtopicResult {
  return { subtopics: mergeKept(previous?.subtopics ?? [], generated.subtopics, subtopicKey) };
}

export function toggleSubtopicKept(result: SubtopicResult, index: number): SubtopicResult {
  return { subtopics: result.subtopics.map((item, i) => (i === index ? { ...item, kept: !item.kept } : item)) };
}

// src/features/memory-helper/lib/types.ts

export const MEMORY_TECHNIQUES = [
  "Best Fit",
  "Method of Loci",
  "Peg Words",
  "Acronyms",
  "Chunking",
  "Storytelling",
  "Keyword Method",
] as const;

export type MemoryTechnique = (typeof MEMORY_TECHNIQUES)[number];

export function isMemoryTechnique(value: unknown): value is MemoryTechnique {
  return typeof value === "string" && (MEMORY_TECHNIQUES as readonly string[]).includes(value);
}

export interface MemoryFormValues {
  topic: string;
  technique: MemoryTechnique;
}

export interface MemoryHook {
  concept: string;
  hook: string;
}

export interface MemoryResult {
  explanation: string;
  memoryHooks: MemoryHook[];
  retentionPlan: string;
}

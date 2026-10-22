// src/features/learning/memory-helper/types/index.ts
/**
 * Zod schemas + TypeScript types for the Memory Helper API
 * (Backend/learning/memory_helper/api.md).
 */
import { z } from "zod";

export const memoryTechniques = [
  "Best Fit",
  "Method of Loci",
  "Peg Words",
  "Acronyms",
  "Chunking",
  "Storytelling",
  "Keyword Method",
] as const;

export const MemoryTechniqueSchema = z.enum(memoryTechniques);

export const MemoryRequestFormSchema = z.object({
  topic: z.string().trim().min(5, "Topic must be at least 5 characters").max(2000),
  technique: MemoryTechniqueSchema.default("Best Fit"),
});
export type MemoryRequestFormValues = z.infer<typeof MemoryRequestFormSchema>;

export const MemoryRequestSchema = z.object({
  topic: z.string().trim().min(5),
  technique: z.string().trim().optional(),
});
export type MemoryRequest = z.infer<typeof MemoryRequestSchema>;

export const MemoryHookSchema = z.object({
  concept: z.string(),
  hook: z.string(),
});
export type MemoryHook = z.infer<typeof MemoryHookSchema>;

export const MemoryResponseSchema = z.object({
  explanation: z.string(),
  memory_hooks: z.array(MemoryHookSchema).default([]),
  retention_plan: z.string(),
});
export type MemoryResponse = z.infer<typeof MemoryResponseSchema>;

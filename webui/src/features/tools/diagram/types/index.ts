// src/features/tools/diagram/types/index.ts
/**
 * Zod schemas + TypeScript types for the Diagram Generator API
 * (Backend/tools/diagram/api.md).
 */
import { z } from "zod";

export const diagramFormats = ["mermaid", "drawio"] as const;
export const DiagramFormatSchema = z.enum(diagramFormats);
export type DiagramFormat = z.infer<typeof DiagramFormatSchema>;

export const DiagramFormSchema = z.object({
  format: DiagramFormatSchema.default("mermaid"),
  instruction: z.string().trim().min(1, "Instruction is required").max(2000),
  context: z.string().trim().max(2000).default(""),
  existing_mermaid: z.string().trim().max(20000).default(""),
  existing_drawio: z.string().trim().max(20000).default(""),
});
export type DiagramFormValues = z.infer<typeof DiagramFormSchema>;

export const DiagramRequestSchema = z.object({
  format: DiagramFormatSchema,
  instruction: z.string().min(1),
  context: z.string().optional(),
  existing_code: z.string().optional(),
});
export type DiagramRequest = z.infer<typeof DiagramRequestSchema>;

export const DiagramResponseSchema = z.object({
  message: z.string(),
  code: z.string(),
  format: z.string(),
  status: z.string().default("success"),
});
export type DiagramResponse = z.infer<typeof DiagramResponseSchema>;

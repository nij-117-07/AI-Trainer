// src/features/tools/flexible-writer/types/index.ts
/**
 * Zod schemas + TypeScript types for the Flexible Writer API
 * (Backend/tools/flexible_writer/api.md).
 */
import { z } from "zod";

export const FlexibleWriterFormSchema = z.object({
  system_prompt: z.string().trim().min(1, "System prompt is required").max(2000),
  input_data: z.string().trim().min(1, "Input data is required").max(20000),
  additional_user_input: z.string().trim().max(2000).default(""),
});
export type FlexibleWriterFormValues = z.infer<typeof FlexibleWriterFormSchema>;

export const FlexibleWriterRequestSchema = z.object({
  system_prompt: z.string().min(1),
  input_data: z.unknown(),
  additional_user_input: z.string().optional(),
});
export type FlexibleWriterRequest = z.infer<typeof FlexibleWriterRequestSchema>;

export const FlexibleWriterResponseSchema = z.object({
  answer_message: z.string(),
  updated_data: z.unknown(),
  status: z.string().default("success"),
});
export type FlexibleWriterResponse = z.infer<typeof FlexibleWriterResponseSchema>;

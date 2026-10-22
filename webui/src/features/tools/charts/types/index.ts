// src/features/tools/charts/types/index.ts
/**
 * Zod schemas + TypeScript types for the Chart.js Generator API
 * (Backend/tools/charts/api.md).
 */
import { z } from "zod";

export const ChartsFormSchema = z.object({
  data_input: z.string().trim().min(1, "Data input is required").max(20000),
  custom_instructions: z
    .string()
    .trim()
    .min(1, "Instructions are required")
    .max(2000),
  previous_code: z.string().trim().max(20000).default(""),
});
export type ChartsFormValues = z.infer<typeof ChartsFormSchema>;

export const ChartRequestSchema = z.object({
  data_input: z.unknown(),
  custom_instructions: z.string().min(1),
  previous_code: z.string().optional(),
});
export type ChartRequest = z.infer<typeof ChartRequestSchema>;

export const ChartResponseSchema = z.object({
  answer_message: z.string(),
  chart_div_code: z.string(),
  status: z.string().default("success"),
});
export type ChartResponse = z.infer<typeof ChartResponseSchema>;

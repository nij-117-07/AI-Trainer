// src/features/tools/vision-converter/types/index.ts
/**
 * Zod schemas + TypeScript types for the Vision Converter API
 * (Backend/tools/vision_converter/api.md).
 */
import { z } from "zod";

export const VisionConversionResponseSchema = z.object({
  markdown_output: z.string(),
  status: z.string().default("success"),
});
export type VisionConversionResponse = z.infer<typeof VisionConversionResponseSchema>;

export interface VisionConvertPayload {
  file: File;
  instruction: string;
}

// src/features/tools/vision-converter/actions/convert.ts
/**
 * Server Action for POST /tools/vision/convert.
 * Uploads an image and returns the AI-converted Markdown.
 */
"use server";

import {
  VisionConversionResponseSchema,
  type VisionConversionResponse,
} from "../types";
import { postFormData, safeParse, toolsApiUrl } from "../../lib/api";

export async function convertImageAction(
  file: File,
  instruction: string
): Promise<VisionConversionResponse> {
  const formData = new FormData();
  formData.append("file", file, file.name);
  const trimmedInstruction = instruction.trim();
  if (trimmedInstruction) {
    formData.append("instruction", trimmedInstruction);
  }

  const raw = await postFormData<unknown>(
    toolsApiUrl("/tools/vision", "convert"),
    formData
  );
  return safeParse(
    VisionConversionResponseSchema,
    raw,
    "Invalid vision conversion response"
  );
}

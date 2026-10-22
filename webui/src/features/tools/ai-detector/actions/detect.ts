// src/features/tools/ai-detector/actions/detect.ts
/**
 * Server Action for POST /tools/ai_detector/detect.
 * Scores how likely the submitted text is AI-generated and returns the
 * verdict, flagged patterns, and suggested changes.
 */
"use server";

import {
  DetectFormSchema,
  DetectRequestSchema,
  AIDetectionResponseSchema,
  type DetectFormValues,
  type DetectRequest,
  type AIDetectionResponse,
} from "../types";
import { postJson, safeParse, toolsApiUrl } from "../../lib/api";

export async function detectTextAction(
  input: DetectFormValues
): Promise<AIDetectionResponse> {
  safeParse(DetectFormSchema, input, "Invalid AI detection request");

  const payload: DetectRequest = {
    text_to_check: input.text_to_check,
  };
  if (input.additional_comments.trim()) {
    payload.additional_comments = input.additional_comments.trim();
  }
  safeParse(DetectRequestSchema, payload, "Invalid AI detection payload");

  const raw = await postJson<unknown>(
    toolsApiUrl("/tools/ai_detector", "detect"),
    payload
  );
  return safeParse(AIDetectionResponseSchema, raw, "Invalid AI detection response");
}

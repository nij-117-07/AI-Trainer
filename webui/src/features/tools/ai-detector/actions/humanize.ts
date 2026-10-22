// src/features/tools/ai-detector/actions/humanize.ts
/**
 * Server Action for POST /tools/ai_detector/humanize.
 * Rewrites AI-sounding text into natural prose, passing along the detector
 * feedback and any extra user comments from the wizard.
 */
"use server";

import {
  HumanizeFormSchema,
  HumanizeRequestSchema,
  HumanizerResponseSchema,
  type HumanizeFormValues,
  type HumanizeRequest,
  type HumanizerResponse,
} from "../types";
import { postJson, safeParse, toolsApiUrl } from "../../lib/api";

export async function humanizeTextAction(
  input: HumanizeFormValues
): Promise<HumanizerResponse> {
  safeParse(HumanizeFormSchema, input, "Invalid humanize request");

  const payload: HumanizeRequest = {
    ai_text: input.ai_text,
  };
  if (input.target_tone.trim()) {
    payload.target_tone = input.target_tone.trim();
  }
  if (input.detection_feedback.trim()) {
    payload.detection_feedback = input.detection_feedback.trim();
  }
  if (input.additional_comments.trim()) {
    payload.additional_comments = input.additional_comments.trim();
  }
  safeParse(HumanizeRequestSchema, payload, "Invalid humanize payload");

  const raw = await postJson<unknown>(
    toolsApiUrl("/tools/ai_detector", "humanize"),
    payload
  );
  return safeParse(HumanizerResponseSchema, raw, "Invalid humanize response");
}

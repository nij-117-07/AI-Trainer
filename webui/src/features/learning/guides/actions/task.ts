// src/features/learning/guides/actions/task.ts
/**
 * Server Action for POST /learning/guides/task.
 * Validates the form, builds the backend payload, and returns mentor feedback
 * plus actionable tasks.
 */
"use server";

import {
  GuideRequestSchema,
  GuideResponseSchema,
  GuideTaskFormSchema,
  type GuideRequest,
  type GuideResponse,
  type GuideTaskFormValues,
} from "../types";
import { guidesApiUrl, postJson, safeParse } from "../lib/api";
import { splitLines } from "../lib/text";

export async function guideTaskAction(input: GuideTaskFormValues): Promise<GuideResponse> {
  safeParse(GuideTaskFormSchema, input, "Invalid guide task request");

  const payload: GuideRequest = {
    subject: input.subject,
    goal: input.goal,
    current_level: input.current_level,
    count: input.count,
    ...(splitLines(input.history).length ? { history: splitLines(input.history) } : {}),
    ...(input.instructions.trim() ? { instructions: input.instructions.trim() } : {}),
  };
  safeParse(GuideRequestSchema, payload, "Invalid guide task payload");

  const raw = await postJson<unknown>(guidesApiUrl("task"), payload);
  return safeParse(GuideResponseSchema, raw, "Invalid guide response");
}

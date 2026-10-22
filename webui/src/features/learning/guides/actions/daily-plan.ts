// src/features/learning/guides/actions/daily-plan.ts
/**
 * Server Action for POST /learning/guides/daily-plan.
 * Returns a detailed daily study plan with roadmap, gap analysis, and exercise.
 */
"use server";

import {
  DailyPlannerFormSchema,
  DailyPlannerRequestSchema,
  DailyPlannerResponseSchema,
  type DailyPlannerFormValues,
  type DailyPlannerRequest,
  type DailyPlannerResponse,
} from "../types";
import { guidesApiUrl, postJson, safeParse } from "../lib/api";

export async function dailyPlanAction(
  input: DailyPlannerFormValues
): Promise<DailyPlannerResponse> {
  safeParse(DailyPlannerFormSchema, input, "Invalid daily plan request");

  const payload: DailyPlannerRequest = {
    master_topic: input.master_topic,
    user_level: input.user_level,
    target_mastery: input.target_mastery,
    existing_knowledge: input.existing_knowledge,
    learning_focus: input.learning_focus,
    ...(input.subtopic_preference.trim()
      ? { subtopic_preference: input.subtopic_preference.trim() }
      : {}),
    ...(input.history.trim() ? { history: input.history.trim() } : {}),
  };
  safeParse(DailyPlannerRequestSchema, payload, "Invalid daily plan payload");

  const raw = await postJson<unknown>(guidesApiUrl("daily-plan"), payload);
  return safeParse(DailyPlannerResponseSchema, raw, "Invalid daily plan response");
}
